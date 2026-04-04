#!/usr/bin/env python3
"""Convert CCSDS OEM ephemeris file to JSON for the dashboard."""
import json
import sys
import os

def parse_oem(filepath):
    vectors = []
    with open(filepath) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith(('CCSDS', 'COMMENT', 'CREATION',
                'ORIGINATOR', 'META_START', 'META_STOP', 'OBJECT', 'CENTER',
                'REF_FRAME', 'TIME_SYSTEM', 'START_TIME', 'USEABLE', 'STOP_TIME')):
                continue
            parts = line.split()
            if len(parts) == 7:
                try:
                    vectors.append({
                        'epoch': parts[0],
                        'x': float(parts[1]),
                        'y': float(parts[2]),
                        'z': float(parts[3]),
                        'vx': float(parts[4]),
                        'vy': float(parts[5]),
                        'vz': float(parts[6]),
                    })
                except ValueError:
                    continue
    return vectors

if __name__ == '__main__':
    oem_path = os.path.join(os.path.dirname(__file__), '..', '..',
                            'ReferenceFiles', 'Artemis_II_OEM_2026_04_02_to_EI_v3.asc')
    out_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'trajectory_data.json')

    vectors = parse_oem(oem_path)
    print(f"Parsed {len(vectors)} state vectors")
    print(f"Time range: {vectors[0]['epoch']} to {vectors[-1]['epoch']}")

    with open(out_path, 'w') as f:
        json.dump(vectors, f)
    print(f"Written to {out_path}")
