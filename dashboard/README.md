# Artemis II Mission Dashboard

Real-time mission tracking dashboard for NASA's Artemis II crewed lunar flyby mission. Built with React, Vite, and Tailwind CSS.

## Setup

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Data Sources & Methodology

### Trajectory Data
State vectors from NASA/JSC Flight Dynamics Operations via the CCSDS Orbital Ephemeris Message (OEM) standard. Reference frame: EME2000 (Earth Mean Equator and Equinox of J2000.0), Earth-centered.

### Live Updates
Position data sourced from JPL Horizons System (spacecraft ID: -1024). Vectors at 4-minute intervals, with 2-second resolution during maneuvers. Client-side Hermite interpolation for real-time display.

### Derived Values
Velocity, distance, and altitude are computed from raw state vectors. Mission Elapsed Time is derived from the launch epoch. Ground track coordinates use IAU GMST for ECI-to-ECEF conversion. Moon position is approximate.

### Timeline
Mission events based on NASA published mission plan. Times are approximate and subject to real-time mission decisions.

## External Resources

- [JPL Horizons System](https://ssd.jpl.nasa.gov/horizons/)
- [NASA AROW (Artemis Real-time Orbit Website)](https://www.nasa.gov/missions/artemis-ii/arow/)
