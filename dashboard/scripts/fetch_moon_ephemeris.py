#!/usr/bin/env python3
"""
Compute Moon ephemeris in EME2000 (J2000 ECI) coordinates.

Uses a low-precision analytical lunar model based on Meeus "Astronomical
Algorithms" Chapter 47. Position accuracy ~0.5% (good enough for visualization).

Can also fetch from JPL Horizons API when network is available.
"""

import json
import math
from datetime import datetime, timedelta, timezone
from pathlib import Path

OUTPUT = Path(__file__).resolve().parent.parent / "src" / "data" / "moon_ephemeris.json"

# Mission time range
START = datetime(2026, 4, 2, 0, 0, 0, tzinfo=timezone.utc)
STOP  = datetime(2026, 4, 11, 0, 0, 0, tzinfo=timezone.utc)
STEP_HOURS = 1


def julian_date(dt):
    """Convert datetime to Julian Date."""
    y = dt.year
    m = dt.month
    d = dt.day + dt.hour / 24 + dt.minute / 1440 + dt.second / 86400
    if m <= 2:
        y -= 1
        m += 12
    A = int(y / 100)
    B = 2 - A + int(A / 4)
    return int(365.25 * (y + 4716)) + int(30.6001 * (m + 1)) + d + B - 1524.5


def moon_eci(dt):
    """
    Compute Moon position in J2000 ECI (EME2000) frame, in km.

    Based on Meeus Ch. 47, simplified. Returns (x, y, z) in km.
    """
    JD = julian_date(dt)
    T = (JD - 2451545.0) / 36525.0  # Julian centuries from J2000

    # Fundamental arguments (degrees)
    # Moon's mean longitude
    Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T**2 + T**3 / 538841 - T**4 / 65194000
    # Moon's mean anomaly
    M_moon = 134.9633964 + 477198.8675055 * T + 0.0087414 * T**2 + T**3 / 69699 - T**4 / 14712000
    # Sun's mean anomaly
    M_sun = 357.5291092 + 35999.0502909 * T - 0.0001536 * T**2 + T**3 / 24490000
    # Moon's mean elongation
    D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T**2 + T**3 / 545868 - T**4 / 113065000
    # Moon's argument of latitude
    F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T**2 - T**3 / 3526000 + T**4 / 863310000
    # Longitude of ascending node
    Omega = 125.0445479 - 1934.1362891 * T + 0.0020754 * T**2 + T**3 / 467441 - T**4 / 60616000

    # Convert to radians
    Lp_r = math.radians(Lp % 360)
    M_m = math.radians(M_moon % 360)
    M_s = math.radians(M_sun % 360)
    D_r = math.radians(D % 360)
    F_r = math.radians(F % 360)
    Om_r = math.radians(Omega % 360)

    # E factor for solar eccentricity
    E = 1 - 0.002516 * T - 0.0000074 * T**2

    # --- Longitude terms (sum_l) and distance terms (sum_r) ---
    # (D, M_sun, M_moon, F, coeff_l, coeff_r) from Meeus Table 47.A
    lon_dist_terms = [
        (0, 0, 1, 0, 6288774, -20905355),
        (2, 0, -1, 0, 1274027, -3699111),
        (2, 0, 0, 0, 658314, -2955968),
        (0, 0, 2, 0, 213618, -569925),
        (0, 1, 0, 0, -185116, 48888),
        (0, 0, 0, 2, -114332, -3149),
        (2, 0, -2, 0, 58793, 246158),
        (2, -1, -1, 0, 57066, -152138),
        (2, 0, 1, 0, 53322, -170733),
        (2, -1, 0, 0, 45758, -204586),
        (0, 1, -1, 0, -40923, -129620),
        (1, 0, 0, 0, -34720, 108743),
        (0, 1, 1, 0, -30383, 104755),
        (2, 0, 0, -2, 15327, 10321),
        (0, 0, 1, 2, -12528, 0),
        (0, 0, 1, -2, 10980, 79661),
        (4, 0, -1, 0, 10675, -34782),
        (0, 0, 3, 0, 10034, -23210),
        (4, 0, -2, 0, 8548, -21636),
        (2, 1, -1, 0, -7888, 24208),
        (2, 1, 0, 0, -6766, 30824),
        (1, 0, -1, 0, -5163, -8379),
        (1, 1, 0, 0, 4987, -16675),
        (2, -1, 1, 0, 4036, -12831),
        (2, 0, 2, 0, 3994, -10445),
        (4, 0, 0, 0, 3861, -11650),
        (2, 0, -3, 0, 3665, 14403),
        (0, 1, -2, 0, -2689, -7003),
        (2, 0, -1, 2, -2602, 0),
        (2, -1, -2, 0, 2390, 10056),
        (1, 0, 1, 0, -2348, 6322),
        (2, -2, 0, 0, 2236, -9884),
        (0, 1, 2, 0, -2120, 5751),
        (0, 2, 0, 0, -2069, 0),
        (2, -2, -1, 0, 2048, -4950),
        (2, 0, 1, -2, -1773, 4130),
        (2, 0, 0, 2, -1595, 0),
        (4, -1, -1, 0, 1215, -3958),
        (0, 0, 2, 2, -1110, 0),
        (3, 0, -1, 0, -892, 3258),
        (2, 1, 1, 0, -810, 2616),
        (4, -1, -2, 0, 759, -1897),
        (0, 2, -1, 0, -713, -2117),
        (2, 2, -1, 0, -700, 2354),
        (2, 1, -2, 0, 691, 0),
        (2, -1, 0, -2, 596, 0),
        (4, 0, 1, 0, 549, -1423),
        (0, 0, 4, 0, 537, -1117),
        (4, -1, 0, 0, 520, -1571),
        (1, 0, -2, 0, -487, -1739),
    ]

    # --- Latitude terms (sum_b) ---
    # (D, M_sun, M_moon, F, coeff_b) from Meeus Table 47.B
    lat_terms = [
        (0, 0, 0, 1, 5128122),
        (0, 0, 1, 1, 280602),
        (0, 0, 1, -1, 277693),
        (2, 0, 0, -1, 173237),
        (2, 0, -1, 1, 55413),
        (2, 0, -1, -1, 46271),
        (2, 0, 0, 1, 32573),
        (0, 0, 2, 1, 17198),
        (2, 0, 1, -1, 9266),
        (0, 0, 2, -1, 8822),
        (2, -1, 0, -1, 8216),
        (2, 0, -2, -1, 4324),
        (2, 0, 1, 1, 4200),
        (2, 1, 0, -1, -3359),
        (2, -1, -1, 1, 2463),
        (2, -1, 0, 1, 2211),
        (2, -1, -1, -1, 2065),
        (0, 1, -1, -1, -1870),
        (4, 0, -1, -1, 1828),
        (0, 1, 0, 1, -1794),
        (0, 0, 0, 3, -1749),
        (0, 1, -1, 1, -1565),
        (1, 0, 0, 1, -1491),
        (0, 1, 1, 1, -1475),
        (0, 1, 1, -1, -1410),
        (0, 1, 0, -1, -1344),
        (1, 0, 0, -1, -1335),
        (0, 0, 3, 1, 1107),
        (4, 0, 0, -1, 1021),
        (4, 0, -1, 1, 833),
    ]

    sum_l = 0
    sum_r = 0
    for d, ms, mm, f, cl, cr in lon_dist_terms:
        arg = d * D_r + ms * M_s + mm * M_m + f * F_r
        e_factor = E ** abs(ms)
        sum_l += cl * e_factor * math.sin(arg)
        sum_r += cr * e_factor * math.cos(arg)

    sum_b = 0
    for d, ms, mm, f, cb in lat_terms:
        arg = d * D_r + ms * M_s + mm * M_m + f * F_r
        e_factor = E ** abs(ms)
        sum_b += cb * e_factor * math.sin(arg)

    # Additive corrections for Venus, Jupiter, flattening
    A1 = math.radians((119.75 + 131.849 * T) % 360)
    A2 = math.radians((53.09 + 479264.290 * T) % 360)
    A3 = math.radians((313.45 + 481266.484 * T) % 360)

    sum_l += 3958 * math.sin(A1) + 1962 * math.sin(Lp_r - F_r) + 318 * math.sin(A2)
    sum_b += -2235 * math.sin(Lp_r) + 382 * math.sin(A3) + 175 * math.sin(A1 - F_r)
    sum_b += 175 * math.sin(A1 + F_r) + 127 * math.sin(Lp_r - M_m) - 115 * math.sin(Lp_r + M_m)

    # Ecliptic longitude, latitude, distance
    lam = (Lp + sum_l / 1e6) % 360  # degrees
    beta = sum_b / 1e6               # degrees
    dist = 385000.56 + sum_r / 1e3   # km

    lam_r = math.radians(lam)
    beta_r = math.radians(beta)

    # Convert ecliptic to equatorial (J2000 obliquity)
    eps = math.radians(23.4392911)  # J2000 mean obliquity

    # Ecliptic cartesian
    xe = dist * math.cos(beta_r) * math.cos(lam_r)
    ye = dist * math.cos(beta_r) * math.sin(lam_r)
    ze = dist * math.sin(beta_r)

    # Rotate ecliptic -> equatorial (ECI / EME2000)
    x = xe
    y = ye * math.cos(eps) - ze * math.sin(eps)
    z = ye * math.sin(eps) + ze * math.cos(eps)

    return x, y, z


def main():
    entries = []
    dt = START
    while dt <= STOP:
        x, y, z = moon_eci(dt)
        iso = dt.strftime("%Y-%m-%dT%H:%M:%S")
        entries.append({"epoch": iso, "x": round(x), "y": round(y), "z": round(z)})
        dt += timedelta(hours=STEP_HOURS)

    print(f"Computed {len(entries)} Moon positions ({START.date()} to {STOP.date()})")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT, "w") as f:
        json.dump(entries, f, separators=(",", ":"))

    print(f"Wrote {OUTPUT}")


if __name__ == "__main__":
    main()
