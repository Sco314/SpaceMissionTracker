import { useState } from 'react';
import { Users, ChevronDown } from 'lucide-react';
import { CREW } from '../lib/mission-data.js';

function CrewCard({ member }) {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const initials = member.name.split(' ').map(n => n[0]).join('');

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className="w-full text-left flex gap-3 p-3 rounded-xl hover:bg-space-700/30 transition-colors"
    >
      {/* Circular avatar with teal ring */}
      <div className="relative w-12 h-12 flex-shrink-0">
        <div className="w-12 h-12 rounded-full ring-2 ring-cyan-500/60 overflow-hidden bg-space-600/60 flex items-center justify-center">
          {member.photo && !imgError ? (
            <img
              src={member.photo}
              alt={member.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-sm font-semibold text-slate-300">{initials}</span>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-slate-200">{member.name}</p>
          <ChevronDown
            size={12}
            className={`ml-auto text-label transition-transform flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
        <p className="text-xs text-label">{member.role}</p>
        <p className="text-[10px] font-semibold text-live tracking-wider mt-0.5">
          STATUS: {member.status || 'GO'}
        </p>
        {expanded && (
          <p className="text-xs text-label mt-2 leading-relaxed border-t border-border pt-2">
            {member.bio}
          </p>
        )}
      </div>
    </button>
  );
}

export default function CrewPanel() {
  return (
    <div className="bg-space-800 rounded-2xl border border-border p-4 md:p-5">
      <div className="flex items-center gap-2 mb-3">
        <Users size={14} className="text-label" strokeWidth={1.5} />
        <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Artemis II Crew</h3>
      </div>
      <div className="space-y-0.5">
        {CREW.map((member) => (
          <CrewCard key={member.name} member={member} />
        ))}
      </div>
    </div>
  );
}
