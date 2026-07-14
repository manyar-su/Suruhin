import { useEffect, useState } from 'react';
import { type MapCoordinate } from '../lib/mapbox/helpers';

interface UseGeolocationOptions {
  enabled?: boolean;
  watch?: boolean;
}

/**
 * Reads the browser geolocation API and exposes loading, error, and live coordinates.
 */
export function useGeolocation({ enabled = true, watch = false }: UseGeolocationOptions = {}) {
  const [position, setPosition] = useState<MapCoordinate | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      setError('Browser ini tidak mendukung geolocation.');
      setIsLoading(false);
      return;
    }

    const handleSuccess = (geoPosition: GeolocationPosition) => {
      setPosition({
        latitude: geoPosition.coords.latitude,
        longitude: geoPosition.coords.longitude,
      });
      setIsLoading(false);
      setError(null);
    };

    const handleError = () => {
      setError('Izin lokasi belum diberikan atau sinyal GPS belum tersedia.');
      setIsLoading(false);
    };

    const watchId = watch
      ? navigator.geolocation.watchPosition(handleSuccess, handleError, {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 12000,
        })
      : null;

    if (!watch) {
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 12000,
      });
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [enabled, watch]);

  return {
    position,
    isLoading,
    error,
  };
}
