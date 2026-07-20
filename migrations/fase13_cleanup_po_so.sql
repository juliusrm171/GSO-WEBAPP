-- ============================================================
-- FASE 13 (pendukung) + kolom SO Accurate di PO
-- Jalankan di Supabase SQL Editor.
-- ============================================================

-- Kolom No. SO dari Accurate di purchase_orders (format: SO.2026.07.00003)
alter table public.purchase_orders add column if not exists so_number text;

-- Catatan Fase 13: dedup & normalisasi nama customer dilakukan dari UI
-- (Database → Rapikan Data, khusus admin) — tidak butuh perubahan skema.
