import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { EARTH_RADIUS, COLORS } from './constants.js';
import * as THREE from 'three';

export default function EarthMesh() {
  const glowRef = useRef();

  // Slow rotation for visual effect
  useFrame((_, delta) => {
    if (glowRef.current) {
      glowRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group>
      {/* Earth sphere */}
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS, 32, 32]} />
        <meshStandardMaterial
          color={COLORS.earth}
          roughness={0.8}
          metalness={0.1}
          emissive={COLORS.earth}
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Atmosphere glow ring */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[EARTH_RADIUS * 1.15, 32, 32]} />
        <meshBasicMaterial
          color={COLORS.earthGlow}
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}
