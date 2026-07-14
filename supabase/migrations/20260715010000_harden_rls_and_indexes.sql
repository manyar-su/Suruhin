create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create index if not exists auth_credentials_profile_id_idx on public.auth_credentials(profile_id);
create index if not exists auth_sessions_profile_id_idx on public.auth_sessions(profile_id);
create index if not exists audit_logs_booking_id_idx on public.audit_logs(booking_id);
create index if not exists audit_logs_performed_by_id_idx on public.audit_logs(performed_by_id);
create index if not exists booking_messages_sender_id_idx on public.booking_messages(sender_id);
create index if not exists bookings_talent_service_id_idx on public.bookings(talent_service_id);
create index if not exists live_locations_user_id_idx on public.live_locations(user_id);
create index if not exists payments_payer_id_idx on public.payments(payer_id);
create index if not exists reviews_booking_id_idx on public.reviews(booking_id);
create index if not exists reviews_customer_id_idx on public.reviews(customer_id);
create index if not exists safety_incidents_booking_id_idx on public.safety_incidents(booking_id);
create index if not exists service_extensions_booking_id_idx on public.service_extensions(booking_id);
create index if not exists services_subcategory_id_idx on public.services(subcategory_id);
create index if not exists talent_service_images_talent_service_id_idx on public.talent_service_images(talent_service_id);
create index if not exists talent_service_revisions_submitted_by_id_idx on public.talent_service_revisions(submitted_by_id);
create index if not exists talent_service_revisions_talent_service_id_idx on public.talent_service_revisions(talent_service_id);
create index if not exists talent_services_category_id_idx on public.talent_services(category_id);
create index if not exists talent_services_reviewed_by_id_idx on public.talent_services(reviewed_by_id);
create index if not exists talent_services_subcategory_id_idx on public.talent_services(subcategory_id);
create index if not exists tips_booking_id_idx on public.tips(booking_id);
create index if not exists tips_customer_id_idx on public.tips(customer_id);
create index if not exists tips_talent_id_idx on public.tips(talent_id);
create index if not exists wallet_transactions_booking_id_idx on public.wallet_transactions(booking_id);
create index if not exists wallet_transactions_wallet_id_idx on public.wallet_transactions(wallet_id);

drop policy if exists "mvp bookings insert" on public.bookings;
create policy "mvp bookings insert" on public.bookings
for insert with check (
  customer_name <> ''
  and customer_phone <> ''
  and total >= 0
  and price >= 0
);

drop policy if exists "mvp bookings update tracking" on public.bookings;
create policy "mvp bookings update tracking" on public.bookings
for update using (
  id <> ''
  and talent_id <> ''
) with check (
  id <> ''
  and talent_id <> ''
  and total >= 0
);

drop policy if exists "mvp status history insert" on public.booking_status_history;
create policy "mvp status history insert" on public.booking_status_history
for insert with check (
  booking_id <> ''
  and changed_by_id <> ''
);

drop policy if exists "mvp live locations upsert" on public.live_locations;
create policy "mvp live locations insert" on public.live_locations
for insert with check (
  booking_id <> ''
  and user_id <> ''
  and expires_at > now()
);

create policy "mvp live locations update" on public.live_locations
for update using (
  booking_id <> ''
  and user_id <> ''
) with check (
  booking_id <> ''
  and user_id <> ''
  and expires_at > now()
);

drop policy if exists "mvp meeting verifications write" on public.meeting_verifications;
create policy "mvp meeting verifications insert" on public.meeting_verifications
for insert with check (
  booking_id <> ''
  and expires_at > now()
);

create policy "mvp meeting verifications update" on public.meeting_verifications
for update using (
  booking_id <> ''
) with check (
  booking_id <> ''
  and expires_at > now()
);

drop policy if exists "mvp extensions write" on public.service_extensions;
create policy "mvp extensions insert" on public.service_extensions
for insert with check (
  booking_id <> ''
  and requested_minutes > 0
  and requested_price >= 0
);

create policy "mvp extensions update" on public.service_extensions
for update using (
  booking_id <> ''
) with check (
  booking_id <> ''
  and approved_price >= 0
);

drop policy if exists "mvp tips insert" on public.tips;
create policy "mvp tips insert" on public.tips
for insert with check (
  booking_id <> ''
  and amount > 0
);

drop policy if exists "mvp notifications update" on public.notifications;
create policy "mvp notifications update" on public.notifications
for update using (
  id <> ''
) with check (
  id <> ''
);

drop policy if exists "mvp booking messages insert" on public.booking_messages;
create policy "mvp booking messages insert" on public.booking_messages
for insert with check (
  booking_id <> ''
  and sender_name <> ''
  and length(trim(message)) > 0
);

drop policy if exists "mvp safety incidents write" on public.safety_incidents;
create policy "mvp safety incidents insert" on public.safety_incidents
for insert with check (
  booking_id <> ''
  and incident_type <> ''
  and description <> ''
);

create policy "mvp safety incidents update" on public.safety_incidents
for update using (
  booking_id <> ''
) with check (
  booking_id <> ''
  and incident_type <> ''
  and description <> ''
);

create policy "service auth credentials" on public.auth_credentials
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "service auth sessions" on public.auth_sessions
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "service login attempts" on public.login_attempts
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "service rate limits" on public.rate_limits
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "service payments" on public.payments
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "service audit logs" on public.audit_logs
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "service system config" on public.system_config
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "service revisions" on public.talent_service_revisions
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "service wallets" on public.wallets
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "service wallet transactions" on public.wallet_transactions
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
