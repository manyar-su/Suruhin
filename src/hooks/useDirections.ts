import { useEffect, useState } from 'react';
import { fetchDirections, type DirectionsResult } from '../lib/mapbox/directions';
import { type MapCoordinate } from '../lib/mapbox/helpers';

interface UseDirectionsOptions {
  destination: MapCoordinate | null;
  enabled?: boolean;
  origin: MapCoordinate | null;
}

/**
 * Loads route geometry, distance, and ETA from Mapbox Directions API.
 */
export function useDirections({ origin, destination, enabled = true }: UseDirectionsOptions) {
  const [data, setData] = useState<DirectionsResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!enabled || !origin || !destination) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetchDirections(origin, destination)
      .then((result) => {
        if (!cancelled) {
          setData(result);
        }
      })
      .catch((reason) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : 'Gagal mengambil rute perjalanan.');
          setData(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [destination?.latitude, destination?.longitude, enabled, origin?.latitude, origin?.longitude]);

  return {
    route: data,
    isLoading,
    error,
  };
}
