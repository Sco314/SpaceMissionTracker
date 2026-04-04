import { useState, useRef, useEffect } from 'react';
import { Globe, ExternalLink } from 'lucide-react';

const AROW_URL = 'https://www.nasa.gov/missions/artemis-ii/arow/';

export default function AROWEmbed() {
  const [iframeBlocked, setIframeBlocked] = useState(false);
  const iframeRef = useRef(null);

  // Detect if the iframe fails to load (X-Frame-Options block)
  // Since there's no reliable cross-origin error event, use a timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setIframeBlocked(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-space-800 rounded-2xl border border-border overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <Globe size={14} className="text-label" strokeWidth={1.5} />
          <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Artemis Real-time Orbit Website (AROW)
          </h3>
        </div>
      </div>

      {!iframeBlocked ? (
        <div className="relative" style={{ height: 480 }}>
          <iframe
            ref={iframeRef}
            src={AROW_URL}
            className="w-full h-full"
            title="NASA AROW"
            sandbox="allow-scripts allow-same-origin"
            onLoad={() => {
              // If the iframe loaded successfully, cancel the fallback
              // Note: this fires even for blocked iframes showing error pages
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-space-900/80">
            <div className="animate-pulse text-label text-xs">Loading AROW...</div>
          </div>
        </div>
      ) : (
        <div className="p-6 flex flex-col items-center text-center gap-4">
          <div className="w-full max-w-lg">
            <div className="bg-space-900 rounded-xl p-8 border border-border">
              <Globe size={40} className="text-indigo-400 mx-auto mb-4" strokeWidth={1} />
              <h4 className="text-sm font-medium text-slate-200 mb-2">
                Interactive 3D Orbit Visualization
              </h4>
              <p className="text-xs text-label leading-relaxed mb-4">
                NASA's AROW provides a real-time interactive 3D view of Orion's position,
                trajectory, and distance from Earth and Moon. Track the spacecraft as it
                travels on its lunar free-return trajectory.
              </p>
              <a
                href={AROW_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
              >
                Open AROW in New Tab <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
