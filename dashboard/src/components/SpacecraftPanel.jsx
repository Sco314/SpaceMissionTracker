import { useState } from 'react';
import { Rocket, Zap, ShieldAlert, ChevronDown } from 'lucide-react';
import { SPACECRAFT } from '../lib/mission-data.js';

// Simple capsule icon as inline SVG (no lucide equivalent)
function CapsuleIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.5 2 6 6 6 10v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4c0-4-2.5-8-6-8z" />
      <path d="M6 14l-1.5 5h15L18 14" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="9" y1="22" x2="15" y2="22" />
    </svg>
  );
}

const ICONS = {
  capsule: CapsuleIcon,
  solar: Zap,
  rocket: Rocket,
  shield: ShieldAlert,
};

function SpacecraftCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const Icon = ICONS[item.icon] || Rocket;

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className="w-full text-left flex gap-3 p-3 rounded-xl hover:bg-space-700/30 transition-colors"
    >
      <div className="w-10 h-10 rounded-lg bg-space-700/50 flex-shrink-0 flex items-center justify-center text-cyan-400/80">
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[10px] uppercase tracking-wider text-label font-medium">{item.label}</p>
          <ChevronDown
            size={12}
            className={`ml-auto text-label transition-transform flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
        <p className="text-sm font-medium text-slate-200 mt-0.5">{item.value}</p>
        {expanded && (
          <div className="mt-2 border-t border-border pt-2">
            {item.image && !imgError && (
              <img
                src={item.image}
                alt={item.label}
                className="w-full rounded-lg mb-2 max-h-40 object-cover"
                onError={() => setImgError(true)}
              />
            )}
            <p className="text-xs text-label leading-relaxed">
              {item.details}
            </p>
          </div>
        )}
      </div>
    </button>
  );
}

export default function SpacecraftPanel() {
  return (
    <div className="bg-space-800 rounded-2xl border border-border p-4 md:p-5">
      <div className="flex items-center gap-2 mb-3">
        <Rocket size={14} className="text-label" strokeWidth={1.5} />
        <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Spacecraft</h3>
      </div>
      <div className="space-y-0.5">
        {SPACECRAFT.map((item) => (
          <SpacecraftCard key={item.label} item={item} />
        ))}
      </div>
    </div>
  );
}
