import { Search, Phone, Video, Pin, UserPlus } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function DMVisualizer() {
  const { data: stateData } = useSWR('/api/state', fetcher, { refreshInterval: 1890 });
  
  const getVal = (k: string) => {
    const item = stateData?.find((s: any) => s.key === k);
    return item ? JSON.parse(item.value) : null;
  };

  const messages = getVal('bot_recent_dms') || [];

  return (
    <div className="module-card no-pad" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
      <div className="discord-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFF', fontWeight: 600 }}>
          <div style={{ position: 'relative' }}>
            <img src="https://cdn.discordapp.com/embed/avatars/2.png" alt="User" style={{ width: 24, height: 24, borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: -2, right: -2, width: 10, height: 10, backgroundColor: '#23A559', borderRadius: '50%', border: '2px solid #313338' }}></div>
          </div>
          Recent DMs
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

      <div className="discord-chat-area">
        {messages.length === 0 && <div style={{ color: '#aaa', textAlign: 'center', marginTop: '20px' }}>No DMs loaded.</div>}
        {messages.map((msg: any) => (
          <div key={msg.id} className="discord-message">
            <img src={msg.avatar} alt="Avatar" className="discord-msg-avatar" />
            <div className="discord-msg-content">
              <div className="discord-msg-header">
                <span className="discord-msg-author" style={{ color: msg.color }}>{msg.author}</span>
                {msg.isBot && <span className="discord-bot-tag">APP</span>}
                <span className="discord-msg-time">{msg.time}</span>
              </div>
              <div className="discord-msg-body">{msg.content}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="discord-input-wrapper">
        <div className="discord-input">
          Message
        </div>
      </div>
    </div>
  );
}
