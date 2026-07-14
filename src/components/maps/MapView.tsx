import { useEffect, useMemo, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { createCustomerMarker } from './CustomerMarker';
import { createTalentMarker } from './TalentMarker';
import { removeRouteLayer, upsertRouteLayer } from './RouteLayer';
import { type MapCoordinate, type RouteGeometry, toLngLat } from '../../lib/mapbox/helpers';
import { getMapboxClient } from '../../lib/mapbox/client';

interface MapViewProps {
  canSelectMeetingPoint?: boolean;
  customerPosition: MapCoordinate | null;
  isLoading?: boolean;
  meetingPoint: MapCoordinate | null;
  onSelectMeetingPoint?: (point: MapCoordinate) => void;
  routeGeometry: RouteGeometry | null;
  talentPosition: MapCoordinate | null;
}

export function MapView({
  canSelectMeetingPoint = false,
  customerPosition,
  isLoading = false,
  meetingPoint,
  onSelectMeetingPoint,
  routeGeometry,
  talentPosition,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const customerMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const talentMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const meetingMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const preferredCenter = useMemo(
    () => meetingPoint || customerPosition || talentPosition,
    [customerPosition, meetingPoint, talentPosition]
  );

  useEffect(() => {
    const mapbox = getMapboxClient();
    if (!containerRef.current || !mapbox || !preferredCenter || mapRef.current) {
      return;
    }

    mapRef.current = new mapbox.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: toLngLat(preferredCenter),
      zoom: 13.5,
      attributionControl: true,
    });

    mapRef.current.addControl(new mapbox.NavigationControl(), 'top-right');

    return () => {
      customerMarkerRef.current?.remove();
      talentMarkerRef.current?.remove();
      meetingMarkerRef.current?.remove();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [preferredCenter]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !preferredCenter) {
      return;
    }

    map.easeTo({
      center: toLngLat(preferredCenter),
      duration: 900,
      essential: true,
    });
  }, [preferredCenter?.latitude, preferredCenter?.longitude]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (customerPosition) {
      if (!customerMarkerRef.current) {
        customerMarkerRef.current = createCustomerMarker('Pengguna');
      }
      customerMarkerRef.current.setLngLat(toLngLat(customerPosition)).addTo(map);
    } else {
      customerMarkerRef.current?.remove();
    }
  }, [customerPosition?.latitude, customerPosition?.longitude]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (talentPosition) {
      if (!talentMarkerRef.current) {
        talentMarkerRef.current = createTalentMarker('Talent');
      }
      talentMarkerRef.current.setLngLat(toLngLat(talentPosition)).addTo(map);
    } else {
      talentMarkerRef.current?.remove();
    }
  }, [talentPosition?.latitude, talentPosition?.longitude]);

  useEffect(() => {
    const map = mapRef.current;
    const mapbox = getMapboxClient();
    if (!map || !mapbox) return;

    if (meetingPoint) {
      if (!meetingMarkerRef.current) {
        meetingMarkerRef.current = new mapbox.Marker({
          color: '#18A957',
        });
      }
      meetingMarkerRef.current.setLngLat(toLngLat(meetingPoint)).addTo(map);
    } else {
      meetingMarkerRef.current?.remove();
    }
  }, [meetingPoint?.latitude, meetingPoint?.longitude]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    if (!routeGeometry || !meetingPoint || !talentPosition) {
      if (map.isStyleLoaded()) {
        removeRouteLayer(map);
      } else {
        map.once('load', () => removeRouteLayer(map));
      }
      return;
    }

    const applyRoute = () => {
      upsertRouteLayer(map, routeGeometry);
      const bounds = new mapboxgl.LngLatBounds();
      routeGeometry.coordinates.forEach((coordinate) => bounds.extend(coordinate));
      map.fitBounds(bounds, {
        padding: 56,
        duration: 900,
        maxZoom: 15.5,
      });
    };

    if (map.isStyleLoaded()) {
      applyRoute();
    } else {
      map.once('load', applyRoute);
    }
  }, [meetingPoint?.latitude, meetingPoint?.longitude, routeGeometry, talentPosition?.latitude, talentPosition?.longitude]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !onSelectMeetingPoint) {
      return;
    }

    const clickHandler = (event: mapboxgl.MapMouseEvent) => {
      if (!canSelectMeetingPoint) {
        return;
      }

      onSelectMeetingPoint({
        latitude: event.lngLat.lat,
        longitude: event.lngLat.lng,
      });
    };

    map.on('click', clickHandler);

    return () => {
      map.off('click', clickHandler);
    };
  }, [canSelectMeetingPoint, onSelectMeetingPoint]);

  return (
    <div className="relative overflow-hidden rounded-[30px] border border-slate-100 bg-slate-100 shadow-inner">
      <div ref={containerRef} className="h-[360px] w-full sm:h-[430px]" />

      {isLoading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-bold text-[#082B5C] shadow-sm">
            Menyiapkan peta dan rute perjalanan...
          </div>
        </div>
      )}

      {!preferredCenter && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/85 p-6 text-center">
          <div className="max-w-sm rounded-3xl border border-dashed border-slate-200 bg-white px-5 py-6 shadow-sm">
            <h3 className="text-base font-black text-[#082B5C]">Titik temu belum siap</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#172033]/70">
              Izinkan lokasi browser atau pilih titik temu di peta supaya Mapbox bisa menghitung rute dan ETA.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
