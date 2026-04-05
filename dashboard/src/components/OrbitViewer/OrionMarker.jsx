import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS, eciToScene, KM_TO_SCENE } from './constants.js';

export default function OrionMarker({ position, velocity }) {
  const groupRef = useRef();

  const velDir = useMemo(() => {
    if (!velocity) return new THREE.Vector3(1, 0, 0);
    // Convert velocity to scene coordinates (same transform as position)
    const dir = new THREE.Vector3(
      velocity.vx,
      velocity.vz,
      -velocity.vy
    ).normalize();
    return dir;
  }, [velocity?.vx, velocity?.vy, velocity?.vz]);

  useFrame(() => {
    if (!groupRef.current || !position) return;
    const pos = eciToScene(position);
    groupRef.current.position.set(pos[0], pos[1], pos[2]);

    // Orient cone along velocity vector
    const target = new THREE.Vector3(
      pos[0] + velDir.x,
      pos[1] + velDir.y,
      pos[2] + velDir.z
    );
    groupRef.current.lookAt(target);
  });

  if (!position) return null;

  const initialPos = eciToScene(position);

  return (
    <group ref={groupRef} position={initialPos}>
      {/* Spacecraft cone */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.12, 0.35, 8]} />
        <meshStandardMaterial
          color={COLORS.orion}
          emissive={COLORS.orion}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Glow */}
      <pointLight
        color={COLORS.orion}
        intensity={2}
        distance={5}
        decay={2}
      />
    </group>
  );
}
