// routes/ocr.js
const express = require('express');
const multer  = require('multer');
const { extractOCR } = require('../controllers/ocrController');

const router = express.Router();

// Store image in memory (no disk write needed — we pipe it to sharp)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

// POST /api/ocr/extract
router.post('/extract', upload.single('image'), extractOCR);

module.exports = router;
