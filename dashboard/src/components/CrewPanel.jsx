import { CREW } from '../lib/mission-data.js';

export default function CrewPanel() {
  return (
    <div className="bg-space-800 rounded-xl border border-space-600/50 p-4 md:p-5">
      <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider mb-4">Artemis II Crew</h3>
      <div className="grid grid-cols-2 gap-3">
        {CREW.map((member) => (
          <div key={member.name} className="flex gap-3 p-2 rounded-lg hover:bg-space-700/50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-space-600 flex-shrink-0 flex items-center justify-center text-lg">
              {member.name[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{member.name}</p>
              <p className="text-xs text-slate-400">{member.role}</p>
              <p className="text-[10px] text-accent-bright">{member.agency}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
