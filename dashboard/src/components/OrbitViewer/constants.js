// Scale: 10,000 km = 1 Three.js unit
export const KM_TO_SCENE = 1 / 10000;
export const EARTH_RADIUS = 6371 * KM_TO_SCENE;   // 0.6371
export const MOON_RADIUS = 1737 * KM_TO_SCENE;    // 0.1737

// Sun placed at ~200 scene units in approximate direction for April 2026
// (well within camera far plane of 500, visually proportioned)
export const SUN_POSITION = [180, 30, 80];

// Colors matching dashboard theme
export const COLORS = {
  earth: '#2563eb',
  earthGlow: '#3b82f6',
  moon: '#9ca3af',
  orion: '#f59e0b',
  trajectoryPast: '#6366f1',
  trajectoryFuture: '#6366f1',
  starfield: '#ffffff',
};

// Convert ECI (Z-up) to Three.js (Y-up): swap Y and Z
export function eciToScene(pos) {
  return [
    pos.x * KM_TO_SCENE,
    pos.z * KM_TO_SCENE,
    -pos.y * KM_TO_SCENE,
  ];
}
