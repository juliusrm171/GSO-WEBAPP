-- ============================================================
-- FASE 9 (Stock & Penerimaan Barang) + FASE 12 (Tab Project)
-- Jalankan di Supabase SQL Editor.
-- ============================================================

-- ── FASE 9: STOCK ──
create table if not exists public.stock_items (
  id uuid primary key default gen_random_uuid(),
  part_number text not null,
  name text,
  unit text default 'unit',
  qty numeric not null default 0,
  notes text,
  updated_at timestamptz default now(),
  created_at timestamptz default now(),
  unique (part_number)
);
create table if not exists public.stock_moves (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.stock_items(id) on delete cascade,
  move_type text not null check (move_type in ('in','out','adjust')),
  qty numeric not null,
  move_date date not null default current_date,
  notes text,
  photo_url text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.stock_items enable row level security;
alter table public.stock_moves enable row level security;
drop policy if exists stock_items_select on public.stock_items;
drop policy if exists stock_items_write  on public.stock_items;
drop policy if exists stock_items_update on public.stock_items;
drop policy if exists stock_items_delete on public.stock_items;
drop policy if exists stock_moves_select on public.stock_moves;
drop policy if exists stock_moves_write  on public.stock_moves;
drop policy if exists stock_moves_delete on public.stock_moves;
create policy stock_items_select on public.stock_items for select to authenticated using (true);
create policy stock_items_write  on public.stock_items for insert to authenticated with check (public.my_role() in ('admin','super_admin'));
create policy stock_items_update on public.stock_items for update to authenticated using (public.my_role() in ('admin','super_admin'));
create policy stock_items_delete on public.stock_items for delete to authenticated using (public.my_role() in ('admin','super_admin'));
create policy stock_moves_select on public.stock_moves for select to authenticated using (true);
create policy stock_moves_write  on public.stock_moves for insert to authenticated with check (public.my_role() in ('admin','super_admin'));
create policy stock_moves_delete on public.stock_moves for delete to authenticated using (public.my_role() in ('admin','super_admin'));

-- ── FASE 12: PROJECT ──
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  customer_name text,
  quotation_id uuid references public.quotations(id) on delete set null,
  po_id uuid references public.purchase_orders(id) on delete set null,
  stage text not null default 'Inquiry' check (stage in ('Inquiry','Penawaran','PO','Pengadaan','Delivery','Instalasi','Selesai','Batal')),
  description text,
  start_date date,
  due_date date,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);
create table if not exists public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  assignee_id uuid references public.profiles(id) on delete set null,
  due_date date,
  status text not null default 'open' check (status in ('open','done')),
  created_at timestamptz default now()
);
create table if not exists public.project_boms (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  part_number text,
  description text,
  qty numeric not null default 1,
  status text not null default 'pending' check (status in ('pending','dipesan','tiba')),
  created_at timestamptz default now()
);
create table if not exists public.project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  kind text not null default 'doc' check (kind in ('design','report','doc','foto')),
  name text,
  url text not null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);
create table if not exists public.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  note text,
  photo_url text,
  stage text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.projects        enable row level security;
alter table public.project_tasks   enable row level security;
alter table public.project_boms    enable row level security;
alter table public.project_files   enable row level security;
alter table public.project_updates enable row level security;

-- semua login bisa lihat
drop policy if exists prj_select  on public.projects;
drop policy if exists prjt_select on public.project_tasks;
drop policy if exists prjb_select on public.project_boms;
drop policy if exists prjf_select on public.project_files;
drop policy if exists prju_select on public.project_updates;
create policy prj_select  on public.projects        for select to authenticated using (true);
create policy prjt_select on public.project_tasks   for select to authenticated using (true);
create policy prjb_select on public.project_boms    for select to authenticated using (true);
create policy prjf_select on public.project_files   for select to authenticated using (true);
create policy prju_select on public.project_updates for select to authenticated using (true);

-- projects & BOM: tulis hanya admin/super_admin
drop policy if exists prj_write  on public.projects;
drop policy if exists prj_update on public.projects;
drop policy if exists prj_delete on public.projects;
create policy prj_write  on public.projects for insert to authenticated with check (public.my_role() in ('admin','super_admin'));
create policy prj_update on public.projects for update to authenticated using (public.my_role() in ('admin','super_admin'));
create policy prj_delete on public.projects for delete to authenticated using (public.my_role() in ('admin','super_admin'));
drop policy if exists prjb_write  on public.project_boms;
drop policy if exists prjb_update on public.project_boms;
drop policy if exists prjb_delete on public.project_boms;
create policy prjb_write  on public.project_boms for insert to authenticated with check (public.my_role() in ('admin','super_admin'));
create policy prjb_update on public.project_boms for update to authenticated using (public.my_role() in ('admin','super_admin'));
create policy prjb_delete on public.project_boms for delete to authenticated using (public.my_role() in ('admin','super_admin'));

-- tasks: admin kelola; assignee boleh update status task miliknya
drop policy if exists prjt_write  on public.project_tasks;
drop policy if exists prjt_update on public.project_tasks;
drop policy if exists prjt_delete on public.project_tasks;
create policy prjt_write  on public.project_tasks for insert to authenticated with check (public.my_role() in ('admin','super_admin'));
create policy prjt_update on public.project_tasks for update to authenticated
  using (public.my_role() in ('admin','super_admin') or assignee_id = auth.uid());
create policy prjt_delete on public.project_tasks for delete to authenticated using (public.my_role() in ('admin','super_admin'));

-- files & updates: semua role login boleh menambah (engineer upload foto/report progress)
drop policy if exists prjf_write  on public.project_files;
drop policy if exists prjf_delete on public.project_files;
create policy prjf_write  on public.project_files for insert to authenticated with check (true);
create policy prjf_delete on public.project_files for delete to authenticated using (public.my_role() in ('admin','super_admin') or uploaded_by = auth.uid());
drop policy if exists prju_write  on public.project_updates;
drop policy if exists prju_delete on public.project_updates;
create policy prju_write  on public.project_updates for insert to authenticated with check (true);
create policy prju_delete on public.project_updates for delete to authenticated using (public.my_role() in ('admin','super_admin') or created_by = auth.uid());

-- Storage: upload foto stock & file project boleh oleh semua user login (bucket attachments sudah public-read)
drop policy if exists "attachments_insert" on storage.objects;
create policy "attachments_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'attachments');
