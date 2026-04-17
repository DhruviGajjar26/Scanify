const Recipe = require('../models/Recipe');

// Get all recipes
exports.getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new recipe
exports.createRecipe = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });
    const recipe = new Recipe({ name });
    await recipe.save();
    res.status(201).json(recipe);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update an existing recipe — uses $set with strict:false so any config shape is accepted
exports.updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const config  = req.body;

    console.log('[updateRecipe] id:', id);
    console.log('[updateRecipe] config keys:', Object.keys(config));

    // Use findById + save so Mongoose doesn't enforce schema shape on nested config
    const recipe = await Recipe.findById(id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    recipe.config        = config;
    recipe.lastModifiedOn = Date.now();
    recipe.markModified('config');   // ← tells Mongoose the mixed field changed

    await recipe.save();

    console.log('[updateRecipe] saved OK');
    res.json(recipe);
  } catch (error) {
    console.error('[updateRecipe] ERROR:', error.message);
    res.status(400).json({ message: error.message });
  }
};

// Get a single recipe
exports.getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a recipe
exports.deleteRecipe = async (req, res) => {
  try {
    const deleted = await Recipe.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Recipe not found' });
    res.json({ message: 'Recipe deleted successfully', deletedRecipe: deleted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};