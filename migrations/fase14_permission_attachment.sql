-- ============================================================
-- FASE 14: Permission & Attachment Upgrade
-- 1) Kolom attachments (jsonb) di purchase_orders & products
-- 2) Bucket Storage 'attachments' (public read, upload oleh admin+)
-- Jalankan di Supabase SQL Editor.
-- ============================================================

alter table public.purchase_orders add column if not exists attachments jsonb not null default '[]'::jsonb;
alter table public.products        add column if not exists attachments jsonb not null default '[]'::jsonb;

-- Bucket attachments (public read)
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', true)
on conflict (id) do update set public = true;

-- Policy storage: semua orang bisa BACA (public URL), upload/hapus hanya admin & super_admin
drop policy if exists "attachments_read"   on storage.objects;
drop policy if exists "attachments_insert" on storage.objects;
drop policy if exists "attachments_delete" on storage.objects;
create policy "attachments_read" on storage.objects for select
  using (bucket_id = 'attachments');
create policy "attachments_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'attachments' and public.my_role() in ('admin','super_admin'));
create policy "attachments_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'attachments' and public.my_role() in ('admin','super_admin'));
