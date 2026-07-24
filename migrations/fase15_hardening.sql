-- ============================================================
-- FASE 15: Hardening pra-go-live
-- Jalankan di Supabase SQL Editor (service role — bypass RLS)
-- ============================================================

-- 1) Pricelist pindah ke DB (rahasia, jangan di bundle client)
create table if not exists public.pricelist_items (
  id bigserial primary key,
  part text,
  name text,
  price bigint not null default 0,
  cat_idx int not null default 0,
  img text default '',
  brand_idx int not null default 0
);
create index if not exists pricelist_items_part_idx on public.pricelist_items (lower(part));
alter table public.pricelist_items enable row level security;
-- SELECT: semua kecuali engineer (harga rahasia). Tulis: admin+.
drop policy if exists pl_select on public.pricelist_items;
create policy pl_select on public.pricelist_items for select to authenticated
  using (public.my_role() <> 'engineer');
drop policy if exists pl_write on public.pricelist_items;
create policy pl_write on public.pricelist_items for all to authenticated
  using (public.my_role() in ('admin','super_admin'))
  with check (public.my_role() in ('admin','super_admin'));

-- 2) products (produk tersimpan/starred berisi harga) — sembunyikan dari engineer
drop policy if exists products_select on public.products;
create policy products_select on public.products for select to authenticated
  using (public.my_role() <> 'engineer');

-- 3) purchase_orders — PRIVAT per sales (admin/super lihat semua; sales hanya miliknya; engineer none)
drop policy if exists po_select on public.purchase_orders;
create policy po_select on public.purchase_orders for select to authenticated
  using (public.my_role() in ('admin','super_admin') or sales_id = auth.uid());
-- Snapshot nama sales di PO (agar tetap ada walau profil dinonaktifkan/dihapus)
alter table public.purchase_orders add column if not exists sales_name text;

-- 4) profiles.is_active — nonaktifkan lembut sales yang keluar (jangan hapus)
alter table public.profiles add column if not exists is_active boolean not null default true;
-- Lindungi is_active: hanya super_admin yang boleh ubah (perluas trigger yang sudah ada)
create or replace function public.protect_role_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return new; end if;
  if new.role is distinct from old.role and public.my_role() <> 'super_admin' then
    raise exception 'Hanya super admin yang boleh mengubah role';
  end if;
  if new.is_sales is distinct from old.is_sales and public.my_role() <> 'super_admin' then
    raise exception 'Hanya super admin yang boleh mengubah is_sales';
  end if;
  if new.is_active is distinct from old.is_active and public.my_role() <> 'super_admin' then
    raise exception 'Hanya super admin yang boleh mengubah is_active';
  end if;
  return new;
end $$;

-- 5) project_milestones — pastikan RLS aktif + policy (tabel dibuat ad-hoc sebelumnya)
alter table public.project_milestones enable row level security;
drop policy if exists pm_select on public.project_milestones;
create policy pm_select on public.project_milestones for select to authenticated using (true);
drop policy if exists pm_write on public.project_milestones;
create policy pm_write on public.project_milestones for all to authenticated
  using (public.my_role() in ('admin','super_admin'))
  with check (public.my_role() in ('admin','super_admin'));

select 'FASE 15 OK' as status,
  (select count(*) from public.pricelist_items) as pricelist_rows;
