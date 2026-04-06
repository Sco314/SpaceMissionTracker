import { useState, lazy, Suspense } from 'react';
import { UnitsProvider } from './lib/units-context.jsx';
import { useMissionData } from './lib/useMissionData.js';
import { formatMET } from './lib/coordinates.js';
import Navigation from './components/Navigation.jsx';
import TelemetryPanel from './components/TelemetryPanel.jsx';
import TrajectoryMap from './components/TrajectoryMap.jsx';
import MissionTimeline from './components/MissionTimeline.jsx';
import CrewPanel from './components/CrewPanel.jsx';
import DetailCards from './components/DetailCards.jsx';
import SpacecraftPanel from './components/SpacecraftPanel.jsx';
import LiveVideo from './components/LiveVideo.jsx';
import UnitToggle from './components/UnitToggle.jsx';
import { LAUNCH_TIME } from './lib/mission-data.js';

const OrbitViewer = lazy(() => import('./components/OrbitViewer/OrbitViewer.jsx'));

function Dashboard() {
  const { telemetry, trajectoryPath, vectors } = useMissionData();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-space-900">
      {/* Header */}
      <header className="bg-space-800/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-9 sm:h-10">
            <div className="flex items-center gap-2 min-w-0">
              <img src="/artemis-ii-patch.svg" alt="" className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs font-semibold text-white truncate">Artemis II</span>
              <span className="text-[8px] text-slate-500 uppercase tracking-wider hidden sm:inline">Dashboard</span>
            </div>

            <div className="flex items-center gap-2.5">
              {telemetry && (
                <span className="text-[9px] font-mono text-slate-400 hidden md:block">
                  MET {formatMET(telemetry.met)}
                </span>
              )}
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-live animate-pulse" />
                <span className="text-[9px] text-live font-medium">Live</span>
              </div>
              <div className="hidden lg:block">
                <UnitToggle compact />
              </div>
            </div>
          </div>

          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        <div className="border-b border-border" />
      </header>

      {/* Main content */}
      <main className="max-w-[1440px] mx-auto px-3 sm:px-4 py-3 sm:py-5 space-y-3 sm:space-y-5">
        {activeTab === 'overview' && (
          <>
            <Suspense fallback={
              <div className="w-full rounded-2xl bg-space-800 border border-white/[0.06] flex items-center justify-center" style={{ height: '60vh', minHeight: '350px' }}>
                <div className="text-slate-500 text-sm">Loading 3D viewer...</div>
              </div>
            }>
              <OrbitViewer trajectoryPath={trajectoryPath} telemetry={telemetry} vectors={vectors} compact />
            </Suspense>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-5">
              <div className="lg:col-span-2">
                <LiveVideo />
              </div>
              <MissionTimeline currentTime={telemetry?.epoch?.getTime()} />
            </div>

            <DetailCards telemetry={telemetry} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <CrewPanel />
              <SpacecraftPanel />
            </div>

            <details className="bg-space-800 rounded-2xl border border-border">
              <summary className="px-4 py-3 text-xs text-slate-400 font-medium uppercase tracking-wider cursor-pointer hover:text-slate-300 transition-colors">
                2D Trajectory Reference
              </summary>
              <div className="px-4 pb-4">
                <TrajectoryMap trajectoryPath={trajectoryPath} telemetry={telemetry} />
              </div>
            </details>
          </>
        )}

        {activeTab === 'trajectory' && (
          <TrajectoryMap trajectoryPath={trajectoryPath} telemetry={telemetry} />
        )}

        {activeTab === '3d' && (
          <Suspense fallback={
            <div className="w-full rounded-2xl bg-space-800 border border-white/[0.06] flex items-center justify-center" style={{ height: 'calc(100vh - 120px)' }}>
              <div className="text-slate-500 text-sm">Loading 3D viewer...</div>
            </div>
          }>
            <OrbitViewer trajectoryPath={trajectoryPath} telemetry={telemetry} vectors={vectors} />
          </Suspense>
        )}

        {activeTab === 'timeline' && (
          <MissionTimeline
            currentTime={telemetry?.epoch?.getTime()}
            expanded
          />
        )}

        {activeTab === 'crew' && (
          <div className="space-y-5">
            <CrewPanel />
            <SpacecraftPanel />
          </div>
        )}

        {activeTab === 'live' && (
          <LiveVideo />
        )}

        {activeTab === 'data' && (
          <>
            <TelemetryPanel telemetry={telemetry} />
            <DetailCards telemetry={telemetry} />
          </>
        )}
      </main>
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
