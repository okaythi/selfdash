import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ProfileEditor } from './components/ProfileEditor';
import { CommandRunner } from './components/CommandRunner';
import { ChannelVisualizer } from './components/ChannelVisualizer';
import { DMVisualizer } from './components/DMVisualizer';

function App() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="dashboard-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        <Header />
        <div className="content-area">
          {activeTab === 'dashboard' && <ChannelVisualizer />}
          {activeTab === 'profile' && <ProfileEditor />}
          {activeTab === 'messages' && <DMVisualizer />}
          {activeTab === 'console' && <CommandRunner />}
        </div>
      </div>
    </div>
  );
}

export default App;
