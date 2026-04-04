import { useUnits } from '../lib/units-context.jsx';

function ToggleButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`text-[10px] px-2 py-0.5 rounded font-medium transition-colors ${
        active ? 'bg-space-600 text-white' : 'text-label hover:text-slate-300'
      }`}
    >
      {label}
    </button>
  );
}

export default function UnitToggle({ compact = false }) {
  const { units, toggleDistance, toggleSpeed, toggleTime } = useUnits();

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <ToggleButton label={units.distance === 'km' ? 'km' : 'mi'} active onClick={toggleDistance} />
        <ToggleButton label={units.speed === 'km/s' ? 'km/s' : 'mph'} active onClick={toggleSpeed} />
        <ToggleButton label={units.time === 'utc' ? 'UTC' : 'Local'} active onClick={toggleTime} />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-4 text-xs">
      <div className="flex items-center gap-1.5">
        <span className="text-label">Distance</span>
        <div className="flex bg-space-900 rounded p-0.5">
          <ToggleButton label="km" active={units.distance === 'km'} onClick={toggleDistance} />
          <ToggleButton label="mi" active={units.distance === 'mi'} onClick={toggleDistance} />
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-label">Speed</span>
        <div className="flex bg-space-900 rounded p-0.5">
          <ToggleButton label="km/s" active={units.speed === 'km/s'} onClick={toggleSpeed} />
          <ToggleButton label="mph" active={units.speed === 'mph'} onClick={toggleSpeed} />
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-label">Time</span>
        <div className="flex bg-space-900 rounded p-0.5">
          <ToggleButton label="UTC" active={units.time === 'utc'} onClick={toggleTime} />
          <ToggleButton label="Local" active={units.time === 'local'} onClick={toggleTime} />
        </div>
      </div>
    </div>
  );
}
