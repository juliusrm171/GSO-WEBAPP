-- ============================================================
-- FASE 4: Visit / Kanvasing
-- Jalankan di Supabase SQL Editor SEBELUM push kode Fase 4.
-- ============================================================

-- Tipe visit: onsite / online
alter table public.visits add column if not exists visit_type text default 'onsite';
alter table public.visits drop constraint if exists visits_type_check;
alter table public.visits add constraint visits_type_check check (visit_type in ('onsite','online'));

-- Link visit ke shodan / penawaran (untuk auto-update FU terakhir)
alter table public.visits add column if not exists related_type text; -- 'shodan' | 'pipeline'
alter table public.visits add column if not exists related_id uuid;
