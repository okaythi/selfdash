import { useState, useRef, useEffect } from 'react';

// Extract colors from an image URL using canvas
const extractColors = (imageUrl: string, callback: (colors: string[]) => void) => {
  if (!imageUrl || imageUrl.includes('0.png')) return callback([]);
  
  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.src = imageUrl;
  
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return callback([]);
    
    // Scale down for faster processing
    canvas.width = 50;
    canvas.height = 50;
    ctx.drawImage(img, 0, 0, 50, 50);
    
    try {
      const data = ctx.getImageData(0, 0, 50, 50).data;
      const colors: Record<string, number> = {};
      
      for (let i = 0; i < data.length; i += 16) {
        // Skip very bright or very dark colors to get more vibrant midtones
        const r = data[i], g = data[i+1], b = data[i+2];
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        if (brightness < 30 || brightness > 220) continue;
        
        // Quantize colors slightly to group similar ones
        const qr = Math.round(r / 20) * 20;
        const qg = Math.round(g / 20) * 20;
        const qb = Math.round(b / 20) * 20;
        const hex = `#${qr.toString(16).padStart(2,'0')}${qg.toString(16).padStart(2,'0')}${qb.toString(16).padStart(2,'0')}`;
        
        colors[hex] = (colors[hex] || 0) + 1;
      }
      
      // Sort by frequency and get top 4
      const sorted = Object.entries(colors)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(entry => entry[0]);
        
      callback(sorted);
    } catch (e) {
      console.error("CORS issue with canvas color extraction:", e);
      callback([]);
    }
  };
  
  img.onerror = () => callback([]);
};

export function DiscordColorPicker({ 
  value, 
  onChange, 
  avatarUrl, 
  bannerUrl 
}: { 
  value: string, 
  onChange: (v: string) => void,
  avatarUrl?: string,
  bannerUrl?: string
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Extract colors from avatar/banner
  useEffect(() => {
    let colors: string[] = [];
    if (avatarUrl) {
      extractColors(avatarUrl, (c) => {
        colors = [...colors, ...c];
        setExtractedColors(Array.from(new Set(colors)).slice(0, 4));
      });
    }
  }, [avatarUrl, bannerUrl]);

  const defaultPresets = ['#d25452', '#4b2d3f', '#a463e2', '#43b581', '#faa61a', '#f04747', '#7289da', '#99aab5'];
  const presetsToShow = extractedColors.length > 0 ? extractedColors : defaultPresets.slice(0, 4);

  return (
    <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
      {/* Target button */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '8px',
          backgroundColor: value,
          border: '2px solid var(--dash-border)',
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        <div style={{
          position: 'absolute',
          top: '4px',
          right: '4px',
          width: '16px',
          height: '16px',
          border: '2px solid rgba(255,255,255,0.8)',
          borderRadius: '4px'
        }} />
      </div>

      {/* Popover */}
      {isOpen && (
        <div 
          ref={popoverRef}
          style={{
            position: 'absolute',
            top: '70px',
            left: '0',
            zIndex: 100,
            background: '#2b2d31', // Discord popover dark color
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.24)',
            width: '260px',
            border: '1px solid #1e1f22'
          }}
        >
          {/* Main Color Gradient Area (Simulated) */}
          <div style={{
            width: '100%',
            height: '130px',
            borderRadius: '4px',
            marginBottom: '12px',
            position: 'relative',
            background: `linear-gradient(to bottom, transparent, #000), linear-gradient(to right, #fff, ${value})`
          }}>
             <div style={{
               position: 'absolute',
               top: '20px',
               right: '40px',
               width: '8px',
               height: '8px',
               borderRadius: '50%',
               border: '2px solid white',
               boxShadow: '0 0 2px rgba(0,0,0,0.5)'
             }}/>
          </div>

          {/* Hue Slider (Native hidden fallback) */}
          <input 
            type="color" 
            value={value} 
            onChange={e => onChange(e.target.value)}
            style={{ width: '100%', height: '16px', border: 'none', padding: 0, cursor: 'pointer', marginBottom: '12px', borderRadius: '4px', appearance: 'none' }}
          />

          {/* Hex Input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#1e1f22',
            borderRadius: '4px',
            padding: '8px 12px',
            marginBottom: '16px',
            border: '1px solid #111214'
          }}>
            <span style={{ color: '#b5bac1', marginRight: '8px', fontFamily: 'monospace' }}>#</span>
            <input 
              type="text" 
              value={value.replace('#', '')}
              onChange={e => {
                const val = e.target.value;
                if (/^[0-9A-Fa-f]{0,6}$/.test(val)) {
                  onChange('#' + val);
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#dbdee1',
                width: '100%',
                outline: 'none',
                fontFamily: 'monospace'
              }}
            />
            {/* Eyedropper Icon Placeholder */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#b5bac1" style={{ cursor: 'pointer' }} onClick={() => inputRef.current?.click()}>
              <path d="M19.35 4.65a3.18 3.18 0 0 0-4.49 0L13.5 6l2.5 2.5 1.35-1.35a3.18 3.18 0 0 0 0-4.5ZM3 18.5V21h2.5l9.33-9.33-2.5-2.5L3 18.5Z"/>
            </svg>
            <input 
              ref={inputRef}
              type="color" 
              value={value} 
              onChange={e => onChange(e.target.value)} 
              style={{ width: 0, height: 0, opacity: 0, position: 'absolute' }}
            />
          </div>

          {/* Presets Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {presetsToShow.map((preset, i) => (
              <div 
                key={i}
                onClick={() => onChange(preset)}
                style={{
                  width: '100%',
                  paddingBottom: '100%', // perfect square
                  backgroundColor: preset,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  border: value.toLowerCase() === preset.toLowerCase() ? '2px solid white' : 'none',
                  boxSizing: 'border-box'
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
