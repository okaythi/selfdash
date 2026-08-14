import { useState, useEffect } from 'react';
import useSWR from 'swr';

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
    avatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png'
  });

  useEffect(() => {
    if (stateData) {
      setProfile(p => ({
        ...p,
        username: getVal('bot_username') || p.username,
        bio: getVal('bot_bio') || p.bio,
        bannerColor: getVal('bot_banner_color') || p.bannerColor,
        avatarUrl: getVal('bot_pfp') || p.avatarUrl
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
          bannerColor: profile.bannerColor
        } 
      })
    });
    alert("Profile update command queued.");
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
            style={{ width: '100%', padding: '10px', background: 'var(--dash-surface)', border: '1px solid var(--dash-border)', color: 'white', marginTop: '5px', minHeight: '80px' }}
          />
        </div>
        <div className="input-group" style={{ marginTop: '15px' }}>
          <label>Banner Color</label>
          <input 
            type="color" 
            value={profile.bannerColor} 
            onChange={e => setProfile({...profile, bannerColor: e.target.value})} 
            style={{ width: '100%', padding: '5px', background: 'var(--dash-surface)', border: '1px solid var(--dash-border)', marginTop: '5px' }}
          />
        </div>
        <button className="btn-primary" style={{ marginTop: '20px', padding: '10px 20px' }} onClick={handleSave}>Save Changes</button>
      </div>

      <div style={{ flex: 1 }}>
        <h2 style={{ marginBottom: '20px' }}>Live Preview</h2>
        <div className="discord-replica-container">
          <div className="discord-profile-banner" style={{ backgroundColor: profile.bannerColor }}></div>
          <div className="discord-profile-avatar-wrapper">
            <img src={profile.avatarUrl} alt="Avatar" className="discord-profile-avatar" />
          </div>
          <div className="discord-profile-info">
            <div className="discord-username">{profile.username}</div>
            <div className="discord-bio">
              {profile.bio.split('\n').map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
