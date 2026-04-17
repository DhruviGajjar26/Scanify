import React, { useState } from 'react';
import UploadPanel from '../components/scanner/UploadPanel';
import ExtractionPanel from '../components/scanner/ExtractionPanel';
// import ImageTextSelector from '../components/scanner/ImageTextSelector';

const Scanner: React.FC = () => {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [extractedText, setExtractedText] = useState<string>('');
    const [isExtracting, setIsExtracting] = useState<boolean>(false);
    return (
        <div className="space-y-12">
            <header className="space-y-2">
                <h1 className="text-4xl font-extrabold text-accent">Document Scanner</h1>
                <p className="text-lg text-text-secondary">Upload an image or PDF to extract text</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <UploadPanel
                    setUploadedFile={setUploadedFile}
                    setExtractedText={setExtractedText}
                    setIsExtracting={setIsExtracting}
                    uploadedFile={uploadedFile}
                />
                <ExtractionPanel
                    extractedText={extractedText}
                    setExtractedText={setExtractedText}
                    isExtracting={isExtracting}
                />
                {/* <ImageTextSelector
                    file={uploadedFile}
                    onFileChange={setUploadedFile}
                    setSelectedText={setExtractedText}
                    isExtracting={isExtracting}
                    setIsExtracting={setIsExtracting}
                    error={error}
                    setError={setError}
                /> */}
            </div>
        </div>
    );
};

export default Scanner; 