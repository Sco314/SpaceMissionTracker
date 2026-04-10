import { useUnits } from '../lib/units-context.jsx';

function ToggleButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`text-[11px] px-2 py-0.5 rounded font-medium transition-colors ${
        active ? 'bg-space-600 text-white' : 'text-label hover:text-slate-300'
      }`}
    >
      {label}
    </button>
  );
}

export default function UnitToggle() {
  const { units, toggleDistance, setSpeed, toggleTime } = useUnits();

  return (
    <div className="flex flex-col gap-3 text-xs">
      <div className="flex items-center justify-between gap-3">
        <span className="text-label">Distance</span>
        <div className="flex bg-space-900 rounded p-0.5">
          <ToggleButton label="km" active={units.distance === 'km'} onClick={toggleDistance} />
          <ToggleButton label="mi" active={units.distance === 'mi'} onClick={toggleDistance} />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-label">Speed</span>
        <div className="flex bg-space-900 rounded p-0.5">
          <ToggleButton label="km/s" active={units.speed === 'km/s'} onClick={() => setSpeed('km/s')} />
          <ToggleButton label="mph" active={units.speed === 'mph'} onClick={() => setSpeed('mph')} />
          <ToggleButton label="kph" active={units.speed === 'kph'} onClick={() => setSpeed('kph')} />
          <ToggleButton label="mi/s" active={units.speed === 'mi/s'} onClick={() => setSpeed('mi/s')} />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-label">Time</span>
        <div className="flex bg-space-900 rounded p-0.5">
          <ToggleButton label="UTC" active={units.time === 'utc'} onClick={toggleTime} />
          <ToggleButton label="Local" active={units.time === 'local'} onClick={toggleTime} />
        </div>
      </div>
    </div>
  );
}
