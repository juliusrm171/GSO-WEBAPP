-- ============================================================
-- FASE 6: Input PO & Target Sales
-- Jalankan di Supabase SQL Editor SEBELUM push kode Fase 6.
-- ============================================================

-- 1. Tabel PO (diinput admin sales, terpisah dari pipeline)
create table if not exists public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  po_number text not null,
  po_date date not null default current_date,
  customer_name text,
  sales_id uuid references public.profiles(id) on delete set null,
  quotation_id uuid references public.quotations(id) on delete set null,
  amount numeric not null default 0,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- 2. Target sales per bulan: omset (Rupiah) + jumlah visit, di-set admin/super admin
create table if not exists public.sales_targets (
  id uuid primary key default gen_random_uuid(),
  sales_id uuid references public.profiles(id) on delete cascade,
  period text not null, -- format 'YYYY-MM'
  target numeric not null default 0,
  visit_target int not null default 0,
  unique (sales_id, period)
);
-- (kalau tabel sudah terlanjur dibuat tanpa kolom ini:)
alter table public.sales_targets add column if not exists visit_target int not null default 0;

-- 3. RLS: semua bisa lihat, tulis hanya admin/super_admin
alter table public.purchase_orders enable row level security;
alter table public.sales_targets  enable row level security;

drop policy if exists po_select on public.purchase_orders;
drop policy if exists po_write  on public.purchase_orders;
drop policy if exists po_update on public.purchase_orders;
drop policy if exists po_delete on public.purchase_orders;
create policy po_select on public.purchase_orders for select to authenticated using (true);
create policy po_write  on public.purchase_orders for insert to authenticated
  with check (public.my_role() in ('admin','super_admin'));
create policy po_update on public.purchase_orders for update to authenticated
  using (public.my_role() in ('admin','super_admin'))
  with check (public.my_role() in ('admin','super_admin'));
create policy po_delete on public.purchase_orders for delete to authenticated
  using (public.my_role() in ('admin','super_admin'));

drop policy if exists tg_select on public.sales_targets;
drop policy if exists tg_write  on public.sales_targets;
drop policy if exists tg_update on public.sales_targets;
drop policy if exists tg_delete on public.sales_targets;
create policy tg_select on public.sales_targets for select to authenticated using (true);
create policy tg_write  on public.sales_targets for insert to authenticated
  with check (public.my_role() in ('admin','super_admin'));
create policy tg_update on public.sales_targets for update to authenticated
  using (public.my_role() in ('admin','super_admin'))
  with check (public.my_role() in ('admin','super_admin'));
create policy tg_delete on public.sales_targets for delete to authenticated
  using (public.my_role() in ('admin','super_admin'));
