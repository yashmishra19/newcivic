// ============================================================================
// LOCATION SERVICE — GPS + OSM REVERSE GEOCODING
// Thin wrapper used by apiService pipeline.
// Deep geocoding logic lives in aiService.ts (getAddressFromCoords).
// ============================================================================

import { getAddressFromCoords } from './aiService';

export interface LiveLocationData {
  lat: number;
  lng: number;
  address: string;        // human-readable display name
  neighborhood: string;   // colony / area name
  suburb?: string;
  city?: string;
  source: 'gps' | 'fallback';
}

/** Kandivali West, Mumbai — used when GPS is unavailable */
const KANDIVALI_FALLBACK: LiveLocationData = {
  lat: 19.2041,
  lng: 72.8517,
  address: 'Kandivali West, Mumbai',
  neighborhood: 'Kandivali West',
  suburb: 'Kandivali',
  city: 'Mumbai',
  source: 'fallback',
};

// Acquire raw GPS coordinates from the device
function getCoordinates(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error('Geolocation not supported'));
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { timeout: 8000, enableHighAccuracy: true, maximumAge: 15000 }
    );
  });
}

/**
 * Complete pipeline: GPS → OSM → LiveLocationData.
 * Falls back to Kandivali, Mumbai if GPS is denied or unavailable.
 */
export async function getLiveLocationWithAddress(): Promise<LiveLocationData> {
  try {
    const { lat, lng } = await getCoordinates();
    const geo = await getAddressFromCoords(lat, lng);

    return {
      lat,
      lng,
      address: geo.displayName,
      neighborhood: geo.neighborhood || geo.suburb || 'Mumbai',
      suburb: geo.suburb,
      city: geo.city,
      source: 'gps',
    };
  } catch (err) {
    console.warn('[LocationService] GPS unavailable — using Kandivali, Mumbai fallback:', err);
    return KANDIVALI_FALLBACK;
  }
}
