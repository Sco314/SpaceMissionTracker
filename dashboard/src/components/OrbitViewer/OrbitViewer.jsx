import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Orbit, Rocket } from 'lucide-react';
import OrbitScene from './OrbitScene.jsx';
import TelemetryGauges from './TelemetryGauges.jsx';

export default function OrbitViewer({ trajectoryPath, telemetry }) {
  const [viewMode, setViewMode] = useState('mission');

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-white/[0.06] bg-[#0b1120]"
         style={{ height: 'calc(100vh - 120px)', minHeight: '400px' }}>

      {/* View mode buttons */}
      <div className="absolute left-2 top-2 z-10 flex flex-col gap-1.5">
        <button
          onClick={() => setViewMode('mission')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
            viewMode === 'mission'
              ? 'bg-white/10 text-white'
              : 'bg-white/5 text-slate-400 hover:text-white'
          }`}
        >
          <Orbit size={14} />
          <span>Mission</span>
        </button>
        <button
          onClick={() => setViewMode('spacecraft')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
            viewMode === 'spacecraft'
              ? 'bg-white/10 text-white'
              : 'bg-white/5 text-slate-400 hover:text-white'
          }`}
        >
          <Rocket size={14} />
          <span>Spacecraft</span>
        </button>
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
        camera={{ fov: 45, near: 0.1, far: 500 }}
        style={{ touchAction: 'none' }}
      >
        <OrbitScene
          trajectoryPath={trajectoryPath}
          telemetry={telemetry}
          viewMode={viewMode}
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
