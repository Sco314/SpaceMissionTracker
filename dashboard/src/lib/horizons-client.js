/**
 * Client for JPL Horizons API.
 * Fetches state vectors for Orion (ID: -1024) and Moon (ID: 301).
 *
 * Note: The Horizons API may have CORS restrictions. If direct browser
 * fetching fails, we fall back to the local OEM file data.
 */

const HORIZONS_API = 'https://ssd.jpl.nasa.gov/api/horizons.api';
const ORION_ID = '-1024';
const MOON_ID = '301';

function buildHorizonsUrl(commandId, startTime, stopTime, stepSize = '30m') {
  const params = new URLSearchParams({
    format: 'json',
    COMMAND: `'${commandId}'`,
    OBJ_DATA: "'NO'",
    MAKE_EPHEM: "'YES'",
    EPHEM_TYPE: "'VECTORS'",
    CENTER: "'500@399'",       // Earth center
    START_TIME: `'${startTime}'`,
    STOP_TIME: `'${stopTime}'`,
    STEP_SIZE: `'${stepSize}'`,
    VEC_TABLE: "'2'",
  });
  return `${HORIZONS_API}?${params}`;
}

/**
 * Fetch Orion state vectors from Horizons.
 * Returns raw JSON response.
 */
export async function fetchOrionVectors(startTime, stopTime) {
  const url = buildHorizonsUrl(ORION_ID, startTime, stopTime);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Horizons API error: ${response.status}`);
  return response.json();
}

/**
 * Fetch Moon state vectors from Horizons.
 */
export async function fetchMoonVectors(startTime, stopTime, stepSize = '1h') {
  const url = buildHorizonsUrl(MOON_ID, startTime, stopTime, stepSize);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Horizons API error: ${response.status}`);
  return response.json();
}
