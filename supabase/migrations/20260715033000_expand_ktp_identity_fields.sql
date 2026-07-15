alter table public.customers
  add column if not exists nik text,
  add column if not exists birth_place text,
  add column if not exists birth_date date,
  add column if not exists gender text,
  add column if not exists rt_rw text,
  add column if not exists village text,
  add column if not exists district text,
  add column if not exists religion text,
  add column if not exists marital_status text,
  add column if not exists occupation text,
  add column if not exists nationality text default 'WNI';

alter table public.talents
  add column if not exists nik text,
  add column if not exists birth_place text,
  add column if not exists birth_date date,
  add column if not exists gender text,
  add column if not exists rt_rw text,
  add column if not exists village text,
  add column if not exists district text,
  add column if not exists religion text,
  add column if not exists marital_status text,
  add column if not exists occupation text,
  add column if not exists nationality text default 'WNI';

create index if not exists customers_nik_idx on public.customers(nik);
create index if not exists talents_nik_idx on public.talents(nik);
