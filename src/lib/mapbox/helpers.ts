export interface MapCoordinate {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface RouteGeometry {
  type: 'LineString';
  coordinates: [number, number][];
}

export interface TravelStatusMeta {
  key: 'TALENT_ON_THE_WAY' | 'TALENT_NEARBY' | 'TALENT_ARRIVED';
  label: string;
  description: string;
}

const TRACKING_ACTIVE_STATUSES = new Set([
  'TALENT_ACCEPTED',
  'TALENT_PREPARING',
  'TALENT_ON_THE_WAY',
  'TALENT_NEARBY',
  'TALENT_ARRIVED',
  'WAITING_MEETING_CONFIRMATION',
  'SERVICE_ACTIVE',
]);

/**
 * Checks whether tracking-related UI should stay active for the current booking status.
 */
export function isTrackingStatusActive(status?: string) {
  return Boolean(status && TRACKING_ACTIVE_STATUSES.has(status));
}

/**
 * Calculates straight-line distance in kilometers between two coordinates.
 */
export function calculateDistanceKm(origin: MapCoordinate, destination: MapCoordinate) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(destination.latitude - origin.latitude);
  const dLon = toRadians(destination.longitude - origin.longitude);
  const lat1 = toRadians(origin.latitude);
  const lat2 = toRadians(destination.latitude);

  const haversine =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return earthRadiusKm * (2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine)));
}

/**
 * Converts a MapCoordinate into Mapbox LngLat order.
 */
export function toLngLat(point: MapCoordinate): [number, number] {
  return [point.longitude, point.latitude];
}

/**
 * Builds a travel status label from the remaining route distance.
 */
export function deriveTravelStatus(distanceKm: number | null): TravelStatusMeta {
  if (distanceKm === null) {
    return {
      key: 'TALENT_ON_THE_WAY',
      label: 'Menunggu Rute',
      description: 'Lokasi talent atau titik temu belum lengkap.',
    };
  }

  if (distanceKm <= 0.08) {
    return {
      key: 'TALENT_ARRIVED',
      label: 'Sudah Tiba',
      description: 'Talent sudah sampai di titik pertemuan.',
    };
  }

  if (distanceKm <= 0.3) {
    return {
      key: 'TALENT_NEARBY',
      label: 'Sudah Dekat',
      description: 'Talent sudah berada di sekitar titik temu.',
    };
  }

  return {
    key: 'TALENT_ON_THE_WAY',
    label: 'Menuju Lokasi',
    description: 'Talent sedang bergerak menuju titik pertemuan.',
  };
}

/**
 * Generates external navigation deep-links for Google Maps and Mapbox.
 */
export function buildNavigationUrl(provider: 'google' | 'mapbox', destination: MapCoordinate) {
  const destinationText = `${destination.latitude},${destination.longitude}`;
  if (provider === 'google') {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinationText)}&travelmode=driving`;
  }
  return `https://www.mapbox.com/directions/?destination=${encodeURIComponent(destinationText)}&profile=mapbox/driving`;
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}
