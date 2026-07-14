import { getMapboxAccessToken } from './client';
import { type MapCoordinate, type RouteGeometry } from './helpers';

export interface DirectionsResult {
  distanceKm: number;
  durationMinutes: number;
  geometry: RouteGeometry;
}

/**
 * Fetches a driving route from Mapbox Directions API for the active booking.
 */
export async function fetchDirections(origin: MapCoordinate, destination: MapCoordinate) {
  const token = getMapboxAccessToken();
  if (!token) {
    throw new Error('Mapbox access token belum tersedia.');
  }

  const coordinates = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?alternatives=false&geometries=geojson&overview=full&steps=false&access_token=${token}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Gagal mengambil rute dari Mapbox Directions API.');
  }

  const payload = await response.json();
  const firstRoute = payload.routes?.[0];

  if (!firstRoute?.geometry?.coordinates?.length) {
    throw new Error('Rute tidak tersedia untuk koordinat ini.');
  }

  return {
    distanceKm: Number(firstRoute.distance || 0) / 1000,
    durationMinutes: Math.max(1, Math.round(Number(firstRoute.duration || 0) / 60)),
    geometry: {
      type: 'LineString',
      coordinates: firstRoute.geometry.coordinates as [number, number][],
    },
  } satisfies DirectionsResult;
}
