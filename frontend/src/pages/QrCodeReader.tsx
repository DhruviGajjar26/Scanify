import React, { useState, useRef, useCallback } from 'react';
// @ts-ignore
import jsQR from 'jsqr';

const QrCodeReader: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [resultText, setResultText] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setResultText('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, []);

  const handleGenerateResult = () => {
    if (!selectedImage || !imageRef.current) {
      setResultText('Please upload a file first.');
      return;
    }
    setIsLoading(true);
    const img = imageRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    if (ctx) {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      setTimeout(() => {
        setIsLoading(false);
        setResultText(code ? code.data : 'No QR code found in the image.');
      }, 600);
    } else {
      setIsLoading(false);
      setResultText('Failed to process image (Canvas Context Error).');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f1117',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: '#e2e8f0',
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 40px 16px',
        borderBottom: '1px solid #1e2535',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{
          width: 36, height: 36,
          background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
        </div>
        <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px' }}>QR Code Reader</span>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        gap: 24,
        padding: '32px 40px',
      }}>
        {/* Left Panel — Upload */}
        <div style={{
          flex: 1,
          background: '#161b27',
          borderRadius: 16,
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>Upload File</h2>

          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              flex: 1,
              border: `2px dashed ${isDragging ? '#7c3aed' : '#2d3748'}`,
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              background: isDragging ? 'rgba(124,58,237,0.06)' : '#1a2035',
              transition: 'all 0.2s ease',
              minHeight: 320,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {selectedImage ? (
              <img
                ref={imageRef}
                src={selectedImage}
                alt="Selected"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8 }}
                crossOrigin="anonymous"
              />
            ) : (
              <>
                <div style={{
                  width: 64, height: 64,
                  background: '#1e2535',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5">
                    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                    <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
                  </svg>
                </div>
                <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 600, color: '#cbd5e1' }}>
                  Drag & drop or{' '}
                  <span style={{ color: '#7c3aed', cursor: 'pointer' }}>click to upload</span>
                </p>
                <p style={{ margin: 0, fontSize: 12, color: '#475569' }}>JPG, PNG, PDF up to 10MB</p>
              </>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {/* Extract Button */}
          <button
            onClick={handleGenerateResult}
            disabled={!selectedImage || isLoading}
            style={{
              width: '100%',
              padding: '14px',
              background: selectedImage && !isLoading
                ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                : '#1e2535',
              color: selectedImage && !isLoading ? 'white' : '#475569',
              border: 'none',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              cursor: selectedImage && !isLoading ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              letterSpacing: '0.2px',
            }}
          >
            {isLoading ? 'Extracting...' : 'Extract Text'}
          </button>
        </div>

        {/* Right Panel — Result */}
        <div style={{
          flex: 1,
          background: '#161b27',
          borderRadius: 16,
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>Extracted Text</h2>
            {resultText && (
              <button
                onClick={() => navigator.clipboard?.writeText(resultText)}
                style={{
                  background: 'transparent',
                  border: '1px solid #2d3748',
                  color: '#94a3b8',
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
                Copy
              </button>
            )}
          </div>

          {/* Result Area */}
          <div style={{
            flex: 1,
            background: '#1a2035',
            borderRadius: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: resultText ? 'flex-start' : 'center',
            justifyContent: resultText ? 'flex-start' : 'center',
            padding: resultText ? 20 : 24,
            minHeight: 320,
          }}>
            {resultText ? (
              <pre style={{
                margin: 0,
                fontFamily: "'Fira Code', 'Courier New', monospace",
                fontSize: 13,
                color: '#a5b4fc',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                lineHeight: 1.7,
              }}>{resultText}</pre>
            ) : (
              <>
                <div style={{
                  width: 64, height: 64,
                  background: '#1e2535',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: '#475569', textAlign: 'center', lineHeight: 1.6 }}>
                  Upload a file and click "Extract Text"<br />to see results
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrCodeReader;
