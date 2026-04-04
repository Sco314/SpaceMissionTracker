import { MISSION_EVENTS } from '../lib/mission-data.js';

export default function MissionTimeline({ currentTime }) {
  const now = currentTime || Date.now();

  return (
    <div className="bg-space-800 rounded-xl border border-space-600/50 p-4 md:p-5">
      <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider mb-4">Mission Timeline</h3>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-space-600" />

        <div className="space-y-1">
          {MISSION_EVENTS.map((event, i) => {
            const isPast = event.time.getTime() <= now;
            const isActive = isPast && (
              i === MISSION_EVENTS.length - 1 ||
              MISSION_EVENTS[i + 1].time.getTime() > now
            );

            return (
              <div key={i} className={`flex items-start gap-3 pl-1 py-2 rounded-lg transition-colors ${isActive ? 'bg-space-700/50' : ''}`}>
                {/* Dot */}
                <div className="relative z-10 mt-0.5">
                  <div className={`w-[10px] h-[10px] rounded-full border-2 ${
                    isPast
                      ? isActive
                        ? 'bg-accent border-accent-bright shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                        : 'bg-accent/60 border-accent/60'
                      : 'bg-space-700 border-space-500'
                  }`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{event.icon}</span>
                    <span className={`text-sm font-medium ${isPast ? 'text-slate-200' : 'text-slate-500'}`}>
                      {event.label}
                    </span>
                    {isActive && (
                      <span className="text-[10px] uppercase tracking-wider bg-accent/20 text-accent-bright px-1.5 py-0.5 rounded font-medium">
                        Current
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 ${isPast ? 'text-slate-400' : 'text-slate-600'}`}>
                    {event.description}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {event.time.toISOString().replace('T', ' ').slice(0, 19)} UTC
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
