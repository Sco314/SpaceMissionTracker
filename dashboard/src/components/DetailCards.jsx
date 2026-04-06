import { useUnits } from '../lib/units-context.jsx';
import { formatNumber } from '../lib/coordinates.js';

const LEO_THRESHOLD_KM = 402; // 250 miles

export default function DetailCards({ telemetry }) {
  const { formatDistance, formatSpeed } = useUnits();

  if (!telemetry) return null;

  const distE = formatDistance(telemetry.distEarthKm);
  const distM = formatDistance(telemetry.distMoonKm);
  const vel = formatSpeed(telemetry.velocityKms);

  const aboveLeo = telemetry.altitudeKm > LEO_THRESHOLD_KM;

  const cards = [];

  if (!aboveLeo) {
    const alt = formatDistance(telemetry.altitudeKm);
    cards.push({ label: 'Altitude', value: alt.value, unit: alt.unit });
  }

  cards.push({ label: 'Velocity', value: vel.value, unit: vel.unit });

  if (!aboveLeo) {
    cards.push({ label: 'Latitude', value: telemetry.groundTrack.lat.toFixed(2), unit: '\u00b0' });
    cards.push({ label: 'Longitude', value: telemetry.groundTrack.lon.toFixed(2), unit: '\u00b0' });
  }

  cards.push({ label: 'Dist. Earth', value: distE.value, unit: distE.unit });
  cards.push({ label: 'Dist. Moon', value: distM.value, unit: distM.unit });

  return (
    <div className="bg-space-800 rounded-xl border border-border p-3 sm:p-4">
      <h3 className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-2">Detailed Metrics</h3>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {cards.map((card) => (
          <div key={card.label} className="text-center">
            <p className="text-[9px] uppercase tracking-wider text-label mb-0.5">{card.label}</p>
            <p className="text-sm font-mono font-semibold text-slate-100">
              {card.value} <span className="text-[10px] font-normal text-label">{card.unit}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
