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

## FASE 7 — Dashboard Baru ✅ SELESAI (19 Jul 2026)
Terakhir karena mengonsumsi data PO, target, visit, customer.

- **Leaderboard hasil PO** per bulan + history bulanan
- **Target vs achievement** per sales: nilai + persentase
- **Grafik penjualan tahunan** (semua sales) + panel Total Revenue per tahun; **klik bulan → popup**: total bulan itu, persentase, status achieve; toggle **yearly/monthly**
- **Top Customer by PO**
- **Existing vs New Customer** di statistik customer
- **Barometer total visit** per sales
- **Dashboard hasil visit kanvasing**

## FASE 8 — Pricelist Upgrade 🔶 SEBAGIAN SELESAI (19 Jul 2026)

- ✅ **Perbaikan harga** — regenerate dari Excel 2026Q1 kolom "New PL (Rupiah)" (bug lama: nomor PN terbaca sebagai harga); Vision Controller dari file DELA via SAP code
- ✅ **Kolom Part Number & Description terpisah** di pricelist
- ✅ **Nama seri resmi Hikrobot** + spesifikasi sebagai description (2.887 item)
- ✅ **Gambar produk** — 230 gambar dari file DELA, terpasang di 1.341 item; tampil di pricelist, editor quotation, preview, dan PDF
- ✅ **Crawl website Hikrobot** (19 Jul) — 1.787 produk; 1.079 nama diganti nama resmi website (mis. "Enterprise USB-Wired Handheld Code Reader"), 375 gambar tambahan via URL website; total 1.716 item bergambar
- ✅ **Sort by resolusi** (↑/↓, dihitung dari total piksel di description)
- ✅ **Struktur multi-brand** — `PL_BRANDS` + filter brand di pricelist; tambah brand baru = tambah data dengan brand index baru

## FASE 9 — Stock & Penerimaan Barang
Independen — modul baru.

- **Tab Stock baru:** diinput admin gudang; sales bisa lihat stock yang ada
- **Barang masuk & keluar** dengan **foto** (upload ke Supabase Storage) untuk pendataan
- *Open: role admin gudang (lihat Fase 1)*

## FASE 10 — Customer per Area
- Field area per customer: **kota/provinsi + kawasan industri** (contoh: Cikarang → MM2100, Lippo Cikarang, dst.)
- Filter/pisah view database customer per area
- *Open: daftar area final menunggu diskusi internal — buat fleksibel (admin bisa tambah area sendiri)*

## FASE 11 — Export & Import Excel (ditambahkan 20 Jul 2026)
Semua jalan di sisi browser (SheetJS), tanpa server tambahan.

- **Export data ke Excel/CSV** dari web: customer, pricelist, pipeline/shodan, PO, visit, dan stock (setelah Fase 9)
  - Sesuai aturan Fase 1: tombol export hanya tampil untuk **super_admin & admin**
- **Import/update via upload Excel** (bulk update):
  - Download template → isi di Excel → upload → **preview perubahan** ("X item di-update, Y item baru") → konfirmasi → upsert ke Supabase
  - Kasus utama: **update stock** (barang masuk/keluar massal, digabung pengerjaannya dengan Fase 9)
  - Bisa dipakai ulang untuk: update harga pricelist massal per kuartal, import customer sekaligus
- Validasi saat import: kolom wajib, format angka, duplikat; baris bermasalah ditampilkan di preview, tidak langsung merusak data
- *Open: tab mana saja yang dapat tombol export; format xlsx saja atau plus CSV*

## FASE 12 — Tab Project (ditambahkan 20 Jul 2026)
Tab baru yang menggabungkan seluruh siklus project dalam satu tempat. Cakupan (hasil klarifikasi Julius, 20 Jul 2026) — keempatnya masuk:

- **Tracking project berjalan:** satu project meng-link quotation, PO, dan progress-nya (inquiry → penawaran → PO → delivery → selesai); status per tahap terlihat jelas
- **Project engineering/instalasi:** timeline instalasi/commissioning di customer, status pengerjaan oleh engineer, dokumentasi foto (upload ke Supabase Storage)
- **Manajemen tugas internal:** task per project — siapa mengerjakan apa, deadline, status (semacam task board sederhana)
- **Dokumen per project:** kumpulan file (quotation, PO, drawing, foto) dikelompokkan per project, tersimpan di Supabase Storage
- **Permission:** mengikuti aturan Fase 1 — engineer bisa lihat project & task tapi nilai harga disembunyikan; sales lihat project miliknya
- Saran urutan pengerjaan: setelah Fase 9 (biar bisa link ke stock/delivery), atau paralel karena strukturnya modul baru
- *Open: tahapan status project final (nama & urutannya); siapa boleh buat project (admin saja atau sales juga)*

## FASE 13 — Pembersihan & Standarisasi Database Customer (ditambahkan 20 Jul 2026)
Data hygiene: hapus duplikat + standar penamaan, supaya pipeline/dashboard/report akurat.

- **Deduplikasi customer:** deteksi entri double (nama mirip: beda kapitalisasi, spasi, dengan/tanpa "PT", typo) → tampilkan kandidat duplikat → admin pilih merge; semua relasi (quotation, shodan, pipeline, PO, visit) dipindah ke satu customer utama sebelum duplikat dihapus
- **Standarisasi penamaan customer:** perusahaan wajib berformat baku dengan **"PT"** di depan (mis. `PT Maju Jaya`, bukan `Maju jaya` / `pt. maju jaya`); dukung juga badan usaha lain (CV, UD, Tbk) dengan aturan sama
- **Normalisasi otomatis saat input baru:** form customer merapikan otomatis (kapitalisasi, prefix PT/CV) + **warning kalau nama mirip customer yang sudah ada** — mencegah duplikat baru
- **Audit sekali jalan:** script/halaman admin untuk scan seluruh database existing, tampilkan daftar yang tidak sesuai standar & kandidat duplikat, eksekusi perbaikan massal setelah dikonfirmasi
- Urutan: sebaiknya SEBELUM Fase 10 (customer per area) & Fase 12 (tab project), supaya fitur-fitur itu dibangun di atas data yang sudah bersih
- *Open: aturan penulisan final ("PT" tanpa titik atau "PT."?); apakah customer perorangan (tanpa badan usaha) diperbolehkan?*

---

## Keputusan Tambahan (17 Jul 2026)
1. ✅ Direktur = **super_admin**. Akun Julius juga **super_admin** (developer)
2. ✅ Admin gudang = role **admin** biasa
3. ⏳ Alamat email perusahaan untuk reminder — menyusul
4. ⏳ Daftar area final customer — menyusul (buat fleksibel, admin bisa tambah area)
