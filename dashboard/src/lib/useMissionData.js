import { useState, useEffect, useRef, useCallback } from 'react';
import { parseOEM } from './oem-parser.js';
import { hermiteInterpolate } from './interpolator.js';
import { distanceFromEarth, speed, kmsToMph, kmToMiles, altitude, eciToLatLon } from './coordinates.js';
import { LAUNCH_TIME } from './mission-data.js';
import trajectoryRaw from '../data/trajectory_data.json';

// Pre-process the JSON data into state vectors with epochMs
const preloadedVectors = trajectoryRaw.map(v => ({
  ...v,
  epoch: new Date(v.epoch),
  epochMs: new Date(v.epoch).getTime(),
}));

// Simple Moon position approximation (average Earth-Moon distance)
// For accuracy, this should be fetched from Horizons (ID 301)
function approximateMoonPosition(timeMs) {
  const MOON_ORBITAL_PERIOD = 27.321661 * 86400 * 1000; // ms
  const MOON_DISTANCE = 384400; // km average
  const epoch0 = new Date('2026-04-01T00:00:00Z').getTime();
  const angle = ((timeMs - epoch0) / MOON_ORBITAL_PERIOD) * 2 * Math.PI;
  // Inclined ~5.14 degrees
  const incl = 5.14 * Math.PI / 180;
  return {
    x: MOON_DISTANCE * Math.cos(angle),
    y: MOON_DISTANCE * Math.sin(angle) * Math.cos(incl),
    z: MOON_DISTANCE * Math.sin(angle) * Math.sin(incl),
  };
}

export function useMissionData() {
  const [telemetry, setTelemetry] = useState(null);
  const [trajectoryPath, setTrajectoryPath] = useState([]);
  const vectorsRef = useRef(preloadedVectors);
  const animFrameRef = useRef(null);

  // Build the trajectory path (downsampled for rendering)
  useEffect(() => {
    const vectors = vectorsRef.current;
    if (vectors.length === 0) return;

    // Sample every ~20 vectors for the path (~160 points)
    const step = Math.max(1, Math.floor(vectors.length / 160));
    const path = [];
    for (let i = 0; i < vectors.length; i += step) {
      const v = vectors[i];
      const dist = distanceFromEarth(v);
      const moonPos = approximateMoonPosition(v.epochMs);
      const distMoon = Math.sqrt(
        (v.x - moonPos.x) ** 2 + (v.y - moonPos.y) ** 2 + (v.z - moonPos.z) ** 2
      );
      path.push({
        epoch: v.epoch,
        epochMs: v.epochMs,
        x: v.x,
        y: v.y,
        z: v.z,
        distEarth: dist,
        distMoon: distMoon,
        speed: speed(v),
      });
    }
    setTrajectoryPath(path);
  }, []);

  // Real-time interpolation loop
  useEffect(() => {
    const vectors = vectorsRef.current;
    if (vectors.length === 0) return;

    function update() {
      const now = Date.now();
      const met = now - LAUNCH_TIME.getTime();
      const state = hermiteInterpolate(vectors, now);

      if (state) {
        const vel = speed(state);
        const distEarth = distanceFromEarth(state);
        const moonPos = approximateMoonPosition(now);
        const distMoon = Math.sqrt(
          (state.x - moonPos.x) ** 2 +
          (state.y - moonPos.y) ** 2 +
          (state.z - moonPos.z) ** 2
        );
        const latLon = eciToLatLon(state, state.epoch);

        setTelemetry({
          met,
          velocityKms: vel,
          velocityMph: kmsToMph(vel),
          distEarthKm: distEarth,
          distEarthMiles: kmToMiles(distEarth),
          distMoonKm: distMoon,
          distMoonMiles: kmToMiles(distMoon),
          altitudeKm: altitude(state),
          position: { x: state.x, y: state.y, z: state.z },
          velocity: { vx: state.vx, vy: state.vy, vz: state.vz },
          groundTrack: latLon,
          epoch: state.epoch,
          moonPosition: moonPos,
        });
      }

      animFrameRef.current = requestAnimationFrame(update);
    }

    update();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return { telemetry, trajectoryPath, vectors: vectorsRef.current };
}
