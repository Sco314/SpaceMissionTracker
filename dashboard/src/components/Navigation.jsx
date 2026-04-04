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
    <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none">
      {TABS.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              isActive
                ? 'text-white bg-space-700'
                : 'text-label hover:text-slate-300 hover:bg-space-800'
            }`}
          >
            <Icon size={14} strokeWidth={1.5} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
