import React, { useState } from 'react';

export function ProfileEditor() {
  const [profile, setProfile] = useState({
    username: 'GewoonThy',
    bio: 'Professional Discord Bot.\nPlaying around with Cloudflare.',
    bannerColor: '#F38020',
    avatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png'
  });

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
        <button style={{ marginTop: '20px', background: 'var(--dash-accent)', color: '#fff', padding: '10px 20px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Save Changes</button>
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
