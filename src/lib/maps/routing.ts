export interface LatLng {
  latitude: number;
  longitude: number;
}

/**
 * Simulates generating a road-following polyline path between start and end coordinates
 */
export function getRoute(
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number,
  stepsCount: number = 30
): LatLng[] {
  const route: LatLng[] = [];
  
  // Create a realistic-looking path that doesn't just go in a straight line,
  // but bends like a road network.
  for (let i = 0; i <= stepsCount; i++) {
    const t = i / stepsCount;
    
    // Linear interpolation
    let lat = startLat + (endLat - startLat) * t;
    let lon = startLon + (endLon - startLon) * t;
    
    // Add sinusoidal road wiggles to simulate city grid bends, except at the ends
    if (i > 0 && i < stepsCount) {
      const wiggleScale = 0.0015; // roughly 150 meters
      const angle = t * Math.PI * 3.5; // 3.5 waves along the way
      lat += Math.sin(angle) * wiggleScale;
      lon += Math.cos(angle * 1.3) * wiggleScale;
    }
    
    route.push({ latitude: lat, longitude: lon });
  }
  
  return route;
}
