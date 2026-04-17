// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// // Create upload directory if it doesn't exist
// const uploadDir = 'uploads/';
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir);
// }

// // Multer storage config
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, uploadDir);
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${Date.now()}_${file.originalname}`);
//     },
// });

// // File filter to allow only images and PDFs
// const fileFilter = (req, file, cb) => {
//     const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
//     const fileExtension = path.extname(file.originalname).toLowerCase();
    
//     if (allowedExtensions.includes(fileExtension)) {
//         cb(null, true);
//     } else {
//         cb(new Error('Only JPG, JPEG, PNG, and PDF files are allowed.'), false);
//     }
// };

// const upload = multer({
//     storage,
//     fileFilter,
//     limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit as in design
// });

// module.exports = upload;

// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// 1. IMPROVED: Create base and subdirectories recursively
// const uploadDir = 'uploads/';
// const textsDir = 'uploads/texts/';
// const path = require('path');

// const uploadDir = path.join(__dirname, '../uploads');
// const textsDir = path.join(uploadDir, 'texts');

// [uploadDir, textsDir].forEach(dir => {
//     if (!fs.existsSync(dir)) {
//         fs.mkdirSync(dir, { recursive: true });
//     }
// });

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, uploadDir);
//     },
//     filename: (req, file, cb) => {
//         // Remove spaces from filenames to prevent path errors
//         const safeName = file.originalname.replace(/\s+/g, '_');
//         cb(null, `${Date.now()}_${safeName}`);
//     },
// });

// const fileFilter = (req, file, cb) => {
//     const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
//     const fileExtension = path.extname(file.originalname).toLowerCase();
    
//     if (allowedExtensions.includes(fileExtension)) {
//         cb(null, true);
//     } else {
//         // 2. IMPROVED: Use a proper Error object for Multer
//         cb(new Error('Only JPG, JPEG, PNG, and PDF files are allowed.'), false);
//     }
// };

// const upload = multer({
//     storage,
//     fileFilter,
//     limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
// });

// module.exports = upload;


const multer = require('multer');
const path = require('path');
const fs = require('fs');

//  Use absolute path based on backend folder
const uploadDir = path.join(__dirname, '../uploads');
const textsDir = path.join(uploadDir, 'texts');

// Create folders safely
[uploadDir, textsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);   // 🔥 This now correctly points to backend/uploads
    },
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/\s+/g, '_');
        cb(null, `${Date.now()}_${safeName}`);
    },
});

//  File filter
const fileFilter = (req, file, cb) => {
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(fileExtension)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPG, JPEG, PNG, and PDF files are allowed.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});


module.exports = upload;