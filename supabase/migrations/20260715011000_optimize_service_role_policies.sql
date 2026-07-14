drop policy if exists "service auth credentials" on public.auth_credentials;
create policy "service auth credentials" on public.auth_credentials
for all using ((select auth.role()) = 'service_role') with check ((select auth.role()) = 'service_role');

drop policy if exists "service auth sessions" on public.auth_sessions;
create policy "service auth sessions" on public.auth_sessions
for all using ((select auth.role()) = 'service_role') with check ((select auth.role()) = 'service_role');

drop policy if exists "service login attempts" on public.login_attempts;
create policy "service login attempts" on public.login_attempts
for all using ((select auth.role()) = 'service_role') with check ((select auth.role()) = 'service_role');

drop policy if exists "service rate limits" on public.rate_limits;
create policy "service rate limits" on public.rate_limits
for all using ((select auth.role()) = 'service_role') with check ((select auth.role()) = 'service_role');

drop policy if exists "service payments" on public.payments;
create policy "service payments" on public.payments
for all using ((select auth.role()) = 'service_role') with check ((select auth.role()) = 'service_role');

drop policy if exists "service audit logs" on public.audit_logs;
create policy "service audit logs" on public.audit_logs
for all using ((select auth.role()) = 'service_role') with check ((select auth.role()) = 'service_role');

drop policy if exists "service system config" on public.system_config;
create policy "service system config" on public.system_config
for all using ((select auth.role()) = 'service_role') with check ((select auth.role()) = 'service_role');

drop policy if exists "service revisions" on public.talent_service_revisions;
create policy "service revisions" on public.talent_service_revisions
for all using ((select auth.role()) = 'service_role') with check ((select auth.role()) = 'service_role');

drop policy if exists "service wallets" on public.wallets;
create policy "service wallets" on public.wallets
for all using ((select auth.role()) = 'service_role') with check ((select auth.role()) = 'service_role');

drop policy if exists "service wallet transactions" on public.wallet_transactions;
create policy "service wallet transactions" on public.wallet_transactions
for all using ((select auth.role()) = 'service_role') with check ((select auth.role()) = 'service_role');
