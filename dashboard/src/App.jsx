import { useState } from 'react';
import { UnitsProvider } from './lib/units-context.jsx';
import { useMissionData } from './lib/useMissionData.js';
import { formatMET } from './lib/coordinates.js';
import Navigation from './components/Navigation.jsx';
import TelemetryPanel from './components/TelemetryPanel.jsx';
import TrajectoryMap from './components/TrajectoryMap.jsx';
import MissionTimeline from './components/MissionTimeline.jsx';
import CrewPanel from './components/CrewPanel.jsx';
import DetailCards from './components/DetailCards.jsx';
import LiveVideo from './components/LiveVideo.jsx';
import SourceAttribution from './components/SourceAttribution.jsx';
import UnitToggle from './components/UnitToggle.jsx';
import { LAUNCH_TIME } from './lib/mission-data.js';

function Dashboard() {
  const { telemetry, trajectoryPath } = useMissionData();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-space-900">
      {/* Header */}
      <header className="border-b border-border bg-space-800/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-4">
          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-space-600 flex items-center justify-center text-[11px] font-bold text-slate-300 tracking-tight">
                A2
              </div>
              <div>
                <h1 className="text-sm font-semibold text-white tracking-wide">Artemis II</h1>
                <p className="text-[9px] uppercase tracking-widest text-label">Mission Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {telemetry && (
                <span className="text-xs font-mono text-slate-300 hidden md:block">
                  MET {formatMET(telemetry.met)}
                </span>
              )}
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-live animate-pulse" />
                <span className="text-[10px] text-live font-medium">Live</span>
              </div>
              <div className="hidden lg:block">
                <UnitToggle compact />
              </div>
            </div>
          </div>

          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-[1440px] mx-auto px-4 py-5 space-y-5">
        {activeTab === 'overview' && (
          <>
            <TelemetryPanel telemetry={telemetry} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <LiveVideo />
              </div>
              <MissionTimeline currentTime={telemetry?.epoch?.getTime()} />
            </div>

            <TrajectoryMap trajectoryPath={trajectoryPath} telemetry={telemetry} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <DetailCards telemetry={telemetry} />
              <CrewPanel />
            </div>

            <SourceAttribution />
          </>
        )}

        {activeTab === 'trajectory' && (
          <TrajectoryMap trajectoryPath={trajectoryPath} telemetry={telemetry} />
        )}

        {activeTab === 'timeline' && (
          <MissionTimeline
            currentTime={telemetry?.epoch?.getTime()}
            expanded
          />
        )}

        {activeTab === 'crew' && (
          <CrewPanel />
        )}

        {activeTab === 'live' && (
          <LiveVideo />
        )}

        {activeTab === 'data' && (
          <>
            <TelemetryPanel telemetry={telemetry} />
            <DetailCards telemetry={telemetry} />
            <SourceAttribution />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-[1440px] mx-auto px-4 py-6 border-t border-border">
        <p className="text-[10px] text-label text-center">
          Data: JPL Horizons &amp; NASA/JSC/FOD | State vectors in EME2000 reference frame
        </p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <UnitsProvider>
      <Dashboard />
    </UnitsProvider>
  );
}

export default App;
