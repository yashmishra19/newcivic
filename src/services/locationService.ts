// ============================================================================
// LOCATION SERVICE - GPS & OPENSTREETMAP NOMINATIM REVERSE GEOCODING
// Adapted from C:\Users\SHREE\Desktop\krrish\src\locationService.js & apiService.js
// ============================================================================

export interface LiveLocationData {
  lat: number;
  lng: number;
  address: string;
  neighborhood: string;
  city?: string;
  source: 'gps' | 'fallback';
}

// 1. Get Live GPS Coordinates from Browser Geolocation
export function getCoordinates(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported by this browser/device'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        timeout: 7000,
        enableHighAccuracy: true,
        maximumAge: 10000,
      }
    );
  });
}

// 2. Convert coordinates into clean street address using free OpenStreetMap Nominatim
export async function getAddressFromCoords(
  lat: number,
  lng: number
): Promise<{ address: string; neighborhood: string; fullAddress: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CivicWatch-CitizenApp/1.0',
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Nominatim error ${res.status}`);
    }

    const data = await res.json();
    const addr = data.address || {};

    const road = addr.road || addr.pedestrian || addr.street || addr.footway || 'Main Corridor';
    const houseNumber = addr.house_number ? `${addr.house_number} ` : '';
    const suburb = addr.suburb || addr.neighbourhood || addr.city_district || addr.quarter || 'Metro Central';
    const city = addr.city || addr.town || addr.village || addr.county || 'City Ward';
    const postcode = addr.postcode ? ` ${addr.postcode}` : '';

    const shortAddress = `${houseNumber}${road}, ${suburb}`.trim();
    const neighborhood = suburb;
    const fullAddress = data.display_name || `${shortAddress}, ${city}${postcode}`;

    return {
      address: shortAddress,
      neighborhood,
      fullAddress,
    };
  } catch (err) {
    console.warn('[LocationService] Geocoding lookup fallback:', err);
    return {
      address: `Near ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      neighborhood: 'Downtown District 4',
      fullAddress: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)} (GPS Locked)`,
    };
  }
}

// 3. Complete pipeline to acquire live location with resolved address
export async function getLiveLocationWithAddress(): Promise<LiveLocationData> {
  try {
    const { lat, lng } = await getCoordinates();
    const { address, neighborhood } = await getAddressFromCoords(lat, lng);
    return {
      lat,
      lng,
      address,
      neighborhood,
      source: 'gps',
    };
  } catch (err) {
    console.warn('[LocationService] Geolocation unavailable, using localized default location:', err);
    // San Francisco Downtown anchor default for demo
    const defaultLat = 37.7845 + (Math.random() - 0.5) * 0.008;
    const defaultLng = -122.4045 + (Math.random() - 0.5) * 0.008;
    return {
      lat: defaultLat,
      lng: defaultLng,
      address: '550 Mission St (near 1st Ave)',
      neighborhood: 'Downtown District 4',
      city: 'Metro City',
      source: 'fallback',
    };
  }
}
