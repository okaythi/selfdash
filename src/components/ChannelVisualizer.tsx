import { useEffect } from 'react';
import { Hash, Search, Bell, Pin, Users } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function ChannelVisualizer() {
  const { data: stateData } = useSWR('/api/state', fetcher, { refreshInterval: 1890 });
  
  const getVal = (k: string) => {
    const item = stateData?.find((s: any) => s.key === k);
    return item ? JSON.parse(item.value) : null;
  };

  useEffect(() => {
    // Request channel context when component mounts
    fetch('/api/queue-command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        command: { type: 'fetch_channel_context' } 
      })
    });
  }, []);

  const channelContext = getVal('bot_channel_context') || { channel_name: 'No recent messages', messages: [] };
  const messages = channelContext.messages;

  return (
    <div className="module-card no-pad" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Discord Header Replica */}
      <div className="discord-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFF', fontWeight: 600 }}>
          <Hash size={24} color="#80848E" />
          {channelContext.channel_name}
        </div>
        <div className="discord-header-icons">
          <Bell size={20} />
          <Pin size={20} />
          <Users size={20} />
          <div className="discord-search">
            <input type="text" placeholder="Search" />
            <Search size={14} />
          </div>
        </div>
      </div>

      {/* Discord Chat Replica */}
      <div className="discord-chat-area">
        {messages.length === 0 && <div style={{ color: '#aaa', textAlign: 'center', marginTop: '20px' }}>No messages loaded. Send a message on Discord to sync your context.</div>}
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

      {/* Discord Input Replica */}
      <div className="discord-input-wrapper">
        <div className="discord-input">
          Message #{channelContext.channel_name}
        </div>
      </div>
    </div>
  );
}
