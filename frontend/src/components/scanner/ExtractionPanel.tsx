// import React from 'react';
// import { Loader2, FileSignature } from 'lucide-react';

// interface ExtractionPanelProps {
//     extractedText: string;
//     setExtractedText: (text: string) => void;
//     isExtracting: boolean;
// }

// const ExtractionPanel: React.FC<ExtractionPanelProps> = ({ extractedText, setExtractedText, isExtracting }) => {
//     return (
//         <div className="bg-surface border border-surface-accent p-8 rounded-panel flex flex-col h-[500px]">
//             <h3 className="text-xl font-bold text-accent mb-6">Extracted Text</h3>

//             <div className="flex-1 flex flex-col items-center justify-center border border-accent-icon/30 rounded-panel bg-background mb-8 relative">
//                 {isExtracting ? (
//                     <div className="flex flex-col items-center space-y-3">
//                         <Loader2 className="w-10 h-10 text-primary animate-spin" />
//                         <p className="text-text-secondary">Extracting text... this may take a moment.</p>
//                     </div>
//                 ) : extractedText ? (
//                     <textarea
//                         value={extractedText}
//                         onChange={(e) => setExtractedText(e.target.value)}
//                         className="w-full h-full p-6 bg-transparent text-text-primary resize-none focus:outline-none"
//                     />
//                 ) : (
//                     <div className="flex flex-col items-center justify-center space-y-4 text-center px-10">
//                         <FileSignature className="w-12 h-12 text-accent-icon" />
//                         <p className="text-text-secondary">Upload a file and click "Extract Text" to see results</p>
//                     </div>
//                 )}
//                 {extractedText && (
//                    <button 
//                      onClick={() => navigator.clipboard.writeText(extractedText)}
//                      className="absolute top-4 right-4 text-xs px-3 py-1 bg-surface-accent rounded-button text-text-secondary hover:text-white transition"
//                     >
//                     Copy All
//                   </button>
//                 )}
//             </div>
//              <div className="h-12"/> {/* Spacer so buttons align across panels */}
//         </div>
//     );
// };

// export default ExtractionPanel;



// import React, { useState } from 'react';
// import { Loader2, FileSignature } from 'lucide-react';

// interface ExtractionPanelProps {
//     extractedText: string;
//     setExtractedText: (text: string) => void;
//     isExtracting: boolean;
// }

// const ExtractionPanel: React.FC<ExtractionPanelProps> = ({ 
//     extractedText, 
//     setExtractedText, 
//     isExtracting 
// }) => {

//     const [copied, setCopied] = useState(false);

//     const handleCopy = async () => {
//         await navigator.clipboard.writeText(extractedText);
//         setCopied(true);

//         setTimeout(() => {
//             setCopied(false);
//         }, 2000); // hide after 2 sec
//     };

//     return (
//         <div className="bg-surface border border-surface-accent p-8 rounded-panel flex flex-col h-[500px]">
//             <h3 className="text-xl font-bold text-accent mb-6">Extracted Text</h3>

//             <div className="flex-1 flex flex-col items-center justify-center border border-accent-icon/30 rounded-panel bg-background mb-8 relative">
                
//                 {isExtracting ? (
//                     <div className="flex flex-col items-center space-y-3">
//                         <Loader2 className="w-10 h-10 text-primary animate-spin" />
//                         <p className="text-text-secondary">
//                             Extracting text... this may take a moment.
//                         </p>
//                     </div>
//                 ) : extractedText ? (
//                     <textarea
//                         value={extractedText}
//                         onChange={(e) => setExtractedText(e.target.value)}
//                         className="w-full h-full p-6 bg-transparent text-text-primary resize-none focus:outline-none"
//                     />
//                 ) : (
//                     <div className="flex flex-col items-center justify-center space-y-4 text-center px-10">
//                         <FileSignature className="w-12 h-12 text-accent-icon" />
//                         <p className="text-text-secondary">
//                             Upload a file and click "Extract Text" to see results
//                         </p>
//                     </div>
//                 )}

//                 {/* Copy Button */}
//                 {extractedText && (
//                     <>
//                         <button 
//                             onClick={handleCopy}
//                             className="absolute top-4 right-4 text-xs px-3 py-1 bg-surface-accent rounded-button text-text-secondary hover:text-white transition"
//                         >
//                             Copy All
//                         </button>

//                         {/* Popup Toast */}
//                         {copied && (
//                             <div className="absolute top-12 right-4 bg-green-500 text-white text-xs px-3 py-1 rounded-md shadow-md animate-fade-in">
//                                 Copied successfully 
//                             </div>
//                         )}
//                     </>
//                 )}
//             </div>

//             <div className="h-12"/>
//         </div>
//     );
// };

// export default ExtractionPanel;


// import React, { useState, useRef, useEffect } from 'react';
// import { Loader2, FileSignature, Globe, Search, ChevronUp } from 'lucide-react';
// import axios from 'axios';

// interface ExtractionPanelProps {
//     extractedText: string;
//     setExtractedText: (text: string) => void;
//     isExtracting: boolean;
// }

// const ExtractionPanel: React.FC<ExtractionPanelProps> = ({ 
//     extractedText, 
//     setExtractedText, 
//     isExtracting 
// }) => {
//     const [copied, setCopied] = useState(false);
//     const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//     const [searchQuery, setSearchQuery] = useState("");
//     const [isTranslating, setIsTranslating] = useState(false);
//     const dropdownRef = useRef<HTMLDivElement>(null);

//     const languages = [
//         { name: "English", code: "en" },
//         { name: "Spanish", code: "es" },
//         { name: "French", code: "fr" },
//         { name: "German", code: "de" },
//         { name: "Hindi", code: "hi" },
//         { name: "Chinese", code: "zh" },
//         { name: "Japanese", code: "ja" },
//         { name: "Arabic", code: "ar" },
//         {name: "Gujarati",code : "gu"}
//     ];

//     // Close dropdown on outside click
//     useEffect(() => {
//         const handleClick = (e: MouseEvent) => {
//             if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
//                 setIsDropdownOpen(false);
//             }
//         };
//         document.addEventListener("mousedown", handleClick);
//         return () => document.removeEventListener("mousedown", handleClick);
//     }, []);

//     const handleCopy = async () => {
//         await navigator.clipboard.writeText(extractedText);
//         setCopied(true);
//         setTimeout(() => setCopied(false), 2000);
//     };

//    const handleTranslate = async (targetLang: string) => {
//     if (!extractedText) return;
    
//     setIsTranslating(true);
//     setIsDropdownOpen(false); 

//     try {
//         // Using MyMemory API via GET request for better stability without an API key
//         const response = await axios.get(`https://api.mymemory.translated.net/get`, {
//             params: {
//                 q: extractedText,
//                 langpair: `en|${targetLang}` // Assumes source is English
//             }
//         });

//         if (response.data.responseData.translatedText) {
//             setExtractedText(response.data.responseData.translatedText);
//         } else {
//             // Fallback for unexpected API response structure
//             throw new Error("Invalid response structure");
//         }
//     } catch (error) {
//         console.error("Translation Error:", error);
//         alert("Translation service is currently busy. Please try again in a moment.");
//     } finally {
//         setIsTranslating(false);
//     }
// };



//     const filteredLanguages = languages.filter(lang => 
//         lang.name.toLowerCase().includes(searchQuery.toLowerCase())
//     );

//     return (
//         <div className="bg-surface border border-surface-accent p-8 rounded-panel flex flex-col h-[500px]">
//             <h3 className="text-xl font-bold text-accent mb-6">Extracted Text</h3>

//             <div className="flex-1 flex flex-col items-center justify-center border border-accent-icon/30 rounded-panel bg-background mb-8 relative overflow-hidden">
//                 {isExtracting || isTranslating ? (
//                     <div className="flex flex-col items-center space-y-3">
//                         <Loader2 className="w-10 h-10 text-primary animate-spin" />
//                         <p className="text-text-secondary">
//                             {isTranslating ? "Translating..." : "Extracting text..."}
//                         </p>
//                     </div>
//                 ) : extractedText ? (
//                     <textarea
//                         value={extractedText}
//                         onChange={(e) => setExtractedText(e.target.value)}
//                         className="w-full h-full p-6 bg-transparent text-text-primary resize-none focus:outline-none"
//                     />
//                 ) : (
//                     <div className="flex flex-col items-center justify-center space-y-4 text-center px-10">
//                         <FileSignature className="w-12 h-12 text-accent-icon" />
//                         <p className="text-text-secondary">
//                             Upload a file and click "Extract Text" to see results
//                         </p>
//                     </div>
//                 )}

//                 {extractedText && !isTranslating && (
//                     <>
//                         <button 
//                             onClick={handleCopy}
//                             className="absolute top-4 right-4 text-xs px-3 py-1 bg-surface-accent rounded-button text-text-secondary hover:text-white transition"
//                         >
//                             {copied ? "Copied!" : "Copy All"}
//                         </button>
//                     </>
//                 )}
//             </div>

//             {/* Translation Button and Dropdown Area */}
//             <div className="relative h-12" ref={dropdownRef}>
//                 <button
//                     disabled={!extractedText || isExtracting}
//                     onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//                     className={`w-full h-full flex items-center justify-center gap-2 rounded-button border border-surface-accent transition
//                         ${!extractedText ? 'opacity-50 cursor-not-allowed bg-transparent' : 'bg-surface-accent hover:bg-surface-accent/80 text-text-primary'}
//                     `}
//                 >
//                     <Globe className="w-4 h-4" />
//                     <span>Convert Language</span>
//                     <ChevronUp className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
//                 </button>

//                 {/* Dropdown Menu (Opens Upward) */}
//                 {isDropdownOpen && (
//                     <div className="absolute bottom-[110%] left-0 w-full bg-surface border border-surface-accent rounded-panel shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
//                         <div className="p-2 border-b border-surface-accent flex items-center gap-2 bg-background/50">
//                             <Search className="w-4 h-4 text-text-secondary" />
//                             <input 
//                                 type="text"
//                                 placeholder="Search languages..."
//                                 className="bg-transparent text-sm text-text-primary focus:outline-none w-full"
//                                 value={searchQuery}
//                                 onChange={(e) => setSearchQuery(e.target.value)}
//                                 autoFocus
//                             />
//                         </div>
//                         <ul className="max-height-[200px] overflow-y-auto">
//                             {filteredLanguages.length > 0 ? (
//                                 filteredLanguages.map(lang => (
//                                     <li 
//                                         key={lang.code}
//                                         onClick={() => handleTranslate(lang.code)}
//                                         className="px-4 py-2 text-sm text-text-secondary hover:bg-primary hover:text-white cursor-pointer transition"
//                                     >
//                                         {lang.name}
//                                     </li>
//                                 ))
//                             ) : (
//                                 <li className="px-4 py-2 text-xs text-text-secondary italic text-center">No language found</li>
//                             )}
//                         </ul>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default ExtractionPanel;


import React, { useState, useRef, useEffect } from 'react';
import { Loader2, FileSignature, Globe, Search, ChevronUp } from 'lucide-react';

interface ExtractionPanelProps {
    extractedText: string;
    setExtractedText: (text: string) => void;
    isExtracting: boolean;
}

const ExtractionPanel: React.FC<ExtractionPanelProps> = ({
    extractedText,
    setExtractedText,
    isExtracting
}) => {
    const [copied, setCopied] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isTranslating, setIsTranslating] = useState(false);
    const [translationError, setTranslationError] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const languages = [
        { name: "Afrikaans", code: "af" },
        { name: "Albanian", code: "sq" },
        { name: "Amharic", code: "am" },
        { name: "Arabic", code: "ar" },
        { name: "Armenian", code: "hy" },
        { name: "Azerbaijani", code: "az" },
        { name: "Basque", code: "eu" },
        { name: "Belarusian", code: "be" },
        { name: "Bengali", code: "bn" },
        { name: "Bosnian", code: "bs" },
        { name: "Bulgarian", code: "bg" },
        { name: "Catalan", code: "ca" },
        { name: "Chinese (Simplified)", code: "zh-CN" },
        { name: "Chinese (Traditional)", code: "zh-TW" },
        { name: "Croatian", code: "hr" },
        { name: "Czech", code: "cs" },
        { name: "Danish", code: "da" },
        { name: "Dutch", code: "nl" },
        { name: "English", code: "en" },
        { name: "Esperanto", code: "eo" },
        { name: "Estonian", code: "et" },
        { name: "Finnish", code: "fi" },
        { name: "French", code: "fr" },
        { name: "Galician", code: "gl" },
        { name: "Georgian", code: "ka" },
        { name: "German", code: "de" },
        { name: "Greek", code: "el" },
        { name: "Gujarati", code: "gu" },
        { name: "Haitian Creole", code: "ht" },
        { name: "Hausa", code: "ha" },
        { name: "Hebrew", code: "iw" },
        { name: "Hindi", code: "hi" },
        { name: "Hungarian", code: "hu" },
        { name: "Icelandic", code: "is" },
        { name: "Igbo", code: "ig" },
        { name: "Indonesian", code: "id" },
        { name: "Irish", code: "ga" },
        { name: "Italian", code: "it" },
        { name: "Japanese", code: "ja" },
        { name: "Javanese", code: "jw" },
        { name: "Kannada", code: "kn" },
        { name: "Kazakh", code: "kk" },
        { name: "Khmer", code: "km" },
        { name: "Korean", code: "ko" },
        { name: "Kurdish", code: "ku" },
        { name: "Kyrgyz", code: "ky" },
        { name: "Lao", code: "lo" },
        { name: "Latin", code: "la" },
        { name: "Latvian", code: "lv" },
        { name: "Lithuanian", code: "lt" },
        { name: "Luxembourgish", code: "lb" },
        { name: "Macedonian", code: "mk" },
        { name: "Malagasy", code: "mg" },
        { name: "Malay", code: "ms" },
        { name: "Malayalam", code: "ml" },
        { name: "Maltese", code: "mt" },
        { name: "Maori", code: "mi" },
        { name: "Marathi", code: "mr" },
        { name: "Mongolian", code: "mn" },
        { name: "Myanmar (Burmese)", code: "my" },
        { name: "Nepali", code: "ne" },
        { name: "Norwegian", code: "no" },
        { name: "Pashto", code: "ps" },
        { name: "Persian", code: "fa" },
        { name: "Polish", code: "pl" },
        { name: "Portuguese", code: "pt" },
        { name: "Punjabi", code: "pa" },
        { name: "Romanian", code: "ro" },
        { name: "Russian", code: "ru" },
        { name: "Serbian", code: "sr" },
        { name: "Sinhala", code: "si" },
        { name: "Slovak", code: "sk" },
        { name: "Slovenian", code: "sl" },
        { name: "Somali", code: "so" },
        { name: "Spanish", code: "es" },
        { name: "Swahili", code: "sw" },
        { name: "Swedish", code: "sv" },
        { name: "Tagalog (Filipino)", code: "tl" },
        { name: "Tajik", code: "tg" },
        { name: "Tamil", code: "ta" },
        { name: "Telugu", code: "te" },
        { name: "Thai", code: "th" },
        { name: "Turkish", code: "tr" },
        { name: "Ukrainian", code: "uk" },
        { name: "Urdu", code: "ur" },
        { name: "Uzbek", code: "uz" },
        { name: "Vietnamese", code: "vi" },
        { name: "Welsh", code: "cy" },
        { name: "Xhosa", code: "xh" },
        { name: "Yiddish", code: "yi" },
        { name: "Yoruba", code: "yo" },
        { name: "Zulu", code: "zu" },
    ];

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
                setSearchQuery("");
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(extractedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // ✅ Call our OWN backend — no CORS issues, no rate limits
    const translateChunk = async (text: string, targetLang: string): Promise<string> => {
        const token = localStorage.getItem("token");

        const response = await fetch("http://localhost:5000/api/scans/translate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ text, targetLang }),
        });

        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const data = await response.json();
        if (!data.translatedText) throw new Error("Empty translation");
        return data.translatedText;
    };

    const handleTranslate = async (targetLang: string, langName: string) => {
        if (!extractedText.trim()) return;

        setIsTranslating(true);
        setIsDropdownOpen(false);
        setSearchQuery("");
        setTranslationError(null);

        try {
            // Change this line in handleTranslate:
<p className="text-text-secondary text-sm">
    {isTranslating ? "Translating... this may take a moment for large files" : "Extracting text..."}
</p>
            // ✅ Split into chunks of 4000 chars on paragraph boundaries
            const CHUNK_SIZE = 4000;
            const paragraphs = extractedText.split(/\n\n+/);
            const chunks: string[] = [];
            let current = "";

            for (const para of paragraphs) {
                const next = current ? current + "\n\n" + para : para;
                if (next.length > CHUNK_SIZE && current.length > 0) {
                    chunks.push(current.trim());
                    current = para;
                } else {
                    current = next;
                }
            }
            if (current.trim()) chunks.push(current.trim());

            console.log(`Translating ${chunks.length} chunk(s) to ${langName}...`);

            // ✅ Sequential to be safe — backend handles Google Translate
            const results: string[] = [];
            for (const chunk of chunks) {
                const translated = await translateChunk(chunk, targetLang);
                results.push(translated);
            }

            setExtractedText(results.join("\n\n"));

        } catch (error) {
            console.error("Translation Error:", error);
            setTranslationError(`Translation to ${langName} failed. Please try again.`);
        } finally {
            setIsTranslating(false);
        }
    };

    const filteredLanguages = languages.filter(lang =>
        lang.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-surface border border-surface-accent p-8 rounded-panel flex flex-col h-[500px]">
            <h3 className="text-xl font-bold text-accent mb-6">Extracted Text</h3>

            <div className="flex-1 flex flex-col items-center justify-center border border-accent-icon/30 rounded-panel bg-background mb-4 relative overflow-hidden">
                {isExtracting || isTranslating ? (
                    <div className="flex flex-col items-center space-y-3">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <p className="text-text-secondary text-sm">
                            {isTranslating ? "Translating... please wait" : "Extracting text..."}
                        </p>
                    </div>
                ) : extractedText ? (
                    <textarea
                        value={extractedText}
                        onChange={(e) => setExtractedText(e.target.value)}
                        className="w-full h-full p-6 bg-transparent text-text-primary resize-none focus:outline-none"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center space-y-4 text-center px-10">
                        <FileSignature className="w-12 h-12 text-accent-icon" />
                        <p className="text-text-secondary">
                            Upload a file and click "Extract Text" to see results
                        </p>
                    </div>
                )}

                {extractedText && !isTranslating && (
                    <button
                        onClick={handleCopy}
                        className="absolute top-4 right-4 text-xs px-3 py-1 bg-surface-accent rounded-button text-text-secondary hover:text-white transition"
                    >
                        {copied ? "Copied!" : "Copy All"}
                    </button>
                )}
            </div>

            {translationError && (
                <p className="text-red-400 text-xs mb-2 text-center">{translationError}</p>
            )}

            <div className="relative h-12" ref={dropdownRef}>
                <button
                    disabled={!extractedText || isExtracting || isTranslating}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`w-full h-full flex items-center justify-center gap-2 rounded-button border border-surface-accent transition
                        ${!extractedText || isExtracting || isTranslating
                            ? 'opacity-50 cursor-not-allowed bg-transparent'
                            : 'bg-surface-accent hover:bg-surface-accent/80 text-text-primary cursor-pointer'}
                    `}
                >
                    <Globe className="w-4 h-4" />
                    <span>Convert Language</span>
                    <ChevronUp className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                    <div className="absolute bottom-[110%] left-0 w-full bg-surface border border-surface-accent rounded-panel shadow-2xl z-50 overflow-hidden">
                        <div className="p-2 border-b border-surface-accent flex items-center gap-2 bg-background/50">
                            <Search className="w-4 h-4 text-text-secondary flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Search languages..."
                                className="bg-transparent text-sm text-text-primary focus:outline-none w-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <ul style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {filteredLanguages.length > 0 ? (
                                filteredLanguages.map(lang => (
                                    <li
                                        key={lang.code}
                                        onClick={() => handleTranslate(lang.code, lang.name)}
                                        className="px-4 py-2 text-sm text-text-secondary hover:bg-primary hover:text-white cursor-pointer transition"
                                    >
                                        {lang.name}
                                    </li>
                                ))
                            ) : (
                                <li className="px-4 py-2 text-xs text-text-secondary italic text-center">
                                    No language found
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExtractionPanel;
