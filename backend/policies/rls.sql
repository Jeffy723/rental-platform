-- Run this in Supabase SQL editor to allow frontend registration inserts.
-- This is permissive for development/demo environments.

alter table if exists public.owners enable row level security;
alter table if exists public.tenants enable row level security;

drop policy if exists owners_insert_anon on public.owners;
create policy owners_insert_anon
on public.owners
for insert
to anon, authenticated
with check (true);

drop policy if exists tenants_insert_anon on public.tenants;
create policy tenants_insert_anon
on public.tenants
for insert
to anon, authenticated
with check (true);

-- Optional read policies if your app reads these tables from frontend.
drop policy if exists owners_select_anon on public.owners;
create policy owners_select_anon
on public.owners
for select
to anon, authenticated
using (true);

drop policy if exists owners_update_anon on public.owners;
create policy owners_update_anon
on public.owners
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists tenants_select_anon on public.tenants;
create policy tenants_select_anon
on public.tenants
for select
to anon, authenticated
using (true);

drop policy if exists tenants_update_anon on public.tenants;
create policy tenants_update_anon
on public.tenants
for update
to anon, authenticated
using (true)
with check (true);
