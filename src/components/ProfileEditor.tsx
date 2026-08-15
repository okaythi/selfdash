import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { DiscordColorPicker } from './DiscordColorPicker';
import { ImageUploader } from './ImageUploader';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function ProfileEditor() {
  const { data: stateData } = useSWR('/api/state', fetcher, { refreshInterval: 1890 });
  
  const getVal = (k: string) => {
    const item = stateData?.find((s: any) => s.key === k);
    return item ? JSON.parse(item.value) : null;
  };

  const [profile, setProfile] = useState({
    username: 'Loading...',
    bio: '',
    bannerColor: '#000000',
    avatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png',
    bannerUrl: ''
  });

  useEffect(() => {
    if (stateData) {
      setProfile(p => ({
        ...p,
        username: getVal('bot_username') || p.username,
        bio: getVal('bot_bio') || p.bio,
        bannerColor: getVal('bot_banner_color') || p.bannerColor,
        avatarUrl: getVal('bot_pfp') || p.avatarUrl,
        bannerUrl: getVal('bot_banner') || p.bannerUrl
      }));
    }
  }, [stateData]);

  const handleSave = async () => {
    await fetch('/api/queue-command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        command: { 
          type: 'update_profile', 
          username: profile.username,
          bio: profile.bio,
          bannerColor: profile.bannerColor,
          avatarUrl: profile.avatarUrl,
          bannerUrl: profile.bannerUrl
        } 
      })
    });
    alert("Profile update command queued.");
  };

  const renderBio = (bio: string) => {
    return bio.split('\n').map((line, i) => {
      const parts = line.split(/(<(?:a?):[a-zA-Z0-9_]+:\d+>)/g);
      return (
        <div key={i} style={{ minHeight: '1.2em' }}>
          {parts.map((part, j) => {
            const match = part.match(/<(a?):([a-zA-Z0-9_]+):(\d+)>/);
            if (match) {
              const isAnimated = match[1] === 'a';
              const name = match[2];
              const id = match[3];
              const ext = isAnimated ? 'gif' : 'webp';
              return (
                <img 
                  key={j} 
                  src={`https://cdn.discordapp.com/emojis/${id}.${ext}`} 
                  alt={`:${name}:`} 
                  title={`:${name}:`}
                  style={{ width: '22px', height: '22px', verticalAlign: 'bottom', display: 'inline-block', margin: '0 1px' }} 
                />
              );
            }
            return <span key={j}>{part}</span>;
          })}
        </div>
      );
    });
  };

  return (
    <div style={{ display: 'flex', gap: '30px' }}>
      <div style={{ flex: 1 }}>
        <h2 style={{ marginBottom: '20px' }}>Edit Profile</h2>
        <div className="input-group">
          <label>Username</label>
          <input 
            type="text" 
            value={profile.username} 
            onChange={e => setProfile({...profile, username: e.target.value})} 
            style={{ width: '100%', padding: '10px', background: 'var(--dash-surface)', border: '1px solid var(--dash-border)', color: 'white', marginTop: '5px' }}
          />
        </div>
        <div className="input-group" style={{ marginTop: '15px' }}>
          <label>Bio</label>
          <textarea 
            value={profile.bio} 
            onChange={e => setProfile({...profile, bio: e.target.value})} 
            style={{ width: '100%', padding: '10px', background: 'var(--dash-surface)', border: '1px solid var(--dash-border)', color: 'white', marginTop: '5px', minHeight: '80px', fontFamily: 'inherit' }}
          />
        </div>
        <div className="input-group" style={{ marginTop: '15px' }}>
          <label>Profile Theme (Banner Color)</label>
          <div style={{ marginTop: '5px' }}>
            <DiscordColorPicker 
              value={profile.bannerColor}
              onChange={(c) => setProfile({...profile, bannerColor: c})}
              avatarUrl={profile.avatarUrl}
              bannerUrl={profile.bannerUrl}
            />
          </div>
        </div>
        <button className="btn-primary" style={{ marginTop: '30px', padding: '10px 20px' }} onClick={handleSave}>Save Changes</button>
      </div>

      <div style={{ flex: 1 }}>
        <h2 style={{ marginBottom: '20px' }}>Live Preview</h2>
        <div className="discord-replica-container" style={{ overflow: 'hidden' }}>
          <ImageUploader 
            currentUrl={profile.bannerUrl}
            onUploadStart={() => {}}
            onUploadSuccess={(url) => setProfile({...profile, bannerUrl: url})}
            onUploadError={(err) => alert(err)}
            onRemove={() => setProfile({...profile, bannerUrl: ''})}
            shape="rect"
          >
            <div 
              className="discord-profile-banner" 
              style={{ 
                backgroundColor: profile.bannerColor,
                backgroundImage: profile.bannerUrl ? `url(${profile.bannerUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '120px',
                width: '100%'
              }} 
            />
          </ImageUploader>
          
          <div className="discord-profile-avatar-wrapper" style={{ position: 'relative', marginTop: '-40px', marginLeft: '16px', width: '80px', height: '80px', zIndex: 5 }}>
            <ImageUploader
              currentUrl={profile.avatarUrl}
              onUploadStart={() => {}}
              onUploadSuccess={(url) => setProfile({...profile, avatarUrl: url})}
              onUploadError={(err) => alert(err)}
              onRemove={() => setProfile({...profile, avatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png'})}
              shape="circle"
            >
              <img 
                src={profile.avatarUrl} 
                alt="Avatar" 
                className="discord-profile-avatar" 
                style={{ width: '100%', height: '100%', borderRadius: '50%', border: '6px solid #111214', boxSizing: 'border-box', backgroundColor: '#1e1f22', objectFit: 'cover' }}
              />
            </ImageUploader>
          </div>
          
          <div className="discord-profile-info" style={{ padding: '12px 16px 16px 16px' }}>
            <div className="discord-username" style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>{profile.username}</div>
            <div className="discord-bio" style={{ fontSize: '14px', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
              {renderBio(profile.bio)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
