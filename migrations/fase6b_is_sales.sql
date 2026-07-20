-- ============================================================
-- FASE 6B: Flag is_sales di profiles
-- Masalah: tidak semua akun adalah sales (purchasing, admin sales, dll)
-- tapi semuanya muncul di Target Sales, Leaderboard, dan Barometer Visit.
-- Solusi: kolom is_sales — hanya user dengan is_sales = true yang ikut
-- target/leaderboard/visit. Role apa pun bisa jadi sales (super_admin
-- yang juga jualan seperti Julius & direktur → is_sales = true).
-- Jalankan di Supabase SQL Editor, lalu atur centang "Sales" per user
-- di halaman Profil (khusus super admin).
-- ============================================================

alter table public.profiles add column if not exists is_sales boolean not null default false;

-- Baseline: semua yang ber-role 'sales' dianggap sales
update public.profiles set is_sales = true where role = 'sales';

-- Julius (super admin, juga jualan)
update public.profiles set is_sales = true where name ilike '%julius%';

-- Catatan: akun non-sales yang ikut ter-set true karena role-nya 'sales'
-- (mis. purchasing/admin sales) tinggal di-uncheck lewat UI Profil.
-- Akun direktur nanti: centang "Sales" di UI Profil setelah akunnya dibuat.

-- Proteksi: hanya super admin yang boleh mengubah is_sales
create or replace function public.protect_role_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return new; end if;
  if new.role is distinct from old.role and public.my_role() <> 'super_admin' then
    raise exception 'Hanya super admin yang boleh mengubah role';
  end if;
  if new.is_sales is distinct from old.is_sales and public.my_role() <> 'super_admin' then
    raise exception 'Hanya super admin yang boleh mengubah status sales';
  end if;
  return new;
end $$;
