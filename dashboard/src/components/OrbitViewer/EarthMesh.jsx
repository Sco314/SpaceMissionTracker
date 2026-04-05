import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { EARTH_RADIUS, COLORS } from './constants.js';

const BASE = import.meta.env.BASE_URL;

export default function EarthMesh() {
  const earthRef = useRef();
  const cloudsRef = useRef();
  const glowRef = useRef();

  const [dayMap, cloudsMap] = useTexture([
    `${BASE}textures/earth_day.jpg`,
    `${BASE}textures/earth_clouds.png`,
  ]);

  // Slow rotation for Earth + slightly faster for clouds
  useFrame((_, delta) => {
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.05;
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.08;
    if (glowRef.current) glowRef.current.rotation.y += delta * 0.03;
  });

  return (
    <group>
      {/* Earth sphere with day texture */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
        <meshStandardMaterial
          map={dayMap}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Cloud layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[EARTH_RADIUS * 1.01, 64, 64]} />
        <meshStandardMaterial
          map={cloudsMap}
          transparent
          opacity={0.35}
          depthWrite={false}
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
