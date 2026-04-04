# Artemis II Mission Dashboard - Full Implementation Plan

**Project**: SpaceMissionTracker
**Date**: 2026-04-04
**Status**: Artemis II is currently in flight (launched 2026-04-01, ~10-day mission)

---

## 1. Project Goal

Build a web dashboard that displays real-time and near-real-time Artemis II mission data, including:
- Spacecraft position & trajectory visualization (2D map + optional 3D)
- Live telemetry: velocity, distance from Earth, distance from Moon, mission elapsed time (MET)
- Mission timeline with key events and burns
- Crew information
- Ground track overlay on Earth map

Inspired by NASA's AROW (Artemis Real-time Orbit Website) but as an independent, open-source dashboard.

---

## 2. Data Sources (Ranked by Priority)

### 2.1 PRIMARY: JPL Horizons API (Confirmed Working)

The **single best public data source** for Artemis II trajectory data.

- **API Endpoint**: `https://ssd.jpl.nasa.gov/api/horizons.api`
- **Orion Spacecraft ID**: `-1024` (Artemis II / Integrity / Orion EM-2)
- **Moon ID**: `301`
- **Reference Frame**: Ecliptic J2000, Earth-centered (or EME2000)
- **Data Standard**: CCSDS Orbital Ephemeris Message (OEM)
- **Resolution**: 4-minute intervals (2-second during maneuvers)
- **Origin**: NASA/JSC Flight Dynamics Operations

**Example API Query** (Orion state vectors):
```
https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND='-1024'&OBJ_DATA='NO'&MAKE_EPHEM='YES'&EPHEM_TYPE='VECTORS'&CENTER='500@399'&START_TIME='2026-04-02'&STOP_TIME='2026-04-11'&STEP_SIZE='30m'&VEC_TABLE='2'
```

**What it provides**:
- X, Y, Z position (km) and VX, VY, VZ velocity (km/s) at each timestep
- Earth-centered coordinates - can compute distance to Earth directly
- Moon vectors (query ID 301 separately) to compute distance to Moon

**Confirmed by**: Multiple independent trackers (cucco-io/artemis-ii-tracker, JOnathanST29/artemis2-live) successfully use this exact source.

### 2.2 LOCAL BACKUP: OEM Ephemeris File (Already in Repo)

We already have `ReferenceFiles/Artemis_II_OEM_2026_04_02_to_EI_v3.asc`:
- **Format**: CCSDS OEM v2.0
- **Object**: EM2 (Orion)
- **Frame**: EME2000, Earth-centered
- **Coverage**: 2026-04-02T03:07:49 to 2026-04-10T23:53:12
- **Source**: NASA/JSC/FOD/FDO
- **~3200 lines** of state vectors (position km + velocity km/s)

This serves as offline fallback and is the same data format as Horizons.

### 2.3 EXPLORATORY: AROW Network Interception (Strategy 1)

The AROW Unity WebGL app at `https://www.nasa.gov/missions/artemis-ii/arow/` renders telemetry to a `<canvas>` element. The Unity binary fetches live data from somewhere.

**Action Item**: Run Playwright network interception to discover if AROW calls:
- A public NASA REST/JSON endpoint (jackpot - direct live feed)
- A WebSocket for real-time telemetry
- Or only uses the same Horizons/OEM data we already have

**Script** (to run once for discovery):
```python
from playwright.async_api import async_playwright
import asyncio

async def intercept_arow():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        captured = []

        async def handle_response(response):
            url = response.url
            if not any(x in url for x in ['.wasm', '.data', '.js', '.css', 'fonts', '.png', '.jpg', '.ico', 'google', 'fontawesome']):
                try:
                    body = await response.text()
                    print(f"FOUND: {url}\n{body[:500]}\n---")
                    captured.append({"url": url, "body": body[:2000]})
                except:
                    pass

        page.on("response", handle_response)
        await page.goto("https://www.nasa.gov/missions/artemis-ii/arow/")
        await asyncio.sleep(45)  # Wait for Unity boot + first data fetch
        await browser.close()
        return captured

asyncio.run(intercept_arow())
```

**Expected outcome**: Either we find a NASA telemetry JSON endpoint (huge win) or confirm that AROW uses the same Horizons ephemeris locally (still valuable to know).

### 2.4 FALLBACK: Screenshot OCR (Strategy 2)

If all else fails, crop the AROW HUD values and OCR them:
- Mission Elapsed Time (MET)
- Velocity (MPH)
- Distance from Earth (miles)
- Distance from Moon (miles)

Low priority since Horizons gives us the raw data to compute all four values ourselves.

### 2.5 SUPPLEMENTARY: NASA Open APIs

- **NASA Image/Video API**: `https://images-api.nasa.gov/` - Artemis mission photos
- **NASA News/Blog RSS**: Mission updates, blog posts
- **Space Weather (DONKI)**: `https://api.nasa.gov/DONKI/` - solar events

---

## 3. Data Processing Pipeline

### 3.1 OEM/Horizons Parser

Parse CCSDS OEM format (both from file and Horizons API response):

```
Input: "2026-04-02T03:07:49.583 -29508.961 -25381.215 -13766.611 -0.724 -2.668 -1.441"
Output: { epoch: Date, pos: {x, y, z} km, vel: {vx, vy, vz} km/s }
```

### 3.2 Derived Calculations (Client-Side)

From raw state vectors, compute:
| Metric | Formula |
|--------|---------|
| Distance from Earth | `sqrt(x^2 + y^2 + z^2)` |
| Distance from Moon | `sqrt((x-mx)^2 + (y-my)^2 + (z-mz)^2)` where m = Moon position |
| Velocity (km/s) | `sqrt(vx^2 + vy^2 + vz^2)` |
| Velocity (MPH) | `velocity_kms * 2236.936` |
| MET | `current_time - launch_time` (launch: 2026-04-01T16:42:00 UTC approx) |
| Ground track | Convert ECI to lat/lon using Earth rotation angle |
| Altitude | `distance_from_earth - 6371` (Earth radius km) |

### 3.3 Interpolation

State vectors are at 4-minute intervals. For smooth real-time display:
- **Hermite interpolation** using position + velocity at bracketing timesteps
- Update display at 1-second intervals (or 60fps for animations)
- This is exactly what other trackers do (confirmed by cucco-io and JOnathanST29 repos)

---

## 4. Architecture

### 4.1 Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | React 18 + Vite | Fast dev, component model, widely used by similar trackers |
| Styling | Tailwind CSS | Rapid dark-theme dashboard UI |
| 2D Map | Leaflet.js or D3.js | Lightweight ground track / trajectory on map |
| 3D View (optional) | Three.js | Earth-Moon-Orion 3D visualization |
| Charts | Chart.js or Recharts | Velocity/altitude over time |
| Data fetching | Built-in fetch + SWR/React Query | Horizons API polling |
| Deployment | GitHub Pages or Netlify | Free static hosting |

### 4.2 Project Structure

```
SpaceMissionTracker/
  src/
    components/
      Dashboard.jsx          # Main layout
      TelemetryPanel.jsx     # MET, velocity, distances
      TrajectoryMap.jsx       # 2D Earth-Moon trajectory
      GroundTrack.jsx         # Lat/lon ground track on Earth map
      MissionTimeline.jsx     # Key events timeline
      CrewPanel.jsx           # Crew info cards
      ThreeDView.jsx          # Optional 3D visualization
    lib/
      oem-parser.js           # Parse CCSDS OEM format
      horizons-client.js      # Fetch from JPL Horizons API
      interpolator.js         # Hermite interpolation for smooth updates
      coordinates.js          # ECI to lat/lon, distance calcs
      mission-data.js         # Static mission events, crew info
    data/
      trajectory_data.json    # Pre-fetched state vectors (fallback)
    App.jsx
    main.jsx
  scripts/
    fetch_horizons.py         # Python script to bulk-fetch from Horizons
    parse_oem.py              # Convert OEM file to JSON
    intercept_arow.py         # Network interception discovery script
  public/
    textures/                 # Earth/Moon textures for 3D
  ReferenceFiles/             # Existing reference data
  index.html
  package.json
  vite.config.js
```

---

## 5. Implementation Phases

### Phase 1: Data Foundation (Priority - Do First)
1. **AROW Network Interception** - Run once to discover if NASA has a hidden JSON endpoint
2. **OEM Parser** - Parse the local ephemeris file into usable JSON
3. **Horizons Client** - Fetch live state vectors from JPL Horizons API (command -1024)
4. **Moon Data** - Fetch Moon vectors (command 301) for distance-to-Moon calculation
5. **Interpolation Engine** - Hermite interpolation for real-time position between state vectors
6. **Coordinate Math** - All derived metrics (distances, velocity, MET, ground track)

### Phase 2: Core Dashboard UI
1. **Telemetry Panel** - Big number displays: MET, velocity, dist-Earth, dist-Moon (like AROW HUD)
2. **2D Trajectory Map** - SVG or Canvas showing Earth, Moon, and Orion's path
3. **Mission Timeline** - Key events: launch, TLI burn, lunar flyby, return, splashdown
4. **Ground Track** - Orion's position projected onto an Earth map
5. **Dark theme** - Space-appropriate dark UI

### Phase 3: Enhanced Features
1. **3D Visualization** - Three.js Earth-Moon-Orion scene (inspired by AROW)
2. **Burn Detection** - Detect maneuvers by velocity discontinuities in state vectors
3. **Crew Panel** - Astronaut bios and photos
4. **Historical Comparison** - Artemis I trajectory overlay
5. **Auto-refresh** - Poll Horizons every 15-30 minutes for updated vectors

### Phase 4: Polish & Deploy
1. **Responsive design** - Mobile-friendly
2. **Performance optimization** - Lazy loading, code splitting
3. **SEO & sharing** - Open Graph tags, social sharing
4. **GitHub Pages deployment**
5. **README documentation**

---

## 6. Key Mission Events (Artemis II Timeline)

| Event | Approx. Time (UTC) | Notes |
|-------|-------------------|-------|
| Launch | 2026-04-01 ~16:42 | SLS from KSC LC-39B |
| Perigee Raise Maneuver | 2026-04-01 ~18:30 | Adjust orbit |
| TLI Burn | 2026-04-02 ~03:00 | Trans-Lunar Injection, leaves Earth orbit |
| Outbound Coast | Apr 2-5 | ~4 days toward Moon |
| Lunar Flyby | ~Apr 5-6 | Closest approach to Moon |
| Return Coast | Apr 6-10 | ~4 days back to Earth |
| Entry Interface | 2026-04-10 ~23:53 | Per OEM file end time |
| Splashdown | 2026-04-11 | Pacific Ocean recovery |

---

## 7. What AROW Shows vs. What We Can Build

| Feature | AROW | Our Dashboard | Data Source |
|---------|------|--------------|-------------|
| Mission Elapsed Time | Yes | Yes | Computed from launch time |
| Velocity (MPH) | Yes | Yes | Horizons state vectors |
| Distance from Earth | Yes | Yes | Horizons state vectors |
| Distance from Moon | Yes | Yes | Horizons + Moon vectors |
| 3D Spacecraft View | Yes (Unity) | Simplified (Three.js) | N/A - visual only |
| 2D Trajectory Map | Yes | Yes (better) | Horizons state vectors |
| Ground Track | No | Yes | ECI to lat/lon conversion |
| Burn Detection | No | Yes | Velocity discontinuities |
| Mission Timeline | Partial | Yes | Static data + detection |
| Crew Info | No | Yes | Static data |
| Historical Overlay | No | Yes | Artemis I data |
| Mobile Responsive | Limited | Yes | N/A |
| Open Source | No | Yes | N/A |

---

## 8. Immediate Next Steps

1. **Run AROW network interception** (`scripts/intercept_arow.py`) to check for hidden NASA endpoints
2. **Build OEM parser** (`src/lib/oem-parser.js`) to load our local ephemeris
3. **Build Horizons client** (`src/lib/horizons-client.js`) with the confirmed API endpoint
4. **Scaffold React+Vite project** with basic telemetry panel showing live-computed values
5. **Test with real data** - verify our computed values match what AROW displays

---

## 9. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Horizons API rate limits | Can't poll frequently | Pre-fetch bulk data, poll every 30min max |
| AROW has no public API | Can't get true real-time telemetry | Horizons + interpolation gives near-real-time |
| Mission ends before dashboard complete | No live data to show | OEM file provides full historical data |
| CORS issues with Horizons | Can't call from browser | Use a lightweight proxy or pre-fetch server-side |
| Ephemeris updates during mission | Stale trajectory after burns | Re-fetch from Horizons periodically |

---

## 10. References

- [NASA Track Artemis II](https://www.nasa.gov/missions/artemis/artemis-2/track-nasas-artemis-ii-mission-in-real-time/)
- [JPL Horizons API](https://ssd.jpl.nasa.gov/api/horizons.api) - Orion ID: -1024
- [AROW Page Source](ReferenceFiles/www%20nasa%20gov%20missions%20artemis-ii%20arow.txt) - Unity WebGL app
- [OEM Ephemeris File](ReferenceFiles/Artemis_II_OEM_2026_04_02_to_EI_v3.asc) - NASA/JSC/FOD
- [cucco-io/artemis-ii-tracker](https://github.com/cucco-io/artemis-ii-tracker) - Reference: Three.js + Horizons
- [JOnathanST29/artemis2-live](https://github.com/JOnathanST29/artemis2-live) - Reference: React + Horizons SVG
