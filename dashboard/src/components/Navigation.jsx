import { LayoutDashboard, Navigation as NavIcon, Clock, Users, Video, Database, Globe } from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'live', label: 'Live', icon: Video },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'crew', label: 'Crew', icon: Users },
  { id: 'data', label: 'Data', icon: Database },
  { id: 'trajectory', label: '2D Trajectory Map', icon: NavIcon },
];

export default function Navigation({ activeSection, onNavigate }) {
  return (
    <nav className="flex items-center -mb-px">
      {TABS.map(({ id, label, icon: Icon }) => {
        const isActive = activeSection === id;
        return (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`relative flex-1 sm:flex-none flex flex-col sm:flex-row items-center justify-center gap-px sm:gap-1.5 px-1 sm:px-3 py-1.5 sm:py-2 text-[9px] sm:text-xs font-medium transition-all active:scale-95 ${
              isActive
                ? 'text-white'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Icon size={16} strokeWidth={isActive ? 2 : 1.5} className="transition-all" />
            <span className={`leading-none ${isActive ? 'text-[9px] sm:text-xs' : 'text-[8px] sm:text-xs'}`}>{label}</span>
            {isActive && (
              <span className="absolute bottom-0 inset-x-1 sm:inset-x-2 h-[2px] rounded-t-full bg-indigo-500" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
