do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'customers' and policyname = 'mvp_customers_delete') then
    create policy mvp_customers_delete on public.customers for delete to anon, authenticated using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'talents' and policyname = 'mvp_talents_delete') then
    create policy mvp_talents_delete on public.talents for delete to anon, authenticated using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'mvp_private_upload_delete') then
    create policy mvp_private_upload_delete on storage.objects
      for delete to anon, authenticated
      using (bucket_id in ('customer-files', 'talent-files'));
  end if;
end;
$$;
