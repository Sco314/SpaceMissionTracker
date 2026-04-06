import { useRef, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Line, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { eciToScene } from './constants.js';
import moonEphemerisRaw from '../../data/moon_ephemeris.json';

// Cyan color for Moon trail
const MOON_TRAIL_PAST = '#22d3ee';
const MOON_TRAIL_FUTURE = '#67e8f9';

// Pre-process ephemeris into scene-coordinate points
const moonPoints = moonEphemerisRaw.map(m => ({
  epochMs: new Date(m.epoch).getTime(),
  pos: eciToScene(m),
}));

// Billboard label that scales with camera distance
function MoonLabel({ position }) {
  const groupRef = useRef();
  const { camera } = useThree();

  useFrame(() => {
    if (!groupRef.current) return;
    const labelPos = new THREE.Vector3(...position);
    const dist = camera.position.distanceTo(labelPos);
    const s = Math.max(0.15, Math.min(1.5, dist * 0.02));
    groupRef.current.scale.setScalar(s);
  });

  return (
    <group ref={groupRef} position={position}>
      <Billboard>
        <Text
          fontSize={1}
          color={MOON_TRAIL_FUTURE}
          anchorX="center"
          anchorY="bottom"
          fillOpacity={0.7}
        >
          MOON
        </Text>
      </Billboard>
    </group>
  );
}

export default function MoonTrail({ currentTime }) {
  const { pastPoints, futurePoints, labelPositions } = useMemo(() => {
    if (moonPoints.length < 2) return { pastPoints: [], futurePoints: [], labelPositions: [] };

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

    // Pick 3 label positions along the future trail
    const labels = [];
    if (future.length >= 3) {
      for (let i = 1; i <= 3; i++) {
        const idx = Math.floor((i / 4) * (future.length - 1));
        const p = future[idx];
        labels.push([p[0], p[1] + 0.3, p[2]]);
      }
    }

    return { pastPoints: past, futurePoints: future, labelPositions: labels };
  }, [currentTime]);

  return (
    <>
      {/* Moon past trail — dim solid cyan */}
      {pastPoints.length >= 2 && (
        <Line
          points={pastPoints}
          color={MOON_TRAIL_PAST}
          lineWidth={1}
          transparent
          opacity={0.3}
        />
      )}
      {/* Moon future trail — dashed, brighter cyan */}
      {futurePoints.length >= 2 && (
        <Line
          points={futurePoints}
          color={MOON_TRAIL_FUTURE}
          lineWidth={1.2}
          transparent
          opacity={0.45}
          dashed
          dashSize={0.8}
          gapSize={0.4}
        />
      )}
      {/* Billboard labels along future trail */}
      {labelPositions.map((pos, i) => (
        <MoonLabel key={i} position={pos} />
      ))}
    </>
  );
}
