-- Suruhin MVP database schema.
-- Apply from Supabase SQL editor, Supabase CLI, or MCP SQL executor when available.

create extension if not exists pgcrypto;

do $$
begin
  create type public.app_role as enum ('customer', 'talent', 'admin', 'system');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.booking_status as enum (
    'WAITING_PAYMENT',
    'PAYMENT_VERIFICATION',
    'PAID',
    'WAITING_TALENT_CONFIRMATION',
    'TALENT_ACCEPTED',
    'TALENT_PREPARING',
    'TALENT_ON_THE_WAY',
    'TALENT_NEARBY',
    'TALENT_ARRIVED',
    'WAITING_MEETING_CONFIRMATION',
    'SERVICE_ACTIVE',
    'EXTENSION_REQUESTED',
    'WAITING_EXTENSION_APPROVAL',
    'SERVICE_COMPLETED_BY_TALENT',
    'WAITING_CUSTOMER_CONFIRMATION',
    'COMPLETED',
    'CANCELLED',
    'DISPUTED',
    'REFUNDED',
    'pending',
    'confirmed',
    'REQUESTED_EXTENSION',
    'WAITING_CUSTOMER_APPROVAL',
    'EXTENSION_ACTIVE',
    'EXTENSION_COMPLETED',
    'EXTENSION_CANCELLED',
    'EXTENSION_DISPUTED'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.meeting_type as enum ('CUSTOMER_LOCATION', 'PUBLIC_PLACE', 'CUSTOM_LOCATION', 'TALENT_LOCATION');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.tracking_mode as enum (
    'REQUIRED_DURING_TRAVEL',
    'REQUIRED_DURING_SERVICE',
    'OPTIONAL_DURING_SERVICE',
    'ARRIVAL_ONLY'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.location_role as enum ('CUSTOMER', 'TALENT');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.verification_method as enum ('PIN', 'QR', 'TWO_PARTY');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.talent_service_status as enum (
    'DRAFT',
    'PENDING_REVIEW',
    'ACTIVE',
    'REJECTED',
    'INACTIVE',
    'ARCHIVED',
    'DELETED'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.pricing_type as enum ('HOURLY', 'FIXED', 'PER_SESSION', 'CUSTOM_QUOTE', 'PER_DAY');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.service_mode as enum ('ONLINE', 'OFFLINE', 'ONLINE_OFFLINE');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.payment_status as enum ('PENDING', 'PAID', 'HELD', 'RELEASED', 'REFUNDED', 'FAILED', 'CANCELLED');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.incident_status as enum ('PENDING', 'RESOLVED');
exception when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id text primary key,
  slug text unique not null,
  name text not null,
  phone text unique,
  role public.app_role not null default 'customer',
  gender text check (gender is null or gender in ('Pria', 'Wanita')),
  age integer check (age is null or age >= 13),
  location text,
  bio text,
  avatar text,
  services text[] not null default '{}',
  skills text[] not null default '{}',
  languages text[] not null default '{}',
  joined_year integer,
  rating numeric(3,2) not null default 5.00 check (rating >= 0 and rating <= 5),
  review_count integer not null default 0 check (review_count >= 0),
  completed_orders integer not null default 0 check (completed_orders >= 0),
  verified boolean not null default false,
  available boolean not null default true,
  schedule jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.auth_credentials (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null references public.profiles(id) on delete cascade,
  phone text not null unique,
  pin_hash text not null,
  is_demo boolean not null default false,
  registered_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.auth_sessions (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null references public.profiles(id) on delete cascade,
  session_token_hash text not null unique,
  user_agent text,
  ip_address inet,
  last_active_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.login_attempts (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  failed_attempts integer not null default 0,
  first_failed_at timestamptz,
  last_attempt_at timestamptz,
  locked_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (phone)
);

create table if not exists public.rate_limits (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  scope text not null,
  request_count integer not null default 0,
  window_started_at timestamptz not null default now(),
  blocked_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (key, scope)
);

create table if not exists public.service_categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  icon text not null,
  description text not null default '',
  color text not null default 'bg-slate-100 text-slate-600',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_subcategories (
  id text primary key,
  category_id text not null references public.service_categories(id) on delete cascade,
  name text not null,
  slug text not null,
  icon text not null,
  description text not null default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, slug)
);

create table if not exists public.services (
  id text primary key,
  slug text not null unique,
  title text not null,
  category_id text references public.service_categories(id) on delete set null,
  category_name text not null,
  subcategory_id text references public.service_subcategories(id) on delete set null,
  subcategory_name text,
  service_mode public.service_mode,
  short_description text not null,
  description text not null,
  location text not null,
  price integer not null default 0 check (price >= 0),
  rating numeric(3,2) not null default 5.00 check (rating >= 0 and rating <= 5),
  review_count integer not null default 0 check (review_count >= 0),
  image text not null,
  featured boolean not null default false,
  included text[] not null default '{}',
  excluded text[] not null default '{}',
  faqs jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.talent_services (
  id text primary key,
  talent_id text not null references public.profiles(id) on delete cascade,
  category_id text not null references public.service_categories(id) on delete restrict,
  category_name text not null,
  subcategory_id text references public.service_subcategories(id) on delete set null,
  subcategory_name text,
  service_mode public.service_mode,
  title text not null,
  slug text not null unique,
  short_description text not null,
  description text not null,
  pricing_type public.pricing_type not null,
  base_price integer not null default 0 check (base_price >= 0),
  hourly_price integer check (hourly_price is null or hourly_price >= 0),
  session_price integer check (session_price is null or session_price >= 0),
  overtime_price integer check (overtime_price is null or overtime_price >= 0),
  minimum_duration_minutes integer not null default 60 check (minimum_duration_minutes > 0),
  maximum_duration_minutes integer check (maximum_duration_minutes is null or maximum_duration_minutes >= minimum_duration_minutes),
  city text not null,
  district text,
  service_radius_km numeric(8,2),
  default_meeting_address text,
  default_meeting_latitude double precision,
  default_meeting_longitude double precision,
  tracking_mode public.tracking_mode not null default 'REQUIRED_DURING_TRAVEL',
  online_available boolean not null default false,
  instant_booking_available boolean not null default false,
  negotiable boolean not null default false,
  included_items text[] not null default '{}',
  excluded_items text[] not null default '{}',
  requirements text[] not null default '{}',
  cancellation_policy text,
  lateness_policy text,
  overtime_policy text,
  safety_notes text,
  status public.talent_service_status not null default 'DRAFT',
  rejection_reason text,
  moderation_notes text,
  published_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by_id text references public.profiles(id) on delete set null,
  is_deleted boolean not null default false,
  deleted_at timestamptz,
  archived_at timestamptz,
  bookings_count integer not null default 0 check (bookings_count >= 0),
  total_earnings integer not null default 0 check (total_earnings >= 0),
  rating numeric(3,2) check (rating is null or (rating >= 0 and rating <= 5)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.talent_service_images (
  id text primary key,
  talent_service_id text not null references public.talent_services(id) on delete cascade,
  url text not null,
  alt_text text not null default '',
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.talent_service_schedules (
  id text primary key,
  talent_service_id text not null references public.talent_services(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  day_name text not null,
  start_time time not null,
  end_time time not null,
  is_active boolean not null default true,
  unique (talent_service_id, day_of_week, start_time, end_time)
);

create table if not exists public.talent_service_revisions (
  id text primary key,
  talent_service_id text not null references public.talent_services(id) on delete cascade,
  submitted_by_id text not null references public.profiles(id) on delete cascade,
  previous_data jsonb,
  proposed_data jsonb not null,
  status public.talent_service_status not null default 'PENDING_REVIEW',
  rejection_reason text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id text primary key,
  customer_id text references public.profiles(id) on delete set null,
  service_id text not null,
  talent_id text not null references public.profiles(id) on delete restrict,
  talent_service_id text references public.talent_services(id) on delete set null,
  date date not null,
  time time not null,
  duration numeric(8,2) not null default 1 check (duration > 0),
  location text not null,
  notes text not null default '',
  customer_name text not null,
  customer_phone text not null,
  price integer not null default 0 check (price >= 0),
  platform_fee integer not null default 0 check (platform_fee >= 0),
  total integer not null default 0 check (total >= 0),
  status public.booking_status not null default 'WAITING_PAYMENT',
  meeting_address text,
  meeting_place_name text,
  meeting_notes text,
  meeting_latitude double precision,
  meeting_longitude double precision,
  meeting_type public.meeting_type,
  booked_start_time timestamptz,
  booked_end_time timestamptz,
  actual_start_time timestamptz,
  actual_end_time timestamptz,
  booked_duration_minutes integer,
  actual_duration_minutes integer,
  overtime_minutes integer not null default 0,
  talent_started_journey_at timestamptz,
  talent_arrived_at timestamptz,
  meeting_verified_at timestamptz,
  customer_completed_at timestamptz,
  talent_completed_at timestamptz,
  tracking_mode public.tracking_mode,
  tracking_started_at timestamptz,
  tracking_stopped_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.booking_status_history (
  id text primary key,
  booking_id text not null references public.bookings(id) on delete cascade,
  previous_status public.booking_status,
  new_status public.booking_status not null,
  changed_by_id text not null,
  latitude double precision,
  longitude double precision,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.live_locations (
  id text primary key,
  booking_id text not null references public.bookings(id) on delete cascade,
  user_id text not null references public.profiles(id) on delete cascade,
  role public.location_role not null,
  latitude double precision not null,
  longitude double precision not null,
  accuracy double precision,
  heading double precision,
  speed double precision,
  altitude double precision,
  recorded_at timestamptz not null default now(),
  expires_at timestamptz not null,
  unique (booking_id, user_id, role)
);

create table if not exists public.meeting_verifications (
  id text primary key,
  booking_id text not null unique references public.bookings(id) on delete cascade,
  method public.verification_method not null default 'PIN',
  pin_hash text,
  pin_raw text,
  customer_confirmed_at timestamptz,
  talent_confirmed_at timestamptz,
  verified_at timestamptz,
  failed_attempts integer not null default 0 check (failed_attempts >= 0),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id text primary key,
  booking_id text not null references public.bookings(id) on delete cascade,
  payer_id text references public.profiles(id) on delete set null,
  amount integer not null check (amount >= 0),
  platform_fee integer not null default 0 check (platform_fee >= 0),
  method text,
  status public.payment_status not null default 'PENDING',
  provider_reference text,
  paid_at timestamptz,
  held_at timestamptz,
  released_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_extensions (
  id text primary key,
  booking_id text not null references public.bookings(id) on delete cascade,
  requested_by public.app_role not null,
  requested_minutes integer not null check (requested_minutes > 0),
  requested_price integer not null check (requested_price >= 0),
  approved_price integer not null default 0 check (approved_price >= 0),
  payment_type text not null default '',
  status text not null check (status in ('pending', 'approved', 'completed', 'cancelled', 'disputed', 'held', 'refunded')),
  reason text not null default '',
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  completed_at timestamptz
);

create table if not exists public.tips (
  id text primary key,
  booking_id text not null references public.bookings(id) on delete cascade,
  talent_id text not null references public.profiles(id) on delete cascade,
  customer_id text not null references public.profiles(id) on delete cascade,
  amount integer not null check (amount > 0),
  message text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id text primary key,
  booking_id text references public.bookings(id) on delete set null,
  talent_id text not null references public.profiles(id) on delete cascade,
  customer_id text references public.profiles(id) on delete set null,
  service_id text,
  customer_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id text primary key,
  booking_id text references public.bookings(id) on delete cascade,
  action text not null,
  performed_by public.app_role not null,
  performed_by_id text references public.profiles(id) on delete set null,
  details text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id text primary key,
  profile_id text references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null check (type in ('time_alert', 'request', 'approved', 'paid', 'tip', 'completed', 'info')),
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.booking_messages (
  id uuid primary key default gen_random_uuid(),
  booking_id text not null references public.bookings(id) on delete cascade,
  sender_id text references public.profiles(id) on delete set null,
  sender_role public.app_role not null,
  sender_name text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.safety_incidents (
  id text primary key,
  booking_id text not null references public.bookings(id) on delete cascade,
  reported_by text not null,
  incident_type text not null,
  description text not null,
  latitude double precision,
  longitude double precision,
  status public.incident_status not null default 'PENDING',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null unique references public.profiles(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  currency text not null default 'IDR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.wallets(id) on delete cascade,
  booking_id text references public.bookings(id) on delete set null,
  direction text not null check (direction in ('credit', 'debit')),
  amount integer not null check (amount > 0),
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.system_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_available_idx on public.profiles(available) where role = 'talent';
create index if not exists services_category_idx on public.services(category_id);
create index if not exists services_featured_idx on public.services(featured) where is_active = true;
create index if not exists talent_services_talent_idx on public.talent_services(talent_id);
create index if not exists talent_services_status_idx on public.talent_services(status) where is_deleted = false;
create index if not exists bookings_customer_idx on public.bookings(customer_id);
create index if not exists bookings_talent_idx on public.bookings(talent_id);
create index if not exists bookings_status_idx on public.bookings(status);
create index if not exists booking_status_history_booking_idx on public.booking_status_history(booking_id, created_at desc);
create index if not exists live_locations_booking_idx on public.live_locations(booking_id, recorded_at desc);
create index if not exists live_locations_expires_idx on public.live_locations(expires_at);
create index if not exists payments_booking_idx on public.payments(booking_id);
create index if not exists reviews_talent_idx on public.reviews(talent_id, created_at desc);
create index if not exists notifications_profile_idx on public.notifications(profile_id, read, created_at desc);
create index if not exists booking_messages_booking_idx on public.booking_messages(booking_id, created_at asc);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists login_attempts_set_updated_at on public.login_attempts;
create trigger login_attempts_set_updated_at before update on public.login_attempts
for each row execute function public.set_updated_at();

drop trigger if exists rate_limits_set_updated_at on public.rate_limits;
create trigger rate_limits_set_updated_at before update on public.rate_limits
for each row execute function public.set_updated_at();

drop trigger if exists service_categories_set_updated_at on public.service_categories;
create trigger service_categories_set_updated_at before update on public.service_categories
for each row execute function public.set_updated_at();

drop trigger if exists service_subcategories_set_updated_at on public.service_subcategories;
create trigger service_subcategories_set_updated_at before update on public.service_subcategories
for each row execute function public.set_updated_at();

drop trigger if exists services_set_updated_at on public.services;
create trigger services_set_updated_at before update on public.services
for each row execute function public.set_updated_at();

drop trigger if exists talent_services_set_updated_at on public.talent_services;
create trigger talent_services_set_updated_at before update on public.talent_services
for each row execute function public.set_updated_at();

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at before update on public.bookings
for each row execute function public.set_updated_at();

drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at before update on public.payments
for each row execute function public.set_updated_at();

drop trigger if exists wallets_set_updated_at on public.wallets;
create trigger wallets_set_updated_at before update on public.wallets
for each row execute function public.set_updated_at();

drop trigger if exists system_config_set_updated_at on public.system_config;
create trigger system_config_set_updated_at before update on public.system_config
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.auth_credentials enable row level security;
alter table public.auth_sessions enable row level security;
alter table public.login_attempts enable row level security;
alter table public.rate_limits enable row level security;
alter table public.service_categories enable row level security;
alter table public.service_subcategories enable row level security;
alter table public.services enable row level security;
alter table public.talent_services enable row level security;
alter table public.talent_service_images enable row level security;
alter table public.talent_service_schedules enable row level security;
alter table public.talent_service_revisions enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_status_history enable row level security;
alter table public.live_locations enable row level security;
alter table public.meeting_verifications enable row level security;
alter table public.payments enable row level security;
alter table public.service_extensions enable row level security;
alter table public.tips enable row level security;
alter table public.reviews enable row level security;
alter table public.audit_logs enable row level security;
alter table public.notifications enable row level security;
alter table public.booking_messages enable row level security;
alter table public.safety_incidents enable row level security;
alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.system_config enable row level security;

-- Public catalog reads for the MVP frontend.
drop policy if exists "catalog categories are readable" on public.service_categories;
create policy "catalog categories are readable" on public.service_categories
for select using (is_active = true);

drop policy if exists "catalog subcategories are readable" on public.service_subcategories;
create policy "catalog subcategories are readable" on public.service_subcategories
for select using (is_active = true);

drop policy if exists "catalog services are readable" on public.services;
create policy "catalog services are readable" on public.services
for select using (is_active = true);

drop policy if exists "active talent services are readable" on public.talent_services;
create policy "active talent services are readable" on public.talent_services
for select using (status = 'ACTIVE' and is_deleted = false);

drop policy if exists "talent service media is readable" on public.talent_service_images;
create policy "talent service media is readable" on public.talent_service_images
for select using (true);

drop policy if exists "talent service schedules are readable" on public.talent_service_schedules;
create policy "talent service schedules are readable" on public.talent_service_schedules
for select using (true);

drop policy if exists "public talent profiles are readable" on public.profiles;
create policy "public talent profiles are readable" on public.profiles
for select using (role in ('talent', 'admin') or verified = true);

drop policy if exists "reviews are readable" on public.reviews;
create policy "reviews are readable" on public.reviews
for select using (true);

-- Demo policies allow anon MVP writes until Supabase Auth is wired into the product.
-- Tighten these before handling real customer payments.
drop policy if exists "mvp bookings read" on public.bookings;
create policy "mvp bookings read" on public.bookings
for select using (true);

drop policy if exists "mvp bookings insert" on public.bookings;
create policy "mvp bookings insert" on public.bookings
for insert with check (true);

drop policy if exists "mvp bookings update tracking" on public.bookings;
create policy "mvp bookings update tracking" on public.bookings
for update using (true) with check (true);

drop policy if exists "mvp status history read" on public.booking_status_history;
create policy "mvp status history read" on public.booking_status_history
for select using (true);

drop policy if exists "mvp status history insert" on public.booking_status_history;
create policy "mvp status history insert" on public.booking_status_history
for insert with check (true);

drop policy if exists "mvp live locations read" on public.live_locations;
create policy "mvp live locations read" on public.live_locations
for select using (expires_at > now());

drop policy if exists "mvp live locations upsert" on public.live_locations;
create policy "mvp live locations upsert" on public.live_locations
for all using (true) with check (true);

drop policy if exists "mvp meeting verifications read" on public.meeting_verifications;
create policy "mvp meeting verifications read" on public.meeting_verifications
for select using (true);

drop policy if exists "mvp meeting verifications write" on public.meeting_verifications;
create policy "mvp meeting verifications write" on public.meeting_verifications
for all using (true) with check (true);

drop policy if exists "mvp extensions read" on public.service_extensions;
create policy "mvp extensions read" on public.service_extensions
for select using (true);

drop policy if exists "mvp extensions write" on public.service_extensions;
create policy "mvp extensions write" on public.service_extensions
for all using (true) with check (true);

drop policy if exists "mvp tips read" on public.tips;
create policy "mvp tips read" on public.tips
for select using (true);

drop policy if exists "mvp tips insert" on public.tips;
create policy "mvp tips insert" on public.tips
for insert with check (true);

drop policy if exists "mvp notifications read" on public.notifications;
create policy "mvp notifications read" on public.notifications
for select using (true);

drop policy if exists "mvp notifications update" on public.notifications;
create policy "mvp notifications update" on public.notifications
for update using (true) with check (true);

drop policy if exists "mvp booking messages read" on public.booking_messages;
create policy "mvp booking messages read" on public.booking_messages
for select using (true);

drop policy if exists "mvp booking messages insert" on public.booking_messages;
create policy "mvp booking messages insert" on public.booking_messages
for insert with check (true);

drop policy if exists "mvp safety incidents write" on public.safety_incidents;
create policy "mvp safety incidents write" on public.safety_incidents
for all using (true) with check (true);

insert into public.system_config (key, value)
values (
  'overtime_policy',
  '{"hourlyOvertimeRate":40000,"toleranceFreeMinutes":10,"tolerance30MinLimit":30,"tolerance60MinLimit":60}'::jsonb
)
on conflict (key) do update set value = excluded.value, updated_at = now();

alter table public.bookings replica identity full;
alter table public.booking_status_history replica identity full;
alter table public.live_locations replica identity full;
alter table public.booking_messages replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.bookings;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.booking_status_history;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.live_locations;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.booking_messages;
exception when duplicate_object then null;
end $$;

do $$
begin
  if exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'rls_auto_enable'
  ) then
    execute 'revoke all on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end $$;
