import { createContext, useContext, useState, useCallback } from 'react';
import { formatNumber, kmsToMph, kmToMiles } from './coordinates.js';

const UnitsContext = createContext(null);

const STORAGE_KEY = 'artemis-units';

function loadPrefs() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { distance: 'mi', speed: 'mph', time: 'local', ...JSON.parse(stored) };
  } catch {}
  return { distance: 'mi', speed: 'mph', time: 'local' };
}

function savePrefs(prefs) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch {}
}

export function UnitsProvider({ children }) {
  const [units, setUnits] = useState(loadPrefs);

  const update = useCallback((patch) => {
    setUnits(prev => {
      const next = { ...prev, ...patch };
      savePrefs(next);
      return next;
    });
  }, []);

  const toggleDistance = useCallback(() => {
    update({ distance: units.distance === 'km' ? 'mi' : 'km' });
  }, [units.distance, update]);

  const toggleSpeed = useCallback(() => {
    update({ speed: units.speed === 'km/s' ? 'mph' : 'km/s' });
  }, [units.speed, update]);

  const toggleTime = useCallback(() => {
    update({ time: units.time === 'utc' ? 'local' : 'utc' });
  }, [units.time, update]);

  const formatDistance = useCallback((km) => {
    if (units.distance === 'mi') {
      return { value: formatNumber(kmToMiles(km)), unit: 'mi' };
    }
    return { value: formatNumber(km), unit: 'km' };
  }, [units.distance]);

  const formatSpeed = useCallback((kms) => {
    if (units.speed === 'mph') {
      return { value: formatNumber(kmsToMph(kms)), unit: 'mph' };
    }
    return { value: kms.toFixed(2), unit: 'km/s' };
  }, [units.speed]);

  const formatTime = useCallback((date) => {
    if (!date) return '';
    if (units.time === 'local') {
      return date.toLocaleString(undefined, {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    }
    return date.toISOString().slice(5, 16).replace('T', ' ') + ' UTC';
  }, [units.time]);

  return (
    <UnitsContext.Provider value={{
      units, toggleDistance, toggleSpeed, toggleTime,
      formatDistance, formatSpeed, formatTime,
    }}>
      {children}
    </UnitsContext.Provider>
  );
}

export function useUnits() {
  const ctx = useContext(UnitsContext);
  if (!ctx) throw new Error('useUnits must be used within UnitsProvider');
  return ctx;
}
