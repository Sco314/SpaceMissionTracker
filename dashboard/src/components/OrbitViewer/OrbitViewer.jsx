import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Orbit, Rocket, Moon, Globe, Play } from 'lucide-react';
import OrbitScene from './OrbitScene.jsx';
import TelemetryGauges from './TelemetryGauges.jsx';

const VIEW_MODES = [
  { id: 'spacecraft', label: 'Spacecraft', Icon: Rocket },
  { id: 'mission', label: 'Mission', Icon: Orbit },
  { id: 'moon', label: 'Moon', Icon: Moon },
  { id: 'earth', label: 'Earth', Icon: Globe },
];

export default function OrbitViewer({ trajectoryPath, telemetry, vectors, compact, requestedViewMode, onViewModeApplied }) {
  const [viewMode, setViewMode] = useState('spacecraft');
  const [replayPhase, setReplayPhase] = useState('intro-3d'); // starts with 3D intro on page load
  // Allow parent to request a view mode change (e.g. from nav)
  useEffect(() => {
    if (requestedViewMode && requestedViewMode !== viewMode) {
      setViewMode(requestedViewMode);
      setReplayPhase('off');
      if (onViewModeApplied) onViewModeApplied();
    }
  }, [requestedViewMode]);

  const heightStyle = compact
    ? { height: '60vh', minHeight: '350px' }
    : { height: 'calc(100vh - 120px)', minHeight: '400px' };

  const isPlaying = replayPhase !== 'off';
  const replayLabel = isPlaying ? 'Replaying...' : 'Replay Launch to Now';
  const is3dReplay = replayPhase === '3d' || replayPhase === 'intro-3d';

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-white/[0.06] bg-[#0b1120]"
         style={heightStyle}>

      {/* Nav buttons */}
      <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
        {/* Replay button */}
        <button
          onClick={() => setReplayPhase('3d')}
          disabled={isPlaying}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
            isPlaying
              ? 'bg-amber-500/20 text-amber-300 animate-pulse'
              : 'bg-white/5 text-slate-400 hover:text-amber-300 hover:bg-amber-500/10'
          }`}
        >
          <Play size={12} />
          <span>{replayLabel}</span>
        </button>

        {/* View mode buttons */}
        {VIEW_MODES.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => { setViewMode(id); setReplayPhase('off'); }}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
              viewMode === id && !isPlaying
                ? 'bg-white/10 text-white'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Icon size={12} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Telemetry gauges */}
      <TelemetryGauges telemetry={telemetry} />

      {/* 3D Canvas */}
      <Canvas
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'low-power',
        }}
        dpr={[1, 1.5]}
        camera={{ fov: 45, near: 0.1, far: 1000 }}
        style={{ touchAction: 'none' }}
      >
        <OrbitScene
          trajectoryPath={trajectoryPath}
          telemetry={telemetry}
          viewMode={viewMode}
          setViewMode={setViewMode}
          replaying={is3dReplay}
          setReplaying={(val) => { if (!val) setReplayPhase('off'); }}
          vectors={vectors}
        />
      </Canvas>

      {/* Bottom branding */}
      <div className="absolute bottom-2 left-0 right-0 text-center">
        <span className="text-[10px] tracking-[0.3em] text-slate-600 font-semibold">
          ARTEMIS II
        </span>
      </div>
    </div>
  );
}
