import { useState, useEffect } from 'react';
import { Terminal, Play, Loader2 } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function CommandRunner() {
  const [command, setCommand] = useState('');
  const { data: stateData } = useSWR('/api/state', fetcher, { refreshInterval: 1890 });
  const [history, setHistory] = useState<{ id: string; cmd: string; output: string; status: 'success' | 'error' | 'running' }[]>([]);

  // Update history from state if the bot pushes console history
  useEffect(() => {
    if (stateData) {
      const histItem = stateData.find((s: any) => s.key === 'bot_console_history');
      if (histItem) {
        setHistory(JSON.parse(histItem.value));
      }
    }
  }, [stateData]);

  const handleRun = async () => {
    if (!command.trim()) return;
    const newCmd = { id: Date.now().toString(), cmd: command, output: '', status: 'running' as const };
    setHistory([...history, newCmd]);
    const cmdText = command;
    setCommand('');

    try {
      await fetch('/api/queue-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: { type: 'shell', text: cmdText, id: newCmd.id } })
      });
    } catch (e) {
      setHistory(prev => prev.map(item => 
        item.id === newCmd.id ? { ...item, status: 'error', output: 'Failed to queue command' } : item
      ));
    }
  };

  return (
    <div className="module-card">
      <div className="card-header">
        <Terminal size={18} />
        <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Command Console</h2>
      </div>
      
      <div className="console-history">
        {history.length === 0 && <div style={{ color: '#555' }}>No commands executed yet.</div>}
        {history.map((item) => (
          <div key={item.id} className="console-entry">
            <div className="console-cmd">
              <span className="prompt">{'>'}</span> {item.cmd}
            </div>
            <div className={`console-output ${item.status}`}>
              {item.status === 'running' ? <Loader2 size={14} className="spin" /> : item.output}
            </div>
          </div>
        ))}
      </div>

      <div className="console-input-area">
        <span className="prompt">{'>'}</span>
        <input 
          type="text" 
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleRun()}
          placeholder="Execute a python bot command (e.g. .git diff)"
          className="console-input"
        />
        <button onClick={handleRun} className="btn-primary" disabled={!command.trim()}>
          <Play size={14} /> Run
        </button>
      </div>
    </div>
  );
}
