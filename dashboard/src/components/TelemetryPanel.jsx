import { formatMET, formatNumber } from '../lib/coordinates.js';

function MetricCard({ label, value, unit, color, icon }) {
  return (
    <div className="bg-space-800 rounded-xl p-4 md:p-5 border border-space-600/50 hover:border-space-500 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-xs uppercase tracking-widest text-slate-400 font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl md:text-3xl font-mono font-bold`} style={{ color }}>
          {value}
        </span>
        {unit && <span className="text-sm text-slate-400">{unit}</span>}
      </div>
    </div>
  );
}

export default function TelemetryPanel({ telemetry }) {
  if (!telemetry) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-space-800 rounded-xl p-5 border border-space-600/50 animate-pulse h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      <MetricCard
        label="Mission Elapsed Time"
        value={formatMET(telemetry.met)}
        color="var(--color-met)"
        icon="⏱"
      />
      <MetricCard
        label="Velocity"
        value={formatNumber(telemetry.velocityMph)}
        unit="MPH"
        color="var(--color-velocity)"
        icon="⚡"
      />
      <MetricCard
        label="Distance from Earth"
        value={formatNumber(telemetry.distEarthMiles)}
        unit="MILES"
        color="var(--color-earth)"
        icon="🌍"
      />
      <MetricCard
        label="Distance from Moon"
        value={formatNumber(telemetry.distMoonMiles)}
        unit="MILES"
        color="var(--color-lunar)"
        icon="🌙"
      />
    </div>
  );
}
