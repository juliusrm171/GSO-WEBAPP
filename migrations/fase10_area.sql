-- ============================================================
-- FASE 10: Customer per Area (2 tingkat)
-- Area Besar (kota/wilayah) → Area Kecil (kawasan industri)
-- Daftar area disimpan di app_settings key 'customer_areas' (JSON),
-- dikelola dari UI oleh admin. Jalankan di Supabase SQL Editor.
-- ============================================================

alter table public.customers add column if not exists area_big text;
alter table public.customers add column if not exists area_small text;
