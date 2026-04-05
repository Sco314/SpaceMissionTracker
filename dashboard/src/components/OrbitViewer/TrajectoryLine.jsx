import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { COLORS, eciToScene } from './constants.js';

export default function TrajectoryLine({ path, currentTime }) {
  const { pastPoints, futurePoints } = useMemo(() => {
    if (!path || path.length === 0) return { pastPoints: [], futurePoints: [] };

    const now = currentTime ? currentTime.getTime() : Date.now();

    // Find split index
    let splitIdx = path.length;
    for (let i = 0; i < path.length; i++) {
      if (path[i].epochMs > now) {
        splitIdx = i;
        break;
      }
    }

    const toPoints = (slice) => slice.map(p => eciToScene(p));

    // Overlap by 1 point for continuity
    const past = toPoints(path.slice(0, splitIdx + 1));
    const future = toPoints(path.slice(Math.max(0, splitIdx - 1)));

    return { pastPoints: past, futurePoints: future };
  }, [path, currentTime]);

  return (
    <>
      {pastPoints.length >= 2 && (
        <Line
          points={pastPoints}
          color={COLORS.trajectoryPast}
          lineWidth={2}
          transparent
          opacity={0.7}
        />
      )}
      {futurePoints.length >= 2 && (
        <Line
          points={futurePoints}
          color={COLORS.trajectoryFuture}
          lineWidth={1}
          transparent
          opacity={0.25}
          dashed
          dashSize={0.5}
          gapSize={0.3}
        />
      )}
    </>
  );
}
