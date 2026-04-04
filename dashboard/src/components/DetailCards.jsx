import { formatNumber } from '../lib/coordinates.js';

export default function DetailCards({ telemetry }) {
  if (!telemetry) return null;

  const cards = [
    { label: 'Altitude', value: formatNumber(telemetry.altitudeKm), unit: 'km', color: '#60a5fa' },
    { label: 'Velocity', value: telemetry.velocityKms.toFixed(2), unit: 'km/s', color: '#f59e0b' },
    { label: 'Latitude', value: telemetry.groundTrack.lat.toFixed(2), unit: '°', color: '#34d399' },
    { label: 'Longitude', value: telemetry.groundTrack.lon.toFixed(2), unit: '°', color: '#34d399' },
    { label: 'Dist. Earth', value: formatNumber(telemetry.distEarthKm), unit: 'km', color: '#60a5fa' },
    { label: 'Dist. Moon', value: formatNumber(telemetry.distMoonKm), unit: 'km', color: '#a78bfa' },
  ];

  return (
    <div className="bg-space-800 rounded-xl border border-space-600/50 p-4 md:p-5">
      <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider mb-4">Detailed Metrics</h3>
      <div className="grid grid-cols-3 gap-3">
        {cards.map((card) => (
          <div key={card.label} className="text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">{card.label}</p>
            <p className="text-base font-mono font-bold" style={{ color: card.color }}>
              {card.value}
            </p>
            <p className="text-[10px] text-slate-500">{card.unit}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
