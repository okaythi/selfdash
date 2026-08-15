import { useState, useEffect } from 'react';
import { Search, Phone, Video, Pin, UserPlus } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function DMVisualizer() {
  const { data: stateData } = useSWR('/api/state', fetcher, { refreshInterval: 1890 });
  
  const getVal = (k: string) => {
    const item = stateData?.find((s: any) => s.key === k);
    return item ? JSON.parse(item.value) : null;
  };

  const dms = getVal('bot_recent_dms_list') || [];
  const messages = getVal('bot_active_dm_messages') || [];

  const [activeDm, setActiveDm] = useState<any>(null);
  const [inputText, setInputText] = useState('');

  // Automatically select the first DM if none is selected
  useEffect(() => {
    if (!activeDm && dms.length > 0) {
      handleSelectDm(dms[0]);
    }
  }, [dms]);

  const handleSelectDm = (dm: any) => {
    setActiveDm(dm);
    fetch('/api/queue-command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        command: { type: 'fetch_dm_messages', channel_id: dm.id } 
      })
    });
  };

  const handleSendMessage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputText.trim() && activeDm) {
      fetch('/api/queue-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          command: { type: 'send_dm_message', channel_id: activeDm.id, content: inputText.trim() } 
        })
      });
      setInputText('');
    }
  };

  return (
    <div className="module-card no-pad" style={{ height: '600px', display: 'flex', overflow: 'hidden' }}>
      
      {/* Sidebar for DMs */}
      <div style={{ width: '240px', backgroundColor: '#2b2d31', display: 'flex', flexDirection: 'column', borderRight: '1px solid #1e1f22' }}>
        <div style={{ padding: '12px 10px', boxShadow: '0 1px 2px rgba(0,0,0,0.2)', zIndex: 2 }}>
          <div style={{ backgroundColor: '#1e1f22', padding: '6px', borderRadius: '4px', fontSize: '13px', color: '#949ba4', display: 'flex', justifyContent: 'center' }}>
            Find or start a conversation
          </div>
        </div>
        <div style={{ padding: '10px 8px', overflowY: 'auto', flex: 1 }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#949ba4', padding: '10px 8px', textTransform: 'uppercase' }}>Direct Messages</div>
          {dms.map((dm: any) => (
            <div 
              key={dm.id} 
              onClick={() => handleSelectDm(dm)}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', 
                borderRadius: '4px', cursor: 'pointer',
                backgroundColor: activeDm?.id === dm.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                color: activeDm?.id === dm.id ? '#fff' : '#949ba4'
              }}
              onMouseEnter={(e) => {
                if (activeDm?.id !== dm.id) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                e.currentTarget.style.color = '#dbdee1';
              }}
              onMouseLeave={(e) => {
                if (activeDm?.id !== dm.id) e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = activeDm?.id === dm.id ? '#fff' : '#949ba4';
              }}
            >
              <div style={{ position: 'relative' }}>
                <img src={dm.avatar} style={{ width: '32px', height: '32px', borderRadius: '50%' }} alt="" />
              </div>
              <div style={{ fontWeight: 500, fontSize: '15px' }}>{dm.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#313338' }}>
        {activeDm ? (
          <>
            <div className="discord-header" style={{ borderBottom: '1px solid #1e1f22' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFF', fontWeight: 600 }}>
                <span style={{ color: '#80848e', fontSize: '24px' }}>@</span>
                {activeDm.name}
              </div>
              <div className="discord-header-icons">
                <Phone size={20} />
                <Video size={20} />
                <Pin size={20} />
                <UserPlus size={20} />
                <div className="discord-search">
                  <input type="text" placeholder="Search" />
                  <Search size={14} />
                </div>
              </div>
            </div>

            <div className="discord-chat-area" style={{ flex: 1 }}>
              {messages.length === 0 && <div style={{ color: '#aaa', textAlign: 'center', marginTop: '20px' }}>Loading messages...</div>}
              {messages.map((msg: any) => (
                <div key={msg.id} className="discord-message" style={msg.isBot ? { backgroundColor: 'rgba(255,255,255,0.03)' } : {}}>
                  <img src={msg.avatar} alt="Avatar" className="discord-msg-avatar" />
                  <div className="discord-msg-content">
                    <div className="discord-msg-header">
                      <span className="discord-msg-author" style={{ color: msg.color }}>{msg.author}</span>
                      {msg.isBot && <span className="discord-bot-tag">APP</span>}
                      <span className="discord-msg-time">{msg.time}</span>
                    </div>
                    <div className="discord-msg-body" style={msg.isBot ? { fontWeight: 'bold' } : {}}>{msg.content}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="discord-input-wrapper">
              <input 
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={handleSendMessage}
                placeholder={`Message @${activeDm.name}`}
                style={{ width: '100%', background: 'none', border: 'none', color: '#dbdee1', padding: '10px 0', outline: 'none', fontSize: '15px' }}
              />
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#949ba4' }}>
            Select a direct message to start chatting.
          </div>
        )}
      </div>

    </div>
  );
}
