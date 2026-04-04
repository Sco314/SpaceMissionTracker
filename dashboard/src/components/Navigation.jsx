import { LayoutDashboard, Navigation as NavIcon, Clock, Users, Video, Database } from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'trajectory', label: 'Trajectory', icon: NavIcon },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'crew', label: 'Crew', icon: Users },
  { id: 'live', label: 'Live', icon: Video },
  { id: 'data', label: 'Data', icon: Database },
];

export default function Navigation({ activeTab, onTabChange }) {
  return (
    <nav className="flex items-center justify-between sm:justify-start sm:gap-1 -mb-px">
      {TABS.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`relative flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium transition-colors whitespace-nowrap ${
              isActive
                ? 'text-white'
                : 'text-label hover:text-slate-300'
            }`}
          >
            <Icon size={15} strokeWidth={1.5} />
            <span className="sm:inline">{label}</span>
            {isActive && (
              <span className="absolute bottom-0 left-1 right-1 h-[2px] rounded-t bg-indigo-500" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
