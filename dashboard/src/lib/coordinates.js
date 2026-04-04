/**
 * Coordinate math for Artemis II mission telemetry.
 * All positions in km, velocities in km/s.
 */

const EARTH_RADIUS_KM = 6371.0;
const KMS_TO_MPH = 2236.936;
const KM_TO_MILES = 0.621371;

/** Compute distance from origin (Earth center) */
export function distanceFromEarth(pos) {
  return Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z);
}

/** Compute altitude above Earth surface */
export function altitude(pos) {
  return distanceFromEarth(pos) - EARTH_RADIUS_KM;
}

/** Compute distance between two positions */
export function distanceBetween(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/** Compute speed from velocity vector */
export function speed(vel) {
  return Math.sqrt(vel.vx * vel.vx + vel.vy * vel.vy + vel.vz * vel.vz);
}

/** km/s to MPH */
export function kmsToMph(kms) {
  return kms * KMS_TO_MPH;
}

/** km to miles */
export function kmToMiles(km) {
  return km * KM_TO_MILES;
}

/**
 * Convert ECI (Earth-Centered Inertial) to ECEF then to lat/lon.
 * Uses Greenwich Mean Sidereal Time for Earth rotation.
 */
export function eciToLatLon(pos, epoch) {
  const gmst = getGMST(epoch);

  // Rotate from ECI to ECEF
  const cosGmst = Math.cos(gmst);
  const sinGmst = Math.sin(gmst);
  const xEcef = pos.x * cosGmst + pos.y * sinGmst;
  const yEcef = -pos.x * sinGmst + pos.y * cosGmst;
  const zEcef = pos.z;

  const r = Math.sqrt(xEcef * xEcef + yEcef * yEcef + zEcef * zEcef);
  const lat = Math.asin(zEcef / r) * (180 / Math.PI);
  const lon = Math.atan2(yEcef, xEcef) * (180 / Math.PI);

  return { lat, lon };
}

/**
 * Greenwich Mean Sidereal Time in radians.
 * Uses the IAU formula for J2000.0 epoch.
 */
function getGMST(date) {
  const jd = dateToJD(date);
  const T = (jd - 2451545.0) / 36525.0;
  // GMST in seconds
  let gmstSec = 67310.54841 + (876600 * 3600 + 8640184.812866) * T +
                0.093104 * T * T - 6.2e-6 * T * T * T;
  // Convert to radians (86400 seconds = 2*PI radians)
  return ((gmstSec % 86400) / 86400) * 2 * Math.PI;
}

function dateToJD(date) {
  const ms = date.getTime();
  return ms / 86400000 + 2440587.5;
}

/**
 * Format Mission Elapsed Time from milliseconds.
 * Returns "DD:HH:MM:SS" format.
 */
export function formatMET(ms) {
  if (ms < 0) return 'T-' + formatDuration(-ms);
  return formatDuration(ms);
}

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n) => String(n).padStart(2, '0');

  if (days > 0) {
    return `${days}D ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Format a large number with commas.
 */
export function formatNumber(n, decimals = 0) {
  return n.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** Unit-aware distance formatting */
export function formatDistanceWithUnit(km, unit) {
  if (unit === 'mi') return { value: formatNumber(kmToMiles(km)), label: 'mi' };
  return { value: formatNumber(km), label: 'km' };
}

/** Unit-aware speed formatting */
export function formatSpeedWithUnit(kms, unit) {
  if (unit === 'mph') return { value: formatNumber(kmsToMph(kms)), label: 'mph' };
  return { value: kms.toFixed(2), label: 'km/s' };
}
