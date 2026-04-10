import { useRef, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { eciToScene } from './constants.js';
import { MISSION_EVENTS } from '../../lib/mission-data.js';

const MI_TO_KM = 1.60934;
const EARTH_R_KM = 6371;

/**
 * Milestone markers along the return path to Earth.
 * Each entry has:
 *   label    – human name (null for round-number distance markers)
 *   miles    – canonical value in miles
 *   altitude – true  → miles above Earth surface
 *              false → miles from Earth center
 *   desc     – optional extra descriptor
 */
const MILESTONES = [
  { label: 'Low Earth Orbit', miles: 671, altitude: true },
  { label: 'Medium Earth Orbit', miles: 2236, altitude: true },
  { label: 'Geosynchronous Orbit', miles: 11739.5, altitude: true },
  { label: 'High Earth Orbit', miles: 22236, altitude: true },
  { label: null, miles: 30000, altitude: false },
  { label: null, miles: 40000, altitude: false },
  { label: null, miles: 50000, altitude: false },
  { label: null, miles: 60000, altitude: false },
  { label: null, miles: 70000, altitude: false },
  { label: null, miles: 80000, altitude: false },
  { label: null, miles: 90000, altitude: false },
  { label: null, miles: 100000, altitude: false },
  { label: 'Halfway Earth\u2013Moon', miles: 119428, altitude: false },
].map(m => ({
  ...m,
  // Distance from Earth center in km (for matching trajectory positions)
  distCenterKm: m.altitude ? m.miles * MI_TO_KM + EARTH_R_KM : m.miles * MI_TO_KM,
}));

const HALFWAY_LABEL = 'Halfway Earth\u2013Moon';

const flybyMs = MISSION_EVENTS.find(e => e.type === 'lunar-flyby').time.getTime();

/**
 * Find positions on the return trajectory for each milestone.
 * Walk the return leg (post-flyby) and interpolate where the trajectory's
 * distance from Earth center crosses each milestone distance.
 */
function findMilestonePositions(trajectoryPath) {
  if (!trajectoryPath || trajectoryPath.length < 2) return [];

  const returnLeg = trajectoryPath.filter(p => p.epochMs > flybyMs);
  if (returnLeg.length < 2) return [];

  const results = [];

  for (const ms of MILESTONES) {
    const target = ms.distCenterKm;
    let found = null;

    for (let i = 1; i < returnLeg.length; i++) {
      const p0 = returnLeg[i - 1];
      const p1 = returnLeg[i];
      const d0 = Math.sqrt(p0.x ** 2 + p0.y ** 2 + p0.z ** 2);
      const d1 = Math.sqrt(p1.x ** 2 + p1.y ** 2 + p1.z ** 2);

      // Check if target distance falls between these two trajectory points
      if ((d0 >= target && d1 <= target) || (d0 <= target && d1 >= target)) {
        const range = d0 - d1;
        if (Math.abs(range) < 0.01) continue;
        const t = (d0 - target) / range;
        if (t < 0 || t > 1) continue;
        found = {
          x: p0.x + t * (p1.x - p0.x),
          y: p0.y + t * (p1.y - p0.y),
          z: p0.z + t * (p1.z - p0.z),
        };
        break;
      }
    }

    if (found) {
      results.push({ ...ms, position: eciToScene(found) });
    }
  }

  return results;
}

function MilestoneMarker({ position, milestone, viewMode, craftScenePos, distanceUnit }) {
  const groupRef = useRef();
  const { camera } = useThree();
  // Persistent vectors to avoid GC in the render loop
  const pos3 = useRef(new THREE.Vector3(...position));
  const craftV = useRef(new THREE.Vector3());

  // Build display text
  const unit = distanceUnit === 'km' ? 'km' : 'mi';
  const value = distanceUnit === 'km'
    ? Math.round(milestone.miles * MI_TO_KM).toLocaleString()
    : Math.round(milestone.miles).toLocaleString();
  const qualifier = milestone.altitude ? 'above Earth' : 'to Earth';
  const distLine = `${value} ${unit} ${qualifier}`;

  const parts = [];
  if (milestone.label) parts.push(milestone.label);
  parts.push(distLine);
  if (milestone.desc) parts.push(milestone.desc);
  const labelText = parts.join('\n');

  useFrame(() => {
    if (!groupRef.current) return;
    const camDist = camera.position.distanceTo(pos3.current);

    let scale;
    if (viewMode === 'spacecraft' && craftScenePos) {
      craftV.current.set(craftScenePos[0], craftScenePos[1], craftScenePos[2]);
      const distToCraft = craftV.current.distanceTo(pos3.current);
      // Proximity: 1.0 at craft, fades to 0.15 far away
      const proximity = Math.max(0.15, 1.0 / (1 + distToCraft * 0.5));
      const camScale = Math.max(0.08, Math.min(1.5, camDist * 0.015));
      scale = proximity * camScale;
    } else if (viewMode === 'mission' && milestone.label === HALFWAY_LABEL) {
      // Mission view: Halfway marker gets a larger base scale
      scale = Math.max(0.25, Math.min(2.0, camDist * 0.025));
    } else {
      // Earth / Moon — uniform camera-distance scaling
      scale = Math.max(0.12, Math.min(1.2, camDist * 0.018));
    }

    groupRef.current.scale.setScalar(scale);
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Glowing orb — solid core + transparent glow shell */}
      <mesh>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshBasicMaterial color="#22d3ee" />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.15} depthWrite={false} />
      </mesh>

      {/* Billboard text — always faces camera */}
      <Billboard>
        <Text
          position={[0, 0.25, 0]}
          fontSize={0.5}
          color="#e2e8f0"
          anchorX="center"
          anchorY="bottom"
          fillOpacity={0.85}
          textAlign="center"
          lineHeight={1.3}
          maxWidth={8}
        >
          {labelText}
        </Text>
      </Billboard>
    </group>
  );
}

export default function ReturnPathMilestones({ trajectoryPath, telemetry, viewMode, distanceUnit }) {
  const allMilestones = useMemo(
    () => findMilestonePositions(trajectoryPath),
    [trajectoryPath]
  );

  // In mission view, only show the Halfway marker
  const milestones = viewMode === 'mission'
    ? allMilestones.filter(m => m.label === HALFWAY_LABEL)
    : allMilestones;

  const craftScenePos = telemetry?.position ? eciToScene(telemetry.position) : null;

  if (milestones.length === 0) return null;

  return (
    <>
      {milestones.map((m, i) => (
        <MilestoneMarker
          key={i}
          position={m.position}
          milestone={m}
          viewMode={viewMode}
          craftScenePos={craftScenePos}
          distanceUnit={distanceUnit}
        />
      ))}
    </>
  );
}
