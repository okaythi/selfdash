import { useState, useEffect } from 'react';
import { Search, Play, Plus, Tv, Film, Loader2 } from 'lucide-react';
import useSWR from 'swr';

const TMDB_READ_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwZWVmZTk2MjU5MTYxYTZjZDU5NDUzOWIxMjY0NGJmZSIsIm5iZiI6MTc4NjgzNTgxNy4xNDMwMDAxLCJzdWIiOiI2YTgwZjM2OTFlYWZiNzNiMDI3MmIyYjkiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.lhAgYUW8_dJUdHE1E8pC3Fddj9mbao0SpzXuR4STCo4";

const tmdbFetcher = async (url: string) => {
  const r = await fetch(url, { headers: { Authorization: `Bearer ${TMDB_READ_KEY}`, accept: 'application/json' }});
  if (!r.ok) throw new Error("TMDB Error");
  return r.json();
}

export function CustomActivity() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: searchResults, isValidating } = useSWR(
    debouncedQuery ? `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(debouncedQuery)}&include_adult=false&language=en-US&page=1` : null,
    tmdbFetcher
  );

  const results = searchResults?.results?.filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv') || [];

  const handleAction = async (action: 'play' | 'queue', item: any) => {
    // For tv shows, default to S1E1 if playing immediately
    const cmdText = `.activity ${action} ${item.media_type} ${item.id}` + (item.media_type === 'tv' ? ' 1 1' : '');
    try {
      await fetch('/api/queue-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: { type: 'shell', text: cmdText, id: Date.now().toString() } })
      });
      alert(`Queued command to ${action} ${item.name || item.title}`);
    } catch {
      alert("Failed to queue command.");
    }
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
    </div>
  );
}
