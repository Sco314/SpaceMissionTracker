import { useState, useEffect, useRef } from 'react';
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

function YouTubeOverlay({ onEnd, onSkip }) {
  const timerRef = useRef(null);

  const handleLoad = () => {
    timerRef.current = setTimeout(onEnd, 28000);
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  return (
    <div className="absolute inset-0 z-20 bg-black flex items-center justify-center">
      <iframe
        src="https://www.youtube.com/embed/vMGuObY8_sw?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&playsinline=1&end=28"
        title="Artemis II Launch"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        className="h-full aspect-[9/16] max-w-full"
        style={{ border: 'none' }}
        onLoad={handleLoad}
      />
      <button
        onClick={onSkip}
        className="absolute bottom-4 right-4 z-30 px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-colors backdrop-blur-sm"
      >
        Skip ▸
      </button>
    </div>
  );
}

export default function OrbitViewer({ trajectoryPath, telemetry, vectors, compact }) {
  const [viewMode, setViewMode] = useState('spacecraft');
  const [replayPhase, setReplayPhase] = useState('off'); // 'off' | 'video' | '3d'

  const heightStyle = compact
    ? { height: '60vh', minHeight: '350px' }
    : { height: 'calc(100vh - 120px)', minHeight: '400px' };

  const replayLabel = replayPhase === 'off'
    ? 'Replay Launch to Now'
    : replayPhase === 'video' ? 'Playing...' : 'Replaying...';

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-white/[0.06] bg-[#0b1120]"
         style={heightStyle}>

      {/* Nav buttons */}
      <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
        {/* Replay button */}
        <button
          onClick={() => setReplayPhase('video')}
          disabled={replayPhase !== 'off'}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
            replayPhase !== 'off'
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
              viewMode === id && replayPhase === 'off'
                ? 'bg-white/10 text-white'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Icon size={12} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* YouTube video overlay — plays before 3D replay */}
      {replayPhase === 'video' && (
        <YouTubeOverlay
          onEnd={() => setReplayPhase('3d')}
          onSkip={() => setReplayPhase('3d')}
        />
      )}

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
          replaying={replayPhase === '3d'}
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
