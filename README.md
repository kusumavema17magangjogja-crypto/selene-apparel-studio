# Selene Apparel Studio

Tolong bangun ulang sistem web profil dan katalog konveksi "Selene Apparel" lengkap dengan halaman publik modern dan panel dashboard admin di rute `/admin` dengan integrasi Supabase:

=========================================
1. KONSEP TEMA & DESAIN VISUAL (UI/UX)
=========================================
- Warna & Estetika: Latar belakang hangat bertema Warm Cream / Soft Sand (#FBF8F2) dengan kartu konten putih bersih (#FFFFFF).
- Aksen Utama: Terracotta / Deep Burnt Orange (#C2410C / #EA580C) untuk tombol aktif, badge status, efek hover, dan border dropzone.
- Tipografi: Kombinasi judul bernuansa serif elegan (Playfair Display / Merriweather) dengan teks isi sans-serif modern yang bersih dan mudah dibaca.

=========================================
2. HALAMAN DEPAN (PUBLIC LANDING PAGE)
=========================================
- Navbar: Logo Karsa Apparel, tautan menu (Beranda, Katalog, Jenis Pakaian, Teknik Sablon/Bordir, Alur Pemesanan, Kontak), tautan "Portal Staf" (/admin), dan tombol CTA "Konsultasi WhatsApp".
- Hero Slider Dinamis: Carousel banner otomatis dengan kontrol panah dan dot indikator. Gambar, judul, deskripsi, dan tombol CTA diambil dinamis dari database (tabel `hero_slides`).
- Katalog Pilihan: Grid kartu produk konveksi dengan foto proporsional, nama produk, kategori, dan batas minimal order.
- Basis Jenis Pakaian: Kartu pilihan bahan pakaian (Kaos, Polo, Kemeja PDH/Korsa, Jaket/Hoodie).
- Teknik Cetak: Showcase Sablon DTF, Sablon Plastisol, Bordir Komputer, dan Sublimasi.
- Konsultasi Desain & Penawaran Kustom: Section ramah yang mengajak calon pemesan mengirim mockup desain dan diskusi bahan via WhatsApp (tanpa kalkulator harga otomatis).
- 4 Langkah Alur Pemesanan: (1) Konsultasi -> (2) Sampel & Desain -> (3) Produksi -> (4) Pengiriman.
- Kontak Dinamis: Semua tombol WhatsApp (navbar, floating button pojok kanan bawah, dan tombol CTA) harus mengambil nomor telepon dari pengaturan database `store_settings`.

=========================================
3. PANEL ADMIN (/admin) & PERBAIKAN SIDEBAR
=========================================
- Proteksi Autentikasi: Seluruh rute `/admin` wajib login via Supabase Auth. Sediakan form login admin yang elegan.
- Header Admin: Logo "K" Karsa Admin - Content workspace, link "Lihat situs", dan tombol "Keluar" (Logout).
- Perbaikan Layout Sidebar Menu:
  * Berikan lebar sidebar yang cukup (w-64 / min-w-[250px]) dan styling `whitespace-nowrap` agar SEMUA teks menu tampil lurus dalam 1 baris.
  * Teks "Manajemen Pesanan" WAJIB sejajar dengan ikonnya dalam SATU BARIS (tidak boleh terpotong atau patah menjadi 2 baris).
  * Struktur Menu Sidebar:
    1. Manajemen Toko (Ikon Store/Settings)
    2. Kelola Slider (Ikon Images)
    3. Jenis Pakaian (Ikon Shirt)
    4. Teknik Aplikasi (Ikon PenTool/Flame)
    5. Manajemen Produk (Ikon Package)
    6. Kelola Kategori (Ikon Tag)
    7. Manajemen Pesanan (Ikon ShoppingBag)
    8. Teks Utama (Ikon LayoutGrid)
    9. Pengaturan Akun (Ikon UserCheck/Lock) -> Menu baru untuk kelola akun admin

=========================================
4. PENYEMPURNAAN UPLOAD GAMBAR (DROPZONE & TOMBOL HIDUP)
=========================================
Terapkan komponen Dropzone / Upload Gambar yang seragam pada Modal Slider dan Modal Jenis Pakaian:
- Ganti input file teks bawaan browser yang flat ("Browse...") menjadi dropzone box modern.
- Styling Dropzone:
  * Border putus-putus oranye kontras (`border-2 border-dashed border-orange-500/50`).
  * Background box lembut bernuansa oranye muda (`bg-orange-50/40`).
  * Ikon awan/unggah di tengah.
  * Tombol fisik menonjol dengan background oranye pekat (`bg-orange-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-orange-800 transition cursor-pointer`): bertuliskan "Pilih File Gambar".
  * Teks keterangan di bawah tombol: "atau seret dan lepas gambar ke sini (Maks 5MB. Format: JPG, PNG, WEBP)".
- Fleksibilitas: Admin tetap dapat memasukkan "URL Foto" langsung ATAU mengunggah file gambar.
- Integrasi Supabase Storage: File yang diunggah langsung tersimpan ke Supabase Storage bucket public dan otomatis mengisi field gambar.
- Status File Terpilih: Menampilkan badge hijau file terpilih (misal: "✓ Terpilih: foto-workshop.jpg") beserta tombol hapus/batal (X).

=========================================
5. FITUR BARU: PENGATURAN AKUN (GANTI EMAIL & PASSWORD)
=========================================
Pada tab "Pengaturan Akun", sediakan 2 kartu pengaturan akun admin yang sedang login:
A. Formulir Ganti Email:
   - Menampilkan email admin yang sedang aktif (read-only / disabled).
   - Input: Email Baru.
   - Tombol: "Perbarui Email" (warna oranye, indikator loading).
   - Logika: Jalankan `supabase.auth.updateUser({ email: newEmail })` dan munculkan toast notifikasi konfirmasi.
B. Formulir Ganti Password:
   - Input: Password Baru (minimal 6 karakter) dilengkapi tombol intip (show/hide password).
   - Input: Konfirmasi Password Baru.
   - Validasi: Pastikan password baru dan konfirmasi cocok.
   - Tombol: "Simpan Password Baru" yang menjalankan `supabase.auth.updateUser({ password: newPassword })` dengan notifikasi sukses.

=========================================
6. SEED DATA LENGKAP
=========================================
- Profil Toko: Selene Apparel | Partner Produksi Apparel & Seragam di Yogyakarta | WA: 628987654321 | Alamat: Jl. Sukun Raya No.98, Banguntapan, Bantul, DIY | Jam: Senin-Sabtu 09.00-17.00 WIB.
- Slider: 4 slide awal bertema workshop produksi konveksi, sablon, bordir, dan seragam.
- Jenis Pakaian: Kaos Combed (Rp 65.000), Polo Shirt (Rp 85.000), Kemeja PDH / Korsa (Rp 110.000), Jaket / Hoodie (Rp 135.000).
- Teknik Aplikasi: Sablon DTF (Rp 15.000), Sablon Plastisol (Rp 12.000), Bordir Komputer (Rp 20.000), Sublimasi Fullprint (Rp 25.000).
- Kategori Produk: Kemeja & PDL, Jaket & Hoodie, Kaos & Polo, Merchandise.
- Manajemen Pesanan: Status filter Tab (Pending, Sedang Diproduksi, Selesai) lengkap dengan fitur Ekspor CSV.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://selene-apparel-studio.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d440bea6-c08d-4226-8fd4-ab5262d1929c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
