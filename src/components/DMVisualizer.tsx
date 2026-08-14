import { Search, Phone, Video, Pin, UserPlus } from 'lucide-react';

export function DMVisualizer() {
  const messages = [
    { id: 1, author: 'SomeFriend', color: '#3498db', avatar: 'https://cdn.discordapp.com/embed/avatars/2.png', time: 'Yesterday at 15:30', content: 'Hey, is the bot working?' },
    { id: 2, author: 'GewoonThy', color: '#e91e63', avatar: 'https://cdn.discordapp.com/embed/avatars/0.png', time: 'Yesterday at 15:31', content: 'Yeah, testing the new Cloudflare dashboard bridge right now.', isBot: true },
  ];

  return (
    <div className="module-card no-pad" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
      <div className="discord-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFF', fontWeight: 600 }}>
          <div style={{ position: 'relative' }}>
            <img src="https://cdn.discordapp.com/embed/avatars/2.png" alt="User" style={{ width: 24, height: 24, borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: -2, right: -2, width: 10, height: 10, backgroundColor: '#23A559', borderRadius: '50%', border: '2px solid #313338' }}></div>
          </div>
          SomeFriend
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
        {messages.map(msg => (
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
          Message @SomeFriend
        </div>
      </div>
    </div>
  );
}
