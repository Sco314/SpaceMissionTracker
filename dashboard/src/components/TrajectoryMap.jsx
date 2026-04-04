import { useRef, useEffect } from 'react';

const CANVAS_W = 800;
const CANVAS_H = 500;
const EARTH_RADIUS_KM = 6371;
const MOON_DISTANCE_KM = 384400;

// Scale: map the full Earth-Moon system into the canvas
// We need ~400,000km to fit. Use a scale factor.
const SCALE = CANVAS_W / (MOON_DISTANCE_KM * 1.15);
const CENTER_X = CANVAS_W * 0.12;
const CENTER_Y = CANVAS_H * 0.5;

function kmToCanvas(x, y) {
  return [CENTER_X + x * SCALE, CENTER_Y - y * SCALE];
}

export default function TrajectoryMap({ trajectoryPath, telemetry }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Stars
    drawStars(ctx);

    // Earth
    const [earthX, earthY] = kmToCanvas(0, 0);
    const earthR = Math.max(EARTH_RADIUS_KM * SCALE, 8);
    const earthGrad = ctx.createRadialGradient(earthX - 2, earthY - 2, 0, earthX, earthY, earthR);
    earthGrad.addColorStop(0, '#60a5fa');
    earthGrad.addColorStop(0.7, '#2563eb');
    earthGrad.addColorStop(1, '#1e3a5f');
    ctx.beginPath();
    ctx.arc(earthX, earthY, earthR, 0, Math.PI * 2);
    ctx.fillStyle = earthGrad;
    ctx.fill();

    // Earth label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Inter, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('EARTH', earthX, earthY + earthR + 14);

    // Moon
    if (telemetry?.moonPosition) {
      const [moonX, moonY] = kmToCanvas(telemetry.moonPosition.x, telemetry.moonPosition.y);
      const moonR = Math.max(1737 * SCALE, 5);
      const moonGrad = ctx.createRadialGradient(moonX - 1, moonY - 1, 0, moonX, moonY, moonR);
      moonGrad.addColorStop(0, '#e2e8f0');
      moonGrad.addColorStop(0.8, '#94a3b8');
      moonGrad.addColorStop(1, '#64748b');
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.fillStyle = moonGrad;
      ctx.fill();

      ctx.fillStyle = '#94a3b8';
      ctx.fillText('MOON', moonX, moonY + moonR + 14);
    }

    // Trajectory path
    if (trajectoryPath.length > 1) {
      ctx.beginPath();
      const [sx, sy] = kmToCanvas(trajectoryPath[0].x, trajectoryPath[0].y);
      ctx.moveTo(sx, sy);

      for (let i = 1; i < trajectoryPath.length; i++) {
        const [px, py] = kmToCanvas(trajectoryPath[i].x, trajectoryPath[i].y);
        ctx.lineTo(px, py);
      }

      ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Gradient overlay for trajectory (brighter near current position)
      if (telemetry) {
        ctx.beginPath();
        const currentIdx = findClosestIndex(trajectoryPath, telemetry.epoch.getTime());
        const startDraw = Math.max(0, currentIdx - 10);
        const [gsx, gsy] = kmToCanvas(trajectoryPath[startDraw].x, trajectoryPath[startDraw].y);
        ctx.moveTo(gsx, gsy);
        for (let i = startDraw + 1; i <= Math.min(currentIdx, trajectoryPath.length - 1); i++) {
          const [px, py] = kmToCanvas(trajectoryPath[i].x, trajectoryPath[i].y);
          ctx.lineTo(px, py);
        }
        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }
    }

    // Current position (Orion)
    if (telemetry) {
      const [ox, oy] = kmToCanvas(telemetry.position.x, telemetry.position.y);

      // Glow
      const glowGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, 16);
      glowGrad.addColorStop(0, 'rgba(251, 191, 36, 0.6)');
      glowGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.beginPath();
      ctx.arc(ox, oy, 16, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // Dot
      ctx.beginPath();
      ctx.arc(ox, oy, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 11px Inter, system-ui';
      ctx.fillText('ORION', ox, oy - 12);
    }

    // Scale bar
    drawScaleBar(ctx);

  }, [trajectoryPath, telemetry]);

  return (
    <div className="bg-space-800 rounded-xl border border-space-600/50 overflow-hidden">
      <div className="px-4 py-3 border-b border-space-600/50">
        <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider">Trajectory Map</h3>
        <p className="text-xs text-slate-500 mt-0.5">Earth-centered ecliptic plane (X-Y projection)</p>
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        width={CANVAS_W}
        height={CANVAS_H}
      />
    </div>
  );
}

function findClosestIndex(path, timeMs) {
  let closest = 0;
  let minDiff = Infinity;
  for (let i = 0; i < path.length; i++) {
    const diff = Math.abs(path[i].epochMs - timeMs);
    if (diff < minDiff) { minDiff = diff; closest = i; }
  }
  return closest;
}

function drawStars(ctx) {
  const rng = mulberry32(42);
  for (let i = 0; i < 120; i++) {
    const x = rng() * CANVAS_W;
    const y = rng() * CANVAS_H;
    const r = rng() * 1.2;
    const alpha = 0.3 + rng() * 0.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fill();
  }
}

function drawScaleBar(ctx) {
  const barKm = 100000;
  const barPx = barKm * SCALE;
  const x = CANVAS_W - 20 - barPx;
  const y = CANVAS_H - 20;

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + barPx, y);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x, y - 3);
  ctx.lineTo(x, y + 3);
  ctx.moveTo(x + barPx, y - 3);
  ctx.lineTo(x + barPx, y + 3);
  ctx.stroke();

  ctx.fillStyle = '#475569';
  ctx.font = '10px Inter, system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('100,000 km', x + barPx / 2, y - 6);
}

// Seedable PRNG for consistent star field
function mulberry32(a) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
