import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function Header() {
  const time = new Date().toLocaleTimeString('en-BE', { timeZone: 'Europe/Brussels' });
  const { data: stateData } = useSWR('/api/state', fetcher, { refreshInterval: 1890 });

  const getVal = (k: string) => {
    const item = stateData?.find((s: any) => s.key === k);
    return item ? JSON.parse(item.value) : null;
  };

  const latency = getVal('bot_latency') || '--';
  const ram = getVal('bot_ram_usage') || '--';

  return (
    <div className="header">
      <div style={{ fontWeight: 600 }}>Overview</div>
      <div className="header-stats">
        <div>Brussels Time: {time}</div>
        <div>Latency: <span style={{ color: '#23A559' }}>{latency}ms</span></div>
        <div>RAM: <span style={{ color: '#F0B232' }}>{ram}MB / 512MB</span></div>
      </div>
    </div>
  );
}
