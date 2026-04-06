import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { eciToScene } from './constants.js';

const GLB_PATH = `${import.meta.env.BASE_URL}models/orion_components.glb`;

// Component names from the GLB for highlighting
const COMPONENT_COLORS = {
  Orion_CrewModule: new THREE.Color('#e8e8e8'),
  Orion_ServiceModule: new THREE.Color('#c8c8c8'),
  Orion_SolarArrays: new THREE.Color('#1a2d52'),
  Orion_HeatShield: new THREE.Color('#1a1a1a'),
};

const HIGHLIGHT_COLOR = new THREE.Color('#00ccff');

const BASE_SCALE = 0.011;
const REFERENCE_DIST = 30; // camera distance where base scale looks right (halfway Earth–Moon)

export default function OrionModel({ position, velocity, highlight }) {
  const groupRef = useRef();
  const innerRef = useRef();
  const { scene } = useGLTF(GLB_PATH);
  const { camera } = useThree();

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone();
      }
    });
    return clone;
  }, [scene]);

  // Apply highlight to a specific component
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        const baseColor = COMPONENT_COLORS[child.name] || new THREE.Color('#aaaaaa');
        if (highlight && child.name === highlight) {
          child.material.emissive = HIGHLIGHT_COLOR;
          child.material.emissiveIntensity = 0.4;
        } else {
          child.material.emissive = new THREE.Color('#000000');
          child.material.emissiveIntensity = 0;
        }
      }
    });
  }, [highlight, clonedScene]);

  const velDir = useMemo(() => {
    if (!velocity) return new THREE.Vector3(1, 0, 0);
    return new THREE.Vector3(
      velocity.vx,
      velocity.vz,
      -velocity.vy
    ).normalize();
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

    // Dynamic scale: smaller when camera is close (near Moon), larger when far away
    if (innerRef.current) {
      const dist = camera.position.distanceTo(groupRef.current.position);
      const factor = Math.max(0.2, Math.min(1.5, dist / REFERENCE_DIST));
      const s = BASE_SCALE * factor;
      innerRef.current.scale.setScalar(s);
    }
  });

  if (!position) return null;

  const initialPos = eciToScene(position);

  return (
    <group ref={groupRef} position={initialPos}>
      {/* Scale adapts to camera distance — see useFrame above */}
      <group ref={innerRef} scale={BASE_SCALE} rotation={[0, Math.PI, 0]}>
        <primitive object={clonedScene} />
      </group>
      {/* Warm glow for visibility at distance */}
      <pointLight color="#ff6b4a" intensity={2} distance={30} decay={2} />
    </group>
  );
}

useGLTF.preload('/models/orion_components.glb');
