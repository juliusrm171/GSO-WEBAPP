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

- Shodan/pipeline tanpa update 2 minggu → kirim reminder otomatis ke **email kantor + Gmail pribadi sales ybs** dan buat event di **Google Calendar** sales
- **Calendar:** tiap sales menghubungkan **Gmail pribadinya** sekali via login Google (OAuth) di halaman profil → event reminder masuk calendar pribadi (keputusan 20 Jul 2026)
- **Email sales:** tiap user punya 2 alamat di profilnya — email kantor (@gso.co.id) + Gmail pribadi; keduanya dikirimi reminder. Daftar alamat 3 user awal sudah diterima dari Julius (20 Jul) — disimpan di catatan internal, tidak di-commit ke repo publik
- Teknis: Supabase Edge Function + pg_cron (cek harian); email via SMTP webmail GSO (kredensial menyusul) atau Resend; calendar via Google Calendar API (Google Cloud project + OAuth — akan dipandu)

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

## FASE 10 — Customer per Area ✅ SELESAI (20 Jul 2026)
Struktur **2 tingkat** (keputusan 20 Jul 2026): **Area Besar** (kota/wilayah) → **Area Kecil** (kawasan industri). Satu customer = satu area. Admin bisa tambah area besar/kecil sendiri kapan saja (lewat dropdown ➕ di form customer).

- Form customer: pilih Area Besar dulu → muncul dropdown Area Kecil milik area itu
- Filter database customer per area besar ATAU langsung per area kecil
- **Seed list awal** (disusun Claude 20 Jul dari kawasan industri umum — admin tinggal koreksi/tambah):
  - **Jakarta:** JIEP Pulogadung, KBN Cakung, KBN Marunda, Sunter, Cilincing, Lainnya
  - **Cikarang/Bekasi:** Jababeka, MM2100, EJIP, Delta Silicon (Lippo Cikarang), Hyundai (BIIE), GIIC Deltamas, Bekasi Fajar (MM2100 area), Tambun/Cibitung, Lainnya
  - **Karawang:** KIIC, Suryacipta, Indotaisei, KNIC, Mitra Karawang (KIM), Podomoro Industrial Park, Lainnya
  - **Bogor:** Sentul, Cibinong (CCIE), Gunung Putri, Cileungsi (Menara Permai), Lainnya
  - **Bandung:** Rancaekek (Dwipapuri), Batujajar, Cimahi/Leuwigajah, Majalaya, Padalarang, Lainnya
  - Saran area besar tambahan (opsional): Tangerang (Jatake, Millennium, Balaraja), Purwakarta (Kota Bukit Indah, BIC), Subang, Semarang, Surabaya
- Tiap area besar otomatis punya opsi **"Lainnya"** untuk customer di luar kawasan industri

## FASE 11 — Export & Import Excel 🔶 SEBAGIAN SELESAI (20 Jul 2026)
Semua jalan di sisi browser (SheetJS), tanpa server tambahan.
✅ Sudah: **Import PO dari file Accurate** ("Daftar Pesanan Penjualan" .xlsx — deteksi header, skip footer, dedup No. SO/PO, normalisasi nama customer, preview + centang + sales default) di tab PO; **Export Excel** PO per bulan & database customer (admin only).
⏳ Sisa: import stock/produk/customer dari Accurate (nyusul bersama Fase 9, butuh contoh file export per jenis data).

- **Export data ke Excel/CSV** dari web: customer, pricelist, pipeline/shodan, PO, visit, dan stock (setelah Fase 9)
  - Sesuai aturan Fase 1: tombol export hanya tampil untuk **super_admin & admin**
- **Import/update via upload Excel** (bulk update):
  - Download template → isi di Excel → upload → **preview perubahan** ("X item di-update, Y item baru") → konfirmasi → upsert ke Supabase
  - Kasus utama: **update stock** (barang masuk/keluar massal, digabung pengerjaannya dengan Fase 9)
  - Bisa dipakai ulang untuk: update harga pricelist massal per kuartal, import customer sekaligus
- Validasi saat import: kolom wajib, format angka, duplikat; baris bermasalah ditampilkan di preview, tidak langsung merusak data
- *Open: tab mana saja yang dapat tombol export; format xlsx saja atau plus CSV*

## FASE 12 — Tab Project (ditambahkan 20 Jul 2026, diperkaya hasil meeting 20 Jul)
Tab baru yang menggabungkan seluruh siklus project dalam satu tempat.

- **Tracking project berjalan:** satu project meng-link quotation, PO, dan progress-nya; tahapan status: **Inquiry → Penawaran → PO → Pengadaan → Delivery → Instalasi/Commissioning → Selesai** (+ status Batal)
- **Komponen per project** (hasil meeting 20 Jul):
  - **BOM list** — daftar bill of material per project (part, qty, status pengadaan)
  - **Design** — file drawing/desain (upload ke Supabase Storage)
  - **Report** — laporan progress/hasil pekerjaan
  - **Timeline** — jadwal & milestone project (instalasi/commissioning termasuk di sini)
- **Project engineering/instalasi:** status pengerjaan oleh engineer, dokumentasi foto (upload ke Supabase Storage)
- **Manajemen tugas internal:** task per project — siapa mengerjakan apa, deadline, status (task board sederhana)
- **Dokumen per project:** kumpulan file (quotation, PO, drawing, foto) dikelompokkan per project
- **Dashboard khusus engineer** (hasil meeting 20 Jul — konsep awal dari Claude, boleh direvisi):
  - Saat engineer login, dashboard-nya BERBEDA: fokus progress project, tanpa nilai uang sama sekali
  - Isi: (a) list project aktif yang melibatkan dia + tahap sekarang, (b) task miliknya yang belum selesai + deadline (yang overdue disorot), (c) timeline/jadwal instalasi minggu berjalan, (d) tombol cepat "Update Progress" → isi status + upload foto dari HP, (e) riwayat update terakhir per project
  - Progress yang diupdate engineer otomatis tampil di tab Project (dilihat admin/sales/direktur)
- **Permission:** dibuat hanya oleh **admin & super admin**; engineer lihat project & task tanpa nilai harga; sales lihat project miliknya
- Saran urutan pengerjaan: setelah Fase 9 (biar bisa link ke stock/delivery), atau paralel karena strukturnya modul baru

## FASE 13 — Pembersihan & Standarisasi Database Customer ✅ SELESAI (20 Jul 2026)
Data hygiene: hapus duplikat + standar penamaan, supaya pipeline/dashboard/report akurat. Tool di **Database → 🧹 Rapikan Data** (khusus admin). Keputusan: format **"PT" tanpa titik**; customer perorangan diperbolehkan.

- **Deduplikasi customer:** deteksi entri double (nama mirip: beda kapitalisasi, spasi, dengan/tanpa "PT", typo) → tampilkan kandidat duplikat → admin pilih merge; semua relasi (quotation, shodan, pipeline, PO, visit) dipindah ke satu customer utama sebelum duplikat dihapus
- **Standarisasi penamaan customer:** perusahaan wajib berformat baku dengan **"PT"** di depan (mis. `PT Maju Jaya`, bukan `Maju jaya` / `pt. maju jaya`); dukung juga badan usaha lain (CV, UD, Tbk) dengan aturan sama
- **Normalisasi otomatis saat input baru:** form customer merapikan otomatis (kapitalisasi, prefix PT/CV) + **warning kalau nama mirip customer yang sudah ada** — mencegah duplikat baru
- **Audit sekali jalan:** script/halaman admin untuk scan seluruh database existing, tampilkan daftar yang tidak sesuai standar & kandidat duplikat, eksekusi perbaikan massal setelah dikonfirmasi
- Urutan: sebaiknya SEBELUM Fase 10 (customer per area) & Fase 12 (tab project), supaya fitur-fitur itu dibangun di atas data yang sudah bersih
- *Open: aturan penulisan final ("PT" tanpa titik atau "PT."?); apakah customer perorangan (tanpa badan usaha) diperbolehkan?*

---

## FASE 14 — Permission & Attachment Upgrade ✅ SELESAI (20 Jul 2026)
Penyesuaian pada fitur yang sudah jadi (quotation Fase 2, PO Fase 6). Termasuk kolom **No. SO Accurate** di PO + tombol 📎 attach dokumen di daftar PO & Produk Tersimpan (bucket Storage `attachments`).

- **Quotation — created by mengikuti akun:** pembuat quotation otomatis tercatat dari akun yang login (bukan dipilih manual); inisial di nomor quotation ikut akun pembuat
- **Visibility PO:** admin & super admin lihat **semua** PO; **sales hanya lihat PO miliknya sendiri**
- **Attach dokumen di tab PO:** upload file (PDF PO customer, dsb.) per PO ke Supabase Storage, bisa multi-file
- **Attach dokumen di Data Barang Trading:** upload file (datasheet, sertifikat, dsb.) per barang trading
- *Open: apakah visibility quotation juga dibatasi seperti PO (sales hanya lihat miliknya)?*

## Keputusan Tambahan (17 Jul 2026)
1. ✅ Direktur = **super_admin**. Akun Julius juga **super_admin** (developer)
2. ✅ Admin gudang = role **admin** biasa
3. ⏳ Alamat email perusahaan untuk reminder — menyusul
4. ⏳ Daftar area final customer — menyusul (buat fleksibel, admin bisa tambah area)

## Keputusan Tambahan (20 Jul 2026 — hasil diskusi Julius)
1. ✅ **Sumber data = export Accurate.** Stock, customer, produk & harga, dan PO/faktur semuanya akan di-import dari file hasil export Accurate. Satu file per jenis data (file stock isinya stock saja, file PO isinya PO saja). Fitur import (Fase 11) harus baca format kolom export Accurate — contoh file menyusul dari Julius
2. ✅ **Fase 9:** import stock harus bisa dilakukan admin dari **web maupun HP** → halaman upload dibuat responsive/mobile-friendly
3. ✅ **Fase 11:** export dari webapp pakai format Excel (.xlsx); import menerima file export Accurate
4. ✅ **Fase 12:** project hanya bisa dibuat **admin & super admin**; tahapan status project = **Inquiry → Penawaran → PO → Pengadaan → Delivery → Instalasi/Commissioning → Selesai** (+ status Batal)
5. ✅ **Fase 13:** format baku **"PT" tanpa titik** (contoh: `PT Maju Jaya`); customer **perorangan/non-badan-usaha diperbolehkan** (tanpa prefix, tidak dianggap invalid saat audit)
6. ✅ **Fase 5:** reminder dikirim via **email perusahaan** + integrasi **Google Calendar** (link akun Google sales); alamat email & kredensial menyusul
