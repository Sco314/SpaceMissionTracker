import { formatMET } from '../../lib/coordinates.js';
import { useUnits } from '../../lib/units-context.jsx';
import { LAUNCH_TIME, MISSION_EVENTS } from '../../lib/mission-data.js';

function Gauge({ value, label, unit, progress }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const filled = circumference * Math.min(1, Math.max(0, progress || 0));

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[88px] h-[88px] flex items-center justify-center">
        <svg className="absolute inset-0" viewBox="0 0 88 88">
          {/* Background ring */}
          <circle
            cx="44" cy="44" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="3"
          />
          {/* Progress arc */}
          <circle
            cx="44" cy="44" r={radius}
            fill="none"
            stroke="#67e8f9"
            strokeWidth="3"
            strokeDasharray={`${filled} ${circumference - filled}`}
            strokeDashoffset={circumference * 0.25}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="text-center z-10">
          <div className="text-[16px] font-bold text-white leading-tight">{value}</div>
          {unit && <div className="text-[11px] text-slate-400 uppercase">{unit}</div>}
        </div>
      </div>
      <span className="text-[11px] text-slate-500 uppercase tracking-wider mt-0.5">{label}</span>
    </div>
  );
}

function MissionProgress({ telemetry }) {
  const launchMs = LAUNCH_TIME.getTime();
  const flyby = MISSION_EVENTS.find(e => e.type === 'lunar-flyby');
  const splashdown = MISSION_EVENTS.find(e => e.type === 'splashdown');
  const flybyMs = flyby.time.getTime();
  const splashMs = splashdown.time.getTime();
  const nowMs = telemetry.epoch?.getTime() || Date.now();

  // Progress from launch to splashdown
  const totalDuration = splashMs - launchMs;
  const elapsed = nowMs - launchMs;
  const progress = Math.min(1, Math.max(0, elapsed / totalDuration));

  // Moon marker position on the bar
  const moonMarker = (flybyMs - launchMs) / totalDuration;

  return (
    <div className="w-[88px] flex flex-col items-center gap-0.5">
      <div className="w-full h-1.5 bg-white/10 rounded-full relative overflow-visible">
        {/* Progress fill */}
        <div
          className="absolute inset-y-0 left-0 bg-cyan-400/60 rounded-full"
          style={{ width: `${progress * 100}%` }}
        />
        {/* Moon marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-300 border border-slate-500"
          style={{ left: `${moonMarker * 100}%`, marginLeft: '-3px' }}
          title="Lunar flyby"
        />
      </div>
      <span className="text-[11px] text-slate-500 uppercase tracking-wider">Progress</span>
    </div>
  );
}

export default function TelemetryGauges({ telemetry }) {
  const { formatDistance, formatSpeed } = useUnits();

  if (!telemetry) return null;

  const metStr = formatMET(telemetry.met);
  const metParts = metStr.split(' ');
  const metCompact = metParts.length > 1
    ? `${metParts[0].padStart(2, '0')}:${metParts[metParts.length - 1].slice(0, 5)}`
    : metStr.slice(0, 8);

  const spd = formatSpeed(telemetry.velocityKms);
  const distEarth = formatDistance(telemetry.distEarthKm);
  const distMoon = formatDistance(telemetry.distMoonKm);

  // Progress values for gauge arcs
  const metProgress = Math.min(1, telemetry.met / (10 * 86400 * 1000));
  const speedProgress = Math.min(1, telemetry.velocityKms / 11);
  const earthProgress = Math.min(1, telemetry.distEarthKm / 400000);
  const moonProgress = Math.min(1, telemetry.distMoonKm / 400000);

  // Time to/from Moon — use distance-based logic instead of hardcoded event time
  // "At Moon" when within 15,000 km, otherwise show time estimate
  const flyby = MISSION_EVENTS.find(e => e.type === 'lunar-flyby');
  const nowMs = telemetry.epoch?.getTime() || Date.now();
  const ttFlybyMs = flyby.time.getTime() - nowMs;
  const atMoon = telemetry.distMoonKm < 15000;

  let moonTimeValue = '';
  let moonTimeLabel = '';
  if (atMoon) {
    moonTimeValue = 'Now';
    moonTimeLabel = 'At Moon';
  } else if (ttFlybyMs > 0) {
    // Before flyby — show countdown
    const hrs = Math.floor(ttFlybyMs / 3600000);
    const mins = Math.floor((ttFlybyMs % 3600000) / 60000);
    moonTimeValue = `${hrs}h ${String(mins).padStart(2, '0')}m`;
    moonTimeLabel = 'Until Flyby';
  } else {
    // After flyby — show time since
    const sinceMs = -ttFlybyMs;
    const hrs = Math.floor(sinceMs / 3600000);
    const mins = Math.floor((sinceMs % 3600000) / 60000);
    moonTimeValue = `${hrs}h ${String(mins).padStart(2, '0')}m`;
    moonTimeLabel = 'Since Flyby';
  }

  return (
    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
      <Gauge value={metCompact} label="MET" unit="D:H:M" progress={metProgress} />
      <Gauge value={spd.value} label="Speed" unit={spd.unit} progress={speedProgress} />
      <Gauge value={distEarth.value} label="Earth" unit={distEarth.unit} progress={earthProgress} />
      <Gauge value={distMoon.value} label="Moon" unit={distMoon.unit} progress={moonProgress} />
      <div className="flex flex-col items-center">
        <span className={`text-[15px] font-bold ${atMoon ? 'text-live' : 'text-cyan-400'}`}>{moonTimeValue}</span>
        <span className="text-[11px] text-slate-500 uppercase tracking-wider">{moonTimeLabel}</span>
      </div>
      <MissionProgress telemetry={telemetry} />
    </div>
  );
}
