import { useState } from 'react';
import { Video, ExternalLink, Radio } from 'lucide-react';

const STREAMS = [
  { id: 'nasa-live', label: 'NASA Live', videoId: '21X5lGlDOfg' },
  { id: 'mission', label: 'Mission Coverage', videoId: 'nA9UZF-SZoQ' },
];

export default function LiveVideo() {
  const [activeStream, setActiveStream] = useState(STREAMS[0]);
  const [loaded, setLoaded] = useState(false);

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
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-full bg-space-700 border border-border flex items-center justify-center group-hover:bg-space-600 transition-colors">
              <Video size={24} className="text-slate-300" />
            </div>
            <span className="text-xs text-label">Click to load stream</span>
          </button>
        )}
        {loaded && (
          <iframe
            src={`https://www.youtube.com/embed/${activeStream.videoId}?autoplay=0&modestbranding=1&rel=0`}
            title={activeStream.label}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            loading="lazy"
          />
        )}
      </div>

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
