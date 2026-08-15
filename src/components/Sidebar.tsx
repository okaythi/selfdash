import { Home, MessageSquare, User, Terminal } from 'lucide-react';

export function Sidebar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) {
  const tabs = [
    { id: 'dashboard', label: 'Channel View', icon: Home },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'messages', label: 'Direct Messages', icon: MessageSquare },
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
    </div>
  );
}
