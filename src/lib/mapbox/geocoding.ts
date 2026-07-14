import { getMapboxAccessToken } from './client';
import { type MapCoordinate } from './helpers';

/**
 * Resolves a free-text address into coordinates using Mapbox Geocoding API.
 */
export async function geocodeAddress(query: string): Promise<MapCoordinate | null> {
  const trimmed = query.trim();
  const token = getMapboxAccessToken();
  if (!trimmed || !token) {
    return null;
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(trimmed)}.json?limit=1&access_token=${token}`;
  const response = await fetch(url);
  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  const feature = payload.features?.[0];
  if (!feature?.center) {
    return null;
  }

  return {
    longitude: feature.center[0],
    latitude: feature.center[1],
    address: feature.place_name,
  };
}

/**
 * Resolves coordinates into a human-readable meeting point label.
 */
export async function reverseGeocode(point: MapCoordinate): Promise<string | null> {
  const token = getMapboxAccessToken();
  if (!token) {
    return null;
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${point.longitude},${point.latitude}.json?limit=1&access_token=${token}`;
  const response = await fetch(url);
  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  return payload.features?.[0]?.place_name || null;
}
