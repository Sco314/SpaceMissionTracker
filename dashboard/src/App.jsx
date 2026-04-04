import { useMissionData } from './lib/useMissionData.js';
import TelemetryPanel from './components/TelemetryPanel.jsx';
import TrajectoryMap from './components/TrajectoryMap.jsx';
import MissionTimeline from './components/MissionTimeline.jsx';
import CrewPanel from './components/CrewPanel.jsx';
import DetailCards from './components/DetailCards.jsx';

function App() {
  const { telemetry, trajectoryPath } = useMissionData();

  return (
    <div className="min-h-screen bg-space-900">
      {/* Header */}
      <header className="border-b border-space-600/50 bg-space-800/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-lunar flex items-center justify-center text-sm font-bold text-white">
              A2
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-wide">ARTEMIS II</h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400">Mission Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium">LIVE</span>
            </div>
            <span className="text-xs text-slate-500 font-mono hidden sm:block">
              {telemetry?.epoch?.toISOString().slice(0, 19).replace('T', ' ')} UTC
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-4 md:py-6 space-y-4 md:space-y-6">
        {/* Telemetry HUD - the big numbers */}
        <TelemetryPanel telemetry={telemetry} />

        {/* Map + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Trajectory Map - takes 2/3 */}
          <div className="lg:col-span-2">
            <TrajectoryMap trajectoryPath={trajectoryPath} telemetry={telemetry} />
          </div>

          {/* Timeline sidebar */}
          <div className="space-y-4">
            <MissionTimeline currentTime={telemetry?.epoch?.getTime()} />
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <DetailCards telemetry={telemetry} />
          <CrewPanel />
        </div>

        {/* Footer */}
        <footer className="text-center py-6 border-t border-space-600/30">
          <p className="text-xs text-slate-500">
            Data from{' '}
            <a href="https://ssd.jpl.nasa.gov/horizons/" className="text-accent hover:text-accent-bright" target="_blank" rel="noreferrer">
              JPL Horizons
            </a>
            {' '}&amp;{' '}
            <a href="https://www.nasa.gov/missions/artemis-ii/arow/" className="text-accent hover:text-accent-bright" target="_blank" rel="noreferrer">
              NASA AROW
            </a>
            {' '}| State vectors: NASA/JSC/FOD/FDO
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
