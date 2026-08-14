import { Hash, Search, Bell, Pin, Users } from 'lucide-react';

export function ChannelVisualizer() {
  const messages = [
    { id: 1, author: 'SomeUser', color: '#1abc9c', avatar: 'https://cdn.discordapp.com/embed/avatars/1.png', time: 'Today at 20:41', content: 'Did the bot restart?' },
    { id: 2, author: 'GewoonThy', color: '#e91e63', avatar: 'https://cdn.discordapp.com/embed/avatars/0.png', time: 'Today at 20:42', content: 'Restarted. Online again!', isBot: true },
    { id: 3, author: 'SomeUser', color: '#1abc9c', avatar: 'https://cdn.discordapp.com/embed/avatars/1.png', time: 'Today at 20:42', content: 'Ah nice, the notification worked.' },
  ];

  return (
    <div className="module-card no-pad" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
      {/* Discord Header Replica */}
      <div className="discord-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFF', fontWeight: 600 }}>
          <Hash size={24} color="#80848E" />
          general
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

      {/* Discord Input Replica */}
      <div className="discord-input-wrapper">
        <div className="discord-input">
          Message #general
        </div>
      </div>
    </div>
  );
}
