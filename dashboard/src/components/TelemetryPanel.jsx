import { formatMET, formatCountdown } from '../lib/coordinates.js';
import { METRIC_ICONS } from '../lib/icon-map.js';
import { useUnits } from '../lib/units-context.jsx';
import { getMissionPhase, getTimeToMoon, getTimeToEarth, getTimeSinceFlyby } from '../lib/mission-data.js';

function MetricCard({ label, value, unit, iconKey, subtitle }) {
  const Icon = METRIC_ICONS[iconKey];
  return (
    <div className="bg-space-800 rounded-xl px-2.5 py-2 sm:p-3 border border-border">
      <div className="flex items-center gap-1 mb-0.5">
        {Icon && <Icon size={11} className="text-label" strokeWidth={1.5} />}
        <span className="text-[9px] uppercase tracking-wider text-label font-medium leading-none">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-base sm:text-lg md:text-2xl font-mono font-semibold text-slate-100 leading-tight">
          {value}
        </span>
        {unit && <span className="text-[10px] text-label">{unit}</span>}
      </div>
      {subtitle && (
        <p className="text-[9px] text-label font-mono mt-0.5 leading-none">{subtitle}</p>
      )}
    </div>
  );
}

export default function TelemetryPanel({ telemetry }) {
  const { formatDistance, formatSpeed } = useUnits();

  if (!telemetry) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-space-800 rounded-xl px-2.5 py-2 border border-border animate-pulse h-[60px]" />
        ))}
      </div>
    );
  }

  const distEarth = formatDistance(telemetry.distEarthKm);
  const distMoon = formatDistance(telemetry.distMoonKm);
  const vel = formatSpeed(telemetry.velocityKms);

  const nowMs = telemetry?.epoch?.getTime() || Date.now();
  const phase = getMissionPhase(nowMs);

  let moonSubtitle = null;
  if (phase === 'pre-flyby') {
    moonSubtitle = `Moon in ${formatCountdown(getTimeToMoon(nowMs))}`;
  } else if (phase === 'flyby') {
    moonSubtitle = 'At Moon';
  } else if (phase === 'post-flyby' || phase === 'post-entry') {
    moonSubtitle = `${formatCountdown(getTimeSinceFlyby(nowMs))} since flyby`;
  }

  let earthSubtitle = null;
  if (phase === 'post-flyby' || phase === 'post-entry') {
    const tte = getTimeToEarth(nowMs);
    earthSubtitle = tte > 0 ? `Earth in ${formatCountdown(tte)}` : 'Arrived';
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
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
        subtitle={earthSubtitle}
      />
      <MetricCard
        label="Distance from Moon"
        value={distMoon.value}
        unit={distMoon.unit}
        iconKey="distMoon"
        subtitle={moonSubtitle}
      />
    </div>
  );
}
