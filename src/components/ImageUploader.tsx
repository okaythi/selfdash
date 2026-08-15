import React, { useState, useRef } from 'react';

export function ImageUploader({ 
  currentUrl, 
  onUploadStart,
  onUploadSuccess,
  onUploadError,
  onRemove,
  shape = 'circle',
  children
}: { 
  currentUrl: string,
  onUploadStart: () => void,
  onUploadSuccess: (url: string) => void,
  onUploadError: (err: string) => void,
  onRemove: () => void,
  shape?: 'circle' | 'rect',
  children: React.ReactNode
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Quick local preview
    const tempUrl = URL.createObjectURL(file);
    onUploadSuccess(tempUrl); // Temporarily show it instantly
    
    setIsUploading(true);
    onUploadStart();
    
    try {
      const formData = new FormData();
      formData.append('reqtype', 'fileupload');
      formData.append('fileToUpload', file);
      
      // Catbox allows anonymous uploads up to 200MB, totally free, with CORS enabled
      const res = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) throw new Error('Upload failed');
      const finalUrl = await res.text();
      onUploadSuccess(finalUrl.trim());
    } catch (err: any) {
      onUploadError(err.message || 'Failed to upload image');
      // Revert if failed
      onUploadSuccess(currentUrl);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div 
      style={{ position: 'relative', display: 'inline-block', width: '100%', height: '100%' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* The actual image or banner element */}
      {children}
      
      {/* Hover Overlay */}
      {isHovered && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          borderRadius: shape === 'circle' ? '50%' : '0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          zIndex: 10,
          cursor: 'pointer'
        }}>
          {isUploading ? (
            <span style={{ color: 'white', fontWeight: 'bold' }}>Uploading...</span>
          ) : (
            <>
              <button 
                onClick={() => fileInputRef.current?.click()}
                style={{ 
                  background: '#5865f2', color: 'white', border: 'none', 
                  padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer',
                  pointerEvents: 'auto'
                }}
              >
                CHANGE
              </button>
              {currentUrl && !currentUrl.includes('0.png') && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onRemove(); }}
                  style={{ 
                    background: '#da373c', color: 'white', border: 'none', 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer',
                    pointerEvents: 'auto'
                  }}
                >
                  REMOVE
                </button>
              )}
            </>
          )}
        </div>
      )}
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        accept="image/png, image/jpeg, image/gif, image/webp" 
        style={{ display: 'none' }} 
      />
    </div>
  );
}
