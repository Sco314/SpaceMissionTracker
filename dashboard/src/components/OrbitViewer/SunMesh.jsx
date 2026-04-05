import * as THREE from 'three';
import { SUN_POSITION } from './constants.js';

export default function SunMesh() {
  // Normalize Sun direction for the directional light
  const sunDir = new THREE.Vector3(...SUN_POSITION).normalize();

  return (
    <>
      {/* Directional light from Sun direction — illuminates entire scene uniformly */}
      <directionalLight
        position={SUN_POSITION}
        intensity={3.0}
        color="#fff8f0"
      />

      {/* Sun visual */}
      <group position={SUN_POSITION}>
        {/* Sun sphere — self-illuminated */}
        <mesh>
          <sphereGeometry args={[4, 32, 32]} />
          <meshBasicMaterial color="#fff4e0" />
        </mesh>

        {/* Inner glow */}
        <mesh>
          <sphereGeometry args={[5.5, 32, 32]} />
          <meshBasicMaterial
            color="#ffaa33"
            transparent
            opacity={0.2}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Outer glow */}
        <mesh>
          <sphereGeometry args={[9, 32, 32]} />
          <meshBasicMaterial
            color="#ff8800"
            transparent
            opacity={0.08}
            side={THREE.BackSide}
          />
        </mesh>
      </group>
    </>
  );
}
