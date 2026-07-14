import { calculateDistance } from './distance';

/**
 * Calculates Estimated Time of Arrival (ETA) in minutes
 * Assumes average speed of 30 km/h in urban environments (0.5 km per minute)
 */
export function calculateETA(
  distanceKm: number,
  trafficCondition: 'smooth' | 'moderate' | 'jammed' = 'moderate'
): number {
  if (distanceKm <= 0) return 0;
  
  const baseSpeedKmh = 30; // km/h
  let travelTimeMinutes = (distanceKm / baseSpeedKmh) * 60;
  
  // Traffic multiplier
  const multiplier = {
    smooth: 0.8,   // 20% faster
    moderate: 1.2, // 20% delay
    jammed: 2.2,   // 120% delay
  }[trafficCondition];
  
  travelTimeMinutes *= multiplier;
  
  // Minimum 1 minute if distance is greater than 0
  return Math.max(1, Math.ceil(travelTimeMinutes));
}

/**
 * Formats ETA string (e.g. "12 menit")
 */
export function formatETA(minutes: number): string {
  if (minutes < 1) return 'Kurang dari 1 menit';
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} jam ${mins} menit`;
  }
  return `${minutes} menit`;
}
