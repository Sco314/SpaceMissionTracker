import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { MOON_RADIUS, eciToScene } from './constants.js';

const BASE = import.meta.env.BASE_URL;

export default function MoonMesh({ moonPosition }) {
  const moonRef = useRef();
  const moonMap = useTexture(`${BASE}textures/moon.jpg`);

  useFrame((_, delta) => {
    if (moonRef.current) moonRef.current.rotation.y += delta * 0.02;
  });

  if (!moonPosition) return null;

  const pos = eciToScene(moonPosition);

  return (
    <mesh ref={moonRef} position={pos}>
      <sphereGeometry args={[MOON_RADIUS, 48, 48]} />
      <meshStandardMaterial
        map={moonMap}
        roughness={0.9}
        metalness={0}
      />
    </mesh>
  );
}
