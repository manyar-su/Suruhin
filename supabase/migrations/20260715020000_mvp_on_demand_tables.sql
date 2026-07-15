create extension if not exists pgcrypto;

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  address text not null,
  city text not null,
  profile_photo_path text,
  ktp_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.talents (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  address text not null,
  city text not null,
  category text not null,
  bio text not null default '',
  hobby text not null default '',
  price_per_hour numeric not null default 0 check (price_per_hour >= 0),
  profile_photo_path text,
  ktp_path text,
  skck_path text,
  verification_status text not null default 'pending' check (verification_status in ('pending', 'approved', 'rejected')),
  is_available boolean not null default false,
  latitude numeric,
  longitude numeric,
  average_rating numeric not null default 0 check (average_rating >= 0 and average_rating <= 5),
  total_orders integer not null default 0 check (total_orders >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  talent_id uuid references public.talents(id) on delete set null,
  category text not null,
  order_date date not null,
  start_time time not null,
  duration_hours numeric not null default 1 check (duration_hours > 0),
  address text not null,
  latitude numeric,
  longitude numeric,
  notes text not null default '',
  price_per_hour numeric not null default 0 check (price_per_hour >= 0),
  total_price numeric not null default 0 check (total_price >= 0),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'ongoing', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz
);

create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  talent_id uuid references public.talents(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  review text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists customers_city_idx on public.customers(city);
create index if not exists talents_search_idx on public.talents(city, category, verification_status, is_available);
create index if not exists talents_rating_idx on public.talents(average_rating desc);
create index if not exists orders_customer_idx on public.orders(customer_id, created_at desc);
create index if not exists orders_talent_idx on public.orders(talent_id, status, created_at desc);
create index if not exists ratings_talent_idx on public.ratings(talent_id, created_at desc);

alter table public.customers enable row level security;
alter table public.talents enable row level security;
alter table public.orders enable row level security;
alter table public.ratings enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('customer-files', 'customer-files', false, 5242880, array['image/jpeg', 'image/png', 'application/pdf']::text[]),
  ('talent-files', 'talent-files', false, 5242880, array['image/jpeg', 'image/png', 'application/pdf']::text[])
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.refresh_mvp_talent_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.talents
  set average_rating = coalesce((
    select round(avg(rating)::numeric, 2)
    from public.ratings
    where talent_id = coalesce(new.talent_id, old.talent_id)
  ), 0)
  where id = coalesce(new.talent_id, old.talent_id);

  return coalesce(new, old);
end;
$$;

drop trigger if exists refresh_mvp_talent_rating_after_insert on public.ratings;
create trigger refresh_mvp_talent_rating_after_insert
after insert or update or delete on public.ratings
for each row execute function public.refresh_mvp_talent_rating();

create or replace function public.increment_mvp_talent_completed_orders()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'completed' and old.status is distinct from 'completed' and new.talent_id is not null then
    update public.talents
    set total_orders = total_orders + 1
    where id = new.talent_id;
  end if;

  return new;
end;
$$;

drop trigger if exists increment_mvp_talent_completed_orders_after_update on public.orders;
create trigger increment_mvp_talent_completed_orders_after_update
after update of status on public.orders
for each row execute function public.increment_mvp_talent_completed_orders();

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'customers' and policyname = 'mvp_customers_insert') then
    create policy mvp_customers_insert on public.customers for insert to anon, authenticated with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'customers' and policyname = 'mvp_customers_select') then
    create policy mvp_customers_select on public.customers for select to anon, authenticated using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'customers' and policyname = 'mvp_customers_update') then
    create policy mvp_customers_update on public.customers for update to anon, authenticated using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'talents' and policyname = 'mvp_talents_insert') then
    create policy mvp_talents_insert on public.talents for insert to anon, authenticated with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'talents' and policyname = 'mvp_talents_select') then
    create policy mvp_talents_select on public.talents for select to anon, authenticated using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'talents' and policyname = 'mvp_talents_update') then
    create policy mvp_talents_update on public.talents for update to anon, authenticated using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'orders' and policyname = 'mvp_orders_insert') then
    create policy mvp_orders_insert on public.orders for insert to anon, authenticated with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'orders' and policyname = 'mvp_orders_select') then
    create policy mvp_orders_select on public.orders for select to anon, authenticated using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'orders' and policyname = 'mvp_orders_update') then
    create policy mvp_orders_update on public.orders for update to anon, authenticated using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'ratings' and policyname = 'mvp_ratings_insert') then
    create policy mvp_ratings_insert on public.ratings for insert to anon, authenticated with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'ratings' and policyname = 'mvp_ratings_select') then
    create policy mvp_ratings_select on public.ratings for select to anon, authenticated using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'mvp_private_upload_insert') then
    create policy mvp_private_upload_insert on storage.objects
      for insert to anon, authenticated
      with check (bucket_id in ('customer-files', 'talent-files'));
  end if;
end;
$$;
