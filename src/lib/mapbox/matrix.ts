import { getMapboxAccessToken } from './client';
import { MapCoordinate } from './helpers';

export interface MatrixRequestOptions {
  profile?: 'mapbox/driving' | 'mapbox/driving-traffic' | 'mapbox/walking' | 'mapbox/cycling';
  sources?: number[];
  destinations?: number[];
  annotations?: Array<'duration' | 'distance'>;
  approaches?: Array<'unrestricted' | 'curb' | ''>;
  departAt?: string;
  fallbackSpeedKph?: number;
}

export interface MatrixWaypoint {
  name?: string;
  location: [number, number];
  distance?: number;
}

export interface MatrixResult {
  durations?: Array<Array<number | null>>;
  distances?: Array<Array<number | null>>;
  sources: MatrixWaypoint[];
  destinations: MatrixWaypoint[];
}

function formatIndices(indices?: number[]) {
  if (!indices || indices.length === 0) return undefined;
  return indices.join(';');
}

function formatApproaches(approaches?: Array<'unrestricted' | 'curb' | ''>) {
  if (!approaches || approaches.length === 0) return undefined;
  return approaches.join(';');
}

/**
 * Mapbox Matrix API returns duration and/or distance matrices for many-to-many travel lookups.
 * Docs: https://docs.mapbox.com/api/navigation/matrix/
 */
export async function fetchMatrix(points: MapCoordinate[], options?: MatrixRequestOptions): Promise<MatrixResult> {
  const token = getMapboxAccessToken();
  if (!token) {
    throw new Error('Mapbox access token belum tersedia.');
  }

  if (points.length < 2) {
    throw new Error('Matrix membutuhkan minimal dua koordinat.');
  }

  const profile = options?.profile || 'mapbox/driving';
  const coordinates = points.map((point) => `${point.longitude},${point.latitude}`).join(';');
  const params = new URLSearchParams({
    access_token: token,
    annotations: options?.annotations?.join(',') || 'duration,distance',
  });

  const sources = formatIndices(options?.sources);
  if (sources) params.set('sources', sources);

  const destinations = formatIndices(options?.destinations);
  if (destinations) params.set('destinations', destinations);

  const approaches = formatApproaches(options?.approaches);
  if (approaches) params.set('approaches', approaches);

  if (options?.departAt) params.set('depart_at', options.departAt);
  if (options?.fallbackSpeedKph && options.fallbackSpeedKph > 0) {
    params.set('fallback_speed', String(options.fallbackSpeedKph));
  }

  const url = `https://api.mapbox.com/directions-matrix/v1/${profile}/${coordinates}?${params.toString()}`;
  const response = await fetch(url);
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload) {
    throw new Error(payload?.message || 'Gagal mengambil data Matrix API dari Mapbox.');
  }

  if (payload.code !== 'Ok') {
    throw new Error(payload.message || payload.code || 'Matrix API tidak mengembalikan hasil yang valid.');
  }

  return {
    durations: payload.durations,
    distances: payload.distances,
    sources: payload.sources || [],
    destinations: payload.destinations || [],
  } satisfies MatrixResult;
}
