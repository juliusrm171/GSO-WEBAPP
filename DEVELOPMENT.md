# GSO Webapp — Development Roadmap (Hasil Meeting)

> Status: PLAN FINAL — sudah diklarifikasi dengan Julius (17 Jul 2026). Belum dikerjakan.
> Urutan fase disusun supaya tidak ada kerja dua kali: fondasi (role & skema data) dulu, baru fitur, terakhir dashboard yang mengonsumsi semua data.

---

## FASE 1 — Role & Permission ✅ SELESAI (18 Jul 2026 — tinggal jalankan SQL + push)
Semua fitur lain bergantung pada siapa boleh lihat/edit apa, jadi ini paling awal.

- **4 role:** `super_admin`, `admin`, `sales`, `engineer` (kolom `role` di profiles + RLS Supabase)
  - **Super admin:** akses semua
  - **Admin:** akses semua (beberapa pembatasan menyusul — Julius tinjau nanti)
  - **Sales:** hanya input quotation & visit; TIDAK bisa tambah/edit database (customer, product, pricelist)
  - **Engineer:** bisa lihat shodan/quotation tapi SEMUA nilai harga disembunyikan
- **Harga/value** hanya terlihat oleh: super admin, admin, sales (dan direktur*)
- **Export/extract data:** hanya super admin & admin
- **Profile user:** halaman profil (nama, inisial untuk nomor quotation, email, foto)
- *Open: "direktur" pakai role super_admin atau role terpisah? "admin gudang" (stock) = role admin atau role baru?*

## FASE 2 — Quotation Upgrade ✅ SELESAI (18 Jul 2026, kecuali gambar part — nyusul bersama Fase 8)
Dikerjakan sebelum pipeline karena pipeline akan menarik data dari quotation.

- **Judul quotation (standard baru):** setiap quotation diberi judul untuk tracking project. Fallback kalau kosong: ambil part number / description item paling atas
- **Nomor auto-generate:** pola `Q + inisial sales + YYYYMM + urutan` (contoh: QJRM202607**01**). Urutan reset tiap bulan; tahun & bulan ikut tanggal berjalan. Counter tersimpan di DB supaya konsisten antar user
- **Nama file download:** `[QUO NUMBER] - [ITEM DESCRIPTION] - [NAMA PT]` — item description = part number/description item pertama (atau judul quotation)
- **Grupping = bundle:** item di bawah grup di-total ke grup; di preview & PDF harga per item TIDAK ditampilkan, hanya subtotal di baris grup (item tetap tampil sebagai daftar isi bundle tanpa harga)
- **Gambar + deskripsi part:** kolom gambar di items. Catatan: website Hikrobot full JS-rendered, scraping langsung tidak reliable → pendekatan: (a) fitur upload gambar per part di pricelist/product, (b) best-effort ambil dari API internal Hikrobot untuk part populer

## FASE 3 — Shodan & Pipeline Rework ✅ SELESAI (19 Jul 2026)
- **Tab baru "Shodan"** = list inquiry (belum tentu jadi penawaran/forecast). Struktur data mirip quotation (customer, judul, estimasi value, sales, status)
- **Pipeline** otomatis terisi dari quotation yang dibuat; shodan yang naik jadi penawaran ter-link ke quotation-nya
- **Latest FU:** kolom tanggal follow-up terakhir saja (di pipeline & shodan)
- **Status Lost:** wajib isi keterangan alasan
- **Masking engineer:** engineer bisa buka shodan tapi kolom nilai disembunyikan
- **List "Perlu Follow-Up"** di pipeline: shodan/pipeline tanpa update > **2 minggu** otomatis masuk list ini (in-app, tanpa integrasi eksternal — cepat jadi)

## FASE 4 — Visit / Kanvasing ✅ SELESAI (19 Jul 2026)
- **Tipe visit:** online / onsite
- **Latest FU** per visit (tanggal terakhir)
- Update visit bisa meng-update Latest FU shodan/pipeline yang terkait (supaya reminder 2 minggu akurat)
- Hasil visit kanvasing masuk database sesuai izin (admin approve → jadi customer baru)

## FASE 5 — Reminder Email & Google Calendar
Dikerjakan setelah Fase 3-4 karena butuh data FU yang sudah stabil.

- Shodan/pipeline tanpa update 2 minggu → kirim reminder otomatis ke **Gmail sales ybs + email perusahaan** dan buat event di **Google Calendar** sales
- Teknis: Supabase Edge Function + pg_cron (cek harian); email via Resend/SMTP; calendar via Google Calendar API (perlu setup Google Cloud project + OAuth/service account — akan dipandu)
- *Open: alamat email perusahaan yang dipakai?*

## FASE 6 — PO & Target Sales ✅ SELESAI (19 Jul 2026)
- **Input PO terpisah** (bukan dari pipeline): diinput admin sales — nomor PO, customer, sales, nilai, tanggal, link ke quotation (opsional)
- **Target sales:** di-set admin/super admin saja, per sales per bulan, dalam Rupiah

## FASE 7 — Dashboard Baru
Terakhir karena mengonsumsi data PO, target, visit, customer.

- **Leaderboard hasil PO** per bulan + history bulanan
- **Target vs achievement** per sales: nilai + persentase
- **Grafik penjualan tahunan** (semua sales) + panel Total Revenue per tahun; **klik bulan → popup**: total bulan itu, persentase, status achieve; toggle **yearly/monthly**
- **Top Customer by PO**
- **Existing vs New Customer** di statistik customer
- **Barometer total visit** per sales
- **Dashboard hasil visit kanvasing**

## FASE 8 — Pricelist Upgrade
Independen, bisa diselipkan kapan saja.

- **Struktur per brand** (sekarang Hikrobot saja, siap untuk brand baru: kolom/tab brand)
- **Sort by resolusi** (MP) di halaman pricelist
- Gambar part (nyambung dengan Fase 2)

## FASE 9 — Stock & Penerimaan Barang
Independen — modul baru.

- **Tab Stock baru:** diinput admin gudang; sales bisa lihat stock yang ada
- **Barang masuk & keluar** dengan **foto** (upload ke Supabase Storage) untuk pendataan
- *Open: role admin gudang (lihat Fase 1)*

## FASE 10 — Customer per Area
- Field area per customer: **kota/provinsi + kawasan industri** (contoh: Cikarang → MM2100, Lippo Cikarang, dst.)
- Filter/pisah view database customer per area
- *Open: daftar area final menunggu diskusi internal — buat fleksibel (admin bisa tambah area sendiri)*

---

## Keputusan Tambahan (17 Jul 2026)
1. ✅ Direktur = **super_admin**. Akun Julius juga **super_admin** (developer)
2. ✅ Admin gudang = role **admin** biasa
3. ⏳ Alamat email perusahaan untuk reminder — menyusul
4. ⏳ Daftar area final customer — menyusul (buat fleksibel, admin bisa tambah area)
