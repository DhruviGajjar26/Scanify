// // frontend/src/pages/ImageToTextPage.tsx
// import React, { useState } from 'react';
// import ImageTextSelector from '../components/scanner/ImageTextSelector';
// import { UploadCloud, CheckCircle, Search, Copy, Loader2, BookType, BotMessageSquare } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';
// import Tesseract from 'tesseract.js';
//  // Ensure Tesseract is installed

// const ImageToTextPage: React.FC = () => {
//     const { user } = useAuth();
//     const [uploadedFile, setUploadedFile] = useState<File | null>(null);
//     const [selectedText, setSelectedText] = useState<string>('');
//     const [allTextData, setAllTextData] = useState<Tesseract.Page | null>(null);
//     const [isExtracting, setIsExtracting] = useState<boolean>(false);
//     const [error, setError] = useState<string | null>(null);

//     const handleFileChange = (file: File | null) => {
//         setUploadedFile(file);
//         setAllTextData(null);
//         setSelectedText('');
//         setError(null);
//     };

//     const copyToClipboard = () => {
//         if (selectedText) {
//             navigator.clipboard.writeText(selectedText);
//         }
//     };

//     return (
//         <div className="space-y-12">
//             <header className="space-y-2">
//                 <h1 className="text-4xl font-extrabold text-accent">Image Text Selector</h1>
//                 <p className="text-lg text-text-secondary">Upload an image and draw a box to select specific text to extract.</p>
//             </header>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
//                 {/* Left Panel: Image Selector */}
//                 <ImageTextSelector
//                     file={uploadedFile}
//                     onFileChange={handleFileChange}
//                     // setAllTextData={setAllTextData}
//                     setSelectedText={setSelectedText}
//                     isExtracting={isExtracting}
//                     setIsExtracting={setIsExtracting}
//                     error={error}
//                     setError={setError}
//                 />

//                 {/* Right Panel: Result */}
//                 <div className="bg-surface border border-surface-accent p-8 rounded-panel flex flex-col h-[600px] space-y-6">
//                     <header className="flex justify-between items-center mb-6">
//                         <div className="flex items-center gap-3">
//                              <div className="w-10 h-10 rounded-xl bg-surface-accent flex items-center justify-center font-bold text-lg text-primary capitalize">
//                                 <Search className="w-5 h-5" />
//                             </div>
//                             <h3 className="text-xl font-bold text-accent">Selected Text</h3>
//                         </div>
//                         {selectedText && (
//                             <button
//                                 onClick={copyToClipboard}
//                                 className="px-4 py-2 text-xs font-semibold bg-surface-accent text-accent hover:bg-surface-accent/80 rounded-button inline-flex items-center gap-2"
//                             >
//                                 <Copy className="w-4 h-4" /> Copy
//                             </button>
//                         )}
//                     </header>

//                     <div className="flex-1 flex flex-col items-center justify-center border border-accent-icon/30 rounded-panel bg-background mb-8 relative">
//                         {isExtracting ? (
//                             <div className="flex flex-col items-center space-y-3">
//                                 <Loader2 className="w-10 h-10 text-primary animate-spin" />
//                                 <p className="text-text-secondary">Pre-extraction in progress... please wait.</p>
//                             </div>
//                         ) : selectedText ? (
//                             <textarea
//                                 value={selectedText}
//                                 onChange={(e) => setSelectedText(e.target.value)}
//                                 className="w-full h-full p-6 bg-transparent text-text-primary resize-none focus:outline-none"
//                             />
//                         ) : uploadedFile ? (
//                             <div className="flex flex-col items-center justify-center space-y-4 text-center px-10">
//                                 <Loader2 className="w-12 h-12 text-accent-icon" />
//                                 <p className="text-text-secondary">Image loaded. The extraction system is analyzing the full text and coordinates. Please wait for pre-extraction to complete.</p>
//                             </div>
//                         ) : (
//                             <div className="flex flex-col items-center justify-center space-y-4 text-center px-10">
//                                 <BotMessageSquare className="w-12 h-12 text-accent-icon" />
//                                 <p className="text-text-secondary">Upload an image on the left and draw a box over text you want to extract.</p>
//                             </div>
//                         )}
//                     </div>
//                      <div className="h-12"/> {/* Spacer so buttons align across panels */}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ImageToTextPage;





// import React, { useState } from "react";
// import ImageTextSelector from "../components/scanner/ImageTextSelector";
// import { Loader2, Copy, Search, BotMessageSquare } from "lucide-react";
// // import { useAuth } from "../context/AuthContext";

// const ImageToTextPage: React.FC = () => {
// //   const { user } = useAuth();
//   const [uploadedFile, setUploadedFile] = useState<File | null>(null);
//   const [selectedText, setSelectedText] = useState<string>("");
//   const [isExtracting, setIsExtracting] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleFileChange = (file: File | null) => {
//     setUploadedFile(file);
//     setSelectedText("");
//     setError(null);
//   };

//   const copyToClipboard = () => {
//     if (selectedText) navigator.clipboard.writeText(selectedText);
//   };

//   return (
//     <div className="space-y-12">
//       <header className="space-y-2">
//         <h1 className="text-4xl font-extrabold text-accent">Image Text Selector</h1>
//         <p className="text-lg text-text-secondary">
//           Upload an image and draw a box to select specific text.
//         </p>
//       </header>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
//         {/* Left Panel */}
//         <ImageTextSelector
//           file={uploadedFile}
//           onFileChange={handleFileChange}
//           setSelectedText={setSelectedText}
//           isExtracting={isExtracting}
//           setIsExtracting={setIsExtracting}
//           error={error}
//           setError={setError}
//         />

//         {/* Right Panel */}
//         <div className="bg-surface border border-surface-accent p-8 rounded-panel flex flex-col h-[600px] space-y-6">
//           <header className="flex justify-between items-center mb-6">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-xl bg-surface-accent flex items-center justify-center font-bold text-lg text-primary capitalize">
//                 <Search className="w-5 h-5" />
//               </div>
//               <h3 className="text-xl font-bold text-accent">Selected Text</h3>
//             </div>
//             {selectedText && (
//               <button
//                 onClick={copyToClipboard}
//                 className="px-4 py-2 text-xs font-semibold bg-surface-accent text-accent hover:bg-surface-accent/80 rounded-button inline-flex items-center gap-2"
//               >
//                 <Copy className="w-4 h-4" /> Copy
//               </button>
//             )}
//           </header>

//           <div className="flex-1 flex flex-col items-center justify-center border border-accent-icon/30 rounded-panel bg-background mb-8 relative w-full">
//             {isExtracting ? (
//               <div className="flex flex-col items-center space-y-3">
//                 <Loader2 className="w-10 h-10 text-primary animate-spin" />
//                 <p className="text-text-secondary">Extraction in progress... please wait.</p>
//               </div>
//             ) : selectedText ? (
//               <textarea
//                 value={selectedText}
//                 onChange={(e) => setSelectedText(e.target.value)}
//                 className="w-full h-full p-6 bg-transparent text-text-primary resize-none focus:outline-none"
//               />
//             ) : uploadedFile ? (
//               <p className="text-text-secondary">Draw a box on the left image to select text.</p>
//             ) : (
//               <div className="flex flex-col items-center justify-center space-y-4 text-center px-10">
//                 <BotMessageSquare className="w-12 h-12 text-accent-icon" />
//                 <p className="text-text-secondary">
//                   Upload an image on the left and draw a box over text to extract it.
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ImageToTextPage;


import React, { useState, useRef, useEffect } from 'react';
import type { MouseEvent } from 'react';
import { Search, Copy, Loader2, BotMessageSquare, Scissors } from 'lucide-react';
import { createWorker } from 'tesseract.js';

const ImageToTextPage: React.FC = () => {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedText, setSelectedText] = useState<string>('');
    const [isExtracting, setIsExtracting] = useState<boolean>(false);

    // Selection Box State
    const [isDrawing, setIsDrawing] = useState(false);
    const [coords, setCoords] = useState({ x: 0, y: 0, w: 0, h: 0 });
    const imgRef = useRef<HTMLImageElement>(null);

    // ✅ Use a persistent worker instead of calling Tesseract.recognize each time
    const workerRef = useRef<any>(null);

    useEffect(() => {
        const initWorker = async () => {
            const worker = await createWorker('eng');
            workerRef.current = worker;
        };
        initWorker();
        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setSelectedText('');
            setCoords({ x: 0, y: 0, w: 0, h: 0 });
        }
    };

    // --- SELECTION LOGIC ---
    const handleMouseDown = (e: MouseEvent) => {
        if (!previewUrl) return;
        const rect = imgRef.current?.getBoundingClientRect();
        if (!rect) return;

        setIsDrawing(true);
        setCoords({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            w: 0,
            h: 0
        });
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDrawing || !imgRef.current) return;
        const rect = imgRef.current.getBoundingClientRect();

        setCoords(prev => ({
            ...prev,
            w: (e.clientX - rect.left) - prev.x,
            h: (e.clientY - rect.top) - prev.y
        }));
    };

    const handleMouseUp = async () => {
        setIsDrawing(false);
        if (!uploadedFile || !imgRef.current || Math.abs(coords.w) < 5) return;

        setIsExtracting(true);
        try {
            // ✅ Map CSS pixels → natural image pixels
            const scaleX = imgRef.current.naturalWidth / imgRef.current.clientWidth;
            const scaleY = imgRef.current.naturalHeight / imgRef.current.clientHeight;

            const left   = Math.min(coords.x, coords.x + coords.w);
            const top    = Math.min(coords.y, coords.y + coords.h);
            const width  = Math.abs(coords.w);
            const height = Math.abs(coords.h);

            if (width < 10 || height < 10) {
                setIsExtracting(false);
                return;
            }

            // ✅ Rectangle in natural image pixel space
            const rectangle = {
                left:   Math.round(left   * scaleX),
                top:    Math.round(top    * scaleY),
                width:  Math.round(width  * scaleX),
                height: Math.round(height * scaleY),
            };

            console.log("RECT (natural px):", rectangle);
            console.log("Image natural size:", imgRef.current.naturalWidth, imgRef.current.naturalHeight);

            if (!workerRef.current) {
                console.error("Worker not ready");
                return;
            }

            // ✅ Correct way to pass rectangle in tesseract.js v4+
            const { data: { text } } = await workerRef.current.recognize(
                uploadedFile,
                { rectangle }   // <-- rectangle goes here as second arg to recognize
            );

            console.log("OCR RESULT:", text);
            setSelectedText(text.trim() || "No text found in selected area");

        } catch (err) {
            console.error("OCR Error:", err);
            setSelectedText("OCR failed. Please try again.");
        } finally {
            setIsExtracting(false);
        }
    };

    const copyToClipboard = () => {
        if (selectedText) navigator.clipboard.writeText(selectedText);
    };

    return (
        <div className="p-8 space-y-8 bg-[#0a0a0c] min-h-screen text-white">
            <header className="space-y-2">
                <h1 className="text-4xl font-extrabold text-[#a855f7]">Image Text Selector</h1>
                <p className="text-gray-400">Upload an image and draw a box to select specific text to extract.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                {/* LEFT PANEL: Drawing Area */}
                <div className="flex flex-col space-y-4">
                    <div className="flex justify-between items-center bg-[#16161a] p-4 rounded-t-xl border border-gray-800">
                        <div className="flex items-center gap-2">
                            <Scissors className="w-5 h-5 text-[#a855f7]" />
                            <span className="font-bold font-sans">Draw Selection Box</span>
                        </div>
                        <input type="file" id="file-up" className="hidden" onChange={handleFileChange} accept="image/*" />
                        <label htmlFor="file-up" className="cursor-pointer bg-[#a855f7] hover:bg-[#9333ea] px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                            Change
                        </label>
                    </div>

                    <div className="relative border-2 border-gray-800 rounded-b-xl overflow-hidden bg-black/40">
                        {previewUrl ? (
                            <div
                                className="relative cursor-crosshair"
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                            >
                                <img
                                    ref={imgRef}
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full h-auto select-none pointer-events-none"
                                    draggable={false}
                                />
                                {/* Visual Selection Box Overlay */}
                                {(isDrawing || coords.w !== 0) && (
                                    <div
                                        className="absolute border-2 border-[#a855f7] bg-[#a855f7]/10 pointer-events-none"
                                        style={{
                                            left:   Math.min(coords.x, coords.x + coords.w),
                                            top:    Math.min(coords.y, coords.y + coords.h),
                                            width:  Math.abs(coords.w),
                                            height: Math.abs(coords.h)
                                        }}
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="h-[400px] flex flex-col justify-center items-center italic text-gray-500 gap-4">
                                <BotMessageSquare className="w-12 h-12 opacity-20" />
                                <p>Upload an image to start selection</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT PANEL: Extraction Result */}
                <div className="bg-[#16161a] border border-gray-800 p-8 rounded-xl h-[550px] flex flex-col space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Search className="w-6 h-6 text-[#a855f7]" />
                            <h3 className="text-xl font-bold">Selected Text</h3>
                        </div>
                        {selectedText && (
                            <button onClick={copyToClipboard} className="flex items-center gap-2 text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-700">
                                <Copy className="w-4 h-4" /> Copy
                            </button>
                        )}
                    </div>

                    <div className="flex-1 bg-[#0a0a0c] border border-gray-800 rounded-lg relative overflow-hidden">
                        {isExtracting ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-black/60 backdrop-blur-sm z-10">
                                <Loader2 className="w-10 h-10 text-[#a855f7] animate-spin" />
                                <p className="text-sm text-gray-300">Analyzing selection...</p>
                            </div>
                        ) : selectedText ? (
                            <textarea
                                value={selectedText}
                                onChange={(e) => setSelectedText(e.target.value)}
                                className="w-full h-full p-6 bg-transparent text-gray-200 resize-none focus:outline-none font-sans leading-relaxed"
                            />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-10 text-center text-gray-500">
                                <p>Select an area on the image to see extracted text here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageToTextPage;
