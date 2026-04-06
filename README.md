# Artemis II Mission Tracker

A real-time mission tracking dashboard for NASA's Artemis II crewed lunar flyby mission. The app displays live spacecraft telemetry, 3D and 2D trajectory visualization, crew information, mission timeline, and live video — all in the browser with no backend required.

**Live site:** [moonlanding.site](https://moonlanding.site)

---

## Features

- **Real-time telemetry** — Mission Elapsed Time, velocity, distance to Earth and Moon, altitude, ground track coordinates
- **3D trajectory visualization** — Interactive Three.js scene with textured Earth, Moon, spacecraft model, trajectory path, and Moon trail
- **2D trajectory map** — Canvas-based overhead view with pan, zoom, and focus modes (Earth / Moon / Full)
- **Camera view modes** — Spacecraft follow, Mission overview, Moon, Earth
- **Replay animation** — Replay from launch to current position with YouTube launch video intro
- **Mission timeline** — Expandable event list (Launch, Perigee Raise, TLI, Lunar Flyby, Re-entry, Splashdown)
- **Crew profiles** — Photos and bios for all four Artemis II crew members
- **Spacecraft details** — Expandable cards for Crew Module, Service Module, SLS, and Launch Abort System
- **Live video** — Embedded NASA mission coverage and Views from Orion YouTube streams
- **Unit preferences** — Toggle between km/mi, km/s/mph, and UTC/local time (persisted in localStorage)
- **Responsive layout** — Side-by-side grid on desktop, single column on mobile
- **Offline capable** — All trajectory data is preloaded; no API calls required at runtime

---

## Data Sources

| Source | What it provides | Format |
|--------|-----------------|--------|
| **NASA/JSC Flight Dynamics Operations** | Orion spacecraft state vectors (position & velocity) | CCSDS OEM v2.0 |
| **JPL Horizons API** (`ssd.jpl.nasa.gov/api/horizons.api`) | Orion (ID `-1024`) and Moon (ID `301`) ephemeris vectors | JSON / state vectors |
| **Preloaded trajectory data** (`trajectory_data.json`) | ~3200 state vectors, Apr 2–10 2026, 4-min intervals | JSON (epoch, X, Y, Z, VX, VY, VZ) |
| **Preloaded lunar ephemeris** (`moon_ephemeris.json`) | ~100+ Moon position snapshots at ~1-hour intervals | JSON (epoch, X, Y, Z) |

All positions use the **EME2000** (Earth Mean Equator and Equinox of J2000.0) Earth-centered inertial reference frame. Units are km for position, km/s for velocity.

### Real-time interpolation

The app uses **Hermite cubic spline interpolation** between discrete state vectors to produce smooth 60 FPS position updates despite the 4-minute spacing of the source data. A binary search locates the bracketing vectors for the current time, then the Hermite basis functions blend both position and velocity for a physically accurate curve.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI framework | React 19 |
| 3D graphics | Three.js + React Three Fiber + drei |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Build tool | Vite 8 |
| Minification | Terser |
| Deployment | Static SPA (Netlify) |

---

## Repository Structure

```
SpaceMissionTracker/
├── README.md
├── LICENSE
├── ReferenceFiles/                          # Source data & design references
│   ├── ARTEMIS_DASHBOARD_PLAN.md            #   Implementation specifications
│   ├── Artemis_II_OEM_2026_04_02_to_EI_v3.asc  #   NASA OEM ephemeris file
│   ├── moon_ephemeris.json                  #   Lunar position source data
│   └── [crew photos, design notes]
│
├── docs/                                    # Production build output (served by hosting)
│   ├── index.html                           #   SPA entry point
│   ├── _headers, _redirects                 #   Netlify deployment config
│   ├── assets/                              #   Minified JS/CSS bundles
│   ├── crew/                                #   Crew member photos
│   ├── models/                              #   3D model assets (GLB)
│   ├── reference/                           #   Spacecraft reference images
│   └── textures/                            #   Earth day map, cloud map
│
└── dashboard/                               # Source code (React/Vite project)
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx                         # React entry point
        ├── App.jsx                          # Root component, layout, scroll navigation
        ├── index.css                        # Global styles, Tailwind config, color palette
        │
        ├── data/
        │   ├── trajectory_data.json         # Preloaded Orion state vectors (588 KB)
        │   └── moon_ephemeris.json          # Lunar ephemeris snapshots (13 KB)
        │
        ├── lib/                             # Core logic & utilities
        │   ├── mission-data.js              #   Mission events, crew bios, spacecraft specs
        │   ├── useMissionData.js            #   React hook: loads vectors, interpolates telemetry
        │   ├── coordinates.js               #   Distance, altitude, speed, ECI-to-lat/lon (GMST)
        │   ├── interpolator.js              #   Hermite cubic spline interpolation
        │   ├── oem-parser.js                #   CCSDS OEM & Horizons API response parser
        │   ├── horizons-client.js           #   JPL Horizons API client
        │   ├── units-context.jsx            #   Unit toggle context (km/mi, km/s/mph, UTC/local)
        │   └── icon-map.js                  #   Lucide icon mappings for timeline events
        │
        └── components/
            ├── Navigation.jsx               # Top nav bar (scroll-to-section)
            ├── TelemetryPanel.jsx           # MET, velocity, distance readouts
            ├── DetailCards.jsx              # Altitude, lat/lon, distance grid
            ├── MissionTimeline.jsx          # Expandable event timeline
            ├── CrewPanel.jsx                # Crew member cards with photos & bios
            ├── SpacecraftPanel.jsx          # Spacecraft component cards with images
            ├── LiveVideo.jsx                # YouTube live stream selector
            ├── TrajectoryMap.jsx            # 2D canvas trajectory map (pan/zoom)
            ├── UnitToggle.jsx               # Distance/speed/time unit switches
            │
            └── OrbitViewer/                 # 3D visualization module
                ├── OrbitViewer.jsx          #   Wrapper: Canvas, replay controls, YouTube overlay
                ├── OrbitScene.jsx           #   Scene orchestration, camera choreography
                ├── EarthMesh.jsx            #   Textured Earth sphere + clouds + glow
                ├── MoonMesh.jsx             #   Moon sphere positioned from ephemeris
                ├── MoonTrail.jsx            #   Cyan trail showing Moon's orbital path
                ├── SunMesh.jsx              #   Distant sun for directional lighting
                ├── OrionModel.jsx           #   Spacecraft GLB model with dynamic scaling
                ├── OrionMarker.jsx          #   Spacecraft position indicator
                ├── TrajectoryLine.jsx       #   Past/future trajectory path rendering
                ├── TelemetryGauges.jsx      #   On-screen HUD (speed, distance, MET)
                └── constants.js             #   Scale factors, ECI-to-scene transform
```

---

## Key Modules Explained

### `useMissionData.js` — Telemetry Hook

The central data hook that powers the entire dashboard. On mount it loads `trajectory_data.json` and `moon_ephemeris.json`, then on every animation frame:

1. Finds the two state vectors bracketing the current time (binary search)
2. Interpolates position and velocity via Hermite spline
3. Computes derived values: distance to Earth, distance to Moon, altitude, speed, ground track lat/lon
4. Returns `{ telemetry, trajectoryPath, vectors }` consumed by all components

Also exports `getMoonPosition(epochMs)` for components that need the Moon's position independently.

### `interpolator.js` — Hermite Interpolation

Implements cubic Hermite spline interpolation using position and velocity at two bracketing time points. This produces physically accurate curves that respect both position and velocity continuity — critical for realistic spacecraft trajectory rendering.

### `coordinates.js` — Coordinate Math

- `eciToLatLon(pos, epochMs)` — Converts ECI X/Y/Z to geographic latitude/longitude using Greenwich Mean Sidereal Time
- `distanceFromEarth(pos)` — Vector magnitude (distance from Earth center)
- `altitude(pos)` — Distance from Earth surface (subtracts 6,371 km radius)
- `speed(vel)` — Velocity magnitude
- `formatMET(ms)` — Formats milliseconds as `Xd Xh Xm Xs`

### `OrbitScene.jsx` — 3D Camera System

Manages four view modes with smooth lerp transitions:
- **Spacecraft** — Camera follows Orion from behind along velocity vector
- **Mission** — Zoomed out to show full Earth-to-Moon trajectory
- **Moon** — Camera near Moon looking toward Earth
- **Earth** — Camera behind Earth looking outward toward spacecraft

Also handles the replay camera choreography: close-up departure → mission overview → spacecraft follow.

### `OrionModel.jsx` — Dynamic Spacecraft Scaling

The 3D spacecraft model scales dynamically based on camera distance so it remains visually appropriate whether viewed from the mission overview (far) or near the Moon (close). Scale factor: `baseScale * clamp(cameraDistance / 30, 0.2, 1.5)`.

### `TrajectoryMap.jsx` — 2D Canvas Visualization

A pure canvas component that renders the spacecraft trajectory in a top-down ECI projection. Features:
- Adaptive downsampling (dense near Earth, sparse in deep space)
- Earth and Moon circles at correct scale
- Directional triangle showing spacecraft heading
- Three view modes: Earth-focused, Moon-focused, Full trajectory
- Mouse-drag panning and scroll-wheel zoom

---

## Coordinate System & Scale

| Property | Value |
|----------|-------|
| Reference frame | EME2000 (Earth-centered inertial, J2000 epoch) |
| Position units | km |
| Velocity units | km/s |
| 3D scene scale | 1 Three.js unit = 10,000 km |
| ECI → Scene transform | `[x/10000, z/10000, -y/10000]` (swap Y↔Z, negate Y for Three.js Y-up) |
| Earth radius | 6,371 km (0.6371 scene units) |
| Moon radius | 1,737 km (0.1737 scene units) |
| Earth–Moon distance | ~384,400 km (~38.4 scene units) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Development

```bash
cd dashboard
npm install
npm run dev
```

Opens a dev server at `http://localhost:5173`.

### Production Build

```bash
cd dashboard
npm run build
```

Output goes to `/docs/` (configured for static hosting).

### Deployment

The `/docs/` directory is deployed as a static site. The `_redirects` file handles SPA routing (`/* → /index.html`). Security headers are configured in `_headers`.

---

## Mission Reference

**Artemis II** is the first crewed mission of NASA's Artemis program. Four astronauts fly aboard the Orion spacecraft on a lunar flyby trajectory — traveling around the Moon and returning to Earth over approximately 10 days.

| Detail | Value |
|--------|-------|
| Launch | April 1, 2026, 16:42 UTC |
| Launch site | Kennedy Space Center, LC-39B |
| Vehicle | SLS Block 1 + Orion CM-003 |
| Crew | Reid Wiseman (CDR), Victor Glover (PLT), Christina Koch (MS1), Jeremy Hansen (MS2) |
| Trajectory | Free-return lunar flyby |
| Duration | ~10 days |
| Closest lunar approach | ~8,900 km |

---

## License

See [LICENSE](./LICENSE) for details.

---

<a href="https://buymeacoffee.com/ssandvik" target="_blank">Support Me & This Project</a>
