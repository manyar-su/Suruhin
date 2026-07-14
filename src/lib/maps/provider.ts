export type MapProviderType = 'google' | 'mapbox' | 'here' | 'openstreetmap';

export interface MapProviderConfig {
  provider: MapProviderType;
  apiKey?: string;
  mapboxToken?: string;
}

export function getActiveMapProvider(): MapProviderConfig {
  // Read from import.meta.env or default to openstreetmap for open access
  const metaEnv = (import.meta as any).env || {};
  const provider = (metaEnv.VITE_NEXT_PUBLIC_MAP_PROVIDER || 'openstreetmap') as MapProviderType;
  const apiKey = metaEnv.VITE_NEXT_PUBLIC_GOOGLE_MAPS_KEY || '';
  const mapboxToken = metaEnv.VITE_NEXT_PUBLIC_MAPBOX_TOKEN || '';

  return {
    provider,
    apiKey,
    mapboxToken,
  };
}

export const PROVIDER_ATTRIBUTIONS: Record<MapProviderType, string> = {
  google: '© Google Maps Platform',
  mapbox: '© Mapbox, © OpenStreetMap contributors',
  here: '© HERE Technologies',
  openstreetmap: '© OpenStreetMap contributors',
};
