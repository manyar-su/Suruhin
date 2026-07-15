create extension if not exists pgcrypto;

create table if not exists public.job_posts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  customer_name text not null,
  title text not null,
  slug text not null unique,
  description text not null,
  category_id text not null,
  category_name text not null,
  budget numeric not null default 0 check (budget >= 0),
  location text not null,
  latitude numeric,
  longitude numeric,
  service_mode text not null default 'OFFLINE' check (service_mode in ('ONLINE', 'OFFLINE', 'HYBRID')),
  deadline date,
  status text not null default 'OPEN' check (status in ('DRAFT', 'OPEN', 'IN_DISCUSSION', 'RECRUITED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED')),
  image_path text,
  file_path text,
  selected_talent_id uuid references public.talents(id) on delete set null,
  selected_application_id uuid,
  accepted_order_id uuid references public.orders(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_comments (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.job_posts(id) on delete cascade,
  user_id text not null,
  actor_role text not null check (actor_role in ('customer', 'talent', 'admin')),
  actor_name text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.job_posts(id) on delete cascade,
  talent_id uuid not null references public.talents(id) on delete cascade,
  talent_name text not null,
  talent_avatar text,
  offer_price numeric not null default 0 check (offer_price >= 0),
  estimated_duration text not null,
  message text not null,
  status text not null default 'SUBMITTED' check (status in ('SUBMITTED', 'VIEWED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN')),
  created_at timestamptz not null default now()
);

alter table public.job_posts
  add constraint job_posts_selected_application_fk
  foreign key (selected_application_id) references public.job_applications(id) on delete set null;

create index if not exists job_posts_customer_idx on public.job_posts(customer_id, created_at desc);
create index if not exists job_posts_status_idx on public.job_posts(status, created_at desc);
create index if not exists job_posts_slug_idx on public.job_posts(slug);
create index if not exists job_comments_job_idx on public.job_comments(job_id, created_at asc);
create index if not exists job_applications_job_idx on public.job_applications(job_id, created_at desc);
create index if not exists job_applications_talent_idx on public.job_applications(talent_id, created_at desc);
create unique index if not exists job_applications_active_unique_idx
  on public.job_applications(job_id, talent_id)
  where status in ('SUBMITTED', 'VIEWED', 'SHORTLISTED', 'ACCEPTED');

create or replace function public.touch_job_post_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_job_post_updated_at on public.job_posts;
create trigger trg_touch_job_post_updated_at
before update on public.job_posts
for each row execute function public.touch_job_post_updated_at();

alter table public.job_posts enable row level security;
alter table public.job_comments enable row level security;
alter table public.job_applications enable row level security;

create or replace function public.current_actor_id()
returns text
language sql
stable
as $$
  select coalesce(
    nullif(auth.jwt() ->> 'profile_id', ''),
    nullif(auth.jwt() ->> 'sub', '')
  );
$$;

create or replace function public.current_actor_type()
returns text
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'account_type', auth.jwt() ->> 'user_type', ''));
$$;

create or replace function public.is_admin_actor()
returns boolean
language sql
stable
as $$
  select coalesce(
    (auth.jwt() ->> 'role') in ('service_role', 'admin'),
    false
  );
$$;

drop policy if exists "job posts anon read" on public.job_posts;
create policy "job posts anon read" on public.job_posts
for select to anon, authenticated
using (true);

drop policy if exists "job posts customer insert" on public.job_posts;
create policy "job posts customer insert" on public.job_posts
for insert to authenticated
with check (
  public.is_admin_actor()
  or (
    public.current_actor_type() = 'customer'
    and public.current_actor_id() = customer_id::text
  )
);

drop policy if exists "job posts customer update" on public.job_posts;
create policy "job posts customer update" on public.job_posts
for update to authenticated
using (
  public.is_admin_actor()
  or (
    public.current_actor_type() = 'customer'
    and public.current_actor_id() = customer_id::text
  )
)
with check (
  public.is_admin_actor()
  or (
    public.current_actor_type() = 'customer'
    and public.current_actor_id() = customer_id::text
  )
);

drop policy if exists "job posts customer delete" on public.job_posts;
create policy "job posts customer delete" on public.job_posts
for delete to authenticated
using (
  public.is_admin_actor()
  or (
    public.current_actor_type() = 'customer'
    and public.current_actor_id() = customer_id::text
  )
);

drop policy if exists "job comments anon read" on public.job_comments;
create policy "job comments anon read" on public.job_comments
for select to anon, authenticated
using (true);

drop policy if exists "job comments actor insert" on public.job_comments;
create policy "job comments actor insert" on public.job_comments
for insert to authenticated
with check (
  public.is_admin_actor()
  or public.current_actor_id() = user_id
);

drop policy if exists "job comments actor update" on public.job_comments;
create policy "job comments actor update" on public.job_comments
for update to authenticated
using (public.is_admin_actor() or public.current_actor_id() = user_id)
with check (public.is_admin_actor() or public.current_actor_id() = user_id);

drop policy if exists "job applications anon read" on public.job_applications;
create policy "job applications anon read" on public.job_applications
for select to anon, authenticated
using (true);

drop policy if exists "job applications talent insert" on public.job_applications;
create policy "job applications talent insert" on public.job_applications
for insert to authenticated
with check (
  public.is_admin_actor()
  or (
    public.current_actor_type() = 'talent'
    and public.current_actor_id() = talent_id::text
  )
);

drop policy if exists "job applications actor update" on public.job_applications;
create policy "job applications actor update" on public.job_applications
for update to authenticated
using (
  public.is_admin_actor()
  or (
    public.current_actor_type() = 'talent'
    and public.current_actor_id() = talent_id::text
  )
)
with check (
  public.is_admin_actor()
  or (
    public.current_actor_type() = 'talent'
    and public.current_actor_id() = talent_id::text
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('job-images', 'job-images', false, 5242880, array['image/jpeg', 'image/png', 'application/pdf']::text[]),
  ('job-files', 'job-files', false, 5242880, array['image/jpeg', 'image/png', 'application/pdf']::text[])
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "job private upload insert" on storage.objects;
create policy "job private upload insert" on storage.objects
for insert to authenticated
with check (bucket_id in ('job-images', 'job-files'));

alter table public.job_posts replica identity full;
alter table public.job_comments replica identity full;
alter table public.job_applications replica identity full;

do $$
begin
  begin
    alter publication supabase_realtime add table public.job_posts;
  exception when duplicate_object then
    null;
  end;
  begin
    alter publication supabase_realtime add table public.job_comments;
  exception when duplicate_object then
    null;
  end;
  begin
    alter publication supabase_realtime add table public.job_applications;
  exception when duplicate_object then
    null;
  end;
end;
$$;
