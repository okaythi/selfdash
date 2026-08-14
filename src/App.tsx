import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ProfileEditor } from './components/ProfileEditor';

function App() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="dashboard-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        <Header />
        <div className="content-area">
          {activeTab === 'profile' && <ProfileEditor />}
          {activeTab === 'dashboard' && <h2>Dashboard Overview</h2>}
          {activeTab === 'messages' && <h2>Messages Module (Coming Soon)</h2>}
          {activeTab === 'console' && <h2>Command Console (Coming Soon)</h2>}
        </div>
      </div>
    </div>
  );
}

export default App;
