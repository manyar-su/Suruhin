export interface GeocodeResult {
  latitude: number;
  longitude: number;
  placeName: string;
}

// Preset locations in Tasikmalaya for realistic mapping
export const TASIKMALAYA_PRESETS: Record<string, GeocodeResult> = {
  'alun-alun': {
    latitude: -7.3305,
    longitude: 108.2206,
    placeName: 'Alun-Alun Kota Tasikmalaya',
  },
  'masjid-agung': {
    latitude: -7.3278,
    longitude: 108.2209,
    placeName: 'Masjid Agung Kota Tasikmalaya',
  },
  'asia-plaza': {
    latitude: -7.3435,
    longitude: 108.2168,
    placeName: 'Asia Plaza Tasikmalaya',
  },
  'stasiun': {
    latitude: -7.3255,
    longitude: 108.2235,
    placeName: 'Stasiun Tasikmalaya',
  },
  'dadaha': {
    latitude: -7.3402,
    longitude: 108.2255,
    placeName: 'Kompleks Olahraga Dadaha',
  },
  'sdn1': {
    latitude: -7.3298,
    longitude: 108.2155,
    placeName: 'SDN 1 Tasikmalaya',
  },
  'unsil': {
    latitude: -7.3512,
    longitude: 108.2241,
    placeName: 'Universitas Siliwangi (UNSIL)',
  }
};

/**
 * Simulates geocoding address strings to coordinates
 */
export function geocodeAddress(address: string): GeocodeResult {
  const normalized = address.toLowerCase();
  
  if (normalized.includes('alun') || normalized.includes('alun-alun')) {
    return TASIKMALAYA_PRESETS['alun-alun'];
  }
  if (normalized.includes('masjid') || normalized.includes('agung')) {
    return TASIKMALAYA_PRESETS['masjid-agung'];
  }
  if (normalized.includes('asia') || normalized.includes('plaza')) {
    return TASIKMALAYA_PRESETS['asia-plaza'];
  }
  if (normalized.includes('stasiun')) {
    return TASIKMALAYA_PRESETS['stasiun'];
  }
  if (normalized.includes('dadaha')) {
    return TASIKMALAYA_PRESETS['dadaha'];
  }
  if (normalized.includes('sdn 1') || normalized.includes('sekolah')) {
    return TASIKMALAYA_PRESETS['sdn1'];
  }
  if (normalized.includes('unsil') || normalized.includes('siliwangi')) {
    return TASIKMALAYA_PRESETS['unsil'];
  }

  // Fallback to random coordinate in central Tasikmalaya range
  // Latitude: -7.32 to -7.35, Longitude: 108.20 to 108.23
  const hash = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const latOffset = (hash % 100) / 3300; // max ~0.03
  const lonOffset = (hash % 80) / 2600; // max ~0.03
  
  return {
    latitude: -7.3305 + latOffset - 0.015,
    longitude: 108.2206 + lonOffset - 0.015,
    placeName: address,
  };
}

/**
 * Simulates reverse geocoding from coordinates back to descriptive name
 */
export function reverseGeocode(latitude: number, longitude: number): string {
  // Find closest preset within 500m
  for (const preset of Object.values(TASIKMALAYA_PRESETS)) {
    const dLat = preset.latitude - latitude;
    const dLon = preset.longitude - longitude;
    const distSq = dLat * dLat + dLon * dLon;
    if (distSq < 0.00002) { // very close (~300 meters)
      return preset.placeName;
    }
  }

  return `Kec. Tawang, Kota Tasikmalaya (Koordinat: ${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
}
