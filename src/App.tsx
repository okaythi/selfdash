import { useState } from 'react';
import useSWR from 'swr';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ProfileEditor } from './components/ProfileEditor';
import { CommandRunner } from './components/CommandRunner';
import { ChannelVisualizer } from './components/ChannelVisualizer';
import { DMVisualizer } from './components/DMVisualizer';
import { OAuthVisualizer } from './components/OAuthVisualizer';
import { CustomActivity } from './components/CustomActivity';

const fetcher = async (url: string) => {
  const r = await fetch(url);
  const data = await r.json();
  if (!r.ok) throw new Error(JSON.stringify(data));
  return data;
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { data, error, isLoading } = useSWR('/api/auth/me', fetcher);

  if (isLoading) return <div style={{ color: 'white', padding: '50px' }}>Loading...</div>;
  
  if (error || !data?.user) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: 'white', marginBottom: '20px' }}>Login</h1>
          <a href="/api/auth/login" style={{ backgroundColor: '#5865F2', color: 'white', padding: '12px 24px', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>Login with Discord</a>

        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        <Header />
        <div className="content-area">
          {activeTab === 'dashboard' && <ChannelVisualizer />}
          {activeTab === 'profile' && <ProfileEditor />}
          {activeTab === 'messages' && <DMVisualizer />}
          {activeTab === 'oauth' && <OAuthVisualizer />}
          {activeTab === 'console' && <CommandRunner />}
          {activeTab === 'movies' && <CustomActivity />}
        </div>
      </div>
    </div>
  );
}

export default App;
