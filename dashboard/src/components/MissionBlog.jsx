import { useState, useEffect, useRef } from 'react';
import { Newspaper, ChevronDown, ExternalLink } from 'lucide-react';
import { NASA_BLOG_LINKS } from '../lib/mission-data.js';

/**
 * NASA Mission Blog feed.
 *
 * Behaves like the Mission Timeline: starts "docked" (collapsed) showing only the
 * most recent entry. User clicks "All" to expand to the full list. If the user
 * scrolls the section out of the viewport while expanded, it auto-redocks.
 */
export default function MissionBlog() {
  const [expanded, setExpanded] = useState(false);
  const rootRef = useRef(null);

  // Newest first (highest day number, then bottom-of-array for same day)
  const ordered = [...NASA_BLOG_LINKS]
    .map((entry, originalIdx) => ({ ...entry, originalIdx }))
    .sort((a, b) => (b.day - a.day) || (b.originalIdx - a.originalIdx));

  // Auto-redock when scrolled out of viewport while expanded
  useEffect(() => {
    if (!expanded || !rootRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          setExpanded(false);
        }
      },
      // Fire when fully out of view (no part of the section is visible)
      { threshold: 0, rootMargin: '0px' }
    );
    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, [expanded]);

  const visible = expanded ? ordered : ordered.slice(0, 1);

  return (
    <div ref={rootRef} className="bg-space-800 rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Newspaper size={14} className="text-cyan-400" strokeWidth={1.5} />
          <h3 className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">NASA Mission Blog</h3>
        </div>
        <button
          onClick={() => setExpanded(s => !s)}
          className="text-[9px] text-slate-500 hover:text-slate-300 transition-colors font-medium flex items-center gap-0.5"
          aria-expanded={expanded}
        >
          {expanded ? 'Less' : `All (${ordered.length})`}
          <ChevronDown size={10} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Entries */}
      <div className="px-3 py-2">
        <ul className="space-y-px">
          {visible.map((link) => (
            <li key={link.originalIdx}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/[0.04] transition-colors group"
              >
                <span className="text-[9px] text-slate-600 font-mono shrink-0 w-10">Day {link.day}</span>
                <span className="text-[10px] text-slate-400 group-hover:text-white transition-colors flex-1 truncate">
                  {link.title}
                </span>
                <ExternalLink size={9} className="text-slate-600 group-hover:text-slate-400 shrink-0 transition-colors" />
              </a>
            </li>
          ))}
        </ul>
        {!expanded && ordered.length > 1 && (
          <p className="text-[9px] text-slate-600 mt-1.5 px-2">
            Showing latest entry — click "All" to see {ordered.length - 1} more.
          </p>
        )}
      </div>
    </div>
  );
}
