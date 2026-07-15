create or replace function public.touch_job_post_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.current_actor_id()
returns text
language sql
stable
set search_path = public
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
set search_path = public
as $$
  select lower(coalesce(auth.jwt() ->> 'account_type', auth.jwt() ->> 'user_type', ''));
$$;

create or replace function public.is_admin_actor()
returns boolean
language sql
stable
set search_path = public
as $$
  select coalesce(
    (auth.jwt() ->> 'role') in ('service_role', 'admin'),
    false
  );
$$;

create index if not exists job_posts_selected_talent_idx on public.job_posts(selected_talent_id);
create index if not exists job_posts_selected_application_idx on public.job_posts(selected_application_id);
create index if not exists job_posts_accepted_order_idx on public.job_posts(accepted_order_id);
