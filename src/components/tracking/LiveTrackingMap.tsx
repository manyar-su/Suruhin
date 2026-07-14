import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, MapPin, RefreshCw, ShieldCheck, Wifi } from 'lucide-react';
import { Booking } from '../../types';
import { MapView } from '../maps/MapView';
import { ETAInfo } from '../maps/ETAInfo';
import { TrackingControls } from '../maps/TrackingControls';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useDirections } from '../../hooks/useDirections';
import { useTracking } from '../../hooks/useTracking';
import {
  buildNavigationUrl,
  calculateDistanceKm,
  deriveTravelStatus,
  isTrackingStatusActive,
  type MapCoordinate,
  type RouteGeometry,
} from '../../lib/mapbox/helpers';
import { geocodeAddress, reverseGeocode } from '../../lib/mapbox/geocoding';
import { isMapboxReady } from '../../lib/mapbox/client';

interface LiveTrackingMapProps {
  booking: Booking;
  role: 'customer' | 'talent' | 'admin';
  talentLoc: { latitude: number; longitude: number } | null;
  gpsStatus?: 'connected' | 'searching' | 'error';
  onMeetingPointChange?: (point: MapCoordinate) => void;
  userId?: string | null;
}

export function LiveTrackingMap({
  booking,
  role,
  talentLoc,
  gpsStatus = 'connected',
  onMeetingPointChange,
  userId,
}: LiveTrackingMapProps) {
  const mapboxAvailable = isMapboxReady();
  const [meetingPoint, setMeetingPoint] = useState<MapCoordinate | null>(() => {
    if (booking.meetingLatitude && booking.meetingLongitude) {
      return {
        latitude: booking.meetingLatitude,
        longitude: booking.meetingLongitude,
        address: booking.meetingAddress || booking.location,
      };
    }
    return null;
  });
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [geocodeState, setGeocodeState] = useState<'idle' | 'loading' | 'resolved' | 'error'>('idle');
  const [geocodeError, setGeocodeError] = useState<string | null>(null);

  const trackingEnabled = isTrackingStatusActive(booking.status);
  const customerGeo = useGeolocation({
    enabled: role !== 'talent',
    watch: trackingEnabled && role !== 'talent',
  });

  useEffect(() => {
    if (booking.meetingLatitude && booking.meetingLongitude) {
      setMeetingPoint({
        latitude: booking.meetingLatitude,
        longitude: booking.meetingLongitude,
        address: booking.meetingAddress || booking.location,
      });
    }
  }, [booking.location, booking.meetingAddress, booking.meetingLatitude, booking.meetingLongitude]);

  useEffect(() => {
    let cancelled = false;

    if (meetingPoint || !mapboxAvailable) {
      return;
    }

    const lookup = async () => {
      setGeocodeState('loading');
      setGeocodeError(null);

      const addressCandidate = booking.meetingAddress || booking.location;
      const resolved = addressCandidate ? await geocodeAddress(addressCandidate) : null;

      if (cancelled) {
        return;
      }

      if (resolved) {
        setMeetingPoint(resolved);
        setGeocodeState('resolved');
        onMeetingPointChange?.(resolved);
        return;
      }

      if (customerGeo.position) {
        setMeetingPoint(customerGeo.position);
        setGeocodeState('resolved');
        onMeetingPointChange?.(customerGeo.position);
        return;
      }

      setGeocodeState('error');
      setGeocodeError('Titik temu belum ditemukan. Pilih titik temu langsung di peta.');
    };

    lookup().catch((error) => {
      if (!cancelled) {
        setGeocodeState('error');
        setGeocodeError(error instanceof Error ? error.message : 'Gagal menyiapkan titik temu.');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [booking.location, booking.meetingAddress, customerGeo.position, mapboxAvailable, meetingPoint, onMeetingPointChange]);

  const tracking = useTracking({
    bookingId: booking.id,
    enabled: trackingEnabled,
    publishedTalentLocation: role === 'talent' ? talentLoc : null,
    role,
    userId,
  });

  const customerPosition = customerGeo.position || meetingPoint;
  const talentPosition = tracking.talentLocation || talentLoc;

  const directions = useDirections({
    destination: meetingPoint,
    enabled: trackingEnabled,
    origin: talentPosition,
  });

  const fallbackRouteGeometry = useMemo<RouteGeometry | null>(() => {
    if (!talentPosition || !meetingPoint) {
      return null;
    }

    return {
      type: 'LineString',
      coordinates: [
        [talentPosition.longitude, talentPosition.latitude],
        [meetingPoint.longitude, meetingPoint.latitude],
      ],
    };
  }, [meetingPoint, talentPosition]);

  const distanceKm =
    directions.route?.distanceKm ??
    (talentPosition && meetingPoint ? calculateDistanceKm(talentPosition, meetingPoint) : null);
  const etaMinutes = directions.route?.durationMinutes ?? (distanceKm !== null ? Math.max(1, Math.round((distanceKm / 28) * 60)) : null);
  const statusMeta = deriveTravelStatus(distanceKm);

  const handleSelectMeetingPoint = async (point: MapCoordinate) => {
    let label = booking.location;
    const reverseLabel = await reverseGeocode(point);
    if (reverseLabel) {
      label = reverseLabel;
    }

    const nextPoint = {
      ...point,
      address: label,
    };

    setMeetingPoint(nextPoint);
    setIsSelectionMode(false);
    onMeetingPointChange?.(nextPoint);
  };

  const handleOpenNavigation = (provider: 'google' | 'mapbox') => {
    if (!meetingPoint) {
      return;
    }
    window.open(buildNavigationUrl(provider, meetingPoint), '_blank', 'noopener,noreferrer');
  };

  const loadingOverlay = geocodeState === 'loading' || directions.isLoading || customerGeo.isLoading;

  if (!mapboxAvailable) {
    return (
      <div className="rounded-[32px] border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
        <h3 className="text-lg font-black text-[#082B5C]">Mapbox belum aktif</h3>
        <p className="mt-2 text-sm leading-relaxed text-[#172033]/70">
          Tambahkan `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` pada environment frontend agar peta, rute, dan ETA bisa dihitung langsung.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-[32px] border border-slate-100 bg-white p-3 shadow-sm">
        <MapView
          canSelectMeetingPoint={role !== 'talent' && role !== 'admin' ? isSelectionMode : isSelectionMode}
          customerPosition={customerPosition}
          isLoading={loadingOverlay}
          meetingPoint={meetingPoint}
          onSelectMeetingPoint={handleSelectMeetingPoint}
          routeGeometry={directions.route?.geometry || fallbackRouteGeometry}
          talentPosition={talentPosition}
        />

        <div className="pointer-events-none absolute left-6 right-6 top-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <ConnectionBadge
            connectionState={tracking.connectionState}
            gpsStatus={gpsStatus}
          />
          <div className="pointer-events-auto rounded-2xl border border-slate-100 bg-white/95 px-3 py-2 text-[11px] font-semibold text-[#082B5C] shadow-sm backdrop-blur-sm">
            {tracking.lastUpdatedAt ? `Update terakhir ${formatRelativeTime(tracking.lastUpdatedAt)}` : 'Menunggu update lokasi terbaru'}
          </div>
        </div>

        {(geocodeError || directions.error || customerGeo.error) && (
          <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-amber-200 bg-white/95 px-4 py-3 text-xs text-amber-700 shadow-sm">
            {geocodeError || directions.error || customerGeo.error}
          </div>
        )}
      </div>

      <ETAInfo
        distanceKm={distanceKm}
        etaMinutes={etaMinutes}
        isLoading={directions.isLoading}
        statusDescription={statusMeta.description}
        statusLabel={statusMeta.label}
      />

      <TrackingControls
        canSelectMeetingPoint={role !== 'talent'}
        isSelectionMode={isSelectionMode}
        onOpenGoogleMaps={() => handleOpenNavigation('google')}
        onOpenMapbox={() => handleOpenNavigation('mapbox')}
        onToggleSelectionMode={() => setIsSelectionMode((current) => !current)}
      />

      <div className="flex flex-wrap items-center gap-2 rounded-[24px] border border-slate-100 bg-white px-4 py-3 text-[11px] font-semibold text-[#172033]/75 shadow-sm">
        <ShieldCheck size={14} className="text-[#18A957]" />
        <span>Tracking hanya aktif selama booking berjalan dan akan berhenti otomatis setelah status selesai atau dibatalkan.</span>
      </div>
    </div>
  );
}

function ConnectionBadge({
  connectionState,
  gpsStatus,
}: {
  connectionState: 'idle' | 'connecting' | 'connected' | 'fallback' | 'error';
  gpsStatus: 'connected' | 'searching' | 'error';
}) {
  if (gpsStatus === 'error') {
    return (
      <div className="pointer-events-auto inline-flex items-center gap-2 rounded-2xl border border-red-100 bg-white/95 px-3 py-2 text-[11px] font-bold text-red-600 shadow-sm backdrop-blur-sm">
        <AlertTriangle size={13} />
        <span>GPS bermasalah</span>
      </div>
    );
  }

  if (gpsStatus === 'searching' || connectionState === 'connecting') {
    return (
      <div className="pointer-events-auto inline-flex items-center gap-2 rounded-2xl border border-amber-100 bg-white/95 px-3 py-2 text-[11px] font-bold text-amber-600 shadow-sm backdrop-blur-sm">
        <RefreshCw size={13} className="animate-spin" />
        <span>Menghubungkan tracking...</span>
      </div>
    );
  }

  return (
    <div className="pointer-events-auto inline-flex items-center gap-2 rounded-2xl border border-emerald-100 bg-white/95 px-3 py-2 text-[11px] font-bold text-[#082B5C] shadow-sm backdrop-blur-sm">
      <Wifi size={13} className="text-emerald-500" />
      <MapPin size={13} className="text-[#FF6500]" />
      <span>{connectionState === 'connected' ? 'Supabase Realtime aktif' : 'Tracking lokal aktif'}</span>
    </div>
  );
}

function formatRelativeTime(value: string) {
  const timestamp = new Date(value).getTime();
  const diffSeconds = Math.max(1, Math.round((Date.now() - timestamp) / 1000));

  if (diffSeconds < 60) {
    return `${diffSeconds} detik lalu`;
  }

  const diffMinutes = Math.round(diffSeconds / 60);
  return `${diffMinutes} menit lalu`;
}
