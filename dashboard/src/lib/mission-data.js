/**
 * Static mission data for Artemis II.
 * Times sourced from NASA blog updates (EDT converted to UTC +4h).
 */

export const LAUNCH_TIME = new Date('2026-04-01T22:35:00Z');

export const MISSION_EVENTS = [
  {
    type: 'launch',
    time: new Date('2026-04-01T22:35:00Z'),
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
    type: 'otc-burn',
    time: new Date('2026-04-03T22:49:00Z'),
    label: 'OTC-1 Cancelled',
    description: 'First outbound trajectory correction burn cancelled — Orion\'s trajectory so precise it wasn\'t needed.',
    details: 'Flight controllers in Houston elected to cancel the spacecraft\'s first outbound trajectory correction burn. The burn was planned for 6:49 p.m. EDT and would have lasted ~8 seconds, changing velocity by 0.7 ft/s. Cancellation was a positive sign of trajectory accuracy.',
  },
  {
    type: 'crew-activity',
    time: new Date('2026-04-04T01:30:00Z'),
    label: 'Cabin Prep for Flyby',
    description: 'Crew practices camera setup and cabin choreography for the lunar observation period.',
    details: 'The four crew members practiced preparing the cabin for lunar observations — stowing equipment, setting up cameras with 80-400mm and 14-24mm lenses, and practicing movement choreography in microgravity within a space the size of two minivans.',
  },
  {
    type: 'crew-activity',
    time: new Date('2026-04-05T01:09:00Z'),
    label: 'Manual Piloting Demo',
    description: 'Koch and Hansen test manual spacecraft piloting for 41 minutes in two thruster modes.',
    details: 'Mission Specialists Christina Koch and Jeremy Hansen took turns controlling Orion starting at 9:09 p.m. EDT, testing six-degree-of-freedom and three-degree-of-freedom thruster modes. Commander Wiseman and Pilot Glover will repeat the demo on Flight Day 8.',
  },
  {
    type: 'crew-activity',
    time: new Date('2026-04-05T14:00:00Z'),
    label: 'Suit Demonstration',
    description: 'Crew completes full Orion Crew Survival System suit test sequence.',
    details: 'All four crew members conducted the OCSS suit test: donning, pressurization, leak checks, simulated seat entry, mobility assessment, and evaluating ability to eat and drink. The suit protects during dynamic flight phases and provides life support in cabin depressurization.',
  },
  {
    type: 'otc-burn',
    time: new Date('2026-04-06T03:03:00Z'),
    label: 'OTC-2 Burn Complete',
    description: 'Outbound trajectory correction burn fires for 17.5 seconds to refine lunar trajectory.',
    details: 'Burn began at 11:03 p.m. EDT on April 5. This was the first correction burn actually performed — flight controllers had cancelled the previous two planned burns because Orion\'s trajectory remained precise.',
  },
  {
    type: 'lunar-soi',
    time: new Date('2026-04-06T04:37:00Z'),
    label: 'Lunar SOI Entry',
    description: 'Orion enters the Moon\'s sphere of gravitational influence.',
    details: 'At 12:37 a.m. EDT on April 6, Orion and its four crew members entered the lunar sphere of influence at the tail end of the fifth day of their mission. The Moon\'s gravity now becomes the dominant force on the spacecraft.',
  },
  {
    type: 'distance-record',
    time: new Date('2026-04-06T17:56:00Z'),
    label: 'Distance Record',
    description: 'Crew surpasses Apollo 13 record — now the farthest humans from Earth in history.',
    details: 'At approximately 1:56 p.m. EDT, the Artemis II spacecraft broke the record for the farthest distance from Earth traveled by any human, surpassing Apollo 13\'s mark of 248,655 miles set in April 1970.',
  },
  {
    type: 'lunar-observation',
    time: new Date('2026-04-06T18:45:00Z'),
    label: 'Lunar Observation Begins',
    description: 'Seven-hour lunar observation period begins with 30 surface targets assigned.',
    details: 'The crew begins detailed observations of the lunar surface including the Orientale basin, a nearly 600-mile-wide crater straddling the Moon\'s near and far sides. They photograph and observe areas of the far side never seen directly by humans, reporting color nuances to the Science Evaluation Room.',
  },
  {
    type: 'earthset',
    time: new Date('2026-04-06T22:44:00Z'),
    label: 'Earthset & Comms Blackout',
    description: 'Earth drops below the lunar horizon. Planned ~40-minute communications blackout begins.',
    details: 'At 6:44 p.m. EDT, mission control loses communication as Orion passes behind the Moon. The lunar surface blocks radio signals from NASA\'s Deep Space Network. The crew witnesses "Earthset" — Earth gliding below the lunar horizon — marking another first since Apollo.',
  },
  {
    type: 'lunar-flyby',
    time: new Date('2026-04-06T23:02:00Z'),
    label: 'Lunar Flyby',
    description: 'Closest approach to the Moon at 4,067 miles (6,545 km) above the lunar surface.',
    details: 'Orion reaches closest approach at 7:02 p.m. EDT, traveling 60,863 mph relative to Earth but only 3,139 mph relative to the Moon. This is the first crewed lunar flyby since Apollo 17 in December 1972 — over 53 years ago.',
  },
  {
    type: 'max-distance',
    time: new Date('2026-04-06T23:07:00Z'),
    label: 'Maximum Distance',
    description: 'Crew reaches maximum distance from Earth: 252,760 miles (406,710 km).',
    details: 'At 7:07 p.m. EDT, Orion reaches 252,760 miles from Earth — 4,111 miles farther than the Apollo 13 record of 248,655 miles. The four crew members are now farther from home than any humans have ever been.',
  },
  {
    type: 'earthrise',
    time: new Date('2026-04-06T23:25:00Z'),
    label: 'Earthrise & Comms Restored',
    description: 'Earth reappears above the lunar horizon. Deep Space Network reacquires signal.',
    details: 'At 7:25 p.m. EDT, the crew witnesses Earthrise as Orion emerges from behind the Moon. Moments later, NASA\'s Deep Space Network reacquires the spacecraft\'s signal and restores communications with mission control in Houston.',
  },
  {
    type: 'solar-eclipse',
    time: new Date('2026-04-07T00:35:00Z'),
    label: 'Solar Eclipse from Orion',
    description: 'Sun passes behind the Moon from the crew\'s perspective — a ~57-minute eclipse.',
    details: 'Starting at 8:35 p.m. EDT, the crew observes a total solar eclipse from space as Orion, the Moon, and the Sun align. The Sun disappears behind the Moon for nearly an hour, ending at approximately 9:32 p.m. EDT.',
  },
  {
    type: 'return-coast',
    time: new Date('2026-04-07T01:45:00Z'),
    label: 'Return Coast',
    description: 'Orion begins the return journey toward Earth on the free-return path.',
    details: 'After the lunar flyby and observation period, Orion\'s free-return trajectory naturally brings it back toward Earth. The crew conducts systems evaluations and prepares for atmospheric entry.',
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

/** NASA blog links for reference */
export const NASA_BLOG_LINKS = [
  { day: 3, title: 'Crew Prepares Cabin for Lunar Flyby', url: 'https://www.nasa.gov/blogs/missions/2026/04/04/artemis-ii-flight-day-3-crew-prepares-cabin-for-lunar-flyby/' },
  { day: 3, title: 'Outbound Trajectory Correction Burn Update', url: 'https://www.nasa.gov/blogs/missions/2026/04/03/artemis-ii-flight-day-3-outbound-trajectory-correction-burn-update/' },
  { day: 4, title: 'Crew Completes Manual Piloting Demonstration', url: 'https://www.nasa.gov/blogs/missions/2026/04/04/artemis-ii-flight-day-4-crew-completes-manual-piloting-demonstration/' },
  { day: 5, title: 'Crew Demos Suits, Readies for Lunar Flyby', url: 'https://www.nasa.gov/blogs/missions/2026/04/05/artemis-ii-flight-day-5-crew-demos-suits-readies-for-lunar-flyby/' },
  { day: 5, title: 'Correction Burn Complete', url: 'https://www.nasa.gov/blogs/missions/2026/04/05/artemis-ii-flight-day-5-correction-burn-complete/' },
  { day: 6, title: 'Crew Ready for Lunar Flyby', url: 'https://www.nasa.gov/blogs/missions/2026/04/06/artemis-ii-flight-day-6-crew-ready-for-lunar-flyby/' },
  { day: 6, title: 'Lunar Flyby Updates', url: 'https://www.nasa.gov/blogs/missions/2026/04/06/artemis-ii-flight-day-6-lunar-flyby-updates/' },
];

/** NASA gallery/multimedia links */
export const NASA_GALLERIES = [
  { title: 'Flight Day Highlights', url: 'https://www.nasa.gov/gallery/artemis-ii-flight-day-highlights/' },
  { title: 'Journey to the Moon', url: 'https://www.nasa.gov/gallery/journey-to-the-moon/' },
  { title: 'All Multimedia', url: 'https://www.nasa.gov/artemis-ii-multimedia/' },
];

/** Photo gallery entries — linking to NASA sources */
export const GALLERY_PHOTOS = [
  {
    caption: 'Earth viewed from Orion after translunar injection burn — two auroras and zodiacal light visible',
    credit: 'NASA/Reid Wiseman',
    day: 2,
    nasaUrl: 'https://www.nasa.gov/image-article/hello-world/',
  },
  {
    caption: 'Orion selfie with solar array camera during routine external inspection',
    credit: 'NASA',
    day: 2,
    nasaUrl: 'https://www.nasa.gov/gallery/artemis-ii-flight-day-highlights/',
  },
  {
    caption: 'Christina Koch peers out of Orion\'s main cabin window with Earth in view',
    credit: 'NASA',
    day: 3,
    nasaUrl: 'https://www.nasa.gov/gallery/artemis-ii-flight-day-highlights/',
  },
  {
    caption: 'A sliver of Earth illuminated against the blackness of deep space',
    credit: 'NASA',
    day: 3,
    nasaUrl: 'https://www.nasa.gov/gallery/artemis-ii-flight-day-highlights/',
  },
  {
    caption: 'The Moon with South Pole at top — Orientale basin visible on the right edge',
    credit: 'NASA',
    day: 4,
    nasaUrl: 'https://www.nasa.gov/gallery/artemis-ii-flight-day-highlights/',
  },
  {
    caption: 'Crew demonstrates Orion Crew Survival System suits in microgravity',
    credit: 'NASA',
    day: 5,
    nasaUrl: 'https://www.nasa.gov/blogs/missions/2026/04/05/artemis-ii-flight-day-5-crew-demos-suits-readies-for-lunar-flyby/',
  },
  {
    caption: 'Earthrise — Earth reappears from behind the Moon as seen from Orion',
    credit: 'NASA',
    day: 6,
    nasaUrl: 'https://www.nasa.gov/blogs/missions/2026/04/06/artemis-ii-flight-day-6-lunar-flyby-updates/',
  },
  {
    caption: 'Lunar surface features observed during the seven-hour flyby observation period',
    credit: 'NASA',
    day: 6,
    nasaUrl: 'https://www.nasa.gov/gallery/journey-to-the-moon/',
  },
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
    photo: '/crew/ReidWiseman.jpg',
    bio: 'U.S. Navy test pilot and NASA astronaut. Previously flew on ISS Expedition 41. Selected as Artemis II commander in April 2023.',
  },
  {
    name: 'Victor Glover',
    role: 'Pilot',
    agency: 'NASA',
    photo: '/crew/VictorGlover.jpg',
    bio: 'U.S. Navy fighter pilot and NASA astronaut. Flew on SpaceX Crew-1 to the International Space Station. First person of color assigned to a lunar mission.',
  },
  {
    name: 'Christina Koch',
    role: 'Mission Specialist 1',
    agency: 'NASA',
    photo: '/crew/ChristinaKoch.jpg',
    bio: 'Electrical engineer and NASA astronaut. Holds the record for longest single spaceflight by a woman at 328 days. First woman assigned to a lunar mission.',
  },
  {
    name: 'Jeremy Hansen',
    role: 'Mission Specialist 2',
    agency: 'CSA',
    photo: '/crew/JeremyHansen.jpg',
    bio: 'Canadian Forces fighter pilot and Canadian Space Agency astronaut. First Canadian to fly beyond low Earth orbit and first non-American on a lunar mission.',
  },
];

export const SPACECRAFT = [
  {
    label: 'Crew Module',
    value: 'Orion CM-003',
    icon: 'capsule',
    image: '/reference/orion-crew-module.jpg',
    details: '16.5 ft diameter pressurized capsule for 4 crew. Reusable heat shield rated for lunar return speeds of 25,000 mph. Designed for up to 21 days in deep space.',
  },
  {
    label: 'Service Module',
    value: 'ESM-2 (Airbus)',
    icon: 'solar',
    image: '/reference/european-service-module.jpg',
    details: 'European-built service module provides propulsion, power (4 solar arrays generating 11 kW), and life support. 33 engines including 1 OMS-E main engine with 25,700 N thrust.',
  },
  {
    label: 'Launch Vehicle',
    value: 'SLS Block 1',
    icon: 'rocket',
    image: '/reference/sls-block-1.jpg',
    details: '322 ft tall, 8.8 million lbs thrust at liftoff. 2 five-segment solid rocket boosters + 4 RS-25 engines on the core stage. Most powerful rocket ever flown.',
  },
  {
    label: 'Launch Abort System',
    value: 'LAS Tower',
    icon: 'shield',
    image: '/reference/launch-abort-system.jpg',
    details: 'Mounted atop the crew module during launch. 3 solid rocket motors generate 400,000 lbs thrust to pull crew to safety within milliseconds. Jettisoned after clearing the upper atmosphere.',
  },
];
