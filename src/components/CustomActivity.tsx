import { useState, useEffect } from 'react';
import { Search, Play, Plus, Tv, Film, Loader2, Pause, Square, SkipBack, SkipForward } from 'lucide-react';
import useSWR from 'swr';

const TMDB_READ_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwZWVmZTk2MjU5MTYxYTZjZDU5NDUzOWIxMjY0NGJmZSIsIm5iZiI6MTc4NjgzNTgxNy4xNDMwMDAxLCJzdWIiOiI2YTgwZjM2OTFlYWZiNzNiMDI3MmIyYjkiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.lhAgYUW8_dJUdHE1E8pC3Fddj9mbao0SpzXuR4STCo4";

const tmdbFetcher = async (url: string) => {
  const r = await fetch(url, { headers: { Authorization: `Bearer ${TMDB_READ_KEY}`, accept: 'application/json' }});
  if (!r.ok) throw new Error("TMDB Error");
  return r.json();
}

export function CustomActivity() {
  const { data: stateData } = useSWR('/api/state', url => fetch(url).then(r => r.json()), { refreshInterval: 2000 });
  const getVal = (k: string) => {
    const item = stateData?.find((s: any) => s.key === k);
    return item ? JSON.parse(item.value) : null;
  };

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [tvSelections, setTvSelections] = useState<Record<number, {season: number, episode: number}>>({});
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  // Read player state
  const playerState = getVal('bot_activity_player');

  // Progress Bar ticker
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!playerState || !playerState.playing) {
      if (playerState?.paused_at) {
        setProgress(Math.max(0, playerState.paused_at - playerState.start_time));
      }
      return;
    }
    const interval = setInterval(() => {
      setProgress(Math.max(0, (Date.now() / 1000) - playerState.start_time));
    }, 1000);
    return () => clearInterval(interval);
  }, [playerState]);

  const { data: searchResults, isValidating } = useSWR(
    debouncedQuery ? `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(debouncedQuery)}&include_adult=false&language=en-US&page=1` : null,
    tmdbFetcher
  );

  const results = searchResults?.results?.filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv') || [];

  const handleAction = async (action: 'play' | 'queue', item: any) => {
    const season = tvSelections[item.id]?.season || 1;
    const episode = tvSelections[item.id]?.episode || 1;
    const cmdText = `.activity ${action} ${item.media_type} ${item.id}` + (item.media_type === 'tv' ? ` ${season} ${episode}` : '');
    try {
      await fetch('/api/queue-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: { type: 'shell', text: cmdText, id: Date.now().toString() } })
      });
    } catch {
      // ignore
    }
  };

  const dispatchCommand = async (text: string) => {
    try {
      await fetch('/api/queue-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: { type: 'shell', text, id: Date.now().toString() } })
      });
    } catch {
      // ignore
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="module-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '80vh' }}>
      <div className="card-header">
        <Tv size={20} />
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Movies & Shows (TMDB)</h2>
      </div>

      <div style={{ position: 'relative' }}>
        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} size={18} />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for movies or TV shows..."
          style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', backgroundColor: '#1E1F22', border: '1px solid #333', color: '#fff', fontSize: '1rem' }}
        />
        {isValidating && <Loader2 className="spin" size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', overflowY: 'auto' }}>
        {results.map((item: any) => {
          const title = item.title || item.name;
          const year = (item.release_date || item.first_air_date || '').substring(0, 4);
          return (
            <div key={item.id} style={{ backgroundColor: '#2B2D31', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {item.poster_path ? (
                <img src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} alt={title} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', aspectRatio: '2/3', backgroundColor: '#1E1F22', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>No Poster</div>
              )}
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{title}</div>
                <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{year}</span>
                  <span style={{ textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {item.media_type === 'movie' ? <Film size={12}/> : <Tv size={12}/>}
                    {item.media_type}
                  </span>
                </div>
                {item.media_type === 'tv' && (
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <label style={{ fontSize: '0.75rem', color: '#ccc', flex: 1 }}>
                      Season
                      <input 
                        type="number" 
                        min="1" 
                        value={tvSelections[item.id]?.season || 1}
                        onChange={(e) => setTvSelections({...tvSelections, [item.id]: {...(tvSelections[item.id] || {episode: 1}), season: parseInt(e.target.value) || 1}})}
                        style={{ width: '100%', marginTop: '4px', padding: '4px', borderRadius: '4px', backgroundColor: '#1E1F22', border: '1px solid #333', color: '#fff', boxSizing: 'border-box' }}
                      />
                    </label>
                    <label style={{ fontSize: '0.75rem', color: '#ccc', flex: 1 }}>
                      Episode
                      <input 
                        type="number" 
                        min="1" 
                        value={tvSelections[item.id]?.episode || 1}
                        onChange={(e) => setTvSelections({...tvSelections, [item.id]: {...(tvSelections[item.id] || {season: 1}), episode: parseInt(e.target.value) || 1}})}
                        style={{ width: '100%', marginTop: '4px', padding: '4px', borderRadius: '4px', backgroundColor: '#1E1F22', border: '1px solid #333', color: '#fff', boxSizing: 'border-box' }}
                      />
                    </label>
                  </div>
                )}
                <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleAction('play', item)} className="btn-primary" style={{ flex: 1, padding: '6px', justifyContent: 'center' }}>
                    <Play size={14} /> Play
                  </button>
                  <button onClick={() => handleAction('queue', item)} style={{ flex: 1, padding: '6px', justifyContent: 'center', backgroundColor: '#4F545C', color: 'white', border: 'none', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <Plus size={14} /> Queue
                  </button>
                </div>
              </div>
            </div>
          )
        })}
        {query && results.length === 0 && !isValidating && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#888' }}>
            No results found for "{query}"
          </div>
        )}
      </div>

      {playerState && playerState.media && (
        <div style={{ position: 'sticky', bottom: '0', backgroundColor: '#1E1F22', borderTop: '1px solid #333', padding: '16px', borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 -4px 10px rgba(0,0,0,0.5)', zIndex: 10 }}>
          {playerState.media.poster && (
            <img src={playerState.media.poster} alt="Poster" style={{ height: '80px', borderRadius: '4px', aspectRatio: '2/3', objectFit: 'cover' }} />
          )}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#fff' }}>
              {playerState.media.type === 'movie' ? playerState.media.title : `${playerState.media.show_title} (S${playerState.media.season.toString().padStart(2, '0')}E${playerState.media.episode.toString().padStart(2, '0')})`}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.8rem', color: '#aaa', minWidth: '45px', textAlign: 'right' }}>{formatTime(progress)}</span>
              <div style={{ flex: 1, height: '6px', backgroundColor: '#333', borderRadius: '3px', overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', backgroundColor: '#5865F2', width: `${Math.min(100, (progress / (playerState.duration || 1)) * 100)}%`, transition: 'width 1s linear' }} />
              </div>
              <span style={{ fontSize: '0.8rem', color: '#aaa', minWidth: '45px' }}>{formatTime(playerState.duration)}</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => dispatchCommand(`.activity seek ${Math.floor(Math.max(0, progress - 10))}`)} style={{ background: 'transparent', border: '1px solid #444', color: '#ccc', cursor: 'pointer', padding: '8px 12px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <SkipBack size={16} /> -10s
            </button>
            <button onClick={() => dispatchCommand(playerState.playing ? '.activity pause' : '.activity resume')} style={{ background: '#5865F2', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px 16px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
              {playerState.playing ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Resume</>}
            </button>
            <button onClick={() => dispatchCommand(`.activity seek ${Math.floor(Math.min(playerState.duration, progress + 10))}`)} style={{ background: 'transparent', border: '1px solid #444', color: '#ccc', cursor: 'pointer', padding: '8px 12px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <SkipForward size={16} /> +10s
            </button>
            <button onClick={() => dispatchCommand('.activity stop')} style={{ background: 'transparent', border: '1px solid #E91E63', color: '#E91E63', cursor: 'pointer', padding: '8px 16px', marginLeft: '12px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
              <Square size={16} /> Stop
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
