import { formatMET } from '../lib/coordinates.js';
import { METRIC_ICONS } from '../lib/icon-map.js';
import { useUnits } from '../lib/units-context.jsx';

function MetricCard({ label, value, unit, iconKey }) {
  const Icon = METRIC_ICONS[iconKey];
  return (
    <div className="bg-space-800 rounded-2xl p-4 border border-border">
      <div className="flex items-center gap-1.5 mb-2">
        {Icon && <Icon size={13} className="text-label" strokeWidth={1.5} />}
        <span className="text-[10px] uppercase tracking-wider text-label font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl md:text-3xl font-mono font-semibold text-slate-100">
          {value}
        </span>
        {unit && <span className="text-xs text-label">{unit}</span>}
      </div>
    </div>
  );
}

export default function TelemetryPanel({ telemetry }) {
  const { formatDistance, formatSpeed } = useUnits();

  if (!telemetry) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-space-800 rounded-2xl p-4 border border-border animate-pulse h-[88px]" />
        ))}
      </div>
    );
  }

  const distEarth = formatDistance(telemetry.distEarthKm);
  const distMoon = formatDistance(telemetry.distMoonKm);
  const vel = formatSpeed(telemetry.velocityKms);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <MetricCard
        label="Mission Elapsed Time"
        value={formatMET(telemetry.met)}
        iconKey="met"
      />
      <MetricCard
        label="Velocity"
        value={vel.value}
        unit={vel.unit}
        iconKey="velocity"
      />
      <MetricCard
        label="Distance from Earth"
        value={distEarth.value}
        unit={distEarth.unit}
        iconKey="distEarth"
      />
      <MetricCard
        label="Distance from Moon"
        value={distMoon.value}
        unit={distMoon.unit}
        iconKey="distMoon"
      />
    </div>
  );
}
