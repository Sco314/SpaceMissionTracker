import { useState, useMemo } from 'react';
import { MISSION_EVENTS } from '../lib/mission-data.js';
import { EVENT_ICONS } from '../lib/icon-map.js';
import { formatCountdown } from '../lib/coordinates.js';
import { ChevronDown, ChevronUp } from 'lucide-react';

function formatRelativeTime(eventTime, now) {
  const diff = eventTime - now;
  const absDiff = Math.abs(diff);

  if (absDiff < 60000) return diff > 0 ? 'in <1m' : '<1m ago';

  const hours = Math.floor(absDiff / 3600000);
  const minutes = Math.floor((absDiff % 3600000) / 60000);

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    const timeStr = `${days}d ${remHours}h`;
    return diff > 0 ? `in ${timeStr}` : `${timeStr} ago`;
  }

  const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  return diff > 0 ? `in ${timeStr}` : `${timeStr} ago`;
}

export default function MissionTimeline({ currentTime }) {
  // Round to nearest 10 seconds to avoid re-rendering on every telemetry tick
  const coarseNow = Math.floor((currentTime || Date.now()) / 10000) * 10000;

  const [expandedIdx, setExpandedIdx] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const activeIdx = useMemo(() => {
    return MISSION_EVENTS.findIndex((event, i) => {
      const isPast = event.time.getTime() <= coarseNow;
      return isPast && (
        i === MISSION_EVENTS.length - 1 ||
        MISSION_EVENTS[i + 1].time.getTime() > coarseNow
      );
    });
  }, [coarseNow]);

  // When collapsed: show active + one before + one after
  const eventsToShow = showAll
    ? MISSION_EVENTS
    : MISSION_EVENTS.filter((_, i) => {
        return i >= activeIdx - 1 && i <= activeIdx + 1;
      });

  const handleItemClick = (i) => {
    setExpandedIdx(expandedIdx === i ? null : i);
  };

  return (
    <div className="bg-space-800 rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Timeline</h3>
        <button
          onClick={() => setShowAll(s => !s)}
          className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors font-medium flex items-center gap-0.5"
        >
          {showAll ? 'Less' : 'All'}
          <ChevronDown size={10} className={`transition-transform ${showAll ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Timeline spine */}
      <div className="relative px-3 py-2">
        {/* Progress line */}
        <div className="absolute left-[21px] top-2 bottom-2 w-px">
          {MISSION_EVENTS.map((event, i) => {
            if (!showAll && !eventsToShow.includes(event)) return null;
            const isPast = event.time.getTime() <= coarseNow;
            const isActive = i === activeIdx;
            return (
              <div
                key={`line-${i}`}
                className={`w-full ${
                  isPast && !isActive
                    ? 'bg-green-500/30'
                    : isActive
                      ? 'bg-active/40'
                      : 'bg-border'
                }`}
                style={{ height: `${100 / eventsToShow.length}%` }}
              />
            );
          })}
        </div>

        <div className="space-y-px">
          {eventsToShow.map((event) => {
            const i = MISSION_EVENTS.indexOf(event);
            const isPast = event.time.getTime() <= coarseNow;
            const isActive = i === activeIdx;
            const isFuture = !isPast;
            const isExpanded = expandedIdx === i;
            const Icon = EVENT_ICONS[event.type];
            const relTime = formatRelativeTime(event.time.getTime(), coarseNow);

            return (
              <button
                key={i}
                onClick={() => handleItemClick(i)}
                className={`w-full text-left flex items-start gap-2.5 pl-0 pr-1 rounded-lg transition-all ${
                  isActive
                    ? 'bg-space-700/50 py-2.5 -mx-1 px-1'
                    : 'py-1.5 hover:bg-space-700/20'
                }`}
              >
                {/* Node */}
                <div className="relative z-10 mt-0.5 flex-shrink-0">
                  {isActive ? (
                    <div className="w-[22px] h-[22px] rounded-full bg-active/20 flex items-center justify-center ring-1 ring-active/30">
                      <div className="w-2 h-2 rounded-full bg-active animate-pulse" />
                    </div>
                  ) : isPast ? (
                    <div className="w-[22px] h-[22px] rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
                    </div>
                  ) : (
                    <div className="w-[22px] h-[22px] rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full border border-slate-600" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-medium leading-none ${
                      isActive ? 'text-white' : isPast ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      {event.label}
                    </span>

                    {isActive && (
                      <span className="text-[10px] uppercase tracking-wider bg-active/15 text-active px-1 py-px rounded font-semibold leading-none">
                        Active
                      </span>
                    )}
                    {isPast && !isActive && (
                      <span className="text-[10px] uppercase tracking-wider text-green-500/70 font-medium leading-none">
                        Done
                      </span>
                    )}

                    <span className={`ml-auto text-[11px] font-mono leading-none flex-shrink-0 ${
                      isActive ? 'text-active/70' : isFuture ? 'text-slate-500' : 'text-slate-600'
                    }`}>
                      {relTime}
                    </span>
                  </div>

                  {isActive && (
                    <p className="text-[12px] text-slate-400 mt-1 leading-snug">
                      {event.description}
                    </p>
                  )}

                  {isExpanded && !isActive && (
                    <p className="text-[12px] text-slate-500 mt-0.5 leading-snug">
                      {event.description}
                    </p>
                  )}

                  {isExpanded && event.details && (
                    <p className="text-[12px] text-slate-600 mt-1 leading-snug">
                      {event.details}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
