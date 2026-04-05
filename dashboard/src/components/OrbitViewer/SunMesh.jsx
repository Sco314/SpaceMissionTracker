import * as THREE from 'three';
import { SUN_POSITION } from './constants.js';

export default function SunMesh() {
  return (
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
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[8, 32, 32]} />
        <meshBasicMaterial
          color="#ff8800"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Sun light — illuminates the scene from Sun direction */}
      <pointLight color="#fff8f0" intensity={3} distance={500} decay={1} />
    </group>
  );
}
