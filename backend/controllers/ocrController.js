// controllers/ocrController.js
const path = require('path');

let Tesseract, sharp;
try { Tesseract = require('tesseract.js'); }
catch (e) { console.error('❌ tesseract.js not installed. Run: npm install tesseract.js'); }
try { sharp = require('sharp'); }
catch (e) { console.error('❌ sharp not installed. Run: npm install sharp'); }

const extractOCR = async (req, res) => {
  if (!Tesseract || !sharp) {
    return res.status(500).json({ error: 'Run: npm install tesseract.js sharp in backend folder.' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided.' });
  }

  try {
    // ── Parse params ───────────────────────────────────────────
    const boxX         = parseFloat(req.body.boxX        || '0');
    const boxY         = parseFloat(req.body.boxY        || '0');
    const boxW         = parseFloat(req.body.boxW        || '200');
    const boxH         = parseFloat(req.body.boxH        || '100');
    const trainFile    = req.body.trainFile               || 'eng';
    const psmValue     = parseInt(req.body.psmValue      || '3',  10);
    const oemValue     = parseInt(req.body.oemValue      || '3',  10);
    const whiteOnBlack = req.body.whiteOnBlack === 'true';
    const charMin      = parseInt(req.body.charMin       || '1',  10);
    const charMax      = parseInt(req.body.charMax       || '500', 10);

    console.log('\n[OCR] ── New Request ──────────────────────────────');
    console.log(`[OCR] Box: x=${boxX} y=${boxY} w=${boxW} h=${boxH}`);
    console.log(`[OCR] Config: lang=${trainFile} psm=${psmValue} oem=${oemValue} whiteOnBlack=${whiteOnBlack}`);
    console.log(`[OCR] CharFilter: min=${charMin} max=${charMax}`);

    // ── Image metadata ─────────────────────────────────────────
    const imageBuffer = req.file.buffer;
    const meta  = await sharp(imageBuffer).metadata();
    const imgW  = meta.width  || 800;
    const imgH  = meta.height || 1000;
    console.log(`[OCR] Image size: ${imgW} x ${imgH} | format: ${meta.format}`);

    // ── Map bounding-box CSS px → real image px ────────────────
    // The viewer renders image at 800px CSS width
    // Box coords are relative to that 800px wide container
    const cssDisplayWidth  = 800;
    const cssDisplayHeight = (imgH / imgW) * cssDisplayWidth;

    const scaleX = imgW / cssDisplayWidth;
    const scaleY = imgH / cssDisplayHeight;

    let left   = Math.max(0, Math.round(boxX * scaleX));
    let top    = Math.max(0, Math.round(boxY * scaleY));
    let width  = Math.round(boxW * scaleX);
    let height = Math.round(boxH * scaleY);

    // Clamp to image bounds
    if (left + width  > imgW) width  = imgW - left;
    if (top  + height > imgH) height = imgH - top;
    width  = Math.max(1, width);
    height = Math.max(1, height);

    console.log(`[OCR] Crop (px): left=${left} top=${top} w=${width} h=${height}`);

    // ── Crop the image ─────────────────────────────────────────
    let pipeline = sharp(imageBuffer)
      .extract({ left, top, width, height })
      .greyscale();

    // Only apply threshold if method is not 'None'
    if (req.body.thresholdMethod === 'Otsu') {
      pipeline = pipeline.normalise().threshold(128);
    } else if (req.body.thresholdMethod === 'Binary') {
      const tMin = parseInt(req.body.thresholdMin || '100', 10);
      pipeline = pipeline.threshold(tMin);
    }
    // else: no threshold — use raw greyscale (better for most images)

    if (whiteOnBlack) pipeline = pipeline.negate();

    // Upscale small crops for better OCR accuracy
    const upscaled = await pipeline.metadata().catch(() => null);
    if (width < 300 || height < 100) {
      pipeline = pipeline.resize({
        width:  Math.min(width * 3, 2400),
        height: Math.min(height * 3, 2400),
        fit: 'fill',
        kernel: sharp.kernel.lanczos3,
      });
      console.log(`[OCR] Upscaling small crop for better accuracy`);
    }

    const processedBuffer = await pipeline.png().toBuffer();

    // ── Run Tesseract ──────────────────────────────────────────
    const langPath = path.join(__dirname, '..');
    console.log(`[OCR] langPath: ${langPath}`);
    console.log(`[OCR] Running Tesseract...`);

    const result = await Tesseract.recognize(processedBuffer, trainFile, {
      langPath,
      tessedit_pageseg_mode:    String(psmValue),
      tessedit_ocr_engine_mode: String(oemValue),
    });

    const data    = result.data;
    const rawText = (data.text || '').trim();

    console.log(`[OCR] Raw text: "${rawText}"`);
    console.log(`[OCR] Confidence: ${(data.confidence || 0).toFixed(1)}%`);
    console.log(`[OCR] Words count: ${Array.isArray(data.words) ? data.words.length : 'N/A'}`);

    // ── Filter words ───────────────────────────────────────────
    let filteredText = '';
    if (Array.isArray(data.words) && data.words.length > 0) {
      const filtered = data.words.filter(w =>
        w && w.text &&
        w.text.trim().length >= charMin &&
        w.text.trim().length <= charMax
      );
      filteredText = filtered.map(w => w.text).join(' ').trim();
      console.log(`[OCR] Filtered words (${filtered.length}/${data.words.length}): "${filteredText}"`);
    }

    const finalText = filteredText || rawText;
    console.log(`[OCR] Final text sent to frontend: "${finalText}"`);
    console.log('[OCR] ────────────────────────────────────────────\n');

    return res.json({
      text:       finalText,
      rawText,
      confidence: data.confidence || 0,
    });

  } catch (err) {
    console.error('[OCR] Error:', err);
    return res.status(500).json({ error: err.message || 'OCR processing failed.' });
  }
};

module.exports = { extractOCR };