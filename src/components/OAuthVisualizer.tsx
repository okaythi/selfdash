import useSWR from 'swr';
import { Server, ShieldCheck, Mail, Link as LinkIcon, CircleSlash, Key, Monitor } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function OAuthVisualizer() {
  const { data: stateData, error: stateError, isLoading } = useSWR('/api/state', fetcher);

  const getVal = (k: string) => {
    const item = stateData?.find((s: any) => s.key === k);
    try {
      return item ? JSON.parse(item.value) : null;
    } catch {
      return null;
    }
  };

  const baseUser = getVal('oauth_user_data');
  const connections = getVal('oauth_connections') || [];
  const guilds = getVal('oauth_guilds') || [];

  // Fetch rich profile data from the Python Bot API
  const { data: botUsers } = useSWR(baseUser?.id ? `https://gewoonthy.onrender.com/api/get_users?ids=${baseUser.id}` : null, fetcher);
  const botUser = botUsers && botUsers.length > 0 ? botUsers[0] : null;

  // Merge the OAuth user with the Bot user data
  const user = baseUser ? {
    ...baseUser,
    flags: botUser?.flags !== undefined ? botUser.flags : baseUser.flags,
    public_flags: botUser?.flags !== undefined ? botUser.flags : baseUser.public_flags,
    flag_names: botUser?.flag_names || [],
    status: botUser?.status || 'offline',
    custom_status: botUser?.custom_status || null,
    bot_badges: botUser?.badges || []
  } : null;

  if (stateError) return <div>Failed to load data</div>;
  if (isLoading) return <div style={{ color: 'white', padding: 20 }}>Loading OAuth Data...</div>;

  const hasData = user || connections || guilds;

  if (!hasData) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ padding: '20px', backgroundColor: 'var(--dash-surface)', borderRadius: '8px', border: '1px solid #ED4245' }}>
          <h3 style={{ color: '#ED4245', marginBottom: '10px' }}>No OAuth data found</h3>
          <p>You need to re-authenticate to grant the new scopes.</p>
          <button 
            className="btn-danger" 
            onClick={() => window.location.href = '/api/auth/logout'}
            style={{ marginTop: '15px', padding: '8px 16px', backgroundColor: '#ED4245', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  const renderAvatar = (u: any) => {
    if (u.avatar) {
      const ext = u.avatar.startsWith('a_') ? 'gif' : 'png';
      return `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${ext}?size=128`;
    }
    return 'https://cdn.discordapp.com/embed/avatars/0.png';
  };

  const renderBanner = (u: any) => {
    if (u.banner) {
      const ext = u.banner.startsWith('a_') ? 'gif' : 'png';
      return `https://cdn.discordapp.com/banners/${u.id}/${u.banner}.${ext}?size=600`;
    }
    return null;
  };

  const getBadges = (u: any) => {
    const badges = [];
    let flags = u.public_flags || 0;
    
    if (u.premium_type > 0) badges.push({ name: 'Nitro', src: 'https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/discord-nitro.svg' });
    
    const flag_map = {
      staff: { bit: 1 << 0, name: 'Staff', src: 'https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/discord-staff.svg' },
      partner: { bit: 1 << 1, name: 'Partner', src: 'https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/discord-partner.svg' },
      hypesquad: { bit: 1 << 2, name: 'HypeSquad Events', src: 'https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/hype-squad-events.svg' },
      bug_hunter_1: { bit: 1 << 3, name: 'Bug Hunter Lvl 1', src: 'https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/discord-bug-hunter-green.svg' },
      bravery: { bit: 1 << 6, name: 'House Bravery', src: 'https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/hype-squad-bravery.svg' },
      brilliance: { bit: 1 << 7, name: 'House Brilliance', src: 'https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/hype-squad-brilliance.svg' },
      balance: { bit: 1 << 8, name: 'House Balance', src: 'https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/hype-squad-balance.svg' },
      early_supporter: { bit: 1 << 9, name: 'Early Supporter', src: 'https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/discord-early-supporter.svg' },
      bug_hunter_2: { bit: 1 << 14, name: 'Bug Hunter Lvl 2', src: 'https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/discord-bug-hunter-gold.svg' },
      verified_bot_dev: { bit: 1 << 17, name: 'Verified Developer', src: 'https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/early-verified-bot-developer.svg' },
      mod_alumni: { bit: 1 << 18, name: 'Moderator Programs Alumni', src: 'https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/discord-mod.svg' },
      active_dev: { bit: 1 << 22, name: 'Active Developer', src: 'https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/active-developer.svg' }
    };

    let flags = u.public_flags || 0;
    
    let bitOffset = 0;
    while (flags > 0) {
      if ((flags & 1) === 1) {
        let found = false;
        for (const key in flag_map) {
          if (flag_map[key as keyof typeof flag_map].bit === (1 << bitOffset)) {
            badges.push(flag_map[key as keyof typeof flag_map]);
            found = true;
            break;
          }
        }
      }
      flags >>= 1;
      bitOffset++;
    }

    const fn = u.flag_names || [];
    if (fn.includes('used_desktop_client')) badges.push({ name: 'Desktop Client', icon: <Monitor size={14} />, color: '#E67E22', bg: '#E67E2222' });
    if (fn.includes('used_web_client')) badges.push({ name: 'Web Client', icon: <Globe size={14} />, color: '#E67E22', bg: '#E67E2222' });
    if (fn.includes('used_mobile_client')) badges.push({ name: 'Mobile Client', icon: <Smartphone size={14} />, color: '#2ECC71', bg: '#2ECC7122' });
    if (fn.includes('premium_promo_dismissed')) badges.push({ name: 'Vencord', icon: <div style={{width: 14, height: 14, borderRadius: '50%', background: 'conic-gradient(from 180deg at 50% 50%, #e67e22 0deg, #f39c12 180deg, #e67e22 360deg)'}}/>, color: '#E67E22', bg: '#E67E2222' });
    if (fn.includes('premium_discriminator')) badges.push({ name: 'Donator', icon: <div style={{width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderBottom: '14px solid #E91E63'}}/>, color: '#E91E63', bg: '#E91E6322' });
    if (fn.includes('has_session_started')) badges.push({ name: 'Aliucord', icon: <Leaf size={14} fill="#2ecc71" stroke="#2ecc71" />, color: '#2ECC71', bg: '#2ECC7122' });
    if (fn.includes('spammer')) badges.push({ name: 'Spammer', icon: <CircleSlash size={14} />, color: '#ED4245', bg: '#ED424522' });
    
    return badges;
  };

  const bannerUrl = user ? renderBanner(user) : null;
  const accentColor = user?.accent_color ? `#${user.accent_color.toString(16).padStart(6, '0')}` : 'var(--dash-accent)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', paddingBottom: '40px' }}>
      
      {user && (
        <div>
          <h2 style={{ marginBottom: '15px', color: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Key size={24} color="#5865F2" /> Identity Profile
          </h2>
          <div className="discord-replica-container" style={{ maxWidth: '800px', margin: 0 }}>
            <div 
              style={{ 
                height: '150px', 
                backgroundColor: bannerUrl ? 'transparent' : accentColor,
                backgroundImage: bannerUrl ? `url(${bannerUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }} 
            />
            <div style={{ position: 'relative', marginTop: '-60px', padding: '0 20px' }}>
              <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                <img 
                  src={renderAvatar(user)} 
                  alt="Avatar" 
                  style={{ width: '120px', height: '120px', borderRadius: '50%', border: '6px solid var(--discord-bg)', backgroundColor: '#222' }} 
                />
                {user.avatar_decoration_data?.asset && (
                  <img 
                    src={`https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data.asset}.png`}
                    alt="Decoration"
                    style={{ position: 'absolute', top: '-12px', left: '-12px', width: '144px', height: '144px', pointerEvents: 'none' }}
                  />
                )}
                
                {user.status && user.status !== 'offline' && (
                  <div style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '32px',
                    height: '32px',
                    backgroundColor: 'var(--discord-bg)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: user.status === 'online' ? '#23A559' : user.status === 'idle' ? '#F0B232' : user.status === 'dnd' ? '#F23F42' : '#80848E'
                    }} />
                  </div>
                )}
              </div>
              
              {user.custom_status && (
                <div style={{ position: 'absolute', top: '20px', left: '160px', backgroundColor: '#111214', padding: '8px 12px', borderRadius: '8px', border: '1px solid #3f4147', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10 }}>
                  <span style={{ fontSize: '0.9rem', color: '#dbdee1' }}>{user.custom_status}</span>
                </div>
              )}
              
              <div style={{ padding: '15px 0 25px 0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h2 style={{ margin: '0 0 5px 0', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={
                          user.display_name_styles?.colors?.length > 1 
                            ? {
                                background: `linear-gradient(90deg, ${user.display_name_styles.colors.map((c: number) => '#' + c.toString(16).padStart(6, '0')).join(', ')})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                              }
                            : { color: user.display_name_styles?.colors?.[0] ? '#' + user.display_name_styles.colors[0].toString(16).padStart(6, '0') : '#fff' }
                        }>
                          {user.global_name || user.username}
                        </span>
                        {user.pronouns && <span style={{ fontSize: '12px', color: '#dbdee1', backgroundColor: '#1e1f22', padding: '2px 6px', borderRadius: '4px' }}>{user.pronouns}</span>}
                      </h2>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#dbdee1', fontSize: '14px' }}>{user.username}</span>
                        {getClanBadge(user) && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#1e1f22', padding: '2px 8px', borderRadius: '12px', border: '1px solid #3f4147' }}>
                            <img src={getClanBadge(user)} alt="Clan" style={{ width: '12px', height: '12px' }} />
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#dbdee1' }}>{user.clan.tag}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-start', alignItems: 'center', marginTop: '4px' }}>
                    {getBadges(user).map((b, i) => (
                      <div key={i} title={b.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px' }}>
                        {b.src ? (
                          <img src={b.src} alt={b.name} style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: (b as any).color }}>
                            {(b as any).icon}
                          </div>
                        )}
                      </div>
                    ))}
                    {user.bot_badges?.map((badgeStr: string, i: number) => {
                       if (badgeStr.includes('hypesquad') || badgeStr.includes('staff') || badgeStr.includes('partner') || badgeStr.includes('bug_hunter') || badgeStr.includes('active-developer') || badgeStr.includes('premium')) return null;
                       return (
                         <div key={`bot-${i}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px' }}>
                           <img src={`https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/${badgeStr}`} alt="Bot Badge" style={{ width: '22px', height: '22px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                         </div>
                       )
                    })}
                  </div>
                </div>

                <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                  <div style={{ backgroundColor: '#2b2d31', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: '#B5BAC1', marginBottom: 5 }}>Email</div>
                    <div style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Mail size={16} /> {user.email || 'Hidden'}
                      {user.verified && <ShieldCheck size={16} color="#23A559" />}
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#2b2d31', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: '#B5BAC1', marginBottom: 5 }}>Locale</div>
                    <div style={{ color: '#fff' }}>{user.locale?.toUpperCase() || 'Unknown'}</div>
                  </div>
                  <div style={{ backgroundColor: '#2b2d31', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: '#B5BAC1', marginBottom: 5 }}>MFA Enabled</div>
                    <div style={{ color: user.mfa_enabled ? '#23A559' : '#F23F42', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {user.mfa_enabled ? <ShieldCheck size={16} /> : <CircleSlash size={16} />} 
                      {user.mfa_enabled ? 'Yes' : 'No'}
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#2b2d31', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: '#B5BAC1', marginBottom: 5 }}>Public Flags</div>
                    <div style={{ color: '#fff', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 8 }}>
                      {user.public_flags}
                      {user.public_flags > 0 && (
                        <span style={{ fontSize: '0.75rem', backgroundColor: '#1e1f22', padding: '2px 6px', borderRadius: '4px', color: '#B5BAC1' }}>
                          {getBadges(user).filter(b => b.name !== 'Nitro').length} Badges
                        </span>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CONNECTIONS */}
      {connections && connections.length > 0 && (
        <div>
          <h2 style={{ marginBottom: '15px', color: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
            <LinkIcon size={24} color="#5865F2" /> Connected Accounts
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
            {connections.map((conn: any, idx: number) => (
              <div key={idx} style={{ backgroundColor: 'var(--discord-surface)', borderRadius: '8px', padding: '15px', display: 'flex', alignItems: 'center', gap: 15, border: '1px solid #1E1F22' }}>
                <div style={{ width: 40, height: 40, backgroundColor: '#2b2d31', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Monitor size={20} color="#fff" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {conn.name}
                    {conn.verified && <ShieldCheck size={14} color="#23A559" />}
                  </div>
                  <div style={{ color: '#B5BAC1', fontSize: '0.85rem', textTransform: 'capitalize' }}>{conn.type}</div>
                </div>
                {conn.show_activity && (
                  <div style={{ fontSize: '0.75rem', backgroundColor: '#5865F222', color: '#5865F2', padding: '2px 6px', borderRadius: 4 }}>
                    Activity On
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. GUILDS */}
      {guilds && guilds.length > 0 && (
        <div>
          <h2 style={{ marginBottom: '15px', color: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Server size={24} color="#5865F2" /> Servers ({guilds.length})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '15px' }}>
            {guilds.map((g: any, idx: number) => (
              <div key={idx} style={{ backgroundColor: 'var(--discord-surface)', borderRadius: '8px', overflow: 'hidden', border: '1px solid #1E1F22', display: 'flex', flexDirection: 'column' }}>
                <div style={{ 
                  height: '60px', 
                  backgroundColor: '#2b2d31',
                  backgroundImage: g.banner ? `url(https://cdn.discordapp.com/banners/${g.id}/${g.banner}.png?size=300)` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }} />
                <div style={{ display: 'flex', gap: '15px', padding: '0 15px 15px', marginTop: '-25px' }}>
                  <div style={{ width: 60, height: 60, borderRadius: '16px', backgroundColor: '#111214', border: '4px solid var(--discord-surface)', overflow: 'hidden', flexShrink: 0 }}>
                    {g.icon ? (
                      <img src={`https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem' }}>
                        {g.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div style={{ paddingTop: '30px', flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {g.name}
                      {g.owner && <Key size={14} color="#F1C40F" />}
                    </div>
                  </div>
                </div>
                
                {g.features && g.features.length > 0 && (
                  <div style={{ padding: '0 15px 15px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {g.features.slice(0, 5).map((f: string, i: number) => (
                      <span key={i} style={{ backgroundColor: '#2b2d31', color: '#dbdee1', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', border: '1px solid #3f4147' }}>
                        {f.replace(/_/g, ' ')}
                      </span>
                    ))}
                    {g.features.length > 5 && (
                      <span style={{ backgroundColor: '#2b2d31', color: '#888', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', border: '1px solid #3f4147' }}>
                        +{g.features.length - 5} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
