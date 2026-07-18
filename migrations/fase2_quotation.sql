-- ============================================================
-- FASE 2: Quotation upgrade
-- Jalankan di Supabase SQL Editor SEBELUM push kode Fase 2.
-- ============================================================

-- Kolom judul quotation (untuk tracking project)
alter table public.quotations add column if not exists title text;
