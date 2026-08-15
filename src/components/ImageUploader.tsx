import { useState, useRef, useEffect } from 'react';

export function ImageUploader({ 
  type,
  currentUrl, 
  onUploadStart,
  onUploadSuccess,
  onUploadError,
  onRemove,
  children
}: { 
  type: 'avatar' | 'banner',
  currentUrl: string,
  onUploadStart: () => void,
  onUploadSuccess: (url: string) => void,
  onUploadError: (err: string) => void,
  onRemove: () => void,
  children: React.ReactNode
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Quick local preview
    const tempUrl = URL.createObjectURL(file);
    onUploadSuccess(tempUrl); // Temporarily show it instantly
    
    setIsUploading(true);
    onUploadStart();
    setMenuOpen(false);
    
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

  const PencilIcon = () => (
    <svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M21.03 2.9a3.54 3.54 0 0 1 0 5l-1.02 1.02-4.96-4.96L16.07 2.9a3.53 3.53 0 0 1 4.96 0Z"></path><path fill="currentColor" d="M3.18 15.86 13.67 5.37l4.96 4.96L8.14 20.82a2 2 0 0 1-1.02.54l-4.23 1a1 1 0 0 1-1.2-1.2l1-4.25a2 2 0 0 1 .5-1.05Z"></path></svg>
  );

  return (
    <div 
      style={{ position: 'relative', display: 'inline-block', width: '100%', height: '100%' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* The actual image or banner element */}
      {children}
      
      {/* Avatar Edit Button */}
      {type === 'avatar' && (isHovered || menuOpen) && (
        <div 
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            position: 'absolute',
            top: '6px', left: '6px', right: '6px', bottom: '6px', // account for the 6px border in the wrapper
            backgroundColor: 'rgba(0,0,0,0.4)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          {isUploading ? (
            <span style={{color: 'white', fontSize: '12px', fontWeight: 'bold'}}>...</span>
          ) : (
            <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '6px', color: 'white', display: 'flex', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
              <PencilIcon />
            </div>
          )}
        </div>
      )}

      {/* Banner Edit Button */}
      {type === 'banner' && (isHovered || menuOpen) && (
        <div 
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            position: 'absolute',
            top: '12px', right: '12px',
            backgroundColor: 'rgba(0,0,0,0.6)',
            borderRadius: '50%',
            padding: '8px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transition: 'background-color 0.1s'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.8)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.6)'}
        >
           {isUploading ? <span style={{fontSize: '12px', fontWeight: 'bold'}}>...</span> : <PencilIcon />}
        </div>
      )}

      {/* Dropdown Menu */}
      {menuOpen && (
        <div 
          ref={menuRef}
          style={{
            position: 'absolute',
            top: type === 'avatar' ? '0' : '45px',
            left: type === 'avatar' ? '85px' : 'auto',
            right: type === 'banner' ? '12px' : 'auto',
            backgroundColor: '#111214',
            border: '1px solid #1e1f22',
            borderRadius: '4px',
            padding: '6px 8px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.24)',
            zIndex: 100,
            width: '180px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          <div 
            onClick={() => fileInputRef.current?.click()}
            style={{ padding: '8px 8px', color: '#dbdee1', fontSize: '14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#5865F2'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#dbdee1'; }}
          >
            Change {type === 'avatar' ? 'Avatar' : 'Banner'}
          </div>
          
          {currentUrl && !currentUrl.includes('0.png') && (
            <>
              <div style={{ height: '1px', backgroundColor: '#2b2d31', margin: '2px 0' }} />
              <div 
                onClick={() => { onRemove(); setMenuOpen(false); }}
                style={{ padding: '8px 8px', color: '#da373c', fontSize: '14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#da373c'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#da373c'; }}
              >
                Remove {type === 'avatar' ? 'Avatar' : 'Banner'}
              </div>
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
