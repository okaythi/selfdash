import React from 'react';
import { Home, MessageSquare, User, Terminal } from 'lucide-react';

export function Sidebar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'profile', label: 'Profile Editor', icon: User },
    { id: 'messages', label: 'Messages & DMs', icon: MessageSquare },
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
