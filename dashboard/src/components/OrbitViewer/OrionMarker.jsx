import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { eciToScene } from './constants.js';

// Build spacecraft oriented with nose along +Z
// lookAt() will point +Z toward velocity vector
function SolarPanel({ angle }) {
  // Each panel arm: 3 segments with small gaps, rotated around the SM
  const segments = useMemo(() => {
    const offset = 2.2; // Z position along service module
    const segLength = 1.35;
    const gap = 0.15;
    const positions = [];
    for (let i = 0; i < 3; i++) {
      const dist = 1.0 + i * (segLength + gap) + segLength / 2;
      positions.push(dist);
    }
    return positions.map((dist) => ({
      position: [
        Math.cos(angle) * dist,
        Math.sin(angle) * dist,
        -offset,
      ],
      rotation: [0, 0, angle],
    }));
  }, [angle]);

  return (
    <group>
      {segments.map((seg, i) => (
        <mesh key={i} position={seg.position} rotation={seg.rotation}>
          <boxGeometry args={[1.35, 0.04, 0.9]} />
          <meshStandardMaterial
            color="#1a2d52"
            metalness={0.3}
            roughness={0.4}
            emissive="#0a1a33"
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function OrionMarker({ position, velocity }) {
  const groupRef = useRef();

  const velDir = useMemo(() => {
    if (!velocity) return new THREE.Vector3(1, 0, 0);
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

    // Orient spacecraft along velocity vector
    const target = new THREE.Vector3(
      pos[0] + velDir.x,
      pos[1] + velDir.y,
      pos[2] + velDir.z
    );
    groupRef.current.lookAt(target);
  });

  if (!position) return null;

  const initialPos = eciToScene(position);

  // Panel angles: X-configuration at 45°, 135°, 225°, 315°
  const panelAngles = [
    Math.PI * 0.25,
    Math.PI * 0.75,
    Math.PI * 1.25,
    Math.PI * 1.75,
  ];

  return (
    <group ref={groupRef} position={initialPos} scale={0.15}>
      {/* === NOSE (forward, +Z) === */}

      {/* Docking ring */}
      <mesh position={[0, 0, 1.95]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.25, 0.05, 8, 16]} />
        <meshStandardMaterial color="#dddddd" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Crew Module — cone with wide end forward, tip aft */}
      <mesh position={[0, 0, 0.9]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.8, 1.8, 16]} />
        <meshStandardMaterial
          color="#e8e8e8"
          metalness={0.3}
          roughness={0.4}
          emissive="#222222"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Heat shield — dark disk at capsule base */}
      <mesh position={[0, 0, -0.05]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.85, 0.85, 0.1, 16]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.1}
          roughness={0.9}
        />
      </mesh>

      {/* === SERVICE MODULE (behind heat shield, toward -Z) === */}

      {/* Service module body */}
      <mesh position={[0, 0, -1.4]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.85, 0.75, 2.5, 16]} />
        <meshStandardMaterial
          color="#c8c8c8"
          metalness={0.6}
          roughness={0.2}
          emissive="#111111"
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* Gold foil band accent on service module */}
      <mesh position={[0, 0, -0.8]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.87, 0.87, 0.3, 16]} />
        <meshStandardMaterial
          color="#b8860b"
          metalness={0.7}
          roughness={0.2}
          emissive="#5a4306"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Solar panels — 4 arms in X-configuration */}
      {panelAngles.map((angle, i) => (
        <SolarPanel key={i} angle={angle} />
      ))}

      {/* === AFT (-Z) === */}

      {/* Engine nozzle */}
      <mesh position={[0, 0, -2.95]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.4, 0.8, 8]} />
        <meshStandardMaterial
          color="#444444"
          metalness={0.4}
          roughness={0.6}
        />
      </mesh>

      {/* Warm glow for visibility at distance */}
      <pointLight
        color="#ff6b4a"
        intensity={2}
        distance={30}
        decay={2}
      />
    </group>
  );
}
