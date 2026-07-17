-- ============================================================
-- FASE 1: Role & Permission
-- Jalankan SEBELUM push kode Fase 1, di Supabase SQL Editor.
-- Role: super_admin | admin | sales | engineer
-- ============================================================

-- 1. Kolom role & initials di profiles
alter table public.profiles add column if not exists role text not null default 'sales';
alter table public.profiles add column if not exists initials text;
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('super_admin','admin','sales','engineer'));

-- 2. Helper: role user yang sedang login (security definer = anti RLS-recursion)
create or replace function public.my_role() returns text
language sql stable security definer set search_path = public as
$$ select coalesce((select role from public.profiles where id = auth.uid()), 'sales') $$;

-- 3. Trigger: hanya super_admin yang boleh mengubah role
create or replace function public.protect_role_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- Izinkan jika dijalankan tanpa user login (SQL Editor / service role)
  if auth.uid() is null then return new; end if;
  if new.role is distinct from old.role and public.my_role() <> 'super_admin' then
    raise exception 'Hanya super admin yang boleh mengubah role';
  end if;
  return new;
end $$;
drop trigger if exists trg_protect_role on public.profiles;
create trigger trg_protect_role before update on public.profiles
for each row execute function public.protect_role_change();

-- 4. Hapus semua policy lama di tabel terkait, lalu buat ulang yang bersih
do $$ declare pol record; begin
  for pol in
    select policyname, tablename from pg_policies
    where schemaname = 'public'
      and tablename in ('customers','products','customer_contacts','quotations','visits','app_settings','profiles')
  loop
    execute format('drop policy if exists %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end $$;

alter table public.customers         enable row level security;
alter table public.products          enable row level security;
alter table public.customer_contacts enable row level security;
alter table public.quotations        enable row level security;
alter table public.visits            enable row level security;
alter table public.app_settings      enable row level security;
alter table public.profiles          enable row level security;

-- PROFILES: semua bisa lihat; update diri sendiri atau oleh super_admin (role dijaga trigger)
create policy profiles_select on public.profiles for select to authenticated using (true);
create policy profiles_insert on public.profiles for insert to authenticated with check (id = auth.uid());
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid() or public.my_role() = 'super_admin')
  with check (id = auth.uid() or public.my_role() = 'super_admin');

-- DATABASE (customers, products, customer_contacts): semua bisa lihat; tulis hanya admin+
create policy customers_select on public.customers for select to authenticated using (true);
create policy customers_insert on public.customers for insert to authenticated
  with check (public.my_role() in ('admin','super_admin'));
create policy customers_update on public.customers for update to authenticated
  using (public.my_role() in ('admin','super_admin'))
  with check (public.my_role() in ('admin','super_admin'));
create policy customers_delete on public.customers for delete to authenticated
  using (public.my_role() in ('admin','super_admin'));

create policy products_select on public.products for select to authenticated using (true);
create policy products_insert on public.products for insert to authenticated
  with check (public.my_role() in ('admin','super_admin'));
create policy products_update on public.products for update to authenticated
  using (public.my_role() in ('admin','super_admin'))
  with check (public.my_role() in ('admin','super_admin'));
create policy products_delete on public.products for delete to authenticated
  using (public.my_role() in ('admin','super_admin'));

create policy contacts_select on public.customer_contacts for select to authenticated using (true);
create policy contacts_insert on public.customer_contacts for insert to authenticated
  with check (public.my_role() in ('admin','super_admin'));
create policy contacts_update on public.customer_contacts for update to authenticated
  using (public.my_role() in ('admin','super_admin'))
  with check (public.my_role() in ('admin','super_admin'));
create policy contacts_delete on public.customer_contacts for delete to authenticated
  using (public.my_role() in ('admin','super_admin'));

-- QUOTATIONS: semua bisa lihat (nilai disembunyikan di UI utk engineer);
-- insert oleh sales/admin+; update milik sendiri (sales) atau semua (admin+); delete admin+
create policy quotations_select on public.quotations for select to authenticated using (true);
create policy quotations_insert on public.quotations for insert to authenticated
  with check (public.my_role() in ('sales','admin','super_admin') and created_by = auth.uid());
create policy quotations_update on public.quotations for update to authenticated
  using (public.my_role() in ('admin','super_admin')
         or (public.my_role() = 'sales' and created_by = auth.uid()))
  with check (public.my_role() in ('admin','super_admin')
         or (public.my_role() = 'sales' and created_by = auth.uid()));
create policy quotations_delete on public.quotations for delete to authenticated
  using (public.my_role() in ('admin','super_admin'));

-- VISITS: sama seperti quotations; delete milik sendiri atau admin+
create policy visits_select on public.visits for select to authenticated using (true);
create policy visits_insert on public.visits for insert to authenticated
  with check (public.my_role() in ('sales','admin','super_admin') and created_by = auth.uid());
create policy visits_update on public.visits for update to authenticated
  using (public.my_role() in ('admin','super_admin')
         or (public.my_role() = 'sales' and created_by = auth.uid()))
  with check (public.my_role() in ('admin','super_admin')
         or (public.my_role() = 'sales' and created_by = auth.uid()));
create policy visits_delete on public.visits for delete to authenticated
  using (public.my_role() in ('admin','super_admin') or created_by = auth.uid());

-- APP_SETTINGS: semua bisa lihat; tulis admin+
create policy settings_select on public.app_settings for select to authenticated using (true);
create policy settings_insert on public.app_settings for insert to authenticated
  with check (public.my_role() in ('admin','super_admin'));
create policy settings_update on public.app_settings for update to authenticated
  using (public.my_role() in ('admin','super_admin'))
  with check (public.my_role() in ('admin','super_admin'));
create policy settings_delete on public.app_settings for delete to authenticated
  using (public.my_role() in ('admin','super_admin'));

-- 5. Set Julius sebagai super_admin
update public.profiles set role = 'super_admin'
where id in (select id from auth.users where email in ('julius@gso.co.id'));

-- Cek hasil:
-- select p.name, p.role, u.email from public.profiles p join auth.users u on u.id = p.id;
