import { useState } from 'react';
import { Globe } from 'lucide-react';

const AROW_URL = 'https://www.nasa.gov/missions/artemis-ii/arow/';

export default function AROWEmbed() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="bg-space-800 rounded-xl border border-border overflow-hidden">
      <div className="px-3 py-2 flex items-center gap-2 border-b border-border">
        <Globe size={14} className="text-label" strokeWidth={1.5} />
        <h3 className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
          Artemis Real-time Orbit Website (AROW)
        </h3>
      </div>
      <div className="relative" style={{ height: 400 }}>
        <iframe
          src={AROW_URL}
          className="w-full h-full"
          title="NASA AROW"
          onLoad={() => setLoaded(true)}
        />
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-space-900/80">
            <p className="animate-pulse text-label text-xs">Loading AROW...</p>
          </div>
        )}
      </div>
    </div>
  );
}
