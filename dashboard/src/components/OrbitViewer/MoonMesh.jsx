import { MOON_RADIUS, COLORS, eciToScene } from './constants.js';

export default function MoonMesh({ moonPosition }) {
  if (!moonPosition) return null;

  const pos = eciToScene(moonPosition);

  return (
    <mesh position={pos}>
      <sphereGeometry args={[MOON_RADIUS, 24, 24]} />
      <meshStandardMaterial
        color={COLORS.moon}
        roughness={0.9}
        metalness={0}
      />
    </mesh>
  );
}
