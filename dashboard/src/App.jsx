import { useState, useRef, useEffect, useCallback, lazy, Suspense } from 'react';
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
import { Coffee } from 'lucide-react';

const OrbitViewer = lazy(() => import('./components/OrbitViewer/OrbitViewer.jsx'));

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isDesktop;
}

function Dashboard() {
  const { telemetry, trajectoryPath, vectors } = useMissionData();
  const [activeSection, setActiveSection] = useState('overview');
  const isDesktop = useIsDesktop();

  // Section refs for scroll-to
  const sectionRefs = {
    overview: useRef(null),
    live: useRef(null),
    timeline: useRef(null),
    crew: useRef(null),
    data: useRef(null),
    trajectory: useRef(null),
  };

  // State for expandable sections
  const [mapOpen, setMapOpen] = useState(true);
  const [requestedViewMode, setRequestedViewMode] = useState(null);

  // Scroll to section when nav button clicked
  const handleNavigate = useCallback((sectionId) => {
    // "3D Mission Trajectory Map" scrolls to 3D viewer and sets mission view
    if (sectionId === '3d-map') {
      setActiveSection('overview');
      sectionRefs.overview.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setRequestedViewMode('mission');
      return;
    }
    setActiveSection(sectionId);
    const ref = sectionRefs[sectionId];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (sectionId === 'trajectory') setMapOpen(true);
    }
  }, []);

  // Track active section on scroll
  useEffect(() => {
    const entries = Object.entries(sectionRefs);
    const observer = new IntersectionObserver(
      (observed) => {
        for (const entry of observed) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-section');
            if (id) setActiveSection(id);
          }
        }
      },
      { threshold: 0.3, rootMargin: '-80px 0px 0px 0px' }
    );
    entries.forEach(([, ref]) => { if (ref.current) observer.observe(ref.current); });
    return () => observer.disconnect();
  }, []);

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
              <a
                href="https://buymeacoffee.com/ssandvik"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
                title="Support Me & This Project"
              >
                <Coffee size={12} />
                <span className="text-[8px] font-medium hidden sm:inline">Support Me & This Project</span>
              </a>
              <div className="hidden lg:block">
                <UnitToggle compact />
              </div>
            </div>
          </div>

          <Navigation activeSection={activeSection} onNavigate={handleNavigate} />
        </div>
        <div className="border-b border-border" />
      </header>

      {/* All sections on one scrollable page */}
      <main className="max-w-[1440px] mx-auto px-3 sm:px-4 py-3 sm:py-5 space-y-3 sm:space-y-5">

        {/* Row 1: 3D Viewer & Live Video — side-by-side on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5">
          <section ref={sectionRefs.overview} data-section="overview">
            <Suspense fallback={
              <div className="w-full rounded-2xl bg-space-800 border border-white/[0.06] flex items-center justify-center" style={{ height: '50vh', minHeight: '300px' }}>
                <div className="text-slate-500 text-sm">Loading 3D viewer...</div>
              </div>
            }>
              <OrbitViewer
                trajectoryPath={trajectoryPath}
                telemetry={telemetry}
                vectors={vectors}
                compact
                requestedViewMode={requestedViewMode}
                onViewModeApplied={() => setRequestedViewMode(null)}
              />
            </Suspense>
          </section>

          <section ref={sectionRefs.live} data-section="live">
            <LiveVideo />
          </section>
        </div>

        {/* Row 2: Timeline & Data left, Crew & Spacecraft right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5">
          <div className="space-y-3 sm:space-y-5">
            <section ref={sectionRefs.timeline} data-section="timeline">
              <MissionTimeline currentTime={telemetry?.epoch?.getTime()} />
            </section>

            <section ref={sectionRefs.data} data-section="data">
              <DetailCards telemetry={telemetry} />
            </section>
          </div>

          <div className="space-y-3 sm:space-y-5">
            <section ref={sectionRefs.crew} data-section="crew">
              <CrewPanel />
            </section>

            <section>
              <SpacecraftPanel />
            </section>
          </div>
        </div>

        {/* Row 4: 2D Trajectory Map — full width */}
        <section ref={sectionRefs.trajectory} data-section="trajectory">
          <details className="bg-space-800 rounded-2xl border border-border" open={mapOpen}>
            <summary
              onClick={(e) => { e.preventDefault(); setMapOpen(!mapOpen); }}
              className="px-4 py-3 text-xs text-slate-400 font-medium uppercase tracking-wider cursor-pointer hover:text-slate-300 transition-colors"
            >
              2D Trajectory Map
            </summary>
            {mapOpen && (
              <div className="px-4 pb-4">
                <TrajectoryMap trajectoryPath={trajectoryPath} telemetry={telemetry} />
              </div>
            )}
          </details>
        </section>

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
