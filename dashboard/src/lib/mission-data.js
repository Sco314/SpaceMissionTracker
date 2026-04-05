/**
 * Static mission data for Artemis II.
 */

export const LAUNCH_TIME = new Date('2026-04-01T16:42:00Z');

export const MISSION_EVENTS = [
  {
    type: 'launch',
    time: new Date('2026-04-01T16:42:00Z'),
    label: 'Launch',
    description: 'Space Launch System lifts off from Kennedy Space Center Launch Complex 39B.',
    details: 'The SLS Block 1 rocket carries the Orion spacecraft and four crew members on the first crewed Artemis mission. Two solid rocket boosters and four RS-25 engines generate 8.8 million pounds of thrust at liftoff.',
  },
  {
    type: 'perigee-raise',
    time: new Date('2026-04-01T18:30:00Z'),
    label: 'Perigee Raise',
    description: 'Perigee raise maneuver adjusts the initial parking orbit.',
    details: 'The Interim Cryogenic Propulsion Stage performs a brief burn to raise the orbit\'s lowest point, setting up the proper geometry for the Trans-Lunar Injection burn.',
  },
  {
    type: 'tli-burn',
    time: new Date('2026-04-02T03:08:00Z'),
    label: 'Trans-Lunar Injection',
    description: 'ICPS ignites for TLI, committing Orion to a lunar transfer trajectory.',
    details: 'The Interim Cryogenic Propulsion Stage fires for approximately 18 minutes, accelerating Orion to roughly 24,500 mph and sending it on a trajectory toward the Moon. After separation, the crew is on their own aboard Orion.',
  },
  {
    type: 'lunar-flyby',
    time: new Date('2026-04-06T21:52:00Z'),
    label: 'Lunar Flyby',
    description: 'Closest approach to the Moon during the free-return trajectory.',
    details: 'Orion passes approximately 6,400 miles above the lunar surface on a free-return trajectory. The crew observes the far side of the Moon, farther from Earth than any humans have traveled since Apollo 17 in 1972.',
  },
  {
    type: 'return-coast',
    time: new Date('2026-04-06T00:00:00Z'),
    label: 'Return Coast',
    description: 'Orion begins the return journey toward Earth on the free-return path.',
    details: 'After the lunar flyby, Orion\'s free-return trajectory naturally brings it back toward Earth. The crew conducts systems evaluations and prepares for atmospheric entry.',
  },
  {
    type: 'entry-interface',
    time: new Date('2026-04-10T23:53:00Z'),
    label: 'Entry Interface',
    description: 'Orion reaches atmospheric entry interface at approximately 400,000 feet altitude.',
    details: 'The crew module enters Earth\'s atmosphere at roughly 25,000 mph, experiencing temperatures of approximately 5,000°F on the heat shield. The skip-entry technique bounces Orion off the upper atmosphere to reduce g-forces.',
  },
  {
    type: 'splashdown',
    time: new Date('2026-04-11T00:30:00Z'),
    label: 'Splashdown',
    description: 'Orion splashes down in the Pacific Ocean. Recovery teams retrieve the crew.',
    details: 'Three main parachutes deploy to slow the crew module to approximately 20 mph for splashdown. The USS Portland and Navy divers are positioned for rapid crew recovery.',
  },
];

/** Curated list of known Artemis II YouTube videos */
export const KNOWN_ARTEMIS_VIDEOS = [
  { id: '6RwfNBtepa4', title: 'Views from Orion' },
  { id: 'm3kR2KK8TEs', title: 'Mission Coverage' },
];

/** Determine mission phase relative to lunar flyby */
export function getMissionPhase(nowMs) {
  const flyby = MISSION_EVENTS.find(e => e.type === 'lunar-flyby');
  const returnCoast = MISSION_EVENTS.find(e => e.type === 'return-coast');
  const entry = MISSION_EVENTS.find(e => e.type === 'entry-interface');
  if (nowMs < flyby.time.getTime()) return 'pre-flyby';
  if (nowMs < returnCoast.time.getTime()) return 'flyby';
  if (nowMs < entry.time.getTime()) return 'post-flyby';
  return 'post-entry';
}

/** Time remaining until lunar flyby (ms) */
export function getTimeToMoon(nowMs) {
  const flyby = MISSION_EVENTS.find(e => e.type === 'lunar-flyby');
  return flyby.time.getTime() - nowMs;
}

/** Time remaining until splashdown (ms) */
export function getTimeToEarth(nowMs) {
  const splashdown = MISSION_EVENTS.find(e => e.type === 'splashdown');
  return splashdown.time.getTime() - nowMs;
}

/** Time elapsed since lunar flyby (ms) */
export function getTimeSinceFlyby(nowMs) {
  const flyby = MISSION_EVENTS.find(e => e.type === 'lunar-flyby');
  return nowMs - flyby.time.getTime();
}

export const CREW = [
  {
    name: 'Reid Wiseman',
    role: 'Commander',
    agency: 'NASA',
    status: 'GO',
    photo: '/crew/wiseman.jpg',
    bio: 'U.S. Navy test pilot and NASA astronaut. Previously flew on ISS Expedition 41. Selected as Artemis II commander in April 2023.',
  },
  {
    name: 'Victor Glover',
    role: 'Pilot',
    agency: 'NASA',
    status: 'GO',
    photo: '/crew/glover.jpg',
    bio: 'U.S. Navy fighter pilot and NASA astronaut. Flew on SpaceX Crew-1 to the International Space Station. First person of color assigned to a lunar mission.',
  },
  {
    name: 'Christina Koch',
    role: 'Mission Specialist 1',
    agency: 'NASA',
    status: 'GO',
    photo: '/crew/koch.jpg',
    bio: 'Electrical engineer and NASA astronaut. Holds the record for longest single spaceflight by a woman at 328 days. First woman assigned to a lunar mission.',
  },
  {
    name: 'Jeremy Hansen',
    role: 'Mission Specialist 2',
    agency: 'CSA',
    status: 'GO',
    photo: '/crew/hansen.jpg',
    bio: 'Canadian Forces fighter pilot and Canadian Space Agency astronaut. First Canadian to fly beyond low Earth orbit and first non-American on a lunar mission.',
  },
];

export const SPACECRAFT = [
  {
    label: 'Crew Module',
    value: 'Orion CM-002',
    icon: 'capsule',
    details: '16.5 ft diameter pressurized capsule for 4 crew. Reusable heat shield rated for lunar return speeds of 25,000 mph. Designed for up to 21 days in deep space.',
  },
  {
    label: 'Service Module',
    value: 'ESM-2 (Airbus)',
    icon: 'solar',
    details: 'European-built service module provides propulsion, power (4 solar arrays generating 11 kW), and life support. 33 engines including 1 OMS-E main engine with 25,700 N thrust.',
  },
  {
    label: 'Launch Vehicle',
    value: 'SLS Block 1',
    icon: 'rocket',
    details: '322 ft tall, 8.8 million lbs thrust at liftoff. 2 five-segment solid rocket boosters + 4 RS-25 engines on the core stage. Most powerful rocket ever flown.',
  },
  {
    label: 'Launch Abort System',
    value: 'LAS Tower',
    icon: 'shield',
    details: 'Mounted atop the crew module during launch. 3 solid rocket motors generate 400,000 lbs thrust to pull crew to safety within milliseconds. Jettisoned after clearing the upper atmosphere.',
  },
];
