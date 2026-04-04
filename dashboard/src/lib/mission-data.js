/**
 * Static mission data for Artemis II.
 */

// Approximate launch time (SLS from KSC LC-39B)
export const LAUNCH_TIME = new Date('2026-04-01T16:42:00Z');

export const MISSION_EVENTS = [
  { time: new Date('2026-04-01T16:42:00Z'), label: 'Launch', icon: '🚀', description: 'SLS launches from Kennedy Space Center LC-39B' },
  { time: new Date('2026-04-01T18:30:00Z'), label: 'Perigee Raise', icon: '🔥', description: 'Perigee raise maneuver to adjust orbit' },
  { time: new Date('2026-04-02T03:08:00Z'), label: 'TLI Burn', icon: '🌙', description: 'Trans-Lunar Injection burn, Orion leaves Earth orbit' },
  { time: new Date('2026-04-05T12:00:00Z'), label: 'Lunar Flyby', icon: '🌕', description: 'Closest approach to the Moon (est.)' },
  { time: new Date('2026-04-06T00:00:00Z'), label: 'Return Coast', icon: '🌍', description: 'Orion begins return journey to Earth' },
  { time: new Date('2026-04-10T23:53:00Z'), label: 'Entry Interface', icon: '☄️', description: 'Atmospheric entry interface' },
  { time: new Date('2026-04-11T00:30:00Z'), label: 'Splashdown', icon: '🌊', description: 'Pacific Ocean splashdown and recovery' },
];

export const CREW = [
  {
    name: 'Reid Wiseman',
    role: 'Commander',
    agency: 'NASA',
    image: 'https://www.nasa.gov/wp-content/uploads/2023/03/jsc2023e007618.jpg',
    bio: 'Navy test pilot and NASA astronaut. Previously flew on ISS Expedition 41.',
  },
  {
    name: 'Victor Glover',
    role: 'Pilot',
    agency: 'NASA',
    image: 'https://www.nasa.gov/wp-content/uploads/2023/03/jsc2023e007617.jpg',
    bio: 'Navy fighter pilot. Flew on SpaceX Crew-1 to ISS.',
  },
  {
    name: 'Christina Koch',
    role: 'Mission Specialist 1',
    agency: 'NASA',
    image: 'https://www.nasa.gov/wp-content/uploads/2023/03/jsc2023e007620.jpg',
    bio: 'Electrical engineer. Holds record for longest single spaceflight by a woman.',
  },
  {
    name: 'Jeremy Hansen',
    role: 'Mission Specialist 2',
    agency: 'CSA',
    image: 'https://www.nasa.gov/wp-content/uploads/2023/03/jsc2023e007621.jpg',
    bio: 'Canadian Forces fighter pilot. First Canadian to fly beyond low Earth orbit.',
  },
];
