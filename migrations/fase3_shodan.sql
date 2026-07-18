-- ============================================================
-- FASE 3: Shodan (inquiry) & Pipeline rework
-- Jalankan di Supabase SQL Editor SEBELUM push kode Fase 3.
-- ============================================================

-- 1. Tabel shodan (inquiry / forecast)
create table if not exists public.shodans (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  customer_name text,
  contact text,
  est_value numeric default 0,
  status text not null default 'Open' check (status in ('Open','Penawaran','Won','Lost')),
  notes text,
  last_fu date,
  lost_reason text,
  quotation_id uuid references public.quotations(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- 2. Kolom baru di quotations (pipeline)
alter table public.quotations add column if not exists last_fu date;
alter table public.quotations add column if not exists lost_reason text;

-- 3. RLS shodans
alter table public.shodans enable row level security;
drop policy if exists shodans_select on public.shodans;
drop policy if exists shodans_insert on public.shodans;
drop policy if exists shodans_update on public.shodans;
drop policy if exists shodans_delete on public.shodans;

create policy shodans_select on public.shodans for select to authenticated using (true);
create policy shodans_insert on public.shodans for insert to authenticated
  with check (public.my_role() in ('sales','admin','super_admin') and created_by = auth.uid());
create policy shodans_update on public.shodans for update to authenticated
  using (public.my_role() in ('admin','super_admin')
         or (public.my_role() = 'sales' and created_by = auth.uid()))
  with check (public.my_role() in ('admin','super_admin')
         or (public.my_role() = 'sales' and created_by = auth.uid()));
create policy shodans_delete on public.shodans for delete to authenticated
  using (public.my_role() in ('admin','super_admin') or created_by = auth.uid());
