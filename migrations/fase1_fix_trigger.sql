-- ============================================================
-- FASE 1 - PATCH: perbaikan trigger role + set super_admin
-- Copy SEMUA isi file ini ke Supabase SQL Editor lalu Run.
-- ============================================================

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

update public.profiles set role = 'super_admin'
where id in (select id from auth.users where email in ('julius@gso.co.id'));

-- Cek hasil (harus muncul role super_admin di baris kamu):
select p.name, p.role, u.email
from public.profiles p join auth.users u on u.id = p.id;
