import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';

const AROW_URL = 'https://www.nasa.gov/missions/artemis-ii/arow/';

export default function AROWEmbed() {
  const [status, setStatus] = useState('loading');
  const iframeRef = useRef(null);

  useEffect(() => {
    console.log('[AROW] Starting iframe load attempt');

    return () => {
      console.log('[AROW] Component unmounting');
    };
  }, []);

  const handleLoad = () => {
    console.log('[AROW] iframe onLoad fired');
    setStatus('loaded');
  };

  const handleError = (e) => {
    console.error('[AROW] iframe onError fired:', e.type, e.message || '');
    setStatus('error');
  };

  return (
    <div className="bg-space-800 rounded-xl border border-border overflow-hidden">
      <div className="px-3 py-2 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <Globe size={14} className="text-label" strokeWidth={1.5} />
          <h3 className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
            AROW
          </h3>
        </div>
        <span className="text-[8px] text-slate-600 font-mono">{status}</span>
      </div>
      <div className="relative" style={{ height: 350 }}>
        <iframe
          ref={iframeRef}
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
    </div>
  );
}
