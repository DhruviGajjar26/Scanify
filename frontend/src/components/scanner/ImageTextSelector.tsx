// import React, { useState, useRef, useEffect } from 'react';
// import { UploadCloud, Maximize2, Loader2 } from 'lucide-react';
// import Tesseract from 'tesseract.js';
// import type { MouseEvent } from 'react';
// interface Rect {
//     x1: number;
//     y1: number;
//     x2: number;
//     y2: number;
// }

// interface BboxRect extends Rect {
//     width: number;
//     height: number;
// }

// interface TesseractWord {
//     text: string;
//     bbox: {
//         x0: number;
//         y0: number;
//         x1: number;
//         y1: number;
//     };
// }

// interface ImageTextSelectorProps {
//     file: File | null;
//     onFileChange: (file: File | null) => void;
//     setAllTextData: (data: any | null) => void;
//     setSelectedText: (text: string) => void;
//     isExtracting: boolean;
//     setIsExtracting: (isLoading: boolean) => void;
//     setError: (error: string | null) => void;
//     error: string | null;
// }

// const ImageTextSelector: React.FC<ImageTextSelectorProps> = ({
//     file,
//     onFileChange,
//     setAllTextData,
//     setSelectedText,
//     isExtracting,
//     setIsExtracting,
//     setError,
//     error
// }) => {

//     const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
//     const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
//     const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
//     const [userBox, setUserBox] = useState<BboxRect | null>(null);
//     const [interactionBox, setInteractionBox] = useState<BboxRect | null>(null);
//     const [isPreExtracted, setIsPreExtracted] = useState(false);
//     const [extractedWords, setExtractedWords] = useState<TesseractWord[]>([]);

//     const fileInputRef = useRef<HTMLInputElement>(null);
//     const imageRef = useRef<HTMLImageElement>(null);

//     const isMouseDownRef = useRef(false);
//     const startXRef = useRef(0);
//     const startYRef = useRef(0);

//     // ================= PRE-EXTRACT OCR =================
//     // const preExtractTesseractData = async (fileToProcess: File) => {
//     //     setIsPreExtracted(false);
//     //     setAllTextData(null);
//     //     setSelectedText('');
//     //     setError(null);
//     //     setIsExtracting(true);

//     //     try {
//     //         const { data } = await Tesseract.recognize(fileToProcess, 'eng');

//     //         const words = (data as any).words as TesseractWord[];

//     //         setAllTextData(data);
//     //         setExtractedWords(words || []);
//     //         setIsPreExtracted(true);

//     //         if (words && words.length > 0) {
//     //             const firstWord = words[0];

//     //             const initialBox: BboxRect = {
//     //                 x1: firstWord.bbox.x0,
//     //                 y1: firstWord.bbox.y0,
//     //                 x2: firstWord.bbox.x1,
//     //                 y2: firstWord.bbox.y1,
//     //                 width: firstWord.bbox.x1 - firstWord.bbox.x0,
//     //                 height: firstWord.bbox.y1 - firstWord.bbox.y0,
//     //             };

//     //             setUserBox(initialBox);
//     //             setInteractionBox(initialBox);
//     //             calculateSelectedText(initialBox, words);
//     //         }

//     //     } catch (err) {
//     //         setError('Pre-extraction failed. Please retry.');
//     //     } finally {
//     //         setIsExtracting(false);
//     //     }
//     // };

//     const preExtractTesseractData = async (fileToProcess: File) => {
//     try {
//         setIsExtracting(true);
//         setError(null);
//         setSelectedText('');

//         const result = await Tesseract.recognize(fileToProcess, 'eng');

//         const words = (result.data as any).words || [];

//         console.log("OCR DONE", words); // debug

//         setExtractedWords(words);
//         setIsPreExtracted(true);

//     } catch (err) {
//         console.error(err);
//         setError("OCR failed");
//     } finally {
//         setIsExtracting(false); 
//     }
// };

//     // ================= FILE SELECT =================
//     const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//         if (e.target.files && e.target.files[0]) {
//             const selectedFile = e.target.files[0];
//             onFileChange(selectedFile);

//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 setImagePreviewUrl(reader.result as string);
//                 preExtractTesseractData(selectedFile);
//             };
//             reader.readAsDataURL(selectedFile);
//         }
//     };

//     // ================= IMAGE LOAD =================
//     const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
//         const img = e.target as HTMLImageElement;
//         setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
//     };

//     // ================= TEXT SELECTION =================
//     const calculateSelectedText = (box: BboxRect, wordsData: TesseractWord[]) => {
//         const selectedWords = wordsData.filter(word => {
//             const wordBox = word.bbox;

//             const overlapX = Math.max(
//                 0,
//                 Math.min(wordBox.x1, box.x2) - Math.max(wordBox.x0, box.x1)
//             );

//             const overlapY = Math.max(
//                 0,
//                 Math.min(wordBox.y1, box.y2) - Math.max(wordBox.y0, box.y1)
//             );

//             const overlapArea = overlapX * overlapY;
//             const wordArea = (wordBox.x1 - wordBox.x0) * (wordBox.y1 - wordBox.y0);

//             return overlapArea > 0.5 * wordArea;
//         });

//         const text = selectedWords.map(word => word.text).join(' ');
//         setSelectedText(text);
//     };

//     // ================= MOUSE EVENTS =================
//     const handleContainerMouseDown = (e: MouseEvent<HTMLDivElement>) => {
//         if (!isPreExtracted || !imageRef.current) return;

//         const rect = imageRef.current.getBoundingClientRect();
//         const scaleX = imageSize.width / rect.width;
//         const scaleY = imageSize.height / rect.height;

//         isMouseDownRef.current = true;

//         startXRef.current = Math.round((e.clientX - rect.left) * scaleX);
//         startYRef.current = Math.round((e.clientY - rect.top) * scaleY);

//         setInteractionBox({
//             x1: startXRef.current,
//             y1: startYRef.current,
//             x2: startXRef.current,
//             y2: startYRef.current,
//             width: 0,
//             height: 0,
//         });
//     };

//     const handleContainerMouseMove = (e: MouseEvent<HTMLDivElement>) => {
//         if (!isMouseDownRef.current || !imageRef.current) return;

//         const rect = imageRef.current.getBoundingClientRect();
//         const scaleX = imageSize.width / rect.width;
//         const scaleY = imageSize.height / rect.height;

//         const currentX = Math.round((e.clientX - rect.left) * scaleX);
//         const currentY = Math.round((e.clientY - rect.top) * scaleY);

//         setInteractionBox({
//             x1: Math.min(startXRef.current, currentX),
//             y1: Math.min(startYRef.current, currentY),
//             x2: Math.max(startXRef.current, currentX),
//             y2: Math.max(startYRef.current, currentY),
//             width: Math.abs(currentX - startXRef.current),
//             height: Math.abs(currentY - startYRef.current),
//         });
//     };

//     const handleContainerMouseUp = () => {
//         if (interactionBox && extractedWords.length > 0) {
//             setUserBox(interactionBox);
//             calculateSelectedText(interactionBox, extractedWords);
//         }

//         isMouseDownRef.current = false;
//     };

//     // ================= SCALE BOX =================
//     const getScaled = (value: number, dimension: 'width' | 'height') => {
//         if (!imageSize[dimension] || !displaySize[dimension]) return value;
//         return (value * displaySize[dimension]) / imageSize[dimension];
//     };

//     const scaledBox = userBox && {
//         left: getScaled(userBox.x1, 'width'),
//         top: getScaled(userBox.y1, 'height'),
//         width: getScaled(userBox.width, 'width'),
//         height: getScaled(userBox.height, 'height'),
//     };

//     useEffect(() => {
//         if (imageRef.current) {
//             const rect = imageRef.current.getBoundingClientRect();
//             setDisplaySize({ width: rect.width, height: rect.height });
//         }
//     }, [imagePreviewUrl]);

//     return (
//         <div className="bg-surface border p-6 rounded-lg h-[600px] flex flex-col">
//             <header className="flex justify-between mb-4">
//                 <h3 className="text-lg font-bold">Draw Selection Box</h3>
//                 {file && (
//                     <button onClick={() => fileInputRef.current?.click()}>
//                         Change
//                     </button>
//                 )}
//             </header>

//             <input
//                 type="file"
//                 ref={fileInputRef}
//                 onChange={handleFileSelect}
//                 accept="image/*"
//                 className="hidden"
//             />

//             <div
//                 className="flex-1 border-2 border-dashed relative flex items-center justify-center cursor-crosshair"
//                 onClick={() => {
//     if (!file) fileInputRef.current?.click();
//   }}
//                 onMouseDown={handleContainerMouseDown}
//                 onMouseMove={handleContainerMouseMove}
//                 onMouseUp={handleContainerMouseUp}
//             >
//                 {!file ? (
//                     <div className="text-center">
//                         <UploadCloud className="w-12 h-12 mx-auto mb-2" />
//                         <p>Click to upload image</p>
//                     </div>
//                 ) : (
//                     <div className="relative">
//                         <img
//                             src={imagePreviewUrl!}
//                             alt="Preview"
//                             ref={imageRef}
//                             onLoad={handleImageLoad}
//                             className="max-h-[400px] object-contain"
//                         />

//                         {isExtracting && (
//                             <Loader2 className="absolute top-1/2 left-1/2 animate-spin w-10 h-10" />
//                         )}

//                         {scaledBox && (
//                             <div
//                                 className="absolute border-2 border-blue-500 bg-blue-300/20"
//                                 style={scaledBox}
//                             />
//                         )}
//                     </div>
//                 )}
//             </div>

//             {error && <p className="text-red-500 mt-2">{error}</p>}
//         </div>
//     );
// };

// export default ImageTextSelector;







// import React, { useState, useRef, useEffect } from "react";
// import { UploadCloud, Loader2 } from "lucide-react";
// import Tesseract from "tesseract.js";
// import type { MouseEvent } from "react";

// interface Rect {
//   x1: number;
//   y1: number;
//   x2: number;
//   y2: number;
// }

// interface BboxRect extends Rect {
//   width: number;
//   height: number;
// }

// interface TesseractWord {
//   text: string;
//   bbox: {
//     x0: number;
//     y0: number;
//     x1: number;
//     y1: number;
//   };
// }

// interface ImageTextSelectorProps {
//   file: File | null;
//   onFileChange: (file: File | null) => void;
//   setSelectedText: (text: string) => void;
//   isExtracting: boolean;
//   setIsExtracting: (isLoading: boolean) => void;
//   setError: (error: string | null) => void;
//   error: string | null;
// }

// const ImageTextSelector: React.FC<ImageTextSelectorProps> = ({
//   file,
//   onFileChange,
//   setSelectedText,
//   isExtracting,
//   setIsExtracting,
//   setError,
//   error,
// }) => {
//   const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
//   const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
//   const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
//   const [interactionBox, setInteractionBox] = useState<BboxRect | null>(null);
//   const [extractedWords, setExtractedWords] = useState<TesseractWord[]>([]);
//   const [isPreExtracted, setIsPreExtracted] = useState(false);

//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const imageRef = useRef<HTMLImageElement>(null);

//   const isMouseDownRef = useRef(false);
//   const startXRef = useRef(0);
//   const startYRef = useRef(0);

//   // ================= OCR =================
// const preExtractTesseractData = async (fileToProcess: File) => {
//   try {
//     setIsExtracting(true);
//     setError(null);
//     setSelectedText("");

//     const { data } = await Tesseract.recognize(fileToProcess, "eng");

//     const words = data.words || [];

//     if (!words.length) {
//       setError("No text detected in image.");
//       setIsPreExtracted(false);
//     } else {
//       setExtractedWords(words);
//       setIsPreExtracted(true);
//     }

//   } catch (err) {
//     console.error(err);
//     setError("OCR failed. Try another image.");
//     setIsPreExtracted(false);
//   } finally {
//     setIsExtracting(false);  // VERY IMPORTANT
//   }
// };

//   // ================= FILE SELECT =================
//   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       const selectedFile = e.target.files[0];
//       onFileChange(selectedFile);

//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImagePreviewUrl(reader.result as string);
//         preExtractTesseractData(selectedFile);
//       };
//       reader.readAsDataURL(selectedFile);
//     }
//   };

//   // ================= IMAGE LOAD =================
//   const handleImageLoad = () => {
//     if (!imageRef.current) return;

//     setImageSize({
//       width: imageRef.current.naturalWidth,
//       height: imageRef.current.naturalHeight,
//     });

//     const rect = imageRef.current.getBoundingClientRect();
//     setDisplaySize({ width: rect.width, height: rect.height });
//   };

//   // ================= TEXT EXTRACTION =================
//   const calculateSelectedText = (box: BboxRect) => {
//     const selectedWords = extractedWords.filter((word) => {
//       const wordBox = word.bbox;

//       const overlapX = Math.max(
//         0,
//         Math.min(wordBox.x1, box.x2) - Math.max(wordBox.x0, box.x1)
//       );

//       const overlapY = Math.max(
//         0,
//         Math.min(wordBox.y1, box.y2) - Math.max(wordBox.y0, box.y1)
//       );

//       const overlapArea = overlapX * overlapY;
//       const wordArea =
//         (wordBox.x1 - wordBox.x0) * (wordBox.y1 - wordBox.y0);

//       return overlapArea > 0.4 * wordArea;
//     });

//     const text = selectedWords.map((w) => w.text).join(" ");
//     setSelectedText(text);
//   };

//   // ================= MOUSE EVENTS =================
//   const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
//    if (!imageRef.current || extractedWords.length === 0) return;

//     const rect = imageRef.current.getBoundingClientRect();
//     const scaleX = imageSize.width / rect.width;
//     const scaleY = imageSize.height / rect.height;

//     isMouseDownRef.current = true;

//     startXRef.current = (e.clientX - rect.left) * scaleX;
//     startYRef.current = (e.clientY - rect.top) * scaleY;

//     setInteractionBox({
//       x1: startXRef.current,
//       y1: startYRef.current,
//       x2: startXRef.current,
//       y2: startYRef.current,
//       width: 0,
//       height: 0,
//     });
//   };

//   const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
//     if (!isMouseDownRef.current || !imageRef.current) return;

//     const rect = imageRef.current.getBoundingClientRect();
//     const scaleX = imageSize.width / rect.width;
//     const scaleY = imageSize.height / rect.height;

//     const currentX = (e.clientX - rect.left) * scaleX;
//     const currentY = (e.clientY - rect.top) * scaleY;

//     setInteractionBox({
//       x1: Math.min(startXRef.current, currentX),
//       y1: Math.min(startYRef.current, currentY),
//       x2: Math.max(startXRef.current, currentX),
//       y2: Math.max(startYRef.current, currentY),
//       width: Math.abs(currentX - startXRef.current),
//       height: Math.abs(currentY - startYRef.current),
//     });
//   };

//   const handleMouseUp = () => {
//     if (interactionBox) {
//       calculateSelectedText(interactionBox);
//     }
//     isMouseDownRef.current = false;
//   };

//   // ================= SCALE BOX =================
//   const getScaled = (value: number, dimension: "width" | "height") => {
//     return (value * displaySize[dimension]) / imageSize[dimension];
//   };

//   const scaledBox =
//     interactionBox && imageSize.width
//       ? {
//           left: getScaled(interactionBox.x1, "width"),
//           top: getScaled(interactionBox.y1, "height"),
//           width: getScaled(interactionBox.width, "width"),
//           height: getScaled(interactionBox.height, "height"),
//         }
//       : null;

//   return (
//     <div className="bg-surface border p-6 rounded-lg h-[600px] flex flex-col">
//       <header className="flex justify-between mb-4">
//         <h3 className="text-lg font-bold">Draw Selection Box</h3>
//         {file && (
//           <button onClick={() => fileInputRef.current?.click()}>
//             Change
//           </button>
//         )}
//       </header>

//       <input
//         type="file"
//         ref={fileInputRef}
//         onChange={handleFileSelect}
//         accept="image/*"
//         className="hidden"
//       />

//       <div
//         className="flex-1 border-2 border-dashed relative flex items-center justify-center cursor-crosshair"
//         onClick={() => !file && fileInputRef.current?.click()}
//         onMouseDown={handleMouseDown}
//         onMouseMove={handleMouseMove}
//         onMouseUp={handleMouseUp}
//       >
//         {!file ? (
//           <div className="text-center">
//             <UploadCloud className="w-12 h-12 mx-auto mb-2" />
//             <p>Click to upload image</p>
//           </div>
//         ) : (
//           <div className="relative">
//             <img
//               src={imagePreviewUrl!}
//               alt="Preview"
//               ref={imageRef}
//               onLoad={handleImageLoad}
//               className="max-h-[400px] object-contain"
//             />

//             {isExtracting && (
//               <Loader2 className="absolute top-1/2 left-1/2 animate-spin w-10 h-10" />
//             )}

//             {scaledBox && (
//               <div
//                 className="absolute border-2 border-blue-500 bg-blue-300/20"
//                 style={scaledBox}
//               />
//             )}
//           </div>
//         )}
//       </div>

//       {error && <p className="text-red-500 mt-2">{error}</p>}
//     </div>
//   );
// };










// import React, { useState, useRef, useEffect } from "react";
// import { UploadCloud, Loader2 } from "lucide-react";
// import { createWorker } from "tesseract.js";

// // import type { Worker } from "tesseract.js";
// interface ImageTextSelectorProps {
//   file: File | null;
//   onFileChange: (file: File | null) => void;
//   setSelectedText: React.Dispatch<React.SetStateAction<string>>;
//   isExtracting: boolean;
//   setIsExtracting: React.Dispatch<React.SetStateAction<boolean>>;
//   error: string | null;
//   setError: React.Dispatch<React.SetStateAction<string | null>>;
// }

// interface BboxRect {
//   x1: number;
//   y1: number;
//   x2: number;
//   y2: number;
//   width: number;
//   height: number;
// }

// interface OCRWord {
//   text: string;
//   bbox: {
//     x0: number;
//     y0: number;
//     x1: number;
//     y1: number;
//   };
// }

// const ImageTextSelector: React.FC<ImageTextSelectorProps> = ({
//   file,
//   onFileChange,
//   setSelectedText,
//   isExtracting,
//   setIsExtracting,
//   error,
//   setError,
// }) => {
//   const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
//   const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
//   const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
//   const [interactionBox, setInteractionBox] = useState<BboxRect | null>(null);
//   const [extractedWords, setExtractedWords] = useState<OCRWord[]>([]);

//   const imageRef = useRef<HTMLImageElement>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const workerRef = useRef<any>(null);

//   const isMouseDownRef = useRef(false);
//   const startXRef = useRef(0);
//   const startYRef = useRef(0);

//   // ================= INIT WORKER =================
// useEffect(() => {
//   const initWorker = async () => {

//     const worker = await createWorker({
//       logger: (m) => console.log("OCR:", m)
//     });

//     await worker.loadLanguage("eng");
//     await worker.initialize("eng");

//     workerRef.current = worker;
//   };

//   initWorker();

//   return () => {
//     workerRef.current?.terminate();
//   };
// }, []);

//   // ================= OCR =================
//   // const runOCR = async (file: File) => {
//   //   if (!workerRef.current) return;

//   //   setIsExtracting(true);
//   //   setError(null);
//   //   setSelectedText("");
//   //   setExtractedWords([]);

//   //   try {
//   //     const fileURL = URL.createObjectURL(file);

//   //     await workerRef.current.setParameters({ tessedit_create_tsv: "1" });
//   //     const { data } = await workerRef.current.recognize(fileURL);

//   //     URL.revokeObjectURL(fileURL);

//   //     if (!data.tsv) {
//   //       setError("No word data generated");
//   //       setExtractedWords([]);
//   //       return;
//   //     }

//   //     const lines = data.tsv.split("\n");
//   //     const words: OCRWord[] = [];

//   //     for (let i = 1; i < lines.length; i++) {
//   //       const cols = lines[i].split("\t");
//   //       if (cols.length < 12) continue;
//   //       if (parseInt(cols[0]) !== 5) continue; // word level

//   //       const text = cols[11];
//   //       const left = parseInt(cols[6]);
//   //       const top = parseInt(cols[7]);
//   //       const width = parseInt(cols[8]);
//   //       const height = parseInt(cols[9]);

//   //       if (text.trim()) {
//   //         words.push({ text, bbox: { x0: left, y0: top, x1: left + width, y1: top + height } });
//   //       }
//   //     }

//   //     if (words.length === 0) {
//   //       setError("No words detected");
//   //       setExtractedWords([]);
//   //     } else {
//   //       setExtractedWords(words);
//   //       setSelectedText(words.map((w) => w.text).join(" ")); // full text
//   //     }
//   //   } catch (err) {
//   //     console.error(err);
//   //     setError("OCR failed");
//   //     setExtractedWords([]);
//   //   } finally {
//   //     setIsExtracting(false);
//   //   }
//   // };


//   const runOCR = async (file: File) => {
//   if (!workerRef.current) return;

//   setIsExtracting(true);
//   setError(null);
//   setSelectedText("");
//   setExtractedWords([]);

//   try {
//     const imageURL = URL.createObjectURL(file);

//     const { data }: any = await workerRef.current.recognize(imageURL);

//     URL.revokeObjectURL(imageURL);

//     if (!data.words || data.words.length === 0) {
//       setError("No words detected");
//       return;
//     }

//     const words: OCRWord[] = data.words.map((w: any) => ({
//       text: w.text,
//       bbox: {
//         x0: w.bbox.x0,
//         y0: w.bbox.y0,
//         x1: w.bbox.x1,
//         y1: w.bbox.y1,
//       },
//     }));
// console.log("OCR WORDS:", words);
//     setExtractedWords(words);

//     // show full OCR text initially
//     setSelectedText(words.map((w) => w.text).join(" "));
//   } catch (err) {
//     console.error(err);
//     setError("OCR failed");
//   } finally {
//     setIsExtracting(false);
//   }
// };

//   // ================= FILE SELECT =================
//   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files?.[0]) return;

//     const selectedFile = e.target.files[0];
//     onFileChange(selectedFile);

//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setImagePreviewUrl(reader.result as string);
//       runOCR(selectedFile);
//     };
//     reader.readAsDataURL(selectedFile);
//   };

//   // ================= IMAGE LOAD =================
//   const handleImageLoad = () => {
//     if (!imageRef.current) return;

//     setImageSize({
//       width: imageRef.current.naturalWidth,
//       height: imageRef.current.naturalHeight,
//     });

//     const rect = imageRef.current.getBoundingClientRect();
//     setDisplaySize({ width: rect.width, height: rect.height });
//   };

//   // ================= TEXT EXTRACTION FROM BOX =================
// const calculateSelectedText = (box: BboxRect) => {

//   console.log("BOX:", box);
//   console.log("WORDS:", extractedWords);

//   const selectedWords = extractedWords.filter((word) => {
//     const w = word.bbox;

//     const intersects =
//       !(w.x1 < box.x1 ||
//         w.x0 > box.x2 ||
//         w.y1 < box.y1 ||
//         w.y0 > box.y2);

//     return intersects;
//   });

//   console.log("SELECTED:", selectedWords);

//   const text = selectedWords.map((w) => w.text).join(" ");

//   setSelectedText(text);
// };

//   // ================= MOUSE EVENTS =================
//   const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
//     if (!imageRef.current || extractedWords.length === 0) return;

//     // const rect = imageRef.current.getBoundingClientRect();
//     const rect = (e.target as HTMLElement).getBoundingClientRect();
//     const scaleX = imageSize.width / rect.width;
//     const scaleY = imageSize.height / rect.height;

//     isMouseDownRef.current = true;
//     startXRef.current = (e.clientX - rect.left) * scaleX;
//     startYRef.current = (e.clientY - rect.top) * scaleY;

//     setInteractionBox({
//       x1: startXRef.current,
//       y1: startYRef.current,
//       x2: startXRef.current,
//       y2: startYRef.current,
//       width: 0,
//       height: 0,
//     });
//   };

//   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
//     if (!isMouseDownRef.current || !imageRef.current) return;

//     const rect = imageRef.current.getBoundingClientRect();
//     const scaleX = imageSize.width / rect.width;
//     const scaleY = imageSize.height / rect.height;

//     const currentX = (e.clientX - rect.left) * scaleX;
//     const currentY = (e.clientY - rect.top) * scaleY;

//     setInteractionBox({
//       x1: Math.min(startXRef.current, currentX),
//       y1: Math.min(startYRef.current, currentY),
//       x2: Math.max(startXRef.current, currentX),
//       y2: Math.max(startYRef.current, currentY),
//       width: Math.abs(currentX - startXRef.current),
//       height: Math.abs(currentY - startYRef.current),
//     });
//   };

//   const handleMouseUp = () => {
//     if (!interactionBox) return;
//     isMouseDownRef.current = false;
//     calculateSelectedText(interactionBox);
//   };

//   // ================= SCALE BOX =================
//   const scaledBox =
//     interactionBox && imageSize.width
//       ? {
//           left: (interactionBox.x1 * displaySize.width) / imageSize.width,
//           top: (interactionBox.y1 * displaySize.height) / imageSize.height,
//           width: (interactionBox.width * displaySize.width) / imageSize.width,
//           height: (interactionBox.height * displaySize.height) / imageSize.height,
//         }
//       : null;

//   return (
//     <div className="bg-surface border p-6 rounded-lg h-[600px] flex flex-col">
//       <header className="flex justify-between mb-4">
//         <h3 className="text-lg font-bold">Draw Selection Box</h3>
//         {file && <button onClick={() => fileInputRef.current?.click()}>Change</button>}
//       </header>

//       <input
//         type="file"
//         ref={fileInputRef}
//         onChange={handleFileSelect}
//         accept="image/*"
//         className="hidden"
//       />

//       <div
//         className="flex-1 border-2 border-dashed relative flex items-center justify-center cursor-crosshair"
//         onClick={() => !file && fileInputRef.current?.click()}
//         onMouseDown={handleMouseDown}
//         onMouseMove={handleMouseMove}
//         onMouseUp={handleMouseUp}
//       >
//         {!file ? (
//           <div className="text-center">
//             <UploadCloud className="w-12 h-12 mx-auto mb-2" />
//             <p>Click to upload image</p>
//           </div>
//         ) : (
//           <div className="relative">
//             <img
//               src={imagePreviewUrl!}
//               alt="Preview"
//               ref={imageRef}
//               onLoad={handleImageLoad}
//               className="max-h-[400px]  object-contain"
//             />
//             {isExtracting && (
//               <Loader2 className="absolute top-1/2 left-1/2 animate-spin w-10 h-10" />
//             )}
//             {scaledBox && (
//               <div
//                 className="absolute border-2 border-blue-500 bg-blue-300/20"
//                 style={scaledBox}
//               />
//             )}
//           </div>
//         )}
//       </div>
//       {error && <p className="text-red-500 mt-2">{error}</p>}
//     </div>
//   );
// };

// export default ImageTextSelector;



// import React, { useState, useRef, useEffect } from "react";
// import { UploadCloud, Loader2 } from "lucide-react";
// import { createWorker } from "tesseract.js";

// interface ImageTextSelectorProps {
//   file: File | null;
//   onFileChange: (file: File | null) => void;
//   setSelectedText: React.Dispatch<React.SetStateAction<string>>;
//   isExtracting: boolean;
//   setIsExtracting: React.Dispatch<React.SetStateAction<boolean>>;
//   error: string | null;
//   setError: React.Dispatch<React.SetStateAction<string | null>>;
// }

// interface OCRWord {
//   text: string;
//   bbox: {
//     x0: number;
//     y0: number;
//     x1: number;
//     y1: number;
//   };
// }

// interface Box {
//   x1: number;
//   y1: number;
//   x2: number;
//   y2: number;
// }

// // Add this helper function in ImageToTextPage.tsx
// // const cropImage = (
// //   image: HTMLImageElement,
// //   rect: { left: number; top: number; width: number; height: number }
// // ) => {
// //   const canvas = document.createElement("canvas");
// //   const ctx = canvas.getContext("2d");

// //   if (!ctx) return null;

// //   canvas.width = rect.width;
// //   canvas.height = rect.height;

// //   ctx.drawImage(
// //     image,
// //     rect.left,
// //     rect.top,
// //     rect.width,
// //     rect.height,
// //     0,
// //     0,
// //     rect.width,
// //     rect.height
// //   );

// //   return canvas.toDataURL("image/png");
// // };

// const ImageTextSelector: React.FC<ImageTextSelectorProps> = ({
//   file,
//   onFileChange,
//   setSelectedText,
//   isExtracting,
//   setIsExtracting,
//   error,
//   setError
// }) => {

//   const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
//   const [box, setBox] = useState<Box | null>(null);
//   const [extractedWords, setExtractedWords] = useState<OCRWord[]>([]);

//   const imageRef = useRef<HTMLImageElement>(null);
//   const workerRef = useRef<any>(null);

//   const startX = useRef(0);
//   const startY = useRef(0);
//   const isDrawing = useRef(false);

//   // ================= WORKER INIT =================
//   useEffect(() => {

//     const init = async () => {

//       const worker = await createWorker("eng", 1, {
//         logger: m => console.log(m)
//       });

//       workerRef.current = worker;
//     };

//     init();

//     return () => workerRef.current?.terminate();

//   }, []);

//   // ================= OCR =================
//   const runOCR = async (file: File) => {

//     if (!workerRef.current) return;

//     setIsExtracting(true);
//     setError(null);

//     try {

//       const url = URL.createObjectURL(file);

//       const { data }: any = await workerRef.current.recognize(url);

//       URL.revokeObjectURL(url);

//       if (!data.words || data.words.length === 0) {
//         setError("No words detected");
//         return;
//       }

//       const words: OCRWord[] = data.words.map((w: any) => ({
//   text: w.text,
//   bbox: {
//     x0: w.bbox.x0,
//     y0: w.bbox.y0,
//     x1: w.bbox.x1,
//     y1: w.bbox.y1
//   }
// }));

//       console.log("OCR WORDS:", words);

//       setExtractedWords(words);

//       setSelectedText(words.map(w => w.text).join(" "));

//     } catch (err) {

//       console.error(err);
//       setError("OCR failed");

//     } finally {

//       setIsExtracting(false);

//     }
//   };

//   // ================= FILE SELECT =================
//   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {

//     if (!e.target.files?.[0]) return;

//     const selected = e.target.files[0];

//     onFileChange(selected);

//     const reader = new FileReader();

//     reader.onload = () => {
//       setImagePreviewUrl(reader.result as string);
//       runOCR(selected);
//     };

//     reader.readAsDataURL(selected);
//   };

//   // ================= MOUSE EVENTS =================
//   const getImageCoords = (e: React.MouseEvent) => {

//     const rect = imageRef.current!.getBoundingClientRect();

//     const scaleX = imageRef.current!.naturalWidth / rect.width;
//     const scaleY = imageRef.current!.naturalHeight / rect.height;

//     const x = (e.clientX - rect.left) * scaleX;
//     const y = (e.clientY - rect.top) * scaleY;

//     return { x, y, rect };
//   };

//   const handleMouseDown = (e: React.MouseEvent) => {

//     if (!imageRef.current) return;

//     const { x, y } = getImageCoords(e);

//     startX.current = x;
//     startY.current = y;

//     isDrawing.current = true;

//     setBox({ x1: x, y1: y, x2: x, y2: y });
//   };

//   const handleMouseMove = (e: React.MouseEvent) => {

//     if (!isDrawing.current) return;

//     const { x, y } = getImageCoords(e);

//     setBox({
//       x1: startX.current,
//       y1: startY.current,
//       x2: x,
//       y2: y
//     });
//   };

//   const handleMouseUp = () => {

//     if (!box) return;

//     isDrawing.current = false;

//     const selected = extractedWords.filter(word => {

//       const w = word.bbox;

//       return !(
//         w.x1 < Math.min(box.x1, box.x2) ||
//         w.x0 > Math.max(box.x1, box.x2) ||
//         w.y1 < Math.min(box.y1, box.y2) ||
//         w.y0 > Math.max(box.y1, box.y2)
//       );

//     });

//     console.log("SELECTED WORDS:", selected);

//     const text = selected.map(w => w.text).join(" ");

//     setSelectedText(text);
//   };

//   // ================= DRAW BOX =================
//   const drawBox = () => {

//     if (!box || !imageRef.current) return null;

//     const rect = imageRef.current.getBoundingClientRect();

//     const scaleX = rect.width / imageRef.current.naturalWidth;
//     const scaleY = rect.height / imageRef.current.naturalHeight;

//     const left = Math.min(box.x1, box.x2) * scaleX;
//     const top = Math.min(box.y1, box.y2) * scaleY;
//     const width = Math.abs(box.x2 - box.x1) * scaleX;
//     const height = Math.abs(box.y2 - box.y1) * scaleY;

//     return (
//       <div
//         className="absolute border-2 border-blue-500 bg-blue-400/20"
//         style={{ left, top, width, height }}
//       />
//     );
//   };

//   return (
//     <div className="border p-6 rounded-lg h-[600px] flex flex-col">

//       <input
//         type="file"
//         accept="image/*"
//         onChange={handleFileSelect}
//         className="hidden"
//         id="fileInput"
//       />

//       <div
//         className="flex-1 border-2 border-dashed flex items-center justify-center relative cursor-crosshair"
//         onMouseDown={handleMouseDown}
//         onMouseMove={handleMouseMove}
//         onMouseUp={handleMouseUp}
//         onClick={() => !file && document.getElementById("fileInput")?.click()}
//       >

//         {!file ? (

//           <div className="text-center">
//             <UploadCloud className="w-12 h-12 mx-auto mb-2"/>
//             <p>Click to upload image</p>
//           </div>

//         ) : (

//           <div className="relative">

//             <img
//               ref={imageRef}
//               src={imagePreviewUrl!}
//               alt="preview"
//               className="max-h-[400px]"
//             />

//             {isExtracting && (
//               <Loader2 className="absolute top-1/2 left-1/2 w-10 h-10 animate-spin"/>
//             )}

//             {drawBox()}

//           </div>

//         )}

//       </div>

//       {error && (
//         <p className="text-red-500 mt-2">{error}</p>
//       )}

//     </div>
//   );
// };

// export default ImageTextSelector;




import React, { useState, useRef, useEffect } from 'react';
import { createWorker } from 'tesseract.js';
import { UploadCloud, Loader2 } from 'lucide-react';

interface Box {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface OCRWord {
  text: string;
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
}

interface ImageTextSelectorProps {
  file: File | null;
  onFileChange: (file: File) => void;
  setSelectedText: (text: string) => void;
  isExtracting: boolean;
  setIsExtracting: (val: boolean) => void;
  error: string | null;
  setError: (err: string | null) => void;
}

const ImageTextSelector: React.FC<ImageTextSelectorProps> = ({
  file,
  onFileChange,
  setSelectedText,
  isExtracting,
  setIsExtracting,
  error,
  setError
}) => {

  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [box, setBox] = useState<Box | null>(null);
  const [extractedWords, setExtractedWords] = useState<OCRWord[]>([]);

  const imageRef = useRef<HTMLImageElement>(null);
  const workerRef = useRef<any>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const isDrawing = useRef(false);

  // ================= WORKER INIT =================
  useEffect(() => {
    const init = async () => {
      const worker = await createWorker("eng", 1, {
        logger: m => console.log(m)
      });
      workerRef.current = worker;
    };
    init();
    return () => workerRef.current?.terminate();
  }, []);

  // ================= OCR =================
  // ✅ FIX: runOCR only stores words — does NOT call setSelectedText
  const runOCR = async (file: File) => {
    if (!workerRef.current) return;

    setIsExtracting(true);
    setError(null);

    try {
      const url = URL.createObjectURL(file);
      const { data }: any = await workerRef.current.recognize(url);
      URL.revokeObjectURL(url);

      if (!data.words || data.words.length === 0) {
        setError("No words detected");
        return;
      }

      const words: OCRWord[] = data.words.map((w: any) => ({
        text: w.text,
        bbox: {
          x0: w.bbox.x0,
          y0: w.bbox.y0,
          x1: w.bbox.x1,
          y1: w.bbox.y1
        }
      }));

      console.log("OCR WORDS:", words);

      // ✅ Only store words — text selection happens on box draw
      setExtractedWords(words);

    } catch (err) {
      console.error(err);
      setError("OCR failed");
    } finally {
      setIsExtracting(false);
    }
  };

  // ================= FILE SELECT =================
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const selected = e.target.files[0];
    onFileChange(selected);

    // Reset state for new file
    setBox(null);
    setExtractedWords([]);
    setSelectedText('');

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreviewUrl(reader.result as string);
      runOCR(selected);
    };
    reader.readAsDataURL(selected);
  };

  // ================= MOUSE EVENTS =================
  const getImageCoords = (e: React.MouseEvent) => {
    const rect = imageRef.current!.getBoundingClientRect();
    const scaleX = imageRef.current!.naturalWidth / rect.width;
    const scaleY = imageRef.current!.naturalHeight / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageRef.current || !file) return;
    const { x, y } = getImageCoords(e);
    startX.current = x;
    startY.current = y;
    isDrawing.current = true;
    setBox({ x1: x, y1: y, x2: x, y2: y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing.current) return;
    const { x, y } = getImageCoords(e);
    setBox({
      x1: startX.current,
      y1: startY.current,
      x2: x,
      y2: y
    });
  };

  // ✅ FIX: Corrected overlap logic — sets selected text only from drawn box
const handleMouseUp = () => {
  if (!box) return;
  isDrawing.current = false;

  const minX = Math.min(box.x1, box.x2);
  const maxX = Math.max(box.x1, box.x2);
  const minY = Math.min(box.y1, box.y2);
  const maxY = Math.max(box.y1, box.y2);

  // 🔍 DEBUG - paste this and tell me what you see in console
  console.log("BOX COORDS:", { minX, maxX, minY, maxY });
  console.log("ALL WORDS:", extractedWords.map(w => ({
    text: w.text,
    x0: w.bbox.x0,
    y0: w.bbox.y0,
    x1: w.bbox.x1,
    y1: w.bbox.y1,
    centerX: (w.bbox.x0 + w.bbox.x1) / 2,
    centerY: (w.bbox.y0 + w.bbox.y1) / 2,
  })));

  const selected = extractedWords.filter(word => {
    const w = word.bbox;
    const centerX = (w.x0 + w.x1) / 2;
    const centerY = (w.y0 + w.y1) / 2;
    return centerX >= minX && centerX <= maxX &&
           centerY >= minY && centerY <= maxY;
  });

  console.log("SELECTED WORDS:", selected);
  const text = selected.map(w => w.text).join(" ");
  setSelectedText(text || "No text found in selected area");
};

  // ================= DRAW BOX =================
  const drawBox = () => {
    if (!box || !imageRef.current) return null;

    const rect = imageRef.current.getBoundingClientRect();
    const scaleX = rect.width / imageRef.current.naturalWidth;
    const scaleY = rect.height / imageRef.current.naturalHeight;

    const left   = Math.min(box.x1, box.x2) * scaleX;
    const top    = Math.min(box.y1, box.y2) * scaleY;
    const width  = Math.abs(box.x2 - box.x1) * scaleX;
    const height = Math.abs(box.y2 - box.y1) * scaleY;

    return (
      <div
        className="absolute border-2 border-blue-500 bg-blue-400/20 pointer-events-none"
        style={{ left, top, width, height }}
      />
    );
  };

  return (
    <div className="border p-6 rounded-lg h-[600px] flex flex-col">

      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        id="fileInput"
      />

      <div
        className="flex-1 border-2 border-dashed flex items-center justify-center relative cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={() => !file && document.getElementById("fileInput")?.click()}
      >
        {!file ? (
          <div className="text-center">
            <UploadCloud className="w-12 h-12 mx-auto mb-2" />
            <p>Click to upload image</p>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              ref={imageRef}
              src={imagePreviewUrl!}
              alt="preview"
              className="max-h-[400px] max-w-full object-contain"
              draggable={false}
            />
            {isExtracting && (
              <Loader2 className="absolute top-1/2 left-1/2 w-10 h-10 animate-spin" />
            )}
            {drawBox()}
          </div>
        )}
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}

    </div>
  );
};

export default ImageTextSelector;