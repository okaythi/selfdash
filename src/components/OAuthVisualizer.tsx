import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function OAuthVisualizer() {
  const { data: stateData, isLoading } = useSWR('/api/state', fetcher, { refreshInterval: 5000 });

  if (isLoading) {
    return <div style={{ color: 'white' }}>Loading OAuth Data...</div>;
  }

  const getVal = (k: string) => {
    const item = stateData?.find((s: any) => s.key === k);
    try {
      return item ? JSON.parse(item.value) : null;
    } catch {
      return null;
    }
  };

  const oauthUserData = getVal('oauth_user_data');
  const oauthConnections = getVal('oauth_connections');
  const oauthGuilds = getVal('oauth_guilds');

  const hasData = oauthUserData || oauthConnections || oauthGuilds;

  return (
    <div>
      <h2 style={{ marginBottom: '10px' }}>OAuth Data Visualizer</h2>
      <p style={{ color: '#aaa', marginBottom: '20px' }}>
        This data is fetched directly from Discord's OAuth2 API when you log in. 
        If it's empty, try logging out and logging back in to authorize the new scopes!
      </p>

      {!hasData ? (
        <div style={{ padding: '20px', backgroundColor: 'var(--dash-surface)', borderRadius: '8px', border: '1px solid #ED4245' }}>
          <h3 style={{ color: '#ED4245', marginBottom: '10px' }}>No OAuth data found</h3>
          <p>You need to re-authenticate to grant the new scopes. Please click Logout below and sign in again.</p>
          <button 
            className="btn-danger" 
            onClick={() => window.location.href = '/api/auth/logout'}
            style={{ marginTop: '15px', padding: '8px 16px', backgroundColor: '#ED4245', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="discord-replica-container" style={{ padding: '20px' }}>
            <h3 style={{ marginBottom: '15px', color: '#5865F2' }}>identify (User Profile)</h3>
            <div style={{ backgroundColor: '#1e1e24', padding: '15px', borderRadius: '8px', overflowX: 'auto' }}>
              {oauthUserData ? (
                <pre style={{ margin: 0, color: '#e2e8f0', fontFamily: 'monospace', fontSize: '13px', whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(oauthUserData, null, 2)}
                </pre>
              ) : <span style={{ color: '#aaa' }}>No identify data</span>}
            </div>
          </div>

          <div className="discord-replica-container" style={{ padding: '20px' }}>
            <h3 style={{ marginBottom: '15px', color: '#5865F2' }}>connections</h3>
            <div style={{ backgroundColor: '#1e1e24', padding: '15px', borderRadius: '8px', overflowX: 'auto' }}>
              {oauthConnections ? (
                <pre style={{ margin: 0, color: '#e2e8f0', fontFamily: 'monospace', fontSize: '13px', whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(oauthConnections, null, 2)}
                </pre>
              ) : <span style={{ color: '#aaa' }}>No connections data</span>}
            </div>
          </div>

          <div className="discord-replica-container" style={{ padding: '20px' }}>
            <h3 style={{ marginBottom: '15px', color: '#5865F2' }}>guilds</h3>
            <div style={{ backgroundColor: '#1e1e24', padding: '15px', borderRadius: '8px', overflowX: 'auto' }}>
              {oauthGuilds ? (
                <pre style={{ margin: 0, color: '#e2e8f0', fontFamily: 'monospace', fontSize: '13px', whiteSpace: 'pre-wrap', maxHeight: '400px', overflowY: 'auto' }}>
                  {JSON.stringify(oauthGuilds, null, 2)}
                </pre>
              ) : <span style={{ color: '#aaa' }}>No guilds data</span>}
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
