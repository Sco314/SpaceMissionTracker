import { useRef, useEffect, useMemo, Suspense } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import EarthMesh from './EarthMesh.jsx';
import MoonMesh from './MoonMesh.jsx';
import MoonTrail from './MoonTrail.jsx';
import SunMesh from './SunMesh.jsx';
import OrionModel from './OrionModel.jsx';
import TrajectoryLine from './TrajectoryLine.jsx';
import { eciToScene } from './constants.js';
import { LAUNCH_TIME, MISSION_EVENTS } from '../../lib/mission-data.js';
import { getMoonPosition } from '../../lib/useMissionData.js';
import { hermiteInterpolate } from '../../lib/interpolator.js';
import { distanceFromEarth, speed } from '../../lib/coordinates.js';

// Pre-compute mission view center: midpoint between Earth and Moon at flyby
const flybyEvent = MISSION_EVENTS.find(e => e.type === 'lunar-flyby');
const flybyMoonEci = getMoonPosition(flybyEvent.time.getTime());
const flybyMoonScene = eciToScene(flybyMoonEci);
const missionCenter = [flybyMoonScene[0] * 0.5, flybyMoonScene[1] * 0.5, flybyMoonScene[2] * 0.5];

export default function OrbitScene({ trajectoryPath, telemetry, viewMode, setViewMode, replaying, setReplaying, vectors }) {
  const controlsRef = useRef();
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 60, 0));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const userInteracting = useRef(false);
  const prevViewMode = useRef(viewMode);

  // Replay state
  const replayTimeRef = useRef(0);
  const replayTelemetryRef = useRef(null);
  const replayStartedRef = useRef(false);

  // Set initial camera
  useEffect(() => {
    camera.position.set(0, 50, 30);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Reset replay when it starts
  useEffect(() => {
    if (replaying) {
      replayTimeRef.current = LAUNCH_TIME.getTime();
      replayStartedRef.current = true;
      userInteracting.current = false;
    }
  }, [replaying]);

  // Animate camera for view modes
  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    // --- REPLAY MODE ---
    if (replaying && vectors && vectors.length > 0) {
      const now = Date.now();
      const totalMs = now - LAUNCH_TIME.getTime();
      const REPLAY_SPEED = totalMs / 15000; // Cover entire mission in ~15 seconds

      replayTimeRef.current += delta * 1000 * REPLAY_SPEED;
      const replayTime = replayTimeRef.current;

      // End replay when we reach current time — switch to spacecraft view
      if (replayTime >= now) {
        setReplaying(false);
        setViewMode('spacecraft');
        replayTelemetryRef.current = null;
        return;
      }

      // Interpolate spacecraft position at replay time
      const state = hermiteInterpolate(vectors, replayTime);
      if (state) {
        const moonPos = getMoonPosition(replayTime);
        const distMoon = Math.sqrt(
          (state.x - moonPos.x) ** 2 + (state.y - moonPos.y) ** 2 + (state.z - moonPos.z) ** 2
        );
        replayTelemetryRef.current = {
          position: { x: state.x, y: state.y, z: state.z },
          velocity: { vx: state.vx, vy: state.vy, vz: state.vz },
          moonPosition: moonPos,
          epoch: new Date(replayTime),
          met: replayTime - LAUNCH_TIME.getTime(),
          distEarthKm: distanceFromEarth(state),
          distMoonKm: distMoon,
          velocityKms: speed(state),
        };
      }

      // Camera choreography based on progress
      const progress = (replayTime - LAUNCH_TIME.getTime()) / totalMs;

      if (state) {
        const pos = eciToScene(state);

        if (progress < 0.05) {
          // Phase 1: Close-up near Earth
          const vel = state;
          const vDir = new THREE.Vector3(vel.vx, vel.vz, -vel.vy).normalize();
          targetPos.current.set(
            pos[0] - vDir.x * 3,
            pos[1] - vDir.y * 3 + 2,
            pos[2] - vDir.z * 3
          );
          targetLookAt.current.set(pos[0], pos[1], pos[2]);
          camera.position.lerp(targetPos.current, 0.08);
          controlsRef.current.target.lerp(targetLookAt.current, 0.08);
        } else if (progress < 0.8) {
          // Phase 2: Pull out to mission overview
          targetPos.current.set(missionCenter[0], missionCenter[1] + 55, missionCenter[2] + 25);
          targetLookAt.current.set(missionCenter[0], missionCenter[1], missionCenter[2]);
          camera.position.lerp(targetPos.current, 0.04);
          controlsRef.current.target.lerp(targetLookAt.current, 0.04);
        } else {
          // Phase 3: Transition to spacecraft follow
          const vel = state;
          const vDir = new THREE.Vector3(vel.vx, vel.vz, -vel.vy).normalize();
          targetPos.current.set(
            pos[0] - vDir.x * 5,
            pos[1] - vDir.y * 5 + 3,
            pos[2] - vDir.z * 5
          );
          targetLookAt.current.set(pos[0], pos[1], pos[2]);
          camera.position.lerp(targetPos.current, 0.05);
          controlsRef.current.target.lerp(targetLookAt.current, 0.05);
        }
      }

      controlsRef.current.update();
      return;
    }

    // --- NORMAL MODE ---

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
      const vel = telemetry.velocity;
      const vDir = new THREE.Vector3(vel.vx, vel.vz, -vel.vy).normalize();
      targetPos.current.set(
        pos[0] - vDir.x * 2.5,
        pos[1] - vDir.y * 2.5 + 1.5,
        pos[2] - vDir.z * 2.5
      );
      targetLookAt.current.set(pos[0], pos[1], pos[2]);
      camera.position.lerp(targetPos.current, 0.03);
      controlsRef.current.target.lerp(targetLookAt.current, 0.03);

    } else if (viewMode === 'moon' && telemetry?.moonPosition && telemetry?.position) {
      const moonPos = eciToScene(telemetry.moonPosition);
      const moonV = new THREE.Vector3(...moonPos);
      const toEarth = new THREE.Vector3(0, 0, 0).sub(moonV).normalize();
      targetPos.current.set(
        moonPos[0] - toEarth.x * 3,
        moonPos[1] - toEarth.y * 3 + 1.5,
        moonPos[2] - toEarth.z * 3
      );
      targetLookAt.current.set(
        moonPos[0] + toEarth.x * 2,
        moonPos[1] + toEarth.y * 2,
        moonPos[2] + toEarth.z * 2
      );
      camera.position.lerp(targetPos.current, 0.03);
      controlsRef.current.target.lerp(targetLookAt.current, 0.03);

    } else if (viewMode === 'earth') {
      if (telemetry?.position) {
        const orionPos = eciToScene(telemetry.position);
        // Camera behind Earth (opposite side from spacecraft), looking past Earth toward Orion
        const toOrion = new THREE.Vector3(...orionPos).normalize();
        targetPos.current.set(
          -toOrion.x * 3,
          -toOrion.y * 3 + 1,
          -toOrion.z * 3
        );
        // Look at Earth center — Earth will be in foreground, spacecraft trajectory beyond
        targetLookAt.current.set(0, 0, 0);
      } else {
        targetPos.current.set(3, 2, 3);
        targetLookAt.current.set(0, 0, 0);
      }
      camera.position.lerp(targetPos.current, 0.03);
      controlsRef.current.target.lerp(targetLookAt.current, 0.03);

    } else if (viewMode === 'mission') {
      targetPos.current.set(missionCenter[0], missionCenter[1] + 55, missionCenter[2] + 25);
      targetLookAt.current.set(missionCenter[0], missionCenter[1], missionCenter[2]);
      camera.position.lerp(targetPos.current, 0.03);
      controlsRef.current.target.lerp(targetLookAt.current, 0.03);
    }

    controlsRef.current.update();
  });

  // Use replay telemetry when replaying, otherwise real telemetry
  const activeTelemetry = replaying && replayTelemetryRef.current ? replayTelemetryRef.current : telemetry;

  return (
    <>
      <ambientLight intensity={1.5} />

      <Stars radius={200} depth={50} count={800} factor={3} fade speed={0.5} />

      <SunMesh />
      <Suspense fallback={null}>
        <EarthMesh />
        <MoonMesh moonPosition={activeTelemetry?.moonPosition} />
        <OrionModel
          position={activeTelemetry?.position}
          velocity={activeTelemetry?.velocity}
        />
      </Suspense>
      <TrajectoryLine
        path={trajectoryPath}
        currentTime={activeTelemetry?.epoch}
      />

      {/* Moon orbital trail from ephemeris data */}
      <MoonTrail currentTime={activeTelemetry?.epoch} />

      <OrbitControls
        ref={controlsRef}
        onStart={() => { if (!replaying) userInteracting.current = true; }}
        enableDamping
        dampingFactor={0.1}
        minDistance={1}
        maxDistance={300}
        enablePan={false}
      />
    </>
  );
}
