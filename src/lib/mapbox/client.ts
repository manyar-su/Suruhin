import mapboxgl from 'mapbox-gl';

/**
 * Reads the publishable Mapbox token from the frontend environment.
 */
export function getMapboxAccessToken() {
  return import.meta.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
}

/**
 * Returns whether Mapbox can be initialized safely on the client.
 */
export function isMapboxReady() {
  return Boolean(getMapboxAccessToken());
}

/**
 * Applies the runtime token to Mapbox GL and returns the client module.
 */
export function getMapboxClient() {
  const token = getMapboxAccessToken();
  if (!token) {
    return null;
  }

  mapboxgl.accessToken = token;
  return mapboxgl;
}
