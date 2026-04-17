const express = require('express');
const connectDB = require('./config/db.js');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const recipeRoutes = require('./routes/recipeRoutes');
const ocrRoutes = require('./routes/ocr');         // ← ADD THIS LINE
// const translateRoutes = require('./routes/translate');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
// app.use(express.json()); // Parse JSON bodies

// add by parth
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.use(express.urlencoded({ extended: true }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// DB Connection
connectDB();

// Routes
app.use('/api/recipes', recipeRoutes);
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/scans', require('./routes/scanRoutes'));
app.use('/api/ocr', ocrRoutes);                    // ← ADD THIS LINE (BEFORE 404 handler)

// Basic 404 handler  ← must stay LAST
app.use((req, res, next) => {
    res.status(404).json({ msg: 'API route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Error Stack:', err.stack);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        msg: err.message || 'Something went wrong on the server',
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
