import { useRef, useEffect, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair } from 'lucide-react';

const CANVAS_W = 900;
const CANVAS_H = 520;
const EARTH_RADIUS_KM = 6371;

const VIEW_MODES = [
  { id: 'auto', label: 'Auto' },
  { id: 'earth', label: 'Earth' },
  { id: 'moon', label: 'Moon' },
  { id: 'craft', label: 'Orion' },
];

function computeBounds(trajectoryPath, telemetry, viewMode) {
  let points = [];

  // Always include Earth at origin
  points.push({ x: 0, y: 0 });

  // Include Moon
  if (telemetry?.moonPosition) {
    points.push({ x: telemetry.moonPosition.x, y: telemetry.moonPosition.y });
  }

  // Include trajectory
  for (const p of trajectoryPath) {
    points.push({ x: p.x, y: p.y });
  }

  // Include current position
  if (telemetry?.position) {
    points.push({ x: telemetry.position.x, y: telemetry.position.y });
  }

  if (points.length < 2) {
    return { minX: -450000, maxX: 450000, minY: -250000, maxY: 250000 };
  }

  if (viewMode === 'earth') {
    // Show Earth + nearby trajectory (first 25%)
    const nearby = trajectoryPath.slice(0, Math.ceil(trajectoryPath.length * 0.25));
    points = [{ x: 0, y: 0 }];
    for (const p of nearby) points.push({ x: p.x, y: p.y });
    if (telemetry?.position) points.push({ x: telemetry.position.x, y: telemetry.position.y });
  } else if (viewMode === 'moon' && telemetry?.moonPosition) {
    const mx = telemetry.moonPosition.x;
    const my = telemetry.moonPosition.y;
    const range = 80000;
    return { minX: mx - range, maxX: mx + range, minY: my - range, maxY: my + range };
  } else if (viewMode === 'craft' && telemetry?.position) {
    const cx = telemetry.position.x;
    const cy = telemetry.position.y;
    const range = 60000;
    return { minX: cx - range, maxX: cx + range, minY: cy - range, maxY: cy + range };
  }

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  // Add padding
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const padX = rangeX * 0.12;
  const padY = rangeY * 0.12;

  // Ensure aspect ratio matches canvas
  let adjRangeX = rangeX + padX * 2;
  let adjRangeY = rangeY + padY * 2;
  const aspect = CANVAS_W / CANVAS_H;

  if (adjRangeX / adjRangeY > aspect) {
    adjRangeY = adjRangeX / aspect;
  } else {
    adjRangeX = adjRangeY * aspect;
  }

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  return {
    minX: cx - adjRangeX / 2,
    maxX: cx + adjRangeX / 2,
    minY: cy - adjRangeY / 2,
    maxY: cy + adjRangeY / 2,
  };
}

export default function TrajectoryMap({ trajectoryPath, telemetry }) {
  const canvasRef = useRef(null);
  const [viewMode, setViewMode] = useState('auto');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const touchRef = useRef({ lastDist: null, lastCenter: null, lastPan: null });
  const mouseRef = useRef({ isDown: false, lastPos: null });

  const zoomIn = useCallback(() => setZoomLevel(z => Math.min(z * 1.5, 10)), []);
  const zoomOut = useCallback(() => setZoomLevel(z => Math.max(z / 1.5, 0.3)), []);
  const resetView = useCallback(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setViewMode('auto');
  }, []);

  // Mouse wheel zoom
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 1 / 1.15 : 1.15;
      setZoomLevel(z => Math.min(Math.max(z * delta, 0.3), 10));
    };
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, []);

  // Touch events for pinch-zoom and pan
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getTouchDist = (touches) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        touchRef.current.lastDist = getTouchDist(e.touches);
      } else if (e.touches.length === 1) {
        touchRef.current.lastPan = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dist = getTouchDist(e.touches);
        if (touchRef.current.lastDist) {
          const scale = dist / touchRef.current.lastDist;
          setZoomLevel(z => Math.min(Math.max(z * scale, 0.3), 10));
        }
        touchRef.current.lastDist = dist;
      } else if (e.touches.length === 1 && touchRef.current.lastPan) {
        e.preventDefault();
        const dx = e.touches[0].clientX - touchRef.current.lastPan.x;
        const dy = e.touches[0].clientY - touchRef.current.lastPan.y;
        setPanOffset(p => ({ x: p.x + dx, y: p.y + dy }));
        touchRef.current.lastPan = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchEnd = () => {
      touchRef.current.lastDist = null;
      touchRef.current.lastPan = null;
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Mouse drag to pan
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e) => {
      mouseRef.current.isDown = true;
      mouseRef.current.lastPos = { x: e.clientX, y: e.clientY };
      canvas.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e) => {
      if (!mouseRef.current.isDown || !mouseRef.current.lastPos) return;
      const dx = e.clientX - mouseRef.current.lastPos.x;
      const dy = e.clientY - mouseRef.current.lastPos.y;
      setPanOffset(p => ({ x: p.x + dx, y: p.y + dy }));
      mouseRef.current.lastPos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      mouseRef.current.isDown = false;
      mouseRef.current.lastPos = null;
      canvas.style.cursor = 'grab';
    };

    canvas.style.cursor = 'grab';
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = '#0b1120';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Stars (subtle)
    drawStars(ctx);

    // Compute dynamic bounds
    const bounds = computeBounds(trajectoryPath, telemetry, viewMode);

    // Apply zoom
    const cx = (bounds.minX + bounds.maxX) / 2;
    const cy = (bounds.minY + bounds.maxY) / 2;
    const rangeX = (bounds.maxX - bounds.minX) / zoomLevel;
    const rangeY = (bounds.maxY - bounds.minY) / zoomLevel;
    const viewBounds = {
      minX: cx - rangeX / 2,
      maxX: cx + rangeX / 2,
      minY: cy - rangeY / 2,
      maxY: cy + rangeY / 2,
    };

    // Scale factor to convert panOffset (pixels) to coordinate space
    const pxToCoordX = (viewBounds.maxX - viewBounds.minX) / CANVAS_W;
    const pxToCoordY = (viewBounds.maxY - viewBounds.minY) / CANVAS_H;

    // Apply pan offset in coordinate space
    viewBounds.minX -= panOffset.x * pxToCoordX;
    viewBounds.maxX -= panOffset.x * pxToCoordX;
    viewBounds.minY += panOffset.y * pxToCoordY; // inverted Y
    viewBounds.maxY += panOffset.y * pxToCoordY;

    const toCanvas = (x, y) => {
      const px = ((x - viewBounds.minX) / (viewBounds.maxX - viewBounds.minX)) * CANVAS_W;
      const py = CANVAS_H - ((y - viewBounds.minY) / (viewBounds.maxY - viewBounds.minY)) * CANVAS_H;
      return [px, py];
    };

    // Earth
    const [earthX, earthY] = toCanvas(0, 0);
    const earthScale = CANVAS_W / (viewBounds.maxX - viewBounds.minX);
    const earthR = Math.max(EARTH_RADIUS_KM * earthScale, 12);

    // Earth atmosphere glow
    const atmosR = earthR + 4;
    const atmosGrad = ctx.createRadialGradient(earthX, earthY, earthR * 0.9, earthX, earthY, atmosR);
    atmosGrad.addColorStop(0, 'rgba(74, 144, 217, 0.2)');
    atmosGrad.addColorStop(1, 'rgba(74, 144, 217, 0)');
    ctx.beginPath();
    ctx.arc(earthX, earthY, atmosR, 0, Math.PI * 2);
    ctx.fillStyle = atmosGrad;
    ctx.fill();

    const earthGrad = ctx.createRadialGradient(earthX - 1, earthY - 1, 0, earthX, earthY, earthR);
    earthGrad.addColorStop(0, '#4a90d9');
    earthGrad.addColorStop(0.7, '#2563eb');
    earthGrad.addColorStop(1, '#1a3a6e');
    ctx.beginPath();
    ctx.arc(earthX, earthY, earthR, 0, Math.PI * 2);
    ctx.fillStyle = earthGrad;
    ctx.fill();

    ctx.fillStyle = '#64748b';
    ctx.font = '600 11px Inter, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Earth', earthX, earthY + earthR + 15);

    // Moon
    if (telemetry?.moonPosition) {
      const [moonX, moonY] = toCanvas(telemetry.moonPosition.x, telemetry.moonPosition.y);
      const moonR = Math.max(1737 * earthScale, 9);
      const moonGrad = ctx.createRadialGradient(moonX - 1, moonY - 1, 0, moonX, moonY, moonR);
      moonGrad.addColorStop(0, '#d1d5db');
      moonGrad.addColorStop(0.8, '#9ca3af');
      moonGrad.addColorStop(1, '#6b7280');
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.fillStyle = moonGrad;
      ctx.fill();

      // Subtle craters
      if (moonR > 5) {
        ctx.beginPath();
        ctx.arc(moonX - moonR * 0.3, moonY - moonR * 0.2, moonR * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(107, 114, 128, 0.4)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(moonX + moonR * 0.25, moonY + moonR * 0.3, moonR * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(107, 114, 128, 0.3)';
        ctx.fill();
      }

      ctx.fillStyle = '#64748b';
      ctx.font = '600 11px Inter, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Moon', moonX, moonY + moonR + 15);
    }

    // Trajectory path — split past/future
    if (trajectoryPath.length > 1) {
      const nowMs = telemetry?.epoch?.getTime() || Date.now();
      const splitIdx = findClosestIndex(trajectoryPath, nowMs);

      // Past trajectory (solid, muted)
      if (splitIdx > 0) {
        ctx.beginPath();
        const [sx, sy] = toCanvas(trajectoryPath[0].x, trajectoryPath[0].y);
        ctx.moveTo(sx, sy);
        for (let i = 1; i <= splitIdx; i++) {
          const [px, py] = toCanvas(trajectoryPath[i].x, trajectoryPath[i].y);
          ctx.lineTo(px, py);
        }
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.55)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Future trajectory (dashed, lower opacity)
      if (splitIdx < trajectoryPath.length - 1) {
        ctx.beginPath();
        const [fs, fy] = toCanvas(trajectoryPath[splitIdx].x, trajectoryPath[splitIdx].y);
        ctx.moveTo(fs, fy);
        for (let i = splitIdx + 1; i < trajectoryPath.length; i++) {
          const [px, py] = toCanvas(trajectoryPath[i].x, trajectoryPath[i].y);
          ctx.lineTo(px, py);
        }
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Current position (Orion) — directional triangle
    if (telemetry) {
      const [ox, oy] = toCanvas(telemetry.position.x, telemetry.position.y);

      // Subtle glow
      const glowGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, 18);
      glowGrad.addColorStop(0, 'rgba(245, 158, 11, 0.4)');
      glowGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.beginPath();
      ctx.arc(ox, oy, 18, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // Draw directional triangle using velocity vector
      const vx = telemetry.velocity?.vx || 0;
      const vy = telemetry.velocity?.vy || 0;
      const angle = Math.atan2(-vy, vx); // negate vy due to canvas Y inversion
      const size = 8;

      ctx.save();
      ctx.translate(ox, oy);
      ctx.rotate(-angle);
      ctx.beginPath();
      ctx.moveTo(size, 0);
      ctx.lineTo(-size * 0.6, -size * 0.5);
      ctx.lineTo(-size * 0.6, size * 0.5);
      ctx.closePath();
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      ctx.restore();

      // Label
      ctx.fillStyle = '#f59e0b';
      ctx.font = '600 11px Inter, system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('Orion', ox + 14, oy + 4);
    }

    // Scale bar
    drawScaleBar(ctx, viewBounds);

  }, [trajectoryPath, telemetry, viewMode, zoomLevel, panOffset]);

  return (
    <div className="bg-space-800 rounded-2xl border border-border overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between border-b border-border">
        <div>
          <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Trajectory</h3>
          <p className="text-[10px] text-label mt-0.5">Earth-centered ecliptic plane projection</p>
        </div>
        <div className="flex gap-1">
          {VIEW_MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`text-[10px] px-2 py-1 rounded font-medium transition-colors ${
                viewMode === mode.id ? 'bg-space-600 text-white' : 'text-label hover:text-slate-300'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative touch-none">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          width={CANVAS_W}
          height={CANVAS_H}
        />

        {/* Controls overlay */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1">
          <ControlButton icon={ZoomIn} onClick={zoomIn} title="Zoom in" />
          <ControlButton icon={ZoomOut} onClick={zoomOut} title="Zoom out" />
          <ControlButton icon={RotateCcw} onClick={resetView} title="Reset view" />
          <ControlButton icon={Crosshair} onClick={() => setViewMode('craft')} title="Center on Orion" />
        </div>
      </div>
    </div>
  );
}

function ControlButton({ icon: Icon, onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-7 h-7 rounded-lg bg-space-900/80 border border-border flex items-center justify-center text-label hover:text-white hover:bg-space-700 transition-colors"
    >
      <Icon size={13} strokeWidth={1.5} />
    </button>
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
  for (let i = 0; i < 60; i++) {
    const x = rng() * CANVAS_W;
    const y = rng() * CANVAS_H;
    const r = rng() * 0.8;
    const alpha = 0.2 + rng() * 0.3;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fill();
  }
}

function drawScaleBar(ctx, bounds) {
  const totalRange = bounds.maxX - bounds.minX;
  // Choose a nice round number for the scale bar
  const niceValues = [10000, 25000, 50000, 100000, 200000];
  let barKm = niceValues[0];
  for (const v of niceValues) {
    if (v < totalRange * 0.3) barKm = v;
  }

  const barPx = (barKm / totalRange) * CANVAS_W;
  const x = CANVAS_W - 16 - barPx;
  const y = CANVAS_H - 16;

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + barPx, y);
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x, y - 3);
  ctx.lineTo(x, y + 3);
  ctx.moveTo(x + barPx, y - 3);
  ctx.lineTo(x + barPx, y + 3);
  ctx.stroke();

  const label = barKm >= 1000 ? `${(barKm / 1000).toFixed(0)}k km` : `${barKm} km`;
  ctx.fillStyle = '#374151';
  ctx.font = '9px Inter, system-ui';
  ctx.textAlign = 'center';
  ctx.fillText(label, x + barPx / 2, y - 5);
}

function mulberry32(a) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
