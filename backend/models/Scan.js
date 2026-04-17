// models/Scan.js
// Added: extractedText field to store the actual OCR text directly in DB
const mongoose = require('mongoose');

const ScanSchema = new mongoose.Schema({
  userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName:        { type: String, required: true },
  fileType:        { type: String, enum: ['pdf', 'image'], required: true },
  extractionDate:  { type: Date, default: Date.now },
  originalPath:    { type: String, required: true },
  extractedTextPath: { type: String, required: true },
  extractedText:   { type: String, default: '' },  // ← NEW: actual OCR text
}, { timestamps: true });

module.exports = mongoose.model('Scan', ScanSchema);