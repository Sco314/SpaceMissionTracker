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

// Cubic ease-in-out for smooth camera transitions
const easeInOut = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// Pre-compute mission view center: midpoint between Earth and Moon at flyby
const flybyEvent = MISSION_EVENTS.find(e => e.type === 'lunar-flyby');
const flybyMoonEci = getMoonPosition(flybyEvent.time.getTime());
const flybyMoonScene = eciToScene(flybyMoonEci);
const missionCenter = [flybyMoonScene[0] * 0.5, flybyMoonScene[1] * 0.5, flybyMoonScene[2] * 0.5];

// Phase boundary: 33% of replay = ~5 seconds fly-by intro
const P1_END = 0.33;

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

  // Pre-compute launch point geometry for replay camera fly-by
  const replayGeo = useMemo(() => {
    if (!vectors || vectors.length === 0) return null;
    const first = vectors[0];
    const firstDist = Math.sqrt(first.x ** 2 + first.y ** 2 + first.z ** 2);
    const launchPoint = {
      x: first.x / firstDist * 6371,
      y: first.y / firstDist * 6371,
      z: first.z / firstDist * 6371,
      vx: first.vx, vy: first.vy, vz: first.vz,
    };
    const scLaunch = eciToScene(launchPoint);
    const scL = new THREE.Vector3(scLaunch[0], scLaunch[1], scLaunch[2]);

    // Velocity direction in scene coords
    const vDir = new THREE.Vector3(launchPoint.vx, launchPoint.vz, -launchPoint.vy).normalize();
    // Radial = "up" from Earth surface at launch point
    const radial = scL.clone().normalize();
    // Lateral = perpendicular to velocity and radial
    const lateral = new THREE.Vector3().crossVectors(vDir, radial).normalize();

    const leoAlt = 0.04; // ~400 km above surface

    // Waypoint 1: Camera ahead of spacecraft, facing away (spacecraft behind camera)
    const startPos = new THREE.Vector3(
      scL.x + vDir.x * 1.5,
      scL.y + vDir.y * 1.5 + leoAlt,
      scL.z + vDir.z * 1.5
    );
    const startLookAt = new THREE.Vector3(
      startPos.x + vDir.x * 2,
      startPos.y + vDir.y * 2,
      startPos.z + vDir.z * 2
    );

    // Waypoint 2: Camera drifted backward past spacecraft, slid laterally
    const midPos = new THREE.Vector3(
      scL.x - vDir.x * 1.0 + lateral.x * 0.4,
      scL.y - vDir.y * 1.0 + lateral.y * 0.4 + leoAlt,
      scL.z - vDir.z * 1.0 + lateral.z * 0.4
    );
    const midLookAt = scL.clone();

    // Waypoint 3: Camera directly overhead, looking down
    const endPos = new THREE.Vector3(
      scL.x + lateral.x * 0.15,
      scL.y + 2.0,
      scL.z + lateral.z * 0.15
    );
    const endLookAt = scL.clone();

    return { launchPoint, startPos, startLookAt, midPos, midLookAt, endPos, endLookAt };
  }, [vectors]);

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
      // Teleport camera to fly-by start position to avoid lurch
      if (replayGeo) {
        const { startPos } = replayGeo;
        camera.position.set(startPos.x, startPos.y, startPos.z);
      }
    }
  }, [replaying, replayGeo, camera]);

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
      const progress = (replayTime - LAUNCH_TIME.getTime()) / totalMs;

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

        // Phase 1: hold spacecraft at launch point so only the camera moves
        if (progress < P1_END && replayGeo) {
          const lp = replayGeo.launchPoint;
          replayTelemetryRef.current.position = { x: lp.x, y: lp.y, z: lp.z };
          replayTelemetryRef.current.velocity = { vx: lp.vx, vy: lp.vy, vz: lp.vz };
        }
      }

      // Camera choreography based on progress
      if (replayGeo) {
        const { startPos, startLookAt, midPos, midLookAt, endPos, endLookAt } = replayGeo;

        if (progress < P1_END) {
          // Phase 1: Fly-by intro — camera flies past stationary spacecraft
          const p1 = progress / P1_END;
          const ep1 = easeInOut(p1);

          if (ep1 < 0.5) {
            const t = ep1 / 0.5;
            targetPos.current.copy(startPos).lerp(midPos, t);
            targetLookAt.current.copy(startLookAt).lerp(midLookAt, t);
          } else {
            const t = (ep1 - 0.5) / 0.5;
            targetPos.current.copy(midPos).lerp(endPos, t);
            targetLookAt.current.copy(midLookAt).lerp(endLookAt, t);
          }
          camera.position.lerp(targetPos.current, 0.10);
          controlsRef.current.target.lerp(targetLookAt.current, 0.10);

        } else {
          // Phase 2: Pull-out to mission overview — spacecraft now moves
          const p2 = (progress - P1_END) / (1.0 - P1_END);
          const ep2 = easeInOut(p2);

          const p2EndPos = new THREE.Vector3(missionCenter[0], missionCenter[1] + 55, missionCenter[2] + 25);
          const p2EndLookAt = new THREE.Vector3(missionCenter[0], missionCenter[1], missionCenter[2]);

          targetPos.current.copy(endPos).lerp(p2EndPos, ep2);
          targetLookAt.current.copy(endLookAt).lerp(p2EndLookAt, ep2);

          // Blend toward spacecraft follow in last 10% for smooth handoff
          if (p2 > 0.9 && state) {
            const blendOut = (p2 - 0.9) / 0.1;
            const scPos = eciToScene(state);
            const vD = new THREE.Vector3(state.vx, state.vz, -state.vy).normalize();
            const followPos = new THREE.Vector3(
              scPos[0] - vD.x * 2.5,
              scPos[1] - vD.y * 2.5 + 1.5,
              scPos[2] - vD.z * 2.5
            );
            const followLookAt = new THREE.Vector3(scPos[0], scPos[1], scPos[2]);
            targetPos.current.lerp(followPos, blendOut);
            targetLookAt.current.lerp(followLookAt, blendOut);
          }

          camera.position.lerp(targetPos.current, 0.06);
          controlsRef.current.target.lerp(targetLookAt.current, 0.06);
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

      const distMoonKm = telemetry.distMoonKm || Infinity;
      const moonPos = telemetry.moonPosition ? eciToScene(telemetry.moonPosition) : null;

      // Moon-aware camera: blend in when < 70k km, full at < 15k km
      // Departure: blend out, fully gone by 50k km
      let moonBlend = 0;
      if (moonPos && distMoonKm < 70000) {
        const scV = new THREE.Vector3(...pos);
        const moonV = new THREE.Vector3(...moonPos);
        const toMoon = moonV.clone().sub(scV);
        const velScene = new THREE.Vector3(vel.vx, vel.vz, -vel.vy);
        const approaching = velScene.dot(toMoon) > 0;

        const outerThreshold = approaching ? 70000 : 50000;
        const innerThreshold = 15000;
        moonBlend = Math.max(0, Math.min(1,
          (outerThreshold - distMoonKm) / (outerThreshold - innerThreshold)
        ));
      }

      if (moonBlend > 0.001 && moonPos) {
        const scV = new THREE.Vector3(...pos);
        const moonV = new THREE.Vector3(...moonPos);
        const toMoon = moonV.clone().sub(scV).normalize();

        // Side vector perpendicular to spacecraft→Moon direction
        const up = new THREE.Vector3(0, 1, 0);
        const right = new THREE.Vector3().crossVectors(toMoon, up).normalize();

        // Camera behind spacecraft (away from Moon), offset to side so
        // spacecraft is in foreground and Moon is visible in background
        const moonCamX = pos[0] - toMoon.x * 3 + right.x * 1.2;
        const moonCamY = pos[1] - toMoon.y * 3 + 1.0;
        const moonCamZ = pos[2] - toMoon.z * 3 + right.z * 1.2;

        // Default follow position (behind velocity vector)
        const defCamX = pos[0] - vDir.x * 2.5;
        const defCamY = pos[1] - vDir.y * 2.5 + 1.5;
        const defCamZ = pos[2] - vDir.z * 2.5;

        // Lerp between default and moon-aware based on blend factor
        const b = moonBlend;
        targetPos.current.set(
          defCamX + (moonCamX - defCamX) * b,
          defCamY + (moonCamY - defCamY) * b,
          defCamZ + (moonCamZ - defCamZ) * b
        );
      } else {
        // Default spacecraft follow — behind velocity vector
        targetPos.current.set(
          pos[0] - vDir.x * 2.5,
          pos[1] - vDir.y * 2.5 + 1.5,
          pos[2] - vDir.z * 2.5
        );
      }

      // Always look at spacecraft (keep it centered)
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
