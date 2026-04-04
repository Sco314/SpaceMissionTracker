/**
 * Hermite interpolation for smooth position/velocity between state vectors.
 * Uses cubic Hermite spline which naturally incorporates both position and velocity.
 */

/**
 * Find the two bracketing state vectors for a given time.
 * Returns { before, after, t } where t is normalized [0,1] between them.
 */
export function findBracket(vectors, timeMs) {
  if (vectors.length === 0) return null;

  // Clamp to range
  if (timeMs <= vectors[0].epochMs) {
    return { before: vectors[0], after: vectors[0], t: 0 };
  }
  if (timeMs >= vectors[vectors.length - 1].epochMs) {
    const last = vectors[vectors.length - 1];
    return { before: last, after: last, t: 0 };
  }

  // Binary search for bracket
  let lo = 0;
  let hi = vectors.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (vectors[mid].epochMs <= timeMs) lo = mid;
    else hi = mid;
  }

  const before = vectors[lo];
  const after = vectors[hi];
  const dt = after.epochMs - before.epochMs;
  const t = dt > 0 ? (timeMs - before.epochMs) / dt : 0;

  return { before, after, t };
}

/**
 * Hermite interpolation between two state vectors.
 * Returns interpolated { x, y, z, vx, vy, vz, epoch }.
 */
export function hermiteInterpolate(vectors, timeMs) {
  const bracket = findBracket(vectors, timeMs);
  if (!bracket) return null;

  const { before, after, t } = bracket;
  if (t === 0) return { ...before, epoch: new Date(timeMs) };

  const dt = (after.epochMs - before.epochMs) / 1000; // seconds

  // Hermite basis functions
  const t2 = t * t;
  const t3 = t2 * t;
  const h00 = 2 * t3 - 3 * t2 + 1;
  const h10 = t3 - 2 * t2 + t;
  const h01 = -2 * t3 + 3 * t2;
  const h11 = t3 - t2;

  const interp = (p0, v0, p1, v1) =>
    h00 * p0 + h10 * dt * v0 + h01 * p1 + h11 * dt * v1;

  return {
    x: interp(before.x, before.vx, after.x, after.vx),
    y: interp(before.y, before.vy, after.y, after.vy),
    z: interp(before.z, before.vz, after.z, after.vz),
    vx: before.vx + t * (after.vx - before.vx), // linear for velocity display
    vy: before.vy + t * (after.vy - before.vy),
    vz: before.vz + t * (after.vz - before.vz),
    epoch: new Date(timeMs),
    epochMs: timeMs,
  };
}
