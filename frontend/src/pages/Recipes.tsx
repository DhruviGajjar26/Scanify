import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, X, ChevronLeft, ChevronRight, FolderOpen, Loader } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { getAllRecipes, createRecipe, deleteRecipe, getRecipeById } from '../api/recipes';
import Layout from '../components/common/Layout';
import './Recipes.css';

// ── Types (mirrors TeachRecipe) ─────────────────────────────
interface RoiNatural {
  x: number; y: number; width: number; height: number;
}
interface RoiEntry {
  id: string;
  name: string;
  natural: RoiNatural;
  extractedText: string;
  extractedAt?: string;
}
interface ImageSaveData {
  imageName: string;
  imageDataUrl: string;
  rois: RoiEntry[];
}
interface RecipeConfig {
  selectedFolderName?: string;
  allImageData?: Record<string, ImageSaveData>;
  ocrResults?: Array<{
    imageName: string;
    roiName: string;
    roiCoords: RoiNatural;
    extractedText: string;
    extractedAt: string;
  }>;
}
interface Recipe {
  _id: string;
  name: string;
  updatedAt: string;
  config?: RecipeConfig;
}

// ── Live OCR result for one ROI on the current image ────────
interface LiveRoiResult {
  id: string;
  name: string;
  natural: RoiNatural;
  liveText: string;       // freshly OCR-extracted from the current displayed image
  extractedAt: string;    // ISO timestamp of this extraction
}

// ── Preview modal state ──────────────────────────────────────
interface PreviewState {
  recipe: Recipe;
  config: RecipeConfig;
  previewImageSrc: string | null;
  previewImageName: string | null;
  // Template ROIs — saved coords + names from DB, never mutated
  templateRois: RoiEntry[];
  // Fresh OCR results from the currently displayed image
  liveResults: LiveRoiResult[];
  imgNaturalW: number;
  imgNaturalH: number;
  imgDisplayW: number;
  imgDisplayH: number;
  folderFiles: File[];
  folderIdx: number;
}

const ROI_COLORS = ['#ef4444', '#7c3aed', '#3b82f6', '#10b981', '#f59e0b'];

const Recipes: React.FC = () => {
  const [recipes, setRecipes]                   = useState<Recipe[]>([]);
  const [showCreateModal, setShowCreateModal]   = useState(false);
  const [newRecipeName, setNewRecipeName]       = useState('');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const navigate = useNavigate();

  // ── Preview ──────────────────────────────────────────────────
  const [preview, setPreview]             = useState<PreviewState | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isRunningOcr, setIsRunningOcr]   = useState(false);
  const [imgMeasured, setImgMeasured]     = useState(false);

  const previewImgRef    = useRef<HTMLImageElement>(null);
  const previewFolderRef = useRef<HTMLInputElement>(null);
  const ocrWorkerRef     = useRef<any>(null);

  // ── Spin up Tesseract worker once for all previews ──────────
  useEffect(() => {
    let alive = true;
    createWorker('eng').then(w => {
      if (alive) ocrWorkerRef.current = w;
    }).catch(console.error);
    return () => {
      alive = false;
      ocrWorkerRef.current?.terminate();
      ocrWorkerRef.current = null;
    };
  }, []);

  useEffect(() => { fetchRecipes(); }, []);

  const fetchRecipes = async () => {
    try {
      const data = await getAllRecipes();
      setRecipes(data);
    } catch (err) {
      console.error('Failed to fetch recipes', err);
    }
  };

  const handleCreateRecipe = async () => {
    if (!newRecipeName.trim()) return;
    try {
      await createRecipe(newRecipeName.trim());
      setNewRecipeName('');
      setShowCreateModal(false);
      fetchRecipes();
    } catch (err) {
      console.error('Failed to create recipe', err);
    }
  };

  // ─────────────────────────────────────────────────────────────
  //  runLiveOcr
  //  Runs Tesseract on `file` for every saved ROI rectangle.
  //  Returns an array of LiveRoiResult (one per ROI).
  // ─────────────────────────────────────────────────────────────
  const runLiveOcr = useCallback(async (
    file: File,
    templateRois: RoiEntry[],
  ): Promise<LiveRoiResult[]> => {
    if (!ocrWorkerRef.current || !templateRois.length) return [];

    // Measure natural dimensions of the image
    const objectUrl = URL.createObjectURL(file);
    const { natW, natH } = await new Promise<{ natW: number; natH: number }>((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ natW: img.naturalWidth, natH: img.naturalHeight });
      img.src = objectUrl;
    });
    URL.revokeObjectURL(objectUrl);

    const now = new Date().toISOString();
    const results: LiveRoiResult[] = [];

    for (const roi of templateRois) {
      const left   = Math.max(0, roi.natural.x);
      const top    = Math.max(0, roi.natural.y);
      const width  = Math.min(natW - left, Math.max(1, roi.natural.width));
      const height = Math.min(natH - top,  Math.max(1, roi.natural.height));

      let liveText = '';
      try {
        const { data } = await ocrWorkerRef.current.recognize(
          file,
          { rectangle: { left, top, width, height } },
        );
        liveText = data.text.trim();
      } catch (e) {
        console.warn('[Preview OCR] failed for ROI:', roi.name, e);
      }

      results.push({ id: roi.id, name: roi.name, natural: roi.natural, liveText, extractedAt: now });
    }

    return results;
  }, []);

  // ─────────────────────────────────────────────────────────────
  //  loadPreviewImage
  //  Displays a new image and immediately OCRs all saved ROIs.
  // ─────────────────────────────────────────────────────────────
  const loadPreviewImage = useCallback(async (
    file: File,
    folderFiles: File[],
    folderIdx: number,
    templateRois: RoiEntry[],
  ) => {
    const objectUrl = URL.createObjectURL(file);

    // Show new image right away, clear old results
    setPreview(prev => prev ? {
      ...prev,
      folderFiles,
      folderIdx,
      previewImageSrc:  objectUrl,
      previewImageName: file.name,
      liveResults:      [],
      imgNaturalW: 0, imgNaturalH: 0,
      imgDisplayW: 0, imgDisplayH: 0,
    } : null);
    setImgMeasured(false);

    // Run OCR in background — update results when done
    setIsRunningOcr(true);
    try {
      const liveResults = await runLiveOcr(file, templateRois);
      setPreview(prev => prev ? { ...prev, liveResults } : null);
    } finally {
      setIsRunningOcr(false);
    }
  }, [runLiveOcr]);

  // ── Open preview for a recipe ────────────────────────────────
  const handleStartPreview = async (recipeId: string) => {
    setPreviewLoading(true);
    try {
      const data   = await getRecipeById(recipeId);
      const config: RecipeConfig = data.config || {};
      const recipe: Recipe       = recipes.find(r => r._id === recipeId)!;

      // Template ROIs come from the first saved image (they are the same across all images)
      const imageEntries = Object.values(config.allImageData || {});
      const templateRois: RoiEntry[] =
        imageEntries.length > 0 ? (imageEntries[0].rois || []) : [];

      // Pre-populate results from DB so the panel looks non-empty immediately
      let initialSrc: string | null  = null;
      let initialName: string | null = null;
      let initialLive: LiveRoiResult[] = [];

      if (imageEntries.length > 0) {
        const first = imageEntries[0];
        initialSrc  = first.imageDataUrl;
        initialName = first.imageName;
        initialLive = (first.rois || []).map(r => ({
          id:          r.id,
          name:        r.name,
          natural:     r.natural,
          liveText:    r.extractedText,
          extractedAt: r.extractedAt || new Date().toISOString(),
        }));
      }

      setPreview({
        recipe,
        config,
        previewImageSrc:  initialSrc,
        previewImageName: initialName,
        templateRois,
        liveResults:      initialLive,
        imgNaturalW: 0, imgNaturalH: 0,
        imgDisplayW: 0, imgDisplayH: 0,
        folderFiles: [],
        folderIdx:   0,
      });
      setImgMeasured(false);
    } catch (err) {
      console.error('Failed to load recipe for preview', err);
      alert('Could not load recipe data for preview.');
    } finally {
      setPreviewLoading(false);
    }
  };

  // ── Measure image once it renders ───────────────────────────
  const handlePreviewImgLoad = useCallback(() => {
    const img = previewImgRef.current;
    if (!img) return;
    setPreview(prev => prev ? {
      ...prev,
      imgNaturalW: img.naturalWidth,
      imgNaturalH: img.naturalHeight,
      imgDisplayW: img.clientWidth,
      imgDisplayH: img.clientHeight,
    } : null);
    setImgMeasured(true);
  }, []);

  // ── Convert natural ROI coords → display px ─────────────────
  const getRoiDisplayCoords = useCallback((nat: RoiNatural, state: PreviewState) => {
    if (state.imgNaturalW === 0) return null;
    const fx = state.imgDisplayW / state.imgNaturalW;
    const fy = state.imgDisplayH / state.imgNaturalH;
    return {
      left:   Math.round(nat.x      * fx),
      top:    Math.round(nat.y      * fy),
      width:  Math.round(nat.width  * fx),
      height: Math.round(nat.height * fy),
    };
  }, []);

  // ── Select folder ────────────────────────────────────────────
  const handlePreviewFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!preview) return;
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
    if (!files.length) return;
    files.sort((a, b) => a.name.localeCompare(b.name));
    e.target.value = '';
    await loadPreviewImage(files[0], files, 0, preview.templateRois);
  };

  // ── Navigate between folder images — runs live OCR each time ─
  const handlePreviewNav = async (dir: 'prev' | 'next') => {
    if (!preview || !preview.folderFiles.length || isRunningOcr) return;
    const newIdx =
      dir === 'next'
        ? Math.min(preview.folderIdx + 1, preview.folderFiles.length - 1)
        : Math.max(preview.folderIdx - 1, 0);
    const file = preview.folderFiles[newIdx];
    await loadPreviewImage(file, preview.folderFiles, newIdx, preview.templateRois);
  };

  const closePreview = () => {
    setPreview(null);
    setImgMeasured(false);
    setIsRunningOcr(false);
  };

  // ── Merge template ROIs with live results for rendering ──────
  //    templateRois supply name/coords; liveResults supply text.
  const getMergedRois = (state: PreviewState) =>
    state.templateRois.map((roi, idx) => {
      const live = state.liveResults.find(r => r.id === roi.id);
      return {
        ...roi,
        displayText: live !== undefined ? live.liveText : roi.extractedText,
        displayTime: live !== undefined ? live.extractedAt : roi.extractedAt,
        color:       ROI_COLORS[idx % ROI_COLORS.length],
      };
    });

  // ────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="recipes-page">

        {/* ── Main table ── */}
        <div className="main-content">
          <h2>Recipe Management</h2>

          <table className="recipe-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Recipe Name</th>
                <th>Last Modified On</th>
                <th>Preview</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((recipe, index) => (
                <tr
                  key={recipe._id}
                  onClick={() => setSelectedRecipeId(recipe._id)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor:
                      selectedRecipeId === recipe._id
                        ? 'rgba(124,58,237,0.12)'
                        : 'transparent',
                  }}
                >
                  <td>{index + 1}</td>
                  <td>{recipe.name}</td>
                  <td>{new Date(recipe.updatedAt).toLocaleString()}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <button
                      className="btn preview-btn"
                      onClick={() => handleStartPreview(recipe._id)}
                      disabled={previewLoading}
                      title="Start Preview"
                    >
                      <Play size={13} style={{ marginRight: 4 }} />
                      {previewLoading ? 'Loading…' : 'Start Preview'}
                    </button>
                  </td>
                </tr>
              ))}
              {recipes.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: '#6b7280', padding: 24 }}>
                    No recipes found. Click <strong>Create</strong> to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Action buttons ── */}
        <div className="action-buttons">
          <button className="btn create-btn" onClick={() => setShowCreateModal(true)}>Create</button>
          <button
            className="btn edit-btn"
            disabled={!selectedRecipeId}
            onClick={() => { if (selectedRecipeId) navigate(`/recipes/${selectedRecipeId}`); }}
          >
            Edit
          </button>
          <button
            className="btn delete-btn"
            disabled={!selectedRecipeId}
            onClick={async () => {
              if (selectedRecipeId && window.confirm('Are you certain you want to delete this recipe?')) {
                try {
                  await deleteRecipe(selectedRecipeId);
                  setSelectedRecipeId(null);
                  fetchRecipes();
                } catch (e) {
                  console.error(e);
                  alert('Error deleting recipe');
                }
              }
            }}
          >
            Delete
          </button>
        </div>

        {/* ── Create Recipe Modal ── */}
        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Recipe Name</h3>
              <input
                type="text"
                value={newRecipeName}
                onChange={e => setNewRecipeName(e.target.value)}
                placeholder="e.g. Batch_Label_v1"
                onKeyDown={e => e.key === 'Enter' && handleCreateRecipe()}
                autoFocus
              />
              <div className="modal-buttons">
                <button className="btn create-btn" onClick={handleCreateRecipe}>Create</button>
                <button className="btn cancel-btn" onClick={() => setShowCreateModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* ════════ START PREVIEW MODAL ════════ */}
        {preview && (() => {
          const mergedRois = getMergedRois(preview);
          return (
            <div className="preview-overlay" onClick={closePreview}>
              <div className="preview-modal" onClick={e => e.stopPropagation()}>

                {/* ── Header ── */}
                <div className="preview-modal-header">
                  <div className="preview-modal-title">
                    <Play size={15} style={{ marginRight: 6, color: '#a78bfa' }} />
                    Preview —&nbsp;
                    <span style={{ color: '#c4b5fd' }}>{preview.recipe.name}</span>
                  </div>
                  <div className="preview-header-right">
                    {preview.config.selectedFolderName && (
                      <span className="preview-folder-badge">
                        📁 {preview.config.selectedFolderName}
                      </span>
                    )}
                    <button className="preview-close-btn" onClick={closePreview} title="Close">
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* ── Toolbar ── */}
                <div className="preview-toolbar">
                  {/* Hidden folder input */}
                  <input
                    ref={previewFolderRef}
                    type="file"
                    style={{ display: 'none' }}
                    // @ts-ignore
                    webkitdirectory=""
                    multiple
                    onChange={handlePreviewFolderSelect}
                  />

                  <button
                    className="preview-tool-btn"
                    onClick={() => previewFolderRef.current?.click()}
                    disabled={isRunningOcr}
                    title="Select a folder of images to preview"
                  >
                    <FolderOpen size={14} style={{ marginRight: 5 }} />
                    Select Folder
                  </button>

                  {/* Folder nav (prev / filename / next) */}
                  {preview.folderFiles.length > 0 && (
                    <div className="preview-nav-group">
                      <button
                        className="preview-nav-btn"
                        onClick={() => handlePreviewNav('prev')}
                        disabled={preview.folderIdx === 0 || isRunningOcr}
                        title="Previous image"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <span className="preview-nav-label">
                        {preview.folderFiles[preview.folderIdx]?.name}
                        &nbsp;({preview.folderIdx + 1} / {preview.folderFiles.length})
                      </span>
                      <button
                        className="preview-nav-btn"
                        onClick={() => handlePreviewNav('next')}
                        disabled={
                          preview.folderIdx === preview.folderFiles.length - 1 || isRunningOcr
                        }
                        title="Next image"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}

                  {/* Status badge — OCR running or ROI count */}
                  {isRunningOcr ? (
                    <span className="preview-ocr-badge preview-ocr-running">
                      <Loader size={11} className="preview-spinner-icon" />
                      &nbsp;Running OCR…
                    </span>
                  ) : mergedRois.length > 0 ? (
                    <span className="preview-roi-count">
                      {mergedRois.length} ROI{mergedRois.length > 1 ? 's' : ''} saved
                    </span>
                  ) : null}
                </div>

                {/* ── Image + ROI overlays ── */}
                <div className="preview-body">
                  {preview.previewImageSrc ? (
                    <div className="preview-img-wrapper">
                      <img
                        ref={previewImgRef}
                        src={preview.previewImageSrc}
                        alt={preview.previewImageName || 'Preview'}
                        className="preview-img"
                        onLoad={handlePreviewImgLoad}
                        draggable={false}
                      />

                      {/* ROI bounding boxes drawn over the image */}
                      {imgMeasured && mergedRois.map((roi) => {
                        const d = getRoiDisplayCoords(roi.natural, preview);
                        if (!d) return null;
                        return (
                          <div
                            key={roi.id}
                            className="preview-roi-box"
                            style={{
                              left:        d.left,
                              top:         d.top,
                              width:       d.width,
                              height:      d.height,
                              borderColor: roi.color,
                            }}
                          >
                            {/* Coloured name tag above the box — name only, no text inside */}
                            <div
                              className="preview-roi-label"
                              style={{ background: roi.color }}
                            >
                              {roi.name}
                            </div>
                          </div>
                        );
                      })}

                      {/* Semi-transparent overlay while OCR runs */}
                      {isRunningOcr && (
                        <div className="preview-ocr-overlay">
                          <Loader size={28} className="preview-spinner-icon" />
                          <span>Extracting text from ROIs…</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="preview-empty">
                      <FolderOpen size={40} style={{ color: '#3d3560', marginBottom: 12 }} />
                      <p>Click <strong>Select Folder</strong> above to load images.</p>
                      {preview.config.selectedFolderName && (
                        <p style={{ fontSize: '0.78rem', color: '#5b4f7a', marginTop: 6 }}>
                          Saved folder:&nbsp;<strong>{preview.config.selectedFolderName}</strong>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* ── OCR Results panel ── */}
                {mergedRois.length > 0 && (
                  <div className="preview-results">
                    <div className="preview-results-title">
                      {isRunningOcr ? 'EXTRACTING OCR RESULTS…' : 'SAVED OCR RESULTS'}
                    </div>
                    <div className="preview-results-grid">
                      {mergedRois.map(roi => (
                        <div
                          key={roi.id}
                          className="preview-result-card"
                          style={{ borderLeftColor: roi.color }}
                        >
                          <div className="preview-result-name" style={{ color: roi.color }}>
                            {roi.name}
                          </div>

                          {isRunningOcr ? (
                            <div className="preview-result-extracting">
                              <Loader size={11} className="preview-spinner-icon" />
                              &nbsp;Extracting…
                            </div>
                          ) : (
                            <div className="preview-result-text">
                              {roi.displayText || (
                                <span style={{ color: '#3d3560', fontStyle: 'italic' }}>
                                  No text found
                                </span>
                              )}
                            </div>
                          )}

                          {!isRunningOcr && roi.displayTime && (
                            <div className="preview-result-time">
                              {new Date(roi.displayTime).toLocaleString()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          );
        })()}

      </div>
    </Layout>
  );
};

export default Recipes;