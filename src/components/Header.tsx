export function Header() {
  const time = new Date().toLocaleTimeString('en-BE', { timeZone: 'Europe/Brussels' });

  return (
    <div className="header">
      <div style={{ fontWeight: 600 }}>Overview</div>
      <div className="header-stats">
        <div>Brussels Time: {time}</div>
        <div>Latency: <span style={{ color: '#23A559' }}>24ms</span></div>
        <div>RAM: <span style={{ color: '#F0B232' }}>48MB / 512MB</span></div>
      </div>
    </div>
  );
}
