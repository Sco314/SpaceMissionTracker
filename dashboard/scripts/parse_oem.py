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
    base = os.path.join(os.path.dirname(__file__), '..', '..')
    old_path = os.path.join(base, 'ReferenceFiles', 'Artemis_II_OEM_2026_04_02_to_EI_v3.asc')
    new_path = os.path.join(base, 'ReferenceFiles', 'Artemis_II_OEM_2026_04_06_Pre-OTC3_to_EI.asc')
    out_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'trajectory_data.json')

    # Parse both OEM files
    old_vectors = parse_oem(old_path)
    new_vectors = parse_oem(new_path)

    # Merge: new (more accurate) data overwrites old for overlapping epochs
    merged = {v['epoch']: v for v in old_vectors}
    for v in new_vectors:
        merged[v['epoch']] = v

    vectors = sorted(merged.values(), key=lambda v: v['epoch'])

    print(f"Old: {len(old_vectors)} vectors ({old_vectors[0]['epoch']} to {old_vectors[-1]['epoch']})")
    print(f"New: {len(new_vectors)} vectors ({new_vectors[0]['epoch']} to {new_vectors[-1]['epoch']})")
    print(f"Merged: {len(vectors)} vectors ({vectors[0]['epoch']} to {vectors[-1]['epoch']})")

    with open(out_path, 'w') as f:
        json.dump(vectors, f)
    print(f"Written to {out_path}")
