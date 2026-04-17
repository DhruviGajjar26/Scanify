// server.js  —  add these lines to your existing server.js
// ─────────────────────────────────────────────────────────────
// 1. Require the new OCR router  (add near your other route imports)
const ocrRoutes = require('./routes/ocr');

// 2. Mount it  (add after your other app.use() calls)
app.use('/api/ocr', ocrRoutes);

// ─────────────────────────────────────────────────────────────
// That's all you need to add.  Full minimal server shown below
// for reference — do NOT replace your existing server.js wholesale
// if it already has auth, DB connection, etc.
// ─────────────────────────────────────────────────────────────

/*
const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '25mb' }));

// Existing routes
const recipeRoutes = require('./routes/recipes');
app.use('/api/recipes', recipeRoutes);

// NEW — OCR route
const ocrRoutes = require('./routes/ocr');
app.use('/api/ocr', ocrRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => { console.error(err); process.exit(1); });
*/
