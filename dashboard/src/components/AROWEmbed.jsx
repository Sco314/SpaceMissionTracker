import { Globe, ExternalLink } from 'lucide-react';

const AROW_URL = 'https://www.nasa.gov/missions/artemis-ii/arow/';

export default function AROWEmbed() {
  return (
    <a
      href={AROW_URL}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 bg-space-800 rounded-xl border border-border px-3 py-2.5 hover:bg-space-700/50 transition-colors group"
    >
      <Globe size={18} className="text-indigo-400 flex-shrink-0" strokeWidth={1.5} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-200 leading-none">NASA AROW</p>
        <p className="text-[9px] text-slate-500 mt-0.5 leading-none">Interactive 3D orbit tracking</p>
      </div>
      <ExternalLink size={12} className="text-slate-500 group-hover:text-slate-300 flex-shrink-0 transition-colors" />
    </a>
  );
}
