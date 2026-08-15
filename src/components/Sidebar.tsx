import { useState } from 'react';
import { Home, MessageSquare, User, Terminal, Tv, ChevronDown, ChevronRight, Activity } from 'lucide-react';

export function Sidebar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) {
  const [customActivityOpen, setCustomActivityOpen] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Channel View', icon: Home },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'messages', label: 'Direct Messages', icon: MessageSquare },
    { id: 'oauth', label: 'OAuth Data', icon: Terminal },
    { id: 'console', label: 'Command Console', icon: Terminal },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-title">Selfdash</div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          <tab.icon size={20} />
          <span>{tab.label}</span>
        </div>
      ))}
      
      <div 
        className="nav-item" 
        onClick={() => setCustomActivityOpen(!customActivityOpen)}
        style={{ marginTop: '10px', justifyContent: 'space-between' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={20} />
          <span>Custom Activity</span>
        </div>
        {customActivityOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </div>
      
      {customActivityOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '30px', marginTop: '4px', gap: '4px' }}>
          <div 
            className={`nav-item ${activeTab === 'movies' ? 'active' : ''}`} 
            onClick={() => setActiveTab('movies')}
            style={{ padding: '8px 12px', fontSize: '0.9rem' }}
          >
            <Tv size={16} />
            <span>Movies & Shows</span>
          </div>
        </div>
      )}
    </div>
  );
}
