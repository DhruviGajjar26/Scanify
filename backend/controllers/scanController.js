// const fs = require('fs');
// const path = require('path');
// const Tesseract = require('tesseract.js');
// const pdfParse = require('pdf-parse');
// const Scan = require('../models/Scan');

// // Core OCR function
// const extractTextFromImage = async (filePath) => {
//     try {
//         const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
//             logger: m => console.log(m) // Optional progress logger
//         });
//         return text;
//     } catch (error) {
//         console.error('Tesseract Error:', error);
//         throw new Error('Image text extraction failed');
//     }
// };

// // Core PDF extraction function
// const extractTextFromPDF = async (filePath) => {
//     try {
//         const dataBuffer = fs.readFileSync(filePath);
//         const data = await pdfParse(dataBuffer);
//         return data.text;
//     } catch (error) {
//         console.error('PDF Parse Error:', error);
//         throw new Error('PDF text extraction failed');
//     }
// };

// exports.performExtraction = async (req, res) => {
//     if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

//     try {
//         const filePath = req.file.path;
//         const fileExtension = path.extname(req.file.originalname).toLowerCase();
//         let extractedText = '';
//         let fileType = '';

//         if (fileExtension === '.pdf') {
//             extractedText = await extractTextFromPDF(filePath);
//             fileType = 'pdf';
//         } else if (['.jpg', '.jpeg', '.png'].includes(fileExtension)) {
//             extractedText = await extractTextFromImage(filePath);
//             fileType = 'image';
//         } else {
//             // Delete file and throw error
//             fs.unlinkSync(filePath);
//             return res.status(400).json({ msg: 'Unsupported file type' });
//         }

//         // --- SAVE TO DB & CLEAN UP ---
        
//         // Save extracted text to a .txt file (scalability choice)
//         const textFileName = `${req.file.filename}.txt`;
//         const textFilePath = path.join('uploads', 'texts', textFileName);
        
//         // Ensure directory exists
//         const textsDir = path.dirname(textFilePath);
//         if (!fs.existsSync(textsDir)) fs.mkdirSync(textsDir, { recursive: true });
        
//         fs.writeFileSync(textFilePath, extractedText, 'utf8');

//         // Store file details in MongoDB
//         const newScan = new Scan({
//             userId: req.user.id,
//             fileName: req.file.originalname,
//             fileType: fileType,
//             originalPath: filePath, // Storing local path. Use cloud storage URL for real deploy.
//             extractedTextPath: textFilePath,
//         });

//         await newScan.save();

//         res.status(200).json({
//             extractedText,
//             msg: 'File processed successfully. Text extracted.',
//             scanId: newScan._id
//         });

//     } catch (error) {
//         console.error('Processing error:', error);
//         res.status(500).json({ msg: error.message || 'Error processing file' });
//         // Optional: delete the uploaded file if processing failed
//     }
// };

// exports.getScanHistory = async (req, res) => {
//     try {
//         const scans = await Scan.find({ userId: req.user.id }).sort({ extractionDate: -1 });
//         res.status(200).json(scans);
//     } catch (error) {
//         console.error('History Fetch Error:', error);
//         res.status(500).json({ msg: 'Error fetching history' });
//     }
// };

// exports.getDashboardStats = async (req, res) => {
//     try {
//         const userId = req.user.id;
//         const totalScans = await Scan.countDocuments({ userId });
//         const imageScans = await Scan.countDocuments({ userId, fileType: 'image' });
//         const pdfScans = await Scan.countDocuments({ userId, fileType: 'pdf' });

//         res.status(200).json({
//             totalScans,
//             imageScans,
//             pdfScans
//         });
//     } catch (error) {
//         res.status(500).json({ msg: 'Error fetching stats' });
//     }
// };


// const fs = require('fs');
// const path = require('path');
// const Tesseract = require('tesseract.js');
// const pdfParse = require('pdf-parse');
// const Scan = require('../models/Scan');

// // INITIALIZE DIRECTORIES: Run this at the top of the file to prevent 500 errors
// const UPLOADS_DIR = path.join(__dirname, '../uploads');
// const TEXTS_DIR = path.join(UPLOADS_DIR, 'texts');

// if (!fs.existsSync(TEXTS_DIR)) {
//     fs.mkdirSync(TEXTS_DIR, { recursive: true });
// }

// // Core OCR function
// const extractTextFromImage = async (filePath) => {
//     try {
//         const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
//         return text;
//     } catch (error) {
//         throw new Error('Image OCR failed: ' + error.message);
//     }
// };

// // Core PDF extraction function
// const extractTextFromPDF = async (filePath) => {
//     try {
//         const dataBuffer = fs.readFileSync(filePath);
//         // Ensure dataBuffer is valid before passing to pdf-parse
//         if (!dataBuffer || dataBuffer.length === 0) throw new Error("Empty PDF file");
        
//         const data = await pdfParse(dataBuffer);
//         return data.text || "No text found in PDF";
//     } catch (error) {
//         throw new Error('PDF extraction failed: ' + error.message);
//     }
// };

// exports.performExtraction = async (req, res) => {
//     if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

//     const filePath = req.file.path;
//     try {
//         const fileExtension = path.extname(req.file.originalname).toLowerCase();
//         let extractedText = '';
//         let fileType = '';

//         // Extraction Logic
//         if (fileExtension === '.pdf') {
//             extractedText = await extractTextFromPDF(filePath);
//             fileType = 'pdf';
//         } else if (['.jpg', '.jpeg', '.png'].includes(fileExtension)) {
//             extractedText = await extractTextFromImage(filePath);
//             fileType = 'image';
//         } else {
//             if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
//             return res.status(400).json({ msg: 'Unsupported file type' });
//         }

//         // SAVE TEXT FILE
//         const textFileName = `${req.file.filename}.txt`;
//         const textFilePath = path.join(TEXTS_DIR, textFileName);
//         fs.writeFileSync(textFilePath, extractedText, 'utf8');

//         // SAVE TO MONGODB
//         const newScan = new Scan({
//            userId: req.user ? req.user.id : null,
//             fileName: req.file.originalname,
//             fileType: fileType,
//             originalPath: filePath, 
//             extractedTextPath: textFilePath,
// //             originalPath: `uploads/${req.file.filename}`,
// // extractedTextPath: `uploads/texts/${textFileName}`,
//             extractionDate: new Date()
//         });

//         await newScan.save();

//         res.status(200).json({
//             extractedText,
//             msg: 'Extraction successful',
//             scanId: newScan._id
//         });

//     } catch (error) {
//         console.error('SERVER CRASH PREVENTED:', error.message);
//         // Clean up file on failure
//         if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
//         res.status(500).json({ msg: error.message });
//     }
// };
// exports.getScanHistory = async (req, res) => {
//     try {

//         if (!req.user) {
//             return res.status(401).json({ msg: "Not authorized" });
//         }

//         const scans = await Scan.find({ userId: req.user.id })
//             .sort({ extractionDate: -1 });

//         res.status(200).json(scans);

//     } catch (error) {
//         console.error("History Error:", error);
//         res.status(500).json({ msg: "Failed to fetch history" });
//     }
// };

// exports.getDashboardStats = async (req, res) => {
//     try {
//         if (!req.user) {
//             return res.status(401).json({ msg: "Not authorized" });
//         }

//         const userId = req.user.id;

//         const totalScans = await Scan.countDocuments({ userId });
//         const imageScans = await Scan.countDocuments({ userId, fileType: "image" });
//         const pdfScans = await Scan.countDocuments({ userId, fileType: "pdf" });

//         res.status(200).json({
//             totalScans,
//             imageScans,
//             pdfScans
//         });

//     } catch (error) {
//         console.error("Stats Error:", error);
//         res.status(500).json({ msg: error.message });
//     }
// };


// ... keep your getScanHistory and getDashboardStats as they are






// const fs = require('fs');
// const path = require('path');
// const Tesseract = require('tesseract.js');
// const pdfParse = require('pdf-parse');
// const Scan = require('../models/Scan');

// const UPLOADS_DIR = path.join(__dirname, '../uploads');
// const TEXTS_DIR = path.join(UPLOADS_DIR, 'texts');

// if (!fs.existsSync(TEXTS_DIR)) {
//     fs.mkdirSync(TEXTS_DIR, { recursive: true });
// }

// const extractTextFromImage = async (filePath) => {
//     try {
//         const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
//         return text;
//     } catch (error) {
//         throw new Error('Image OCR failed: ' + error.message);
//     }
// };

// const extractTextFromPDF = async (filePath) => {
//     try {
//         const dataBuffer = fs.readFileSync(filePath);
//         if (!dataBuffer || dataBuffer.length === 0) throw new Error("Empty PDF file");
//         const data = await pdfParse(dataBuffer);
//         return data.text || "No text found in PDF";
//     } catch (error) {
//         throw new Error('PDF extraction failed: ' + error.message);
//     }
// };

// exports.performExtraction = async (req, res) => {
//     if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

//     const filePath = req.file.path;
//     try {
//         const fileExtension = path.extname(req.file.originalname).toLowerCase();
//         let extractedText = '';
//         let fileType = '';

//         if (fileExtension === '.pdf') {
//             extractedText = await extractTextFromPDF(filePath);
//             fileType = 'pdf';
//         } else if (['.jpg', '.jpeg', '.png'].includes(fileExtension)) {
//             extractedText = await extractTextFromImage(filePath);
//             fileType = 'image';
//         } else {
//             if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
//             return res.status(400).json({ msg: 'Unsupported file type' });
//         }

//         const textFileName = `${req.file.filename}.txt`;
//         const textFilePath = path.join(TEXTS_DIR, textFileName);
//         fs.writeFileSync(textFilePath, extractedText, 'utf8');

//         const newScan = new Scan({
//             userId: req.user ? req.user.id : null,
//             fileName: req.file.originalname,
//             fileType: fileType,
//             originalPath: filePath,
//             extractedTextPath: textFilePath,
//             extractionDate: new Date()
//         });

//         await newScan.save();

//         res.status(200).json({
//             extractedText,
//             msg: 'Extraction successful',
//             scanId: newScan._id
//         });

//     } catch (error) {
//         console.error('SERVER CRASH PREVENTED:', error.message);
//         if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
//         res.status(500).json({ msg: error.message });
//     }
// };

// exports.getScanHistory = async (req, res) => {
//     try {
//         if (!req.user) return res.status(401).json({ msg: "Not authorized" });

//         const scans = await Scan.find({ userId: req.user.id })
//             .sort({ extractionDate: -1 });

//         res.status(200).json(scans);
//     } catch (error) {
//         console.error("History Error:", error);
//         res.status(500).json({ msg: "Failed to fetch history" });
//     }
// };

// exports.getDashboardStats = async (req, res) => {
//     try {
//         if (!req.user) return res.status(401).json({ msg: "Not authorized" });

//         const userId = req.user.id;
//         const totalScans = await Scan.countDocuments({ userId });
//         const imageScans = await Scan.countDocuments({ userId, fileType: "image" });
//         const pdfScans = await Scan.countDocuments({ userId, fileType: "pdf" });

//         res.status(200).json({ totalScans, imageScans, pdfScans });
//     } catch (error) {
//         console.error("Stats Error:", error);
//         res.status(500).json({ msg: error.message });
//     }
// };

// // ✅ NEW: Download original file
// exports.downloadOriginalFile = async (req, res) => {
//     try {
//         const scan = await Scan.findOne({ _id: req.params.id, userId: req.user.id });
//         if (!scan) return res.status(404).json({ msg: 'Scan not found' });

//         const filePath = scan.originalPath;
//         if (!fs.existsSync(filePath)) {
//             return res.status(404).json({ msg: 'File not found on server' });
//         }

//         res.download(filePath, scan.fileName);
//     } catch (error) {
//         console.error('Download error:', error);
//         res.status(500).json({ msg: error.message });
//     }
// };

// // ✅ NEW: View extracted text
// exports.viewTextFile = async (req, res) => {
//     try {
//         const scan = await Scan.findOne({ _id: req.params.id, userId: req.user.id });
//         if (!scan) return res.status(404).json({ msg: 'Scan not found' });

//         const textPath = scan.extractedTextPath;
//         if (!fs.existsSync(textPath)) {
//             return res.status(404).json({ msg: 'Text file not found' });
//         }

//         const text = fs.readFileSync(textPath, 'utf8');
//         res.status(200).json({ text, fileName: scan.fileName });
//     } catch (error) {
//         console.error('Text view error:', error);
//         res.status(500).json({ msg: error.message });
//     }
// };

// exports.translateText = async (req, res) => {
//     const { text, targetLang } = req.body;
//     if (!text || !targetLang) return res.status(400).json({ msg: 'text and targetLang required' });
//     try {
//         const axios = require('axios');
//         const response = await axios.get('https://translate.googleapis.com/translate_a/single', {
//             params: { client: 'gtx', sl: 'auto', tl: targetLang, dt: 't', q: text }
//         });
//         const translated = response.data[0]?.map((item) => item[0]).filter(Boolean).join('');
//         res.status(200).json({ translatedText: translated });
//     } catch (error) {
//         console.error('Translation error:', error.message);
//         res.status(500).json({ msg: 'Translation failed' });
//     }
// };


const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');
const Scan = require('../models/Scan');

const UPLOADS_DIR = path.join(__dirname, '../uploads');
const TEXTS_DIR = path.join(UPLOADS_DIR, 'texts');

if (!fs.existsSync(TEXTS_DIR)) {
    fs.mkdirSync(TEXTS_DIR, { recursive: true });
}

const extractTextFromImage = async (filePath) => {
    try {
        const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
        return text;
    } catch (error) {
        throw new Error('Image OCR failed: ' + error.message);
    }
};

const extractTextFromPDF = async (filePath) => {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        if (!dataBuffer || dataBuffer.length === 0) throw new Error("Empty PDF file");
        const data = await pdfParse(dataBuffer);
        return data.text || "No text found in PDF";
    } catch (error) {
        throw new Error('PDF extraction failed: ' + error.message);
    }
};

exports.performExtraction = async (req, res) => {
    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

    const filePath = req.file.path;
    try {
        const fileExtension = path.extname(req.file.originalname).toLowerCase();
        let extractedText = '';
        let fileType = '';

        if (fileExtension === '.pdf') {
            extractedText = await extractTextFromPDF(filePath);
            fileType = 'pdf';
        } else if (['.jpg', '.jpeg', '.png'].includes(fileExtension)) {
            extractedText = await extractTextFromImage(filePath);
            fileType = 'image';
        } else {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            return res.status(400).json({ msg: 'Unsupported file type' });
        }

        const textFileName = `${req.file.filename}.txt`;
        const textFilePath = path.join(TEXTS_DIR, textFileName);
        fs.writeFileSync(textFilePath, extractedText, 'utf8');

        const newScan = new Scan({
            userId: req.user ? req.user.id : null,
            fileName: req.file.originalname,
            fileType: fileType,
            originalPath: filePath,
            extractedTextPath: textFilePath,
            extractionDate: new Date()
        });

        await newScan.save();

        res.status(200).json({
            extractedText,
            msg: 'Extraction successful',
            scanId: newScan._id
        });

    } catch (error) {
        console.error('SERVER CRASH PREVENTED:', error.message);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.status(500).json({ msg: error.message });
    }
};

exports.getScanHistory = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ msg: "Not authorized" });
        const scans = await Scan.find({ userId: req.user.id }).sort({ extractionDate: -1 });
        res.status(200).json(scans);
    } catch (error) {
        console.error("History Error:", error);
        res.status(500).json({ msg: "Failed to fetch history" });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ msg: "Not authorized" });
        const userId = req.user.id;
        const totalScans = await Scan.countDocuments({ userId });
        const imageScans = await Scan.countDocuments({ userId, fileType: "image" });
        const pdfScans  = await Scan.countDocuments({ userId, fileType: "pdf" });
        res.status(200).json({ totalScans, imageScans, pdfScans });
    } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({ msg: error.message });
    }
};

exports.downloadOriginalFile = async (req, res) => {
    try {
        const scan = await Scan.findOne({ _id: req.params.id, userId: req.user.id });
        if (!scan) return res.status(404).json({ msg: 'Scan not found' });

        const filePath = scan.originalPath;
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ msg: 'File not found on server' });
        }

        res.download(filePath, scan.fileName);
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ msg: error.message });
    }
};

exports.viewTextFile = async (req, res) => {
    try {
        const scan = await Scan.findOne({ _id: req.params.id, userId: req.user.id });
        if (!scan) return res.status(404).json({ msg: 'Scan not found' });

        const textPath = scan.extractedTextPath;
        if (!fs.existsSync(textPath)) {
            return res.status(404).json({ msg: 'Text file not found' });
        }

        const text = fs.readFileSync(textPath, 'utf8');
        res.status(200).json({ text, fileName: scan.fileName });
    } catch (error) {
        console.error('Text view error:', error);
        res.status(500).json({ msg: error.message });
    }
};

// ✅ Translation via Google Translate (backend proxy — avoids CORS)
exports.translateText = async (req, res) => {
    const { text, targetLang } = req.body;

    if (!text || !targetLang) {
        return res.status(400).json({ msg: 'text and targetLang are required' });
    }

    try {
        // ✅ Smaller chunks = faster per request
        const CHUNK_SIZE = 300;
        const chunks = [];
        const words = text.split(' ');
        let current = "";

        for (const word of words) {
            if ((current + ' ' + word).length > CHUNK_SIZE && current.length > 0) {
                chunks.push(current.trim());
                current = word;
            } else {
                current = current ? current + ' ' + word : word;
            }
        }
        if (current.trim()) chunks.push(current.trim());

        console.log(`Backend translating ${chunks.length} chunk(s) to ${targetLang}`);

        const translatedChunks = [];
        for (const chunk of chunks) {
            try {
                const response = await axios.get(
                    'https://translate.googleapis.com/translate_a/single',
                    {
                        params: {
                            client: 'gtx',
                            sl: 'auto',
                            tl: targetLang,
                            dt: 't',
                            q: chunk
                        },
                        timeout: 30000, // ✅ 30s per chunk
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            'Referer': 'https://translate.google.com/',
                        }
                    }
                );

                const translated = response.data[0]
                    ?.map((item) => item[0])
                    .filter(Boolean)
                    .join('');

                translatedChunks.push(translated || chunk);

            } catch (chunkError) {
                // ✅ If one chunk fails, keep original text for that chunk
                console.warn(`Chunk failed, keeping original: ${chunkError.message}`);
                translatedChunks.push(chunk);
            }

            // ✅ Slightly longer delay to avoid throttling
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        res.status(200).json({ translatedText: translatedChunks.join(' ') });

    } catch (error) {
        console.error('Translation error:', error.message);
        res.status(500).json({ msg: 'Translation failed: ' + error.message });
    }
};