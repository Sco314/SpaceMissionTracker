/**
 * Parse CCSDS OEM (Orbital Ephemeris Message) format into state vectors.
 * Format: "YYYY-MM-DDTHH:MM:SS.sss X Y Z VX VY VZ"
 * Units: position in km, velocity in km/s
 */
export function parseOEM(text) {
  const lines = text.split('\n');
  const vectors = [];
  let metadata = {};
  let inMeta = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === 'META_START') { inMeta = true; continue; }
    if (trimmed === 'META_STOP') { inMeta = false; continue; }

    if (inMeta) {
      const match = trimmed.match(/^(\w+)\s*=\s*(.+)$/);
      if (match) metadata[match[1]] = match[2].trim();
      continue;
    }

    if (trimmed.startsWith('COMMENT') || trimmed.startsWith('CCSDS') ||
        trimmed.startsWith('CREATION') || trimmed.startsWith('ORIGINATOR') ||
        trimmed === '' || trimmed.startsWith('META')) {
      continue;
    }

    // State vector line: epoch x y z vx vy vz
    const parts = trimmed.split(/\s+/);
    if (parts.length === 7) {
      const epoch = new Date(parts[0]);
      if (isNaN(epoch.getTime())) continue;

      vectors.push({
        epoch,
        epochMs: epoch.getTime(),
        x: parseFloat(parts[1]),
        y: parseFloat(parts[2]),
        z: parseFloat(parts[3]),
        vx: parseFloat(parts[4]),
        vy: parseFloat(parts[5]),
        vz: parseFloat(parts[6]),
      });
    }
  }

  return { metadata, vectors };
}

/**
 * Parse Horizons API JSON response into the same state vector format.
 */
export function parseHorizonsResponse(json) {
  const result = json.result || '';
  const vectors = [];

  // Extract the ephemeris data between $$SOE and $$EOE markers
  const soeIndex = result.indexOf('$$SOE');
  const eoeIndex = result.indexOf('$$EOE');
  if (soeIndex === -1 || eoeIndex === -1) return vectors;

  const dataBlock = result.substring(soeIndex + 5, eoeIndex).trim();
  const lines = dataBlock.split('\n');

  // Horizons vector format (TABLE_TYPE=2):
  // JDTDB, Calendar Date, X, Y, Z, VX, VY, VZ
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('*')) continue;

    // Look for lines with calendar date format: "2026-Apr-02 03:07:49.5830"
    const dateMatch = line.match(/=\s*A\.D\.\s+(\d{4}-\w{3}-\d{2}\s+\d{2}:\d{2}:\d{2}\.\d+)/);
    if (dateMatch) {
      // Next line has X Y Z
      const posLine = lines[i + 1]?.trim();
      // Line after has VX VY VZ
      const velLine = lines[i + 2]?.trim();

      if (posLine && velLine) {
        const posMatch = posLine.match(/X\s*=\s*([-\d.E+]+)\s+Y\s*=\s*([-\d.E+]+)\s+Z\s*=\s*([-\d.E+]+)/);
        const velMatch = velLine.match(/VX\s*=\s*([-\d.E+]+)\s+VY\s*=\s*([-\d.E+]+)\s+VZ\s*=\s*([-\d.E+]+)/);

        if (posMatch && velMatch) {
          const dateStr = dateMatch[1].replace(/-(\w{3})-/, (_, m) => {
            const months = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
                           Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
            return `-${months[m]}-`;
          }).replace(' ', 'T') + 'Z';
          const epoch = new Date(dateStr);

          vectors.push({
            epoch,
            epochMs: epoch.getTime(),
            x: parseFloat(posMatch[1]),
            y: parseFloat(posMatch[2]),
            z: parseFloat(posMatch[3]),
            vx: parseFloat(velMatch[1]),
            vy: parseFloat(velMatch[2]),
            vz: parseFloat(velMatch[3]),
          });
        }
      }
    }
  }

  return vectors;
}
