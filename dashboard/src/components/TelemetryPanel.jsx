import { formatMET, formatCountdown } from '../lib/coordinates.js';
import { METRIC_ICONS } from '../lib/icon-map.js';
import { useUnits } from '../lib/units-context.jsx';
import { getMissionPhase, getTimeToMoon, getTimeToEarth, getTimeSinceFlyby } from '../lib/mission-data.js';

function MetricCell({ label, value, unit, iconKey, subtitle }) {
  const Icon = METRIC_ICONS[iconKey];
  return (
    <div className="flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 min-w-0">
      {Icon && <Icon size={14} className="text-label flex-shrink-0 hidden sm:block" strokeWidth={1.5} />}
      <div className="min-w-0">
        <p className="text-[8px] sm:text-[9px] uppercase tracking-wider text-label font-medium leading-none truncate">{label}</p>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="text-sm sm:text-base font-mono font-semibold text-slate-100 leading-none">
            {value}
          </span>
          {unit && <span className="text-[9px] text-label">{unit}</span>}
        </div>
        {subtitle && (
          <p className="text-[8px] text-slate-500 font-mono mt-px leading-none">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export default function TelemetryPanel({ telemetry }) {
  const { formatDistance, formatSpeed } = useUnits();

  if (!telemetry) {
    return (
      <div className="bg-space-800 rounded-xl border border-border animate-pulse h-[72px]" />
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
    moonSubtitle = `${formatCountdown(getTimeSinceFlyby(nowMs))} ago`;
  }

  let earthSubtitle = null;
  if (phase === 'post-flyby' || phase === 'post-entry') {
    const tte = getTimeToEarth(nowMs);
    earthSubtitle = tte > 0 ? `Return in ${formatCountdown(tte)}` : 'Arrived';
  }

  return (
    <div className="bg-space-800 rounded-xl border border-border overflow-hidden">
      <div className="grid grid-cols-2 divide-x divide-border">
        <MetricCell
          label="MET"
          value={formatMET(telemetry.met)}
          iconKey="met"
        />
        <MetricCell
          label="Velocity"
          value={vel.value}
          unit={vel.unit}
          iconKey="velocity"
        />
      </div>
      <div className="grid grid-cols-2 divide-x divide-border border-t border-border">
        <MetricCell
          label="Earth"
          value={distEarth.value}
          unit={distEarth.unit}
          iconKey="distEarth"
          subtitle={earthSubtitle}
        />
        <MetricCell
          label="Moon"
          value={distMoon.value}
          unit={distMoon.unit}
          iconKey="distMoon"
          subtitle={moonSubtitle}
        />
      </div>
    </div>
  );
}
