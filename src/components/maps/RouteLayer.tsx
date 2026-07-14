import type mapboxgl from 'mapbox-gl';
import { type RouteGeometry } from '../../lib/mapbox/helpers';

export const ROUTE_SOURCE_ID = 'suruhin-route-source';
export const ROUTE_LINE_ID = 'suruhin-route-line';

/**
 * Creates or updates the visible route polyline on the active Mapbox map.
 */
export function upsertRouteLayer(map: mapboxgl.Map, route: RouteGeometry) {
  const source = map.getSource(ROUTE_SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
  const data = {
    type: 'Feature' as const,
    geometry: route,
    properties: {},
  };

  if (source) {
    source.setData(data);
    return;
  }

  map.addSource(ROUTE_SOURCE_ID, {
    type: 'geojson',
    data,
  });

  map.addLayer({
    id: ROUTE_LINE_ID,
    type: 'line',
    source: ROUTE_SOURCE_ID,
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#FF6500',
      'line-width': 5,
      'line-opacity': 0.9,
    },
  });
}

/**
 * Removes the route layer cleanly when tracking is no longer active.
 */
export function removeRouteLayer(map: mapboxgl.Map) {
  if (map.getLayer(ROUTE_LINE_ID)) {
    map.removeLayer(ROUTE_LINE_ID);
  }
  if (map.getSource(ROUTE_SOURCE_ID)) {
    map.removeSource(ROUTE_SOURCE_ID);
  }
}
