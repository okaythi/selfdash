import { useState } from 'react';
import { Terminal, Play, Loader2 } from 'lucide-react';

export function CommandRunner() {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<{ id: string; cmd: string; output: string; status: 'success' | 'error' | 'running' }[]>([
    { id: '1', cmd: '.ping', output: 'Pong! 24ms', status: 'success' },
    { id: '2', cmd: '.uptime', output: 'Uptime: 2 days, 4 hours', status: 'success' }
  ]);

  const handleRun = () => {
    if (!command.trim()) return;
    const newCmd = { id: Date.now().toString(), cmd: command, output: '', status: 'running' as const };
    setHistory([...history, newCmd]);
    setCommand('');

    // Simulate execution latency
    setTimeout(() => {
      setHistory(prev => prev.map(item => 
        item.id === newCmd.id 
          ? { ...item, status: 'success', output: 'Command sent to selfbot via D1 polling.' } 
          : item
      ));
    }, 1500);
  };

  return (
    <div className="module-card">
      <div className="card-header">
        <Terminal size={18} />
        <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Command Console</h2>
      </div>
      
      <div className="console-history">
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
