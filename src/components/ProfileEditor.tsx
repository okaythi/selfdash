import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { DiscordColorPicker } from './DiscordColorPicker';
import { ImageUploader } from './ImageUploader';
import twemoji from '@twemoji/api';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function ProfileEditor() {
  const { data: stateData } = useSWR('/api/state', fetcher, { refreshInterval: 1890 });
  
  const getVal = (k: string) => {
    const item = stateData?.find((s: any) => s.key === k);
    return item ? JSON.parse(item.value) : null;
  };

  const [hasInitialized, setHasInitialized] = useState(false);
  const [profile, setProfile] = useState({
    displayName: 'Loading...',
    bio: '',
    bannerColor: '#000000',
    accentColor: '#000000',
    avatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png',
    bannerUrl: '',
    status: 'online'
  });

  useEffect(() => {
    if (stateData && !hasInitialized) {
      setProfile(p => ({
        ...p,
        displayName: getVal('bot_display_name') || p.displayName,
        bio: getVal('bot_bio') || p.bio,
        bannerColor: getVal('bot_banner_color') || p.bannerColor,
        accentColor: getVal('bot_accent_color') || p.accentColor,
        avatarUrl: getVal('bot_pfp') || p.avatarUrl,
        bannerUrl: getVal('bot_banner') || p.bannerUrl,
        status: getVal('bot_status') || p.status
      }));
      setHasInitialized(true);
    }
  }, [stateData, hasInitialized]);

  const handleSave = async () => {
    await fetch('/api/queue-command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        command: { 
          type: 'update_profile', 
          displayName: profile.displayName,
          bio: profile.bio,
          bannerColor: profile.bannerColor,
          accentColor: profile.accentColor,
          avatarUrl: profile.avatarUrl,
          bannerUrl: profile.bannerUrl,
          status: profile.status
        } 
      })
    });
    alert("Profile update command queued.");
  };

  const renderBio = (bio: string) => {
    // 1. Escape HTML
    let escaped = bio
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    // 2. Parse Custom Discord Emojis
    let customParsed = escaped.replace(/&lt;(a?):([a-zA-Z0-9_]+):(\d+)&gt;/g, (_, animated, name, id) => {
      const ext = animated ? 'gif' : 'webp';
      return `<img class="emoji" src="https://cdn.discordapp.com/emojis/${id}.${ext}" alt=":${name}:" title=":${name}:" style="width:22px; height:22px; vertical-align:bottom; display:inline-block; margin:0 1px;" />`;
    });

    // 3. Parse Twemoji (standard unicode emojis)
    let finalHtml = customParsed;
    try {
      finalHtml = twemoji.parse(customParsed, {
        folder: 'svg',
        ext: '.svg',
        base: 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/'
      });
    } catch (e) {
      console.error('Twemoji parsing error:', e);
    }

    finalHtml = finalHtml.replace(/\n/g, '<br/>');

    // Make sure Twemoji <img> tags are styled correctly
    finalHtml = finalHtml.replace(/<img class="emoji"/g, '<img class="emoji" style="width:22px; height:22px; vertical-align:bottom; display:inline-block; margin:0 1px;"');

    return <div dangerouslySetInnerHTML={{ __html: finalHtml }} />;
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'online': return '#23a559';
      case 'idle': return '#f0b232';
      case 'dnd': return '#f23f43';
      case 'invisible': return '#80848e';
      default: return '#80848e';
    }
  };

  return (
    <div style={{ display: 'flex', gap: '30px' }}>
      <div style={{ flex: 1 }}>
        <h2 style={{ marginBottom: '20px' }}>Edit Profile</h2>
        
        <div className="input-group">
          <label>Status</label>
          <select 
            value={profile.status}
            onChange={e => setProfile({...profile, status: e.target.value})}
            style={{ width: '100%', padding: '10px', background: 'var(--dash-surface)', border: '1px solid var(--dash-border)', color: 'white', marginTop: '5px', borderRadius: '4px' }}
          >
            <option value="online">Online</option>
            <option value="idle">Idle</option>
            <option value="dnd">Do Not Disturb</option>
            <option value="invisible">Invisible</option>
          </select>
        </div>

        <div className="input-group" style={{ marginTop: '15px' }}>
          <label>Display Name</label>
          <input 
            type="text" 
            value={profile.displayName} 
            onChange={e => setProfile({...profile, displayName: e.target.value})} 
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
        
        <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label>Banner colour</label>
            <div style={{ marginTop: '5px' }}>
              <DiscordColorPicker 
                value={profile.bannerColor}
                onChange={(c) => setProfile({...profile, bannerColor: c})}
                avatarUrl={profile.avatarUrl}
                bannerUrl={profile.bannerUrl}
              />
            </div>
          </div>
          
          <div className="input-group" style={{ flex: 1 }}>
            <label>Profile Theme (Accent)</label>
            <div style={{ marginTop: '5px' }}>
              <DiscordColorPicker 
                value={profile.accentColor}
                onChange={(c) => setProfile({...profile, accentColor: c})}
                avatarUrl={profile.avatarUrl}
                bannerUrl={profile.bannerUrl}
              />
            </div>
          </div>
        </div>
        
        <button className="btn-primary" style={{ marginTop: '30px', padding: '10px 20px' }} onClick={handleSave}>Save Changes</button>
      </div>

      <div style={{ flex: 1 }}>
        <h2 style={{ marginBottom: '20px' }}>Live Preview</h2>
        <div className="discord-replica-container" style={{ overflow: 'hidden', backgroundColor: profile.bannerColor }}>
          <ImageUploader 
            type="banner"
            currentUrl={profile.bannerUrl}
            onUploadStart={() => {}}
            onUploadSuccess={(url) => setProfile({...profile, bannerUrl: url})}
            onUploadError={(err) => alert(err)}
            onRemove={() => setProfile({...profile, bannerUrl: ''})}
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
              type="avatar"
              currentUrl={profile.avatarUrl}
              onUploadStart={() => {}}
              onUploadSuccess={(url) => setProfile({...profile, avatarUrl: url})}
              onUploadError={(err) => alert(err)}
              onRemove={() => setProfile({...profile, avatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png'})}
            >
              <img 
                src={profile.avatarUrl} 
                alt="Avatar" 
                className="discord-profile-avatar" 
                style={{ width: '100%', height: '100%', borderRadius: '50%', border: `6px solid ${profile.bannerColor}`, boxSizing: 'border-box', backgroundColor: profile.bannerColor, objectFit: 'cover' }}
              />
            </ImageUploader>
            
            {/* Status indicator */}
            <div style={{
              position: 'absolute',
              bottom: '0px',
              right: '0px',
              width: '24px',
              height: '24px',
              backgroundColor: getStatusColor(profile.status),
              borderRadius: '50%',
              border: `4px solid ${profile.bannerColor}`,
              zIndex: 10
            }}>
              {profile.status === 'idle' && (
                <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '12px', height: '12px', backgroundColor: profile.bannerColor, borderRadius: '50%' }}></div>
              )}
              {profile.status === 'dnd' && (
                <div style={{ position: 'absolute', top: '7px', left: '2px', width: '12px', height: '3px', backgroundColor: profile.bannerColor, borderRadius: '2px' }}></div>
              )}
              {profile.status === 'invisible' && (
                <div style={{ position: 'absolute', top: '3px', left: '3px', width: '10px', height: '10px', backgroundColor: profile.bannerColor, borderRadius: '50%' }}></div>
              )}
            </div>
          </div>
          
          <div className="discord-profile-info" style={{ padding: '12px 16px 16px 16px', margin: '16px', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '8px' }}>
            <div className="discord-username" style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>{profile.displayName}</div>
            <div className="discord-bio" style={{ fontSize: '14px', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
              {renderBio(profile.bio)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
