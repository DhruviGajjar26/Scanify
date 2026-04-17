import React, { useState } from 'react';
import { UploadCloud, Loader2, FileText, CheckCircle } from 'lucide-react';
import api from '../../api/api';
import type { ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';

interface UploadPanelProps {
    uploadedFile: File | null;
    setUploadedFile: (file: File | null) => void;
    setExtractedText: (text: string) => void;
    setIsExtracting: (isLoading: boolean) => void;
}

const UploadPanel: React.FC<UploadPanelProps> = ({
    uploadedFile,
    setUploadedFile,
    setExtractedText,
    setIsExtracting
}) => {

    const navigate = useNavigate();   // added

    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        setError(null);
        setExtractedText('');

        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            //  File Size Validation
            if (file.size > 10 * 1024 * 1024) {
                setError('File is too large (max 10MB).');
                return;
            }

            
            if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
                setError('Unsupported file type (use PDF, JPG, PNG).');
                return;
            }

            setUploadedFile(file);
        }
    };

    const handleExtract = async () => {
        if (!uploadedFile) return;

        setIsExtracting(true);
        setError(null);
        setExtractedText('');

        const formData = new FormData();
        formData.append('file', uploadedFile);

        try {
            const { data } = await api.post('/scans/extract', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) /
                        (progressEvent.total || 1)
                    );
                    setUploadProgress(percentCompleted);
                }
            });

          
            setExtractedText(data.extractedText);

            setUploadProgress(0);

            //  Navigate to Dashboard (refresh stats automatically)
            // navigate('/dashboard');

        } catch (err: any) {
            console.error('Extraction Error:', err);
            setError(
                err.response?.data?.msg ||
                'Failed to process file. Ensure your backend is running.'
            );
            setUploadProgress(0);
        } finally {
            setIsExtracting(false);
        }
    };

    return (
        <div className="bg-surface border border-surface-accent p-8 rounded-panel flex flex-col h-[500px]">
            <h3 className="text-xl font-bold text-accent mb-6">Upload File</h3>

            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-accent-icon/40 rounded-panel bg-surface-accent/30 mb-8 px-6 text-center cursor-pointer group hover:border-primary/50 transition">
                <input
                    type="file"
                    id="fileUpload"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                />

                <label
                    htmlFor="fileUpload"
                    className="w-full h-full flex flex-col items-center justify-center cursor-pointer space-y-4"
                >
                    {!uploadedFile && (
                        <>
                            <UploadCloud className="w-12 h-12 text-accent-icon group-hover:text-primary transition" />
                            <div>
                                <p className="font-semibold text-text-primary group-hover:text-primary">
                                    Drag & drop or <span className='text-primary font-bold'>click to upload</span>
                                </p>
                                <p className="text-sm text-text-secondary mt-1">
                                    JPG, PNG, PDF up to 10MB
                                </p>
                            </div>
                        </>
                    )}

                    {uploadedFile && (
                        <>
                            {uploadedFile.type === 'application/pdf'
                                ? <FileText className="w-12 h-12 text-orange-400" />
                                : <div className="w-12 h-12 rounded bg-teal-400/10 flex items-center justify-center">
                                    <CheckCircle className="w-8 h-8 text-teal-400" />
                                  </div>
                            }

                            <div>
                                <p className="font-semibold text-teal-400">File Selected</p>
                                <p className="text-sm text-accent mt-1 truncate max-w-sm">
                                    {uploadedFile.name}
                                </p>
                                <p className="text-xs text-text-secondary">
                                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        </>
                    )}
                </label>
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-surface-accent rounded-full h-2 mb-4">
                    <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                    ></div>
                </div>
            )}

            {error && (
                <p className='text-red-400 text-sm mb-4 text-center'>
                    {error}
                </p>
            )}

            <button
                onClick={handleExtract}
                disabled={!uploadedFile}
                className={`w-full h-12 flex items-center justify-center gap-3 rounded-button font-semibold transition
                    ${!uploadedFile
                        ? 'bg-surface-accent text-text-secondary cursor-not-allowed'
                        : 'bg-primary hover:bg-primary-hover text-white'}`}
            >
                <UploadCloud className="w-5 h-5" />
                Extract Text
            </button>
        </div>
    );
};

export default UploadPanel; 