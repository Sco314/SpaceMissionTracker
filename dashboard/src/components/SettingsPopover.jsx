import { useState, useRef, useEffect } from 'react';
import { Settings, X } from 'lucide-react';
import UnitToggle from './UnitToggle.jsx';

export default function SettingsPopover() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        title="Settings"
        aria-label="Settings"
        aria-expanded={open}
        className="flex items-center px-1.5 py-1 rounded bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 transition-colors"
      >
        <Settings size={18} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 bg-space-800 border border-border rounded-lg shadow-xl p-3 z-50 min-w-[220px]">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Settings</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close settings"
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
          <UnitToggle />
        </div>
      )}
    </div>
  );
}
