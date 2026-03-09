import { useState, useRef, useCallback } from 'react';

export default function ImageUploader({ onImageLoaded, disabled }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Draw to offscreen canvas to get ImageData
        const canvas = document.createElement('canvas');
        const maxSize = 224;
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        onImageLoaded({
          src: e.target.result,
          imageData,
          fileName: file.name,
          width: canvas.width,
          height: canvas.height,
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }, [onImageLoaded]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  }, [processFile]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleFileChange = (e) => processFile(e.target.files[0]);

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? '#22c55e' : 'rgba(34,197,94,0.25)'}`,
          borderRadius: 16,
          padding: '32px 20px',
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: isDragging ? 'rgba(34,197,94,0.07)' : 'rgba(255,255,255,0.02)',
          transition: 'all 0.25s ease',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>🌿</div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, color: '#d1fae5', marginBottom: 6, fontWeight: 700 }}>
          Drop a leaf image here
        </div>
        <div style={{ fontSize: 12, color: '#4b5563', fontFamily: "'JetBrains Mono', monospace" }}>
          or click to browse · JPG / PNG / WebP
        </div>
        <div style={{
          display: 'inline-block', marginTop: 14,
          padding: '7px 20px', borderRadius: 30,
          background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)',
          fontSize: 12, color: '#4ade80', fontFamily: "'JetBrains Mono', monospace",
        }}>
          Browse Files
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}
