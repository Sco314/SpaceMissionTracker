import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { eciToScene } from './constants.js';
import moonEphemerisRaw from '../../data/moon_ephemeris.json';

// Pre-process ephemeris into scene-coordinate points
const moonPoints = moonEphemerisRaw.map(m => ({
  epochMs: new Date(m.epoch).getTime(),
  pos: eciToScene(m),
}));

export default function MoonTrail({ currentTime }) {
  const { pastPoints, futurePoints } = useMemo(() => {
    if (moonPoints.length < 2) return { pastPoints: [], futurePoints: [] };

    const now = currentTime ? currentTime.getTime() : Date.now();

    let splitIdx = moonPoints.length;
    for (let i = 0; i < moonPoints.length; i++) {
      if (moonPoints[i].epochMs > now) {
        splitIdx = i;
        break;
      }
    }

    const toArr = (slice) => slice.map(p => p.pos);

    const past = toArr(moonPoints.slice(0, splitIdx + 1));
    const future = toArr(moonPoints.slice(Math.max(0, splitIdx - 1)));

    return { pastPoints: past, futurePoints: future };
  }, [currentTime]);

  return (
    <>
      {/* Moon past trail — dim solid */}
      {pastPoints.length >= 2 && (
        <Line
          points={pastPoints}
          color="#9ca3af"
          lineWidth={1}
          transparent
          opacity={0.3}
        />
      )}
      {/* Moon future trail — dashed, slightly brighter */}
      {futurePoints.length >= 2 && (
        <Line
          points={futurePoints}
          color="#d1d5db"
          lineWidth={1.2}
          transparent
          opacity={0.45}
          dashed
          dashSize={0.8}
          gapSize={0.4}
        />
      )}
    </>
  );
}
