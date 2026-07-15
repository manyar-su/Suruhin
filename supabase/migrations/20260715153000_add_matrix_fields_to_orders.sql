alter table public.orders
  add column if not exists estimated_travel_distance_km numeric,
  add column if not exists estimated_travel_duration_minutes numeric;
