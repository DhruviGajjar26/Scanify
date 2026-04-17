// // backend/routes/translate.js

// const express = require('express');
// const router = express.Router();
// const translate = require('google-translate-api-x');

// router.post('/translate', async (req, res) => {
//     try {

//         const { text, targetLang } = req.body;

//         // ❌ ERROR POINT: text missing
//         if (!text) {
//             return res.status(400).json({ error: "No text provided" });
//         }

//         // ❌ ERROR POINT: language missing
//         if (!targetLang) {
//             return res.status(400).json({ error: "Target language missing" });
//         }

//         console.log("Incoming Text:", text.substring(0,100)); // DEBUG
//         console.log("Target Language:", targetLang); // DEBUG

//         const result = await translate(text, { to: targetLang });

//         console.log("Translated Result:", result.text); // DEBUG

//         res.json({
//             translatedText: result.text
//         });

//     } catch (error) {

//         //  THIS WILL SHOW REAL ERROR
//         console.error("Translation Error FULL:", error);

//         res.status(500).json({
//             error: "Translation API error",
//             message: error.message
//         });
//     }
// });

// module.exports = router;