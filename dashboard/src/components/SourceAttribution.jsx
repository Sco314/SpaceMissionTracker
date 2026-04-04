import { Database, ExternalLink, Info } from 'lucide-react';
import UnitToggle from './UnitToggle.jsx';

export default function SourceAttribution() {
  return (
    <div className="bg-space-800 rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <Database size={14} className="text-label" strokeWidth={1.5} />
        <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Data Sources &amp; Methodology</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="space-y-3">
          <div>
            <p className="text-slate-300 font-medium mb-1">Trajectory Data</p>
            <p className="text-label leading-relaxed">
              State vectors from NASA/JSC Flight Dynamics Operations via the CCSDS Orbital
              Ephemeris Message (OEM) standard. Reference frame: EME2000 (Earth Mean Equator
              and Equinox of J2000.0), Earth-centered.
            </p>
          </div>
          <div>
            <p className="text-slate-300 font-medium mb-1">Live Updates</p>
            <p className="text-label leading-relaxed">
              Position data sourced from JPL Horizons System (spacecraft ID: -1024).
              Vectors at 4-minute intervals, with 2-second resolution during maneuvers.
              Client-side Hermite interpolation for real-time display.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-slate-300 font-medium mb-1">Derived Values</p>
            <p className="text-label leading-relaxed">
              Velocity, distance, and altitude are computed from raw state vectors. Mission
              Elapsed Time is derived from the launch epoch. Ground track coordinates use
              IAU GMST for ECI-to-ECEF conversion. Moon position is approximate.
            </p>
          </div>
          <div>
            <p className="text-slate-300 font-medium mb-1">Timeline</p>
            <p className="text-label leading-relaxed">
              Mission events based on NASA published mission plan. Times are approximate
              and subject to real-time mission decisions.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <UnitToggle />
        <div className="flex gap-3">
          <a
            href="https://ssd.jpl.nasa.gov/horizons/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-[10px] text-label hover:text-slate-300 transition-colors"
          >
            JPL Horizons <ExternalLink size={10} />
          </a>
          <a
            href="https://www.nasa.gov/missions/artemis-ii/arow/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-[10px] text-label hover:text-slate-300 transition-colors"
          >
            NASA AROW <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  );
}
