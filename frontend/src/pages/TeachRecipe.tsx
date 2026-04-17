import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Save, Minus, Square, Maximize2, Upload, Copy, Plus, Tag } from 'lucide-react';
import { Rnd } from 'react-rnd';
import { createWorker } from 'tesseract.js';
import { getRecipeById, updateRecipe } from '../api/recipes';
import './TeachRecipe.css';

// ─────────────────────────────────────────────────────────────────────────────
//  COORDINATE SYSTEM  (mirrors the C# Form1 reference exactly)
//
//  roiNatural  – ROI stored in NATURAL IMAGE PIXEL space (same as C# ROI_Rect).
//                This is the ground-truth used for OCR and saved to DB.
//
//  C# SaveROICoordinates():
//    ROI_Rect.X = Math.Round(M_Rect.X * factor_x)
//    factor_x   = ImageWidth / pbRecipe.Width        ← natural px / displayed px
//
//  C# LoadROI():
//    ROI.X = Math.Round(ROI_Rect.X / factor_x)       ← convert back to display px
//
//  In React:
//    factor_x = img.naturalWidth / (img.clientWidth * zoomLevel)
//    (clientWidth ignores CSS transform, so we multiply by zoomLevel manually)
//
//  Benefit: changing zoom only updates roiDisplay (derived), never roiNatural.
//  The Rnd box repositions automatically. OCR always gets correct natural coords.
// ─────────────────────────────────────────────────────────────────────────────

export interface RoiNatural {
  x: number; y: number; width: number; height: number;
}

/** A single named ROI with its coordinates and the last extracted text */
export interface RoiEntry {
  id: string;            // unique key
  name: string;          // user-defined label
  natural: RoiNatural;
  extractedText: string;
  extractedAt?: string;  // ISO datetime of last OCR extraction
  cropUrl?: string;      // runtime only — not persisted
}

/** Per-image save data persisted to DB */
export interface ImageSaveData {
  imageName: string;
  imageDataUrl: string; // base64 — used for preview restore
  rois: Omit<RoiEntry, 'cropUrl'>[];
}

/** Top-level structure stored in recipe.config */
export interface RecipeConfig {
  trainFile: string;
  datatypes: string;
  psmValue: string;
  oemValue: string;
  scaleFactor: number;
  erode: number;
  dilate: number;
  smooth: number;
  thresholdMethod: string;
  thresholdMin: number;
  thresholdMax: number;
  charMin: number;
  charMax: number;
  whiteOnBlack: boolean;
  triggerDelay: number;
  count: number;
  selectorPosition: { x: number; y: number };
  selectedFolderName: string;
  // Key = image filename → full data including all ROIs + extracted texts
  allImageData: Record<string, ImageSaveData>;
  // Flat summary for quick DB queries: array of {imageName, roiName, extractedText, extractedAt}
  ocrResults: OcrResult[];
}

export interface OcrResult {
  imageName: string;
  roiName: string;
  roiCoords: RoiNatural;
  extractedText: string;
  extractedAt: string;
}

const generateId = () => Math.random().toString(36).slice(2, 10);

const TeachRecipe: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ── Toast ──────────────────────────────────────────────────
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ── Modes ──────────────────────────────────────────────────
  const [isMinimized, setIsMinimized]             = useState(false);
  const [isMaximized, setIsMaximized]             = useState(false);
  const [isSelectorVisible, setIsSelectorVisible] = useState(true);

  // ── Image ──────────────────────────────────────────────────
  const [selectedImage, setSelectedImage]           = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile]   = useState<File | null>(null);
  const [selectedFolderName, setSelectedFolderName] = useState<string>('');
  const [folderImageFiles, setFolderImageFiles]     = useState<File[]>([]);
  const [currentFolderIndex, setCurrentFolderIndex] = useState<number>(0);
  const fileInputRef   = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const imgRef         = useRef<HTMLImageElement>(null);

  // ── OCR ────────────────────────────────────────────────────
  const workerRef      = useRef<any>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  // ── ROI crop preview (active ROI only) ─────────────────────
  const [roiCropUrl, setRoiCropUrl]   = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');

  // ── Multi-ROI state ────────────────────────────────────────
  const [rois, setRois]               = useState<RoiEntry[]>([]);
  const [activeRoiIdx, setActiveRoiIdx] = useState<number>(0);
  const [showRoiNameDialog, setShowRoiNameDialog] = useState(false);
  const [pendingRoiName, setPendingRoiName] = useState('');

  // Per-image saved data (keyed by image filename), loaded from / saved to DB
  const [allImageData, setAllImageData] = useState<Record<string, ImageSaveData>>({});

  // ── Form config ────────────────────────────────────────────
  const [formData, setFormData] = useState({
    trainFile: 'eng', datatypes: 'ASCII',
    psmValue: '6', oemValue: '3',
    scaleFactor: 0, erode: 0, dilate: 0, smooth: 0,
    thresholdMethod: 'None',
    thresholdMin: 100, thresholdMax: 255,
    charMin: 1, charMax: 500,
    whiteOnBlack: false, triggerDelay: 500, count: 1,
  });

  // ── Selector panel position ────────────────────────────────
  const [selectorPosition, setSelectorPosition] = useState({ x: 20, y: 20 });

  // ── Active ROI shortcuts ───────────────────────────────────
  const activeRoi: RoiEntry | undefined = rois[activeRoiIdx];
  const roiNatural: RoiNatural = activeRoi?.natural ?? { x: 40, y: 150, width: 380, height: 180 };

  // ── CSV state ──────────────────────────────────────────────
  const [isGeneratingCsv, setIsGeneratingCsv] = useState(false);

  // ── Init Tesseract worker ──────────────────────────────────
  useEffect(() => {
    const initWorker = async () => {
      try {
        const worker = await createWorker('eng');
        workerRef.current = worker;
      } catch (e) {
        console.error('[Tesseract] Worker init failed:', e);
      }
    };
    initWorker();
    return () => { workerRef.current?.terminate(); };
  }, []);

  // ── Load recipe from DB ────────────────────────────────────
  useEffect(() => {
    if (id) {
      getRecipeById(id)
        .then((data) => {
          if (data.config) {
            const cfg: Partial<RecipeConfig> = data.config;
            setFormData((prev) => ({ ...prev, ...cfg }));
            if (cfg.selectorPosition)   setSelectorPosition(cfg.selectorPosition);
            if (cfg.selectedFolderName) setSelectedFolderName(cfg.selectedFolderName);
            if (cfg.allImageData)       setAllImageData(cfg.allImageData);
            showToast('Loaded config from Database', 'success');
          }
        })
        .catch(() => showToast('Ready for new recipe configuration', 'info'));
    }
  }, [id]);

  // ── When image changes, restore its ROIs from allImageData ─
  // This fires whenever the user selects a different image from the folder.
  // If we already have saved ROI data for that image name, restore it exactly.
  useEffect(() => {
    const imgName = selectedImageFile?.name;
    if (!imgName) return;

    const saved = allImageData[imgName];
    if (saved && saved.rois && saved.rois.length > 0) {
      setRois(saved.rois.map(r => ({ ...r, cropUrl: undefined })));
      setActiveRoiIdx(0);
      setExtractedText(saved.rois[0].extractedText || '');
      setRoiCropUrl(null);
      showToast(`Restored ${saved.rois.length} ROI(s) for "${imgName}"`, 'success');
    } else {
      // No saved ROIs for this image — start with one default ROI
      setRois([{
        id: generateId(),
        name: 'ROI 1',
        natural: { x: 40, y: 150, width: 380, height: 180 },
        extractedText: '',
      }]);
      setActiveRoiIdx(0);
      setExtractedText('');
      setRoiCropUrl(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImageFile?.name]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  getScaleFactors
  // ─────────────────────────────────────────────────────────────────────────
  const getScaleFactors = useCallback(() => {
    const img = imgRef.current;
    if (!img || img.naturalWidth === 0) return null;
    return {
      factor_x: img.naturalWidth  / img.clientWidth,
      factor_y: img.naturalHeight / img.clientHeight,
    };
  }, []);

  const saveROICoordinates = useCallback((
    displayX: number, displayY: number,
    displayW: number, displayH: number,
  ) => {
    const sf = getScaleFactors();
    if (!sf) return;
    const natural: RoiNatural = {
      x:      Math.round(displayX * sf.factor_x),
      y:      Math.round(displayY * sf.factor_y),
      width:  Math.round(displayW * sf.factor_x),
      height: Math.round(displayH * sf.factor_y),
    };
    setRois(prev => prev.map((r, i) => i === activeRoiIdx ? { ...r, natural } : r));
  }, [getScaleFactors, activeRoiIdx]);

  const getRoiDisplayCoords = useCallback((nat: RoiNatural) => {
    const sf = getScaleFactors();
    if (!sf) return { x: nat.x, y: nat.y, width: nat.width, height: nat.height };
    return {
      x:      Math.round(nat.x      / sf.factor_x),
      y:      Math.round(nat.y      / sf.factor_y),
      width:  Math.round(nat.width  / sf.factor_x),
      height: Math.round(nat.height / sf.factor_y),
    };
  }, [getScaleFactors]);

  // ── File / Folder pickers ─────────────────────────────────
  const handleOpenFilePicker   = () => fileInputRef.current?.click();
  const handleOpenFolderPicker = () => folderInputRef.current?.click();

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('Please select a valid image file', 'error'); return; }
    setFolderImageFiles([]);
    setSelectedFolderName('');
    setCurrentFolderIndex(0);
    loadImageFile(file);
    showToast(`Image loaded: ${file.name}`, 'success');
    e.target.value = '';
  };

  const loadImageFile = (file: File) => {
    setSelectedImageFile(file);
    const url = URL.createObjectURL(file);
    setSelectedImage(url);
    setExtractedText('');
    setRoiCropUrl(null);
    // ROI restore is handled by the useEffect above watching selectedImageFile.name
  };

  const handleFolderSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
    if (!files.length) { showToast('No images found in selected folder', 'error'); return; }
    files.sort((a, b) => a.name.localeCompare(b.name));
    const folderName = (files[0] as any).webkitRelativePath?.split('/')?.[0] || 'folder';
    setFolderImageFiles(files);
    setSelectedFolderName(folderName);
    setCurrentFolderIndex(0);
    loadImageFile(files[0]);
    showToast(`Folder loaded: "${folderName}" — ${files.length} image(s)`, 'success');
    e.target.value = '';
  };

  const handleFolderNavigation = (dir: 'prev' | 'next') => {
    if (!folderImageFiles.length) return;
    const newIdx = dir === 'next'
      ? Math.min(currentFolderIndex + 1, folderImageFiles.length - 1)
      : Math.max(currentFolderIndex - 1, 0);
    setCurrentFolderIndex(newIdx);
    loadImageFile(folderImageFiles[newIdx]);
  };

  // ── Crop ROI ───────────────────────────────────────────────
  const cropROI = useCallback((nat: RoiNatural, src: string): Promise<{
    dataUrl: string;
    rectangle: { left: number; top: number; width: number; height: number };
  } | null> => {
    return new Promise((resolve) => {
      if (!imgRef.current) { resolve(null); return; }
      const img    = imgRef.current;
      const left   = Math.max(0, nat.x);
      const top    = Math.max(0, nat.y);
      const width  = Math.min(img.naturalWidth  - left, Math.max(1, nat.width));
      const height = Math.min(img.naturalHeight - top,  Math.max(1, nat.height));
      const canvas = document.createElement('canvas');
      canvas.width  = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(null); return; }
      const fullImg = new Image();
      fullImg.onload = () => {
        ctx.drawImage(fullImg, left, top, width, height, 0, 0, width, height);
        resolve({ dataUrl: canvas.toDataURL('image/png'), rectangle: { left, top, width, height } });
      };
      fullImg.src = src;
    });
  }, []);

  // ── Get Data (OCR for active ROI) ─────────────────────────
  const handleGetData = useCallback(async () => {
    if (!selectedImageFile || !selectedImage) { showToast('Please select an image first', 'error'); return; }
    if (!workerRef.current)  { showToast('OCR engine not ready yet', 'error'); return; }
    if (!imgRef.current)     { showToast('Image not rendered yet', 'error'); return; }
    if (!activeRoi)          { showToast('No active ROI', 'error'); return; }

    setIsExtracting(true);
    setExtractedText('');
    setRoiCropUrl(null);

    try {
      const roi = await cropROI(activeRoi.natural, selectedImage);
      if (roi) setRoiCropUrl(roi.dataUrl);

      const { data: { text } } = await workerRef.current.recognize(
        selectedImageFile,
        { rectangle: roi?.rectangle },
      );
      const result    = text.trim();
      const timestamp = new Date().toISOString();

      setExtractedText(result || 'No text found in selected region');

      // Persist extracted text + timestamp into rois state
      setRois(prev => prev.map((r, i) =>
        i === activeRoiIdx
          ? { ...r, extractedText: result, extractedAt: timestamp, cropUrl: roi?.dataUrl }
          : r
      ));

      showToast(result ? 'OCR extraction complete!' : 'No text found — try resizing the box', result ? 'success' : 'info');
    } catch (err: any) {
      showToast(`OCR Error: ${err.message}`, 'error');
    } finally {
      setIsExtracting(false);
    }
  }, [selectedImageFile, selectedImage, cropROI, activeRoi, activeRoiIdx]);

  // ── Add / Delete ROI ──────────────────────────────────────
  const handleAddRoi = () => {
    setPendingRoiName(`ROI ${rois.length + 1}`);
    setShowRoiNameDialog(true);
  };

  const confirmAddRoi = () => {
    const name = pendingRoiName.trim() || `ROI ${rois.length + 1}`;
    const newRoi: RoiEntry = {
      id: generateId(),
      name,
      natural: { x: 40, y: 150, width: 380, height: 180 },
      extractedText: '',
    };
    setRois(prev => [...prev, newRoi]);
    setActiveRoiIdx(rois.length);
    setExtractedText('');
    setRoiCropUrl(null);
    setShowRoiNameDialog(false);
    setPendingRoiName('');
  };

  const handleDeleteRoi = (idx: number) => {
    if (rois.length <= 1) { showToast('At least one ROI required', 'error'); return; }
    setRois(prev => prev.filter((_, i) => i !== idx));
    setActiveRoiIdx(prev => Math.max(0, prev >= idx ? prev - 1 : prev));
  };

  // ── Image → base64 helper ─────────────────────────────────
  const imageToDataUrl = (src: string): Promise<string> =>
    new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
        canvas.getContext('2d')?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = src;
    });

  // ─────────────────────────────────────────────────────────────────────────
  //  handleSaveRecipe
  //  Saves ALL of the following to the DB inside recipe.config:
  //    • allImageData   — per-image map of { imageName, imageDataUrl, rois[] }
  //                       each roi contains: id, name, natural coords,
  //                       extractedText, extractedAt
  //    • ocrResults     — flat array for quick querying:
  //                       [{ imageName, roiName, roiCoords, extractedText, extractedAt }]
  //    • selectedFolderName, formData (OCR settings), selectorPosition
  // ─────────────────────────────────────────────────────────────────────────
  const handleSaveRecipe = async () => {
    try {
      // 1. Snapshot current image + its current ROIs into allImageData
      const updatedAllImageData: Record<string, ImageSaveData> = { ...allImageData };

      if (selectedImageFile && selectedImage) {
        const dataUrl = await imageToDataUrl(selectedImage);
        updatedAllImageData[selectedImageFile.name] = {
          imageName:    selectedImageFile.name,
          imageDataUrl: dataUrl,
          rois: rois.map(({ cropUrl: _c, ...rest }) => rest),
        };
      }

      // 2. Also capture any folder images that were navigated but not yet saved
      //    (they are already in allImageData from previous saves — kept as-is)

      setAllImageData(updatedAllImageData);

      // 3. Build flat ocrResults array from all saved images
      const ocrResults: OcrResult[] = [];
      for (const imgData of Object.values(updatedAllImageData)) {
        for (const roi of imgData.rois) {
          if (roi.extractedText) {
            ocrResults.push({
              imageName:     imgData.imageName,
              roiName:       roi.name,
              roiCoords:     roi.natural,
              extractedText: roi.extractedText,
              extractedAt:   roi.extractedAt || new Date().toISOString(),
            });
          }
        }
      }

      // 4. Persist everything
      const fullConfig: RecipeConfig = {
        ...formData,
        selectorPosition,
        selectedFolderName,
        allImageData: updatedAllImageData,
        ocrResults,
      };

      if (id) {
        await updateRecipe(id, fullConfig);
        showToast(
          `Saved! ${ocrResults.length} OCR result(s) across ${Object.keys(updatedAllImageData).length} image(s).`,
          'success',
        );
      } else {
        showToast('No recipe ID found. Cannot save.', 'error');
      }
    } catch (err) {
      console.error('[Save]', err);
      showToast('Error saving recipe to backend!', 'error');
    }
  };

  // ── Generate CSV ───────────────────────────────────────────
  const handleGenerateCSV = useCallback(async () => {
    if (!selectedImage && !folderImageFiles.length) {
      showToast('Please select an image or folder first', 'error'); return;
    }
    if (!workerRef.current) {
      showToast('OCR engine not ready yet', 'error'); return;
    }

    setIsGeneratingCsv(true);
    showToast('Generating CSV…', 'info');

    try {
      const recipeName = id || 'recipe';
      const folderName = selectedFolderName || 'images';

      const imagesToProcess: File[] = folderImageFiles.length > 0
        ? folderImageFiles
        : (selectedImageFile ? [selectedImageFile] : []);

      const rows: string[][] = [['FolderName', 'ImageName', 'RecipeName', 'DateTime', 'ROI_Name', 'ExtractedText']];

      for (const file of imagesToProcess) {
        const objectUrl = URL.createObjectURL(file);
        await new Promise<void>((res) => {
          const tmp = new Image();
          tmp.onload = () => res();
          tmp.src = objectUrl;
        });

        const imageRois: Omit<RoiEntry, 'cropUrl'>[] =
          allImageData[file.name]?.rois?.length
            ? allImageData[file.name].rois
            : rois.map(({ cropUrl: _c, ...r }) => r);

        for (const roi of imageRois) {
          const left   = Math.max(0, roi.natural.x);
          const top    = Math.max(0, roi.natural.y);
          let text     = roi.extractedText || '';

          if (!text) {
            try {
              const img    = imgRef.current;
              const natW   = img?.naturalWidth  || 9999;
              const natH   = img?.naturalHeight || 9999;
              const width  = Math.min(natW - left, Math.max(1, roi.natural.width));
              const height = Math.min(natH - top,  Math.max(1, roi.natural.height));
              const { data } = await workerRef.current.recognize(file, { rectangle: { left, top, width, height } });
              text = data.text.trim();
            } catch { text = ''; }
          }

          URL.revokeObjectURL(objectUrl);

          const dt  = new Date().toLocaleString();
          const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
          rows.push([esc(folderName), esc(file.name), esc(recipeName), esc(dt), esc(roi.name), esc(text)]);
        }
      }

      const csvContent = rows.map(r => r.join(',')).join('\n');
      const safeName   = (n: string) => n.replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName   = `${safeName(recipeName)}.csv`;

      const ipcRenderer = (window as any).electron?.ipcRenderer || (window as any).ipcRenderer;
      if (ipcRenderer) {
        ipcRenderer.invoke('save-csv', { fileName, content: csvContent })
          .then(() => showToast(`CSV saved to CSV/${fileName}`, 'success'))
          .catch((err: any) => showToast(`CSV save error: ${err.message}`, 'error'));
      } else {
        const blob = new Blob([csvContent], { type: 'text/plain;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url; a.download = fileName; a.click();
        URL.revokeObjectURL(url);
        showToast(`CSV downloaded: ${fileName}`, 'success');
      }
    } catch (err: any) {
      showToast(`CSV Error: ${err.message}`, 'error');
    } finally {
      setIsGeneratingCsv(false);
    }
  }, [selectedImage, selectedImageFile, folderImageFiles, selectedFolderName, rois, allImageData, id]);

  // ── Compute Rnd display coords ────────────────────────────
  const roiDisplay = getRoiDisplayCoords(roiNatural);

  const copyToClipboard = () => {
    if (extractedText) { navigator.clipboard.writeText(extractedText); showToast('Copied!', 'success'); }
  };

  const handleSingleCapture     = () => showToast(`Single frame captured. Delay: ${formData.triggerDelay}ms`, 'info');
  const handleContinuousCapture = () => showToast(`Continuous capture started. Count: ${formData.count}`, 'info');
  const handleResetCapture      = () => {
    setSelectedImage(null); setSelectedImageFile(null);
    setExtractedText(''); setRoiCropUrl(null);
    showToast('Reset.', 'info');
  };

  return (
    <div className="teach-recipe-container" style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>

      {/* Hidden inputs — single image + folder */}
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileSelected} />
      <input
        ref={folderInputRef}
        type="file"
        style={{ display: 'none' }}
        // @ts-ignore
        webkitdirectory=""
        multiple
        onChange={handleFolderSelected}
      />

      {/* Toast */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-2xl z-50 text-white text-sm font-semibold tracking-wide transition-all duration-300 ${
          toastMessage.type === 'success' ? 'bg-green-600' : toastMessage.type === 'error' ? 'bg-red-600' : 'bg-violet-600'
        }`}>
          {toastMessage.text}
        </div>
      )}

      {/* ROI Name Dialog */}
      {showRoiNameDialog && (
        <div className="roi-modal-overlay" onClick={() => setShowRoiNameDialog(false)}>
          <div className="roi-modal" style={{ width: 360 }} onClick={e => e.stopPropagation()}>
            <div className="roi-modal-header">
              <span>Name This ROI</span>
              <button className="roi-modal-close" onClick={() => setShowRoiNameDialog(false)}><X className="w-3 h-3" /></button>
            </div>
            <div className="roi-modal-body" style={{ flexDirection: 'column', gap: 12 }}>
              <input
                type="text"
                className="prop-control"
                style={{ width: '100%', fontSize: '0.9rem', padding: '8px 12px' }}
                placeholder="e.g. Batch Number, Expiry Date…"
                value={pendingRoiName}
                onChange={e => setPendingRoiName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && confirmAddRoi()}
                autoFocus
              />
            </div>
            <div className="roi-modal-footer" style={{ gap: 8 }}>
              <button className="roi-modal-btn" style={{ background: 'linear-gradient(135deg,#374151,#1f2937)' }} onClick={() => setShowRoiNameDialog(false)}>Cancel</button>
              <button className="roi-modal-btn" onClick={confirmAddRoi}>Add ROI</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="teach-header">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/recipes')} className="header-close-btn">
            <X className="w-5 h-5" />
          </button>
          <span>{`Teach Recipe ${id ? `— ${id.substring(0, 8)}` : ''}`}</span>
        </div>
        <span className="text-sm font-normal opacity-50">{new Date().toLocaleString()}</span>
      </div>

      {/* Main */}
      <div className="teach-main relative">

        {/* Floating Image Selector */}
        {isSelectorVisible && (
          <Rnd
            position={{ x: selectorPosition.x, y: selectorPosition.y }}
            onDragStop={(e, d) => setSelectorPosition({ x: d.x, y: d.y })}
            bounds="parent" enableResizing={false} dragHandleClassName="fw-drag-handle"
            className="z-40" style={{ position: 'absolute' }}
          >
            <div className={`floating-window ${isMaximized ? 'fw-maximized' : ''}`}>
              <div className="fw-header fw-drag-handle">
                <span>Image Selector</span>
                <div className="fw-window-controls">
                  <button className="fw-ctrl-btn fw-ctrl-minimize" onClick={(e) => { e.stopPropagation(); setIsMinimized(v => !v); }}>
                    <Minus className="w-3 h-3" />
                  </button>
                  <button className="fw-ctrl-btn fw-ctrl-maximize" onClick={(e) => { e.stopPropagation(); setIsMaximized(v => !v); setIsMinimized(false); }}>
                    {isMaximized ? <Square className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                  </button>
                  <button className="fw-ctrl-btn fw-ctrl-close" onClick={(e) => { e.stopPropagation(); setIsSelectorVisible(false); }}>
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
              {!isMinimized && (
                <div className="fw-content">
                  <div className="fw-icon-group">
                    {/* Single image picker */}
                    <button className="folder-icon" title="Select Image" onClick={handleOpenFilePicker}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </button>
                    {/* Folder picker */}
                    <button className="folder-icon folder-icon-blue" title="Select Folder" onClick={handleOpenFolderPicker}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                      </svg>
                    </button>
                  </div>
                  <div className="fw-controls">
                    {folderImageFiles.length > 0 ? (
                      <div className="fw-folder-info">
                        <div className="fw-filename" title={selectedFolderName}>
                          <Upload className="w-3 h-3 flex-shrink-0" />
                          <span>{selectedFolderName} ({currentFolderIndex + 1}/{folderImageFiles.length})</span>
                        </div>
                        <div className="fw-filename" title={folderImageFiles[currentFolderIndex]?.name} style={{ marginBottom: 6 }}>
                          <span style={{ fontSize: '0.7rem', color: '#a78bfa' }}>{folderImageFiles[currentFolderIndex]?.name}</span>
                        </div>
                        <div className="fw-nav-btns">
                          <button className="fw-btn" onClick={() => handleFolderNavigation('prev')} disabled={currentFolderIndex === 0}>◀ Prev</button>
                          <button className="fw-btn" onClick={() => handleFolderNavigation('next')} disabled={currentFolderIndex === folderImageFiles.length - 1}>Next ▶</button>
                        </div>
                      </div>
                    ) : selectedImageFile ? (
                      <div className="fw-filename" title={selectedImageFile.name}>
                        <Upload className="w-3 h-3 flex-shrink-0" />
                        <span>{selectedImageFile.name}</span>
                      </div>
                    ) : null}
                    <div className="trigger-delay">
                      <span>Trigger Delay :</span>
                      <input type="number" name="triggerDelay" value={formData.triggerDelay} onChange={handleInputChange} />
                      <span>Count :</span>
                      <input type="number" name="count" value={formData.count} onChange={handleInputChange} style={{ width: 50 }} />
                    </div>
                    <div className="fw-buttons">
                      <button className="fw-btn" onClick={handleSingleCapture}>Single</button>
                      <button className="fw-btn" onClick={handleContinuousCapture}>Continuous</button>
                      <button className="fw-btn" onClick={handleResetCapture}>Reset</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Rnd>
        )}

        {!isSelectorVisible && (
          <button className="selector-restore-btn" onClick={() => setIsSelectorVisible(true)}>+ Image Selector</button>
        )}

        {/* ── Viewer ── */}
        <div className="viewer-area">
          <div
            className="document-mockup"
            style={{ width: '100%', minHeight: '100%', position: 'relative', padding: selectedImage ? 0 : undefined }}
          >
            {selectedImage ? (
              <div style={{ position: 'relative', width: '100%' }}>
                <img
                  ref={imgRef}
                  src={selectedImage}
                  alt="Selected"
                  style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 8, userSelect: 'none', pointerEvents: 'none' }}
                  draggable={false}
                />

                {/* Render all ROIs; active one is red, others are purple */}
                {rois.map((roi, idx) => {
                  const disp     = getRoiDisplayCoords(roi.natural);
                  const isActive = idx === activeRoiIdx;
                  return (
                    <Rnd
                      key={roi.id}
                      size={{ width: disp.width, height: disp.height }}
                      position={{ x: disp.x, y: disp.y }}
                      onDragStop={(_e, d) => {
                        if (!isActive) { setActiveRoiIdx(idx); return; }
                        saveROICoordinates(d.x, d.y, disp.width, disp.height);
                      }}
                      onResizeStop={(_e, _direction, ref, _delta, position) => {
                        if (!isActive) { setActiveRoiIdx(idx); return; }
                        saveROICoordinates(position.x, position.y, parseInt(ref.style.width, 10), parseInt(ref.style.height, 10));
                      }}
                      onClick={() => {
                        if (!isActive) {
                          setActiveRoiIdx(idx);
                          setExtractedText(roi.extractedText || '');
                          setRoiCropUrl(roi.cropUrl || null);
                        }
                      }}
                      bounds="parent"
                      className={isActive ? 'border-2 border-red-500 z-10' : 'border-2 z-10'}
                      style={{
                        borderColor: isActive ? '#ef4444' : '#7c3aed',
                        background: isActive
                          ? 'linear-gradient(135deg,rgba(239,68,68,0.08),rgba(124,58,237,0.05))'
                          : 'linear-gradient(135deg,rgba(124,58,237,0.06),rgba(124,58,237,0.02))',
                        cursor: 'move',
                      }}
                      dragHandleClassName="draggable-area"
                      resizeHandleStyles={{
                        topLeft:     { width:10,height:10,background:'linear-gradient(135deg,#a78bfa,#7c3aed)',borderRadius:2,left:-5,top:-5 },
                        topRight:    { width:10,height:10,background:'linear-gradient(135deg,#a78bfa,#7c3aed)',borderRadius:2,right:-5,top:-5 },
                        bottomLeft:  { width:10,height:10,background:'linear-gradient(135deg,#a78bfa,#7c3aed)',borderRadius:2,left:-5,bottom:-5 },
                        bottomRight: { width:10,height:10,background:'linear-gradient(135deg,#a78bfa,#7c3aed)',borderRadius:2,right:-5,bottom:-5 },
                        top:    { width:10,height:10,background:'linear-gradient(135deg,#a78bfa,#7c3aed)',borderRadius:2,left:'50%',transform:'translateX(-50%)',top:-5 },
                        bottom: { width:10,height:10,background:'linear-gradient(135deg,#a78bfa,#7c3aed)',borderRadius:2,left:'50%',transform:'translateX(-50%)',bottom:-5 },
                        left:   { width:10,height:10,background:'linear-gradient(135deg,#a78bfa,#7c3aed)',borderRadius:2,top:'50%',transform:'translateY(-50%)',left:-5 },
                        right:  { width:10,height:10,background:'linear-gradient(135deg,#a78bfa,#7c3aed)',borderRadius:2,top:'50%',transform:'translateY(-50%)',right:-5 },
                      }}
                    >
                      {/* ROI name label */}
                      <div style={{
                        position: 'absolute', top: -22, left: 0,
                        background: isActive ? '#ef4444' : '#7c3aed',
                        color: '#fff', fontSize: '0.65rem', fontWeight: 700,
                        padding: '1px 6px', borderRadius: '4px 4px 0 0',
                        whiteSpace: 'nowrap', pointerEvents: 'none',
                      }}>
                        {roi.name}
                      </div>
                      <div className="draggable-area w-full h-full cursor-move" />
                    </Rnd>
                  );
                })}
              </div>
            ) : (
              <div className="document-text select-none" style={{ padding: 40 }}>
                <h3 className="font-bold mb-4" style={{ color: '#c4b5fd' }}>No image loaded</h3>
                <p style={{ color: '#6b7280' }}>
                  Click the <strong style={{ color: '#3b82f6' }}>folder</strong> button in the
                  Image Selector panel to load images, then drag the bounding box over the text you want to extract.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ══════════ RIGHT SIDEBAR ══════════ */}
        <div className="properties-sidebar">

          {/* ROI Manager */}
          <div className="sidebar-section">
            <div className="sidebar-section-label" style={{ justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Tag className="w-3 h-3" /> ROI Regions
              </span>
              <button
                onClick={handleAddRoi}
                style={{
                  display: 'flex', alignItems: 'center', gap: 3,
                  fontSize: '0.68rem', fontWeight: 700, color: '#a78bfa',
                  background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
                  borderRadius: 5, padding: '2px 8px', cursor: 'pointer',
                }}
                title="Add new ROI"
              >
                <Plus className="w-3 h-3" /> Add ROI
              </button>
            </div>
            <div className="roi-list">
              {rois.map((roi, idx) => (
                <div
                  key={roi.id}
                  className={`roi-list-item ${idx === activeRoiIdx ? 'roi-list-item-active' : ''}`}
                  onClick={() => { setActiveRoiIdx(idx); setExtractedText(roi.extractedText || ''); setRoiCropUrl(roi.cropUrl || null); }}
                >
                  <div className="roi-list-dot" style={{ background: idx === activeRoiIdx ? '#ef4444' : '#7c3aed' }} />
                  <span className="roi-list-name">{roi.name}</span>
                  {rois.length > 1 && (
                    <button
                      className="roi-list-del"
                      onClick={e => { e.stopPropagation(); handleDeleteRoi(idx); }}
                      title="Remove ROI"
                    >×</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* OCR Engine */}
          <div className="sidebar-section">
            <div className="sidebar-section-label">OCR Engine</div>
            <div className="prop-group">
              <div className="sidebar-prop-row">
                <label>Train File</label>
                <select className="prop-control" name="trainFile" value={formData.trainFile} onChange={handleInputChange}>
                  <option value="eng">eng</option>
                  <option value="osd">osd</option>
                  <option value="hin">hin</option>
                </select>
              </div>
              <div className="sidebar-divider" />
              <div className="sidebar-prop-row">
                <label>Datatypes</label>
                <select className="prop-control" name="datatypes" value={formData.datatypes} onChange={handleInputChange}>
                  <option value="ASCII">ASCII</option>
                  <option value="UTF8">UTF8</option>
                </select>
              </div>
              <div className="sidebar-divider" />
              <div className="sidebar-prop-row">
                <label>PSM Value</label>
                <select className="prop-control" name="psmValue" value={formData.psmValue} onChange={handleInputChange}>
                  <option value="6">6 (recommended)</option>
                  <option value="3">3</option>
                  <option value="11">11</option>
                </select>
              </div>
              <div className="sidebar-divider" />
              <div className="sidebar-prop-row">
                <label>OEM Value</label>
                <select className="prop-control" name="oemValue" value={formData.oemValue} onChange={handleInputChange}>
                  <option value="3">3</option>
                  <option value="1">1</option>
                </select>
              </div>
            </div>
          </div>

          {/* Image Processing */}
          <div className="sidebar-section">
            <div className="sidebar-section-label">Image Processing</div>
            <div className="prop-group">
              {([['ScaleFactor','scaleFactor'],['Erode','erode'],['Dilate','dilate'],['Smooth','smooth']] as [string,string][]).map(([label,name],i,arr) => (
                <React.Fragment key={name}>
                  <div className="sidebar-prop-row">
                    <label>{label}</label>
                    <input type="number" className="prop-control-small" name={name} value={(formData as any)[name]} onChange={handleInputChange} />
                  </div>
                  {i < arr.length - 1 && <div className="sidebar-divider" />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Threshold */}
          <div className="sidebar-section">
            <div className="sidebar-section-label">Threshold</div>
            <div className="prop-group">
              <div className="sidebar-prop-row">
                <label>Method</label>
                <select className="prop-control" name="thresholdMethod" value={formData.thresholdMethod} onChange={handleInputChange}>
                  <option value="None">None (recommended)</option>
                  <option value="Binary">Binary</option>
                  <option value="Otsu">Otsu</option>
                </select>
              </div>
              <div className="sidebar-divider" />
              <div className="sidebar-dual-row">
                <div className="sidebar-dual-item">
                  <span className="sidebar-dual-label">Min</span>
                  <input type="number" className="prop-control-small" name="thresholdMin" value={formData.thresholdMin} onChange={handleInputChange} />
                </div>
                <div className="sidebar-dual-divider" />
                <div className="sidebar-dual-item">
                  <span className="sidebar-dual-label">Max</span>
                  <input type="number" className="prop-control-small" name="thresholdMax" value={formData.thresholdMax} onChange={handleInputChange} />
                </div>
              </div>
            </div>
          </div>

          {/* Character Filter */}
          <div className="sidebar-section">
            <div className="sidebar-section-label">Character Filter</div>
            <div className="prop-group">
              <div className="sidebar-dual-row">
                <div className="sidebar-dual-item">
                  <span className="sidebar-dual-label">Min</span>
                  <input type="number" className="prop-control-small" name="charMin" value={formData.charMin} onChange={handleInputChange} />
                </div>
                <div className="sidebar-dual-divider" />
                <div className="sidebar-dual-item">
                  <span className="sidebar-dual-label">Max</span>
                  <input type="number" className="prop-control-small" name="charMax" value={formData.charMax} onChange={handleInputChange} />
                </div>
              </div>
              <div className="sidebar-divider" />
              <div className="sidebar-checkbox-row">
                <input type="checkbox" id="whiteOnBlack" name="whiteOnBlack" checked={formData.whiteOnBlack} onChange={handleInputChange} />
                <label htmlFor="whiteOnBlack" className="cursor-pointer select-none">WhiteOnBlack</label>
              </div>
            </div>
          </div>

          {/* ── SELECTED REGION + EXTRACTED TEXT ── */}
          {(roiCropUrl || isExtracting) && (
            <div className="sidebar-section">
              <div className="sidebar-section-label">Selected Region</div>

              <div className="roi-image-box">
                {roiCropUrl
                  ? <img src={roiCropUrl} alt="ROI" style={{ width: '100%', height: 'auto', borderRadius: 6, display: 'block' }} />
                  : <div className="preview-crop-placeholder">Cropping…</div>
                }
              </div>

              <div className="roi-text-box">
                {isExtracting ? (
                  <div className="roi-extracting-row">
                    <div className="roi-spinner" /> Running OCR…
                  </div>
                ) : (
                  <>
                    <div className="roi-text-header">
                      <span className="roi-text-label">Extracted Text</span>
                      {extractedText && extractedText !== 'No text found in selected region' && (
                        <button className="roi-copy-btn" onClick={copyToClipboard} title="Copy text">
                          <Copy className="w-3 h-3" /> Copy
                        </button>
                      )}
                    </div>
                    <div className="roi-text-value">{extractedText}</div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="sidebar-action-group" style={{ flexWrap: 'wrap' }}>
            <button
              className="sidebar-btn-secondary"
              onClick={handleGetData}
              disabled={isExtracting}
              style={{ opacity: isExtracting ? 0.6 : 1 }}
            >
              {isExtracting ? 'Extracting…' : 'Get Data'}
            </button>
            <button
              className="sidebar-btn-csv"
              onClick={handleGenerateCSV}
              disabled={isGeneratingCsv}
              style={{ opacity: isGeneratingCsv ? 0.6 : 1 }}
            >
              {isGeneratingCsv ? 'Generating…' : '⬇ Generate CSV'}
            </button>
            <button className="sidebar-btn-primary sidebar-btn-full" onClick={handleSaveRecipe}>
              <Save className="w-4 h-4" /> Save Recipe
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeachRecipe;