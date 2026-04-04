import { useState, useEffect } from 'react';
import { Video, ExternalLink, Radio } from 'lucide-react';

const STREAMS = [
  { id: 'orion-views', label: 'Views from Orion', videoId: '6RwfNBtepa4' },
  { id: 'mission', label: 'Mission Coverage', videoId: 'm3kR2KK8TEs' },
];

const NASA_CHANNEL_ID = 'UCLA_DiR1FfKNvjuUpBHmylQ';

export default function LiveVideo() {
  const [activeStream, setActiveStream] = useState(STREAMS[0]);
  const [loaded, setLoaded] = useState(false);
  const [rssVideos, setRssVideos] = useState([]);

  useEffect(() => {
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${NASA_CHANNEL_ID}`;
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`;

    fetch(proxyUrl)
      .then(r => r.text())
      .then(xml => {
        const videos = [];
        // Extract video IDs and titles using regex (namespace-safe)
        const idMatches = [...xml.matchAll(/<yt:videoId>([^<]+)<\/yt:videoId>/g)];
        const titleMatches = [...xml.matchAll(/<media:title>([^<]+)<\/media:title>/g)];

        idMatches.forEach((match, idx) => {
          const title = titleMatches[idx]?.[1] || '';
          if (title.toLowerCase().includes('artemis')) {
            const videoId = match[1];
            // Skip videos already in curated streams
            if (!STREAMS.some(s => s.videoId === videoId)) {
              videos.push({ id: videoId, title });
            }
          }
        });
        setRssVideos(videos);
      })
      .catch(() => {}); // Silently fail if CORS proxy is down
  }, []);

  return (
    <div className="bg-space-800 rounded-2xl border border-border overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <Video size={14} className="text-label" strokeWidth={1.5} />
          <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Live Coverage</h3>
        </div>
        <div className="flex gap-1">
          {STREAMS.map((stream) => (
            <button
              key={stream.id}
              onClick={() => { setActiveStream(stream); setLoaded(false); }}
              className={`text-[10px] px-2 py-1 rounded font-medium transition-colors ${
                activeStream.id === stream.id
                  ? 'bg-space-600 text-white'
                  : 'text-label hover:text-slate-300'
              }`}
            >
              {stream.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative aspect-video bg-space-900">
        {!loaded && (
          <button
            onClick={() => setLoaded(true)}
            className="absolute inset-0 cursor-pointer group"
          >
            <img
              src={`https://img.youtube.com/vi/${activeStream.videoId}/hqdefault.jpg`}
              alt={activeStream.label}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center group-hover:bg-red-500 transition-colors">
                <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          </button>
        )}
        {loaded && (
          <iframe
            src={`https://www.youtube.com/embed/${activeStream.videoId}?autoplay=1&mute=1&modestbranding=1&rel=0`}
            title={activeStream.label}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            loading="lazy"
          />
        )}
      </div>

      {rssVideos.length > 0 && (
        <div className="px-4 py-2 border-t border-border">
          <p className="text-[10px] text-label mb-2">More Artemis Videos</p>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {rssVideos.map(v => (
              <button
                key={v.id}
                onClick={() => { setActiveStream({ id: v.id, label: v.title, videoId: v.id }); setLoaded(true); }}
                className="flex-shrink-0 w-32 group text-left"
              >
                <img
                  src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`}
                  className="w-full rounded"
                  alt={v.title}
                />
                <p className="text-[9px] text-label mt-1 truncate">{v.title}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 py-2 flex items-center justify-between border-t border-border">
        <div className="flex items-center gap-1.5">
          <Radio size={12} className="text-live" />
          <span className="text-[10px] text-label">NASA TV</span>
        </div>
        <a
          href="https://www.nasa.gov/live"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-[10px] text-label hover:text-slate-300 transition-colors"
        >
          Open on NASA.gov <ExternalLink size={10} />
        </a>
      </div>
    </div>
  );
}
