// const express = require('express');
// const router = express.Router();
// const scanController = require('../controllers/scanController');
// const { protect } = require('../middleware/authMiddleware');
// const upload = require('../middleware/uploadMiddleware');
// const path = require("path");
// const fs = require("fs");
// const Scan = require("../models/Scan");
// const { downloadOriginalFile, viewTextFile } = require('../controllers/scanController');

// // Route: POST /api/scans/extract (File upload + text extraction)
// router.post('/extract', protect, upload.single('file'), scanController.performExtraction);

// // Route: GET /api/scans/history (Get user's scan history)
// router.get('/history', protect, scanController.getScanHistory);

// // Route: GET /api/scans/stats (Get user's dashboard stats)
// router.get('/stats', protect, scanController.getDashboardStats);




// router.get('/download/:id', authMiddleware, downloadOriginalFile);
// router.get('/text/:id', authMiddleware, viewTextFile);





const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scanController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { downloadOriginalFile, viewTextFile } = require('../controllers/scanController');
const { translateText } = require('../controllers/scanController');


// Route: POST /api/scans/extract (File upload + text extraction)
router.post('/extract', protect, upload.single('file'), scanController.performExtraction);
router.post('/translate', protect, translateText);

// Route: GET /api/scans/history (Get user's scan history)
router.get('/history', protect, scanController.getScanHistory);

// Route: GET /api/scans/stats (Get user's dashboard stats)
router.get('/stats', protect, scanController.getDashboardStats);

// ✅ FIXED: use 'protect' not 'authMiddleware'
router.get('/download/:id', protect, downloadOriginalFile);
router.get('/text/:id', protect, viewTextFile);

module.exports = router;














//new added
// router.get("/download", protect, (req, res) => {
//   const filePath = req.query.path;

//   if (!filePath) {
//     return res.status(400).json({ message: "File path missing" });
//   }

//   const fullPath = path.join(__dirname, "..", filePath);

//   if (!fs.existsSync(fullPath)) {
//     return res.status(404).json({ message: "File not found" });
//   }

//   res.download(fullPath);
// });


// // Download PDF / Original
// router.get("/download/:filename", protect, (req, res) => {
//     const filePath = path.join(__dirname, "../uploads", req.params.filename);

//     if (!fs.existsSync(filePath)) {
//         return res.status(404).json({ msg: "File not found" });
//     }

//     // Proper download with correct headers
//     res.download(filePath, req.params.filename, (err) => {
//         if (err) console.error("Download error:", err);
//     });
// });

// // Download extracted text
// router.get("/download/text/:id", protect, async (req, res) => {
//     try {
//         const scan = await Scan.findById(req.params.id);
//         if (!scan) return res.status(404).json({ msg: "Scan not found" });

//         if (scan.extractedText) {
//             res.setHeader("Content-Type", "text/plain");
//             res.setHeader(
//                 "Content-Disposition",
//                 `attachment; filename=${scan.fileName.split('.')[0]}.txt`
//             );
//             return res.send(scan.extractedText);
//         }

//         // If using file on disk instead
//         if (scan.extractedTextPath) {
//             const textPath = path.join(__dirname, "../uploads", scan.extractedTextPath);
//             if (!fs.existsSync(textPath)) return res.status(404).json({ msg: "Text file missing" });
//             res.setHeader("Content-Type", "text/plain");
//             return res.download(textPath, `${scan.fileName.split('.')[0]}.txt`);
//         }

//         res.status(404).json({ msg: "No text available" });
//     } catch (error) {
//         console.error("Text download error:", error);
//         res.status(500).json({ msg: "Server error" });
//     }
// });

// module.exports = router;