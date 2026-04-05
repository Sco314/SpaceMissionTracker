import { useRef, useEffect, Suspense } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import EarthMesh from './EarthMesh.jsx';
import MoonMesh from './MoonMesh.jsx';
import SunMesh from './SunMesh.jsx';
import OrionModel from './OrionModel.jsx';
import TrajectoryLine from './TrajectoryLine.jsx';
import { eciToScene } from './constants.js';

export default function OrbitScene({ trajectoryPath, telemetry, viewMode }) {
  const controlsRef = useRef();
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 60, 0));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const userInteracting = useRef(false);
  const prevViewMode = useRef(viewMode);

  // Set initial camera
  useEffect(() => {
    camera.position.set(0, 50, 30);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Animate camera for view modes
  useFrame(() => {
    if (!controlsRef.current) return;

    // Detect view mode switch — animate transition even if user was dragging
    if (viewMode !== prevViewMode.current) {
      prevViewMode.current = viewMode;
      userInteracting.current = false;
    }

    // Let user freely orbit without camera fighting back
    if (userInteracting.current) {
      controlsRef.current.update();
      return;
    }

    if (viewMode === 'spacecraft' && telemetry?.position) {
      const pos = eciToScene(telemetry.position);
      // Offset behind and above spacecraft
      const vel = telemetry.velocity;
      const vDir = new THREE.Vector3(vel.vx, vel.vz, -vel.vy).normalize();
      targetPos.current.set(
        pos[0] - vDir.x * 5 + 0,
        pos[1] - vDir.y * 5 + 3,
        pos[2] - vDir.z * 5
      );
      targetLookAt.current.set(pos[0], pos[1], pos[2]);

      camera.position.lerp(targetPos.current, 0.03);
      controlsRef.current.target.lerp(targetLookAt.current, 0.03);
    } else if (viewMode === 'mission') {
      targetPos.current.set(0, 50, 30);
      targetLookAt.current.set(0, 0, 0);
      camera.position.lerp(targetPos.current, 0.03);
      controlsRef.current.target.lerp(targetLookAt.current, 0.03);
    }

    controlsRef.current.update();
  });

  return (
    <>
      <ambientLight intensity={0.25} />

      <Stars radius={200} depth={50} count={800} factor={3} fade speed={0.5} />

      <SunMesh />
      <Suspense fallback={null}>
        <EarthMesh />
        <MoonMesh moonPosition={telemetry?.moonPosition} />
        <OrionModel
          position={telemetry?.position}
          velocity={telemetry?.velocity}
        />
      </Suspense>
      <TrajectoryLine
        path={trajectoryPath}
        currentTime={telemetry?.epoch}
      />

      <OrbitControls
        ref={controlsRef}
        onStart={() => { userInteracting.current = true; }}
        onEnd={() => { userInteracting.current = false; }}
        enableDamping
        dampingFactor={0.1}
        minDistance={1}
        maxDistance={150}
        enablePan={false}
      />
    </>
  );
}
