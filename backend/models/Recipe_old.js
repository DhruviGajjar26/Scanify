const mongoose = require('mongoose');

// Define the blueprint for our recipe data
const RecipeSchema = new mongoose.Schema({
  recipeName: {
    type: String,
    required: true,
    trim: true // Remove leading/trailing whitespace
  },
  lastModifiedOn: {
    type: Date,
    default: Date.now // Automatically set the date when created/updated
  },
  config: {
    type: Object,
    default: {}
  }
});

module.exports = mongoose.model('Recipe', RecipeSchema);