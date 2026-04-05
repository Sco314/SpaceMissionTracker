import { useState } from 'react';
import { Globe } from 'lucide-react';

const AROW_URL = 'https://www.nasa.gov/missions/artemis-ii/arow/';

export default function AROWEmbed() {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [status, setStatus] = useState('idle');

  const handleLoad = () => setStatus('loaded');
  const handleError = () => setStatus('error');

  return (
    <div className="bg-space-800 rounded-xl border border-border overflow-hidden">
      <div className="px-3 py-2 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <Globe size={14} className="text-label" strokeWidth={1.5} />
          <h3 className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">AROW</h3>
        </div>
        <span className="text-[8px] text-slate-600 font-mono">{status}</span>
      </div>

      {!shouldLoad ? (
        <button
          onClick={() => { setShouldLoad(true); setStatus('loading'); }}
          className="w-full py-6 flex flex-col items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Globe size={24} strokeWidth={1} />
          <span className="text-xs">Tap to load NASA AROW</span>
        </button>
      ) : (
        <div className="relative" style={{ height: 350 }}>
          <iframe
            src={AROW_URL}
            className="w-full h-full"
            title="NASA AROW"
            onLoad={handleLoad}
            onError={handleError}
          />
          {status === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center bg-space-900/60 pointer-events-none">
              <p className="animate-pulse text-label text-xs">Loading AROW...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
