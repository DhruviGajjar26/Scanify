// models/Recipe.js
// config is stored as Mixed (Schema.Types.Mixed) so ANY shape is accepted —
// no more schema mismatch errors when saving allImageData, ocrResults, etc.

const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true, trim: true },
    description:   { type: String, default: '' },
    config:        { type: mongoose.Schema.Types.Mixed, default: {} }, // ← accepts any shape
    lastModifiedOn:{ type: Date, default: Date.now },
    createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Recipe || mongoose.model('Recipe', RecipeSchema);