import { useState } from 'react';
import { MISSION_EVENTS } from '../lib/mission-data.js';
import { EVENT_ICONS } from '../lib/icon-map.js';
import { ChevronDown } from 'lucide-react';

export default function MissionTimeline({ currentTime, expanded: alwaysExpanded = false }) {
  const now = currentTime || Date.now();
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [collapsed, setCollapsed] = useState(true);

  // Find the active event index
  const activeIdx = MISSION_EVENTS.findIndex((event, i) => {
    const isPast = event.time.getTime() <= now;
    const isActive = isPast && (
      i === MISSION_EVENTS.length - 1 ||
      MISSION_EVENTS[i + 1].time.getTime() > now
    );
    return isActive;
  });

  const showCollapsed = collapsed && !alwaysExpanded;
  const eventsToShow = showCollapsed
    ? MISSION_EVENTS.filter((_, i) => i === activeIdx)
    : MISSION_EVENTS;

  return (
    <div className="bg-space-800 rounded-2xl border border-border p-4 md:p-5">
      <button
        onClick={() => !alwaysExpanded && setCollapsed(c => !c)}
        className="flex items-center gap-2 w-full mb-4"
      >
        <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Mission Timeline</h3>
        {!alwaysExpanded && (
          <ChevronDown
            size={12}
            className={`text-label transition-transform ${collapsed ? '' : 'rotate-180'}`}
          />
        )}
      </button>
      <div className="relative">
        {!showCollapsed && <div className="absolute left-[15px] top-3 bottom-3 w-px bg-border" />}

        <div className="space-y-0.5">
          {eventsToShow.map((event) => {
            const i = MISSION_EVENTS.indexOf(event);
            const isPast = event.time.getTime() <= now;
            const isActive = i === activeIdx;
            const isExpanded = alwaysExpanded || expandedIdx === i;
            const Icon = EVENT_ICONS[event.type];

            return (
              <button
                key={i}
                onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                className={`w-full text-left flex items-start gap-3 px-1 py-2.5 rounded-lg transition-colors ${
                  isActive ? 'bg-space-700/40' : 'hover:bg-space-700/20'
                }`}
              >
                <div className="relative z-10 mt-0.5 flex-shrink-0">
                  <div className={`w-[30px] h-[30px] rounded-lg flex items-center justify-center ${
                    isActive
                      ? 'bg-active/15 text-active'
                      : isPast
                        ? 'bg-space-600/50 text-slate-400'
                        : 'bg-space-700 text-label'
                  }`}>
                    {Icon && <Icon size={14} strokeWidth={1.5} />}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${
                      isActive ? 'text-slate-100' : isPast ? 'text-slate-300' : 'text-label'
                    }`}>
                      {event.label}
                    </span>
                    {isActive && (
                      <span className="text-[9px] uppercase tracking-wider bg-active/15 text-active px-1.5 py-0.5 rounded font-medium">
                        Active
                      </span>
                    )}
                    {isPast && !isActive && (
                      <span className="text-[9px] uppercase tracking-wider bg-green-500/15 text-green-400 px-1.5 py-0.5 rounded font-medium">
                        Successful
                      </span>
                    )}
                    <ChevronDown
                      size={12}
                      className={`ml-auto text-label transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </div>
                  <p className={`text-xs mt-0.5 leading-relaxed ${
                    isPast ? 'text-label' : 'text-space-500'
                  }`}>
                    {event.description}
                  </p>
                  {isExpanded && event.details && (
                    <p className="text-xs text-label mt-2 leading-relaxed border-t border-border pt-2">
                      {event.details}
                    </p>
                  )}
                  <p className="text-[10px] text-space-500 font-mono mt-1">
                    {event.time.toISOString().replace('T', ' ').slice(0, 19)} UTC
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
