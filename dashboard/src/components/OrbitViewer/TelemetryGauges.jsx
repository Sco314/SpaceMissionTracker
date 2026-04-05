import { formatMET } from '../../lib/coordinates.js';
import { useUnits } from '../../lib/units-context.jsx';
import { getTimeToMoon, getMissionPhase } from '../../lib/mission-data.js';

function Gauge({ value, label, unit, progress }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const filled = circumference * Math.min(1, Math.max(0, progress || 0));

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-14 h-14 flex items-center justify-center">
        <svg className="absolute inset-0" viewBox="0 0 56 56">
          {/* Background ring */}
          <circle
            cx="28" cy="28" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="2"
          />
          {/* Progress arc */}
          <circle
            cx="28" cy="28" r={radius}
            fill="none"
            stroke="#67e8f9"
            strokeWidth="2"
            strokeDasharray={`${filled} ${circumference - filled}`}
            strokeDashoffset={circumference * 0.25}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="text-center z-10">
          <div className="text-[11px] font-bold text-white leading-tight">{value}</div>
          {unit && <div className="text-[7px] text-slate-400 uppercase">{unit}</div>}
        </div>
      </div>
      <span className="text-[7px] text-slate-500 uppercase tracking-wider mt-0.5">{label}</span>
    </div>
  );
}

export default function TelemetryGauges({ telemetry }) {
  const { formatDistance, formatSpeed } = useUnits();

  if (!telemetry) return null;

  const metStr = formatMET(telemetry.met);
  // Extract D:HH:MM for compact display
  const metParts = metStr.split(' ');
  const metCompact = metParts.length > 1
    ? `${metParts[0].padStart(2, '0')}:${metParts[metParts.length - 1].slice(0, 5)}`
    : metStr.slice(0, 8);

  const spd = formatSpeed(telemetry.velocityKms);
  const distEarth = formatDistance(telemetry.distEarthKm);
  const distMoon = formatDistance(telemetry.distMoonKm);

  // Progress values for gauge arcs (normalized 0-1)
  // MET: 10-day mission
  const metProgress = Math.min(1, telemetry.met / (10 * 86400 * 1000));
  // Speed: max ~11 km/s at TLI
  const speedProgress = Math.min(1, telemetry.velocityKms / 11);
  // Earth distance: max ~400,000 km
  const earthProgress = Math.min(1, telemetry.distEarthKm / 400000);
  // Moon distance: max ~400,000 km
  const moonProgress = Math.min(1, telemetry.distMoonKm / 400000);

  // Time to Moon (or since flyby)
  const nowMs = telemetry.epoch?.getTime() || Date.now();
  const phase = getMissionPhase(nowMs);
  const ttMoonMs = getTimeToMoon(nowMs);
  let moonTimeLabel = '';
  let moonTimeValue = '';
  if (phase === 'pre-flyby' && ttMoonMs > 0) {
    const hrs = Math.floor(ttMoonMs / 3600000);
    const mins = Math.floor((ttMoonMs % 3600000) / 60000);
    moonTimeLabel = 'To Moon';
    moonTimeValue = `${hrs}h ${String(mins).padStart(2, '0')}m`;
  } else {
    moonTimeLabel = 'At Moon';
    moonTimeValue = 'Now';
  }

  return (
    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
      <Gauge value={metCompact} label="MET" unit="D:H:M" progress={metProgress} />
      <Gauge value={spd.value} label="Speed" unit={spd.unit} progress={speedProgress} />
      <Gauge value={distEarth.value} label="Earth" unit={distEarth.unit} progress={earthProgress} />
      <Gauge value={distMoon.value} label="Moon" unit={distMoon.unit} progress={moonProgress} />
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-bold text-cyan-400">{moonTimeValue}</span>
        <span className="text-[7px] text-slate-500 uppercase tracking-wider">{moonTimeLabel}</span>
      </div>
    </div>
  );
}
