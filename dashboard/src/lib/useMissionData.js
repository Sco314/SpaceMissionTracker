import { useState, useEffect, useRef, useCallback } from 'react';
import { parseOEM } from './oem-parser.js';
import { hermiteInterpolate } from './interpolator.js';
import { distanceFromEarth, speed, kmsToMph, kmToMiles, altitude, eciToLatLon } from './coordinates.js';
import { LAUNCH_TIME, MISSION_EVENTS } from './mission-data.js';
import trajectoryRaw from '../data/trajectory_data.json';
import moonEphemerisRaw from '../data/moon_ephemeris.json';

const SPLASHDOWN_MS = MISSION_EVENTS.find(e => e.type === 'splashdown').time.getTime();
const EARTH_RADIUS_KM = 6371;

// Pre-process the JSON data into state vectors with epochMs
const preloadedVectors = trajectoryRaw.map(v => ({
  ...v,
  epoch: new Date(v.epoch),
  epochMs: new Date(v.epoch).getTime(),
}));

// Pre-process Moon ephemeris (derived from trajectory dynamics)
const moonEphemeris = moonEphemerisRaw.map(m => ({
  ...m,
  epochMs: new Date(m.epoch).getTime(),
}));

// Interpolate Moon position from real ephemeris data
export function getMoonPosition(timeMs) {
  if (moonEphemeris.length === 0) return { x: 0, y: 0, z: 0 };

  // Clamp to range
  if (timeMs <= moonEphemeris[0].epochMs) {
    const m = moonEphemeris[0];
    return { x: m.x, y: m.y, z: m.z };
  }
  if (timeMs >= moonEphemeris[moonEphemeris.length - 1].epochMs) {
    const m = moonEphemeris[moonEphemeris.length - 1];
    return { x: m.x, y: m.y, z: m.z };
  }

  // Binary search for bracketing positions
  let lo = 0, hi = moonEphemeris.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (moonEphemeris[mid].epochMs <= timeMs) lo = mid;
    else hi = mid;
  }

  const before = moonEphemeris[lo];
  const after = moonEphemeris[hi];
  const t = (timeMs - before.epochMs) / (after.epochMs - before.epochMs);

  return {
    x: before.x + t * (after.x - before.x),
    y: before.y + t * (after.y - before.y),
    z: before.z + t * (after.z - before.z),
  };
}

export function useMissionData() {
  const [telemetry, setTelemetry] = useState(null);
  const [trajectoryPath, setTrajectoryPath] = useState([]);
  const vectorsRef = useRef(preloadedVectors);
  const animFrameRef = useRef(null);

  // Build the trajectory path (adaptively downsampled for rendering)
  useEffect(() => {
    const vectors = vectorsRef.current;
    if (vectors.length === 0) return;

    // Add a synthetic launch point at Earth's surface
    const first = vectors[0];
    const firstDir = Math.sqrt(first.x ** 2 + first.y ** 2 + first.z ** 2);
    const launchPoint = {
      epoch: LAUNCH_TIME,
      epochMs: LAUNCH_TIME.getTime(),
      x: first.x / firstDir * 6371,
      y: first.y / firstDir * 6371,
      z: first.z / firstDir * 6371,
      vx: first.vx, vy: first.vy, vz: first.vz,
    };

    // Adaptive sampling: denser near Earth, sparser in deep space
    const path = [];
    const addPoint = (v) => {
      const dist = distanceFromEarth(v);
      const moonPos = getMoonPosition(v.epochMs);
      const distMoon = Math.sqrt(
        (v.x - moonPos.x) ** 2 + (v.y - moonPos.y) ** 2 + (v.z - moonPos.z) ** 2
      );
      path.push({
        epoch: v.epoch,
        epochMs: v.epochMs,
        x: v.x, y: v.y, z: v.z,
        distEarth: dist,
        distMoon: distMoon,
        speed: speed(v),
      });
    };

    // Start with launch point
    addPoint(launchPoint);

    // Adaptive step: small step when close to Earth, larger when far
    let i = 0;
    while (i < vectors.length) {
      const v = vectors[i];
      const dist = Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);
      let step;
      if (dist < 15000) step = 2;       // Very dense near Earth
      else if (dist < 50000) step = 5;   // Medium density in near space
      else step = 20;                     // Sparse in deep space
      addPoint(v);
      i += step;
    }

    // Always include the last point
    if (i - vectors.length !== 0) {
      addPoint(vectors[vectors.length - 1]);
    }

    setTrajectoryPath(path);
  }, []);

  // Real-time interpolation loop
  useEffect(() => {
    const vectors = vectorsRef.current;
    if (vectors.length === 0) return;

    function update() {
      const now = Date.now();
      const landed = now >= SPLASHDOWN_MS;
      // After splashdown, freeze MET at the splashdown duration
      const effectiveNow = landed ? SPLASHDOWN_MS : now;
      const met = effectiveNow - LAUNCH_TIME.getTime();
      let state = hermiteInterpolate(vectors, effectiveNow);

      if (state) {
        // After splashdown: clamp spacecraft to Earth's surface and zero velocity
        if (landed) {
          const mag = Math.sqrt(state.x ** 2 + state.y ** 2 + state.z ** 2);
          if (mag > 0) {
            const scale = EARTH_RADIUS_KM / mag;
            state = {
              ...state,
              x: state.x * scale,
              y: state.y * scale,
              z: state.z * scale,
              vx: 0, vy: 0, vz: 0,
            };
          }
        }

        const vel = landed ? 0 : speed(state);
        const distEarth = landed ? 0 : distanceFromEarth(state);
        const moonPos = getMoonPosition(effectiveNow);
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
          altitudeKm: landed ? 0 : altitude(state),
          position: { x: state.x, y: state.y, z: state.z },
          velocity: { vx: state.vx, vy: state.vy, vz: state.vz },
          groundTrack: latLon,
          epoch: state.epoch,
          moonPosition: moonPos,
          landed,
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
