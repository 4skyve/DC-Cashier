# DCS Commerce

Sistem Informasi Kasir (POS) untuk toko grosir snack, dilengkapi Portal Pemesanan sederhana
tanpa akun. Dibangun sesuai SRS v2.1 Final Draft.

## Tech Stack

Next.js 14 (App Router) · React · TypeScript · Tailwind CSS · Prisma ORM · Supabase PostgreSQL · next-intl (ID/EN)

## Cara Menjalankan

```bash
npm install
cp .env.example .env    # isi DATABASE_URL dengan connection string Supabase kamu
npm run db:generate
npm run db:push         # push schema ke database Supabase
npm run db:seed         # isi data awal (akun admin/kasir + produk contoh)
npm run dev
```

Buka `http://localhost:3000` (otomatis redirect ke `/id` — Portal Pemesanan publik).
Untuk masuk ke POS: `http://localhost:3000/id/login`

**Akun demo (dari seed):**
- Admin — username: `admin`, password: `admin123`
- Kasir — username: `kasir1`, password: `kasir123`

## Status Implementasi (~50% proyek: full frontend + sebagian backend)

### ✅ Sudah selesai
| Area | Detail |
|---|---|
| **i18n** | Wajib ID/EN, default ID, switch di navbar — semua halaman yang dibangun 100% bilingual (lihat `src/messages/`) |
| **Database** | Prisma schema lengkap, 9 entitas sesuai ERD final |
| **Auth** | Login/logout (bcrypt + cookie session), role Admin/Kasir |
| **POS Shell** | Sidebar role-based (Admin lihat semua menu, Kasir cuma Kasir+Riwayat), Navbar dengan search+bahasa+profil |
| **Portal Shell** | Navbar tanpa sidebar, search, cart badge, tanpa login |
| **Dashboard** | Data real dari database (penjualan hari ini, stok rendah, kedaluwarsa, pesanan pending) |
| **Kasir (POS)** | Cart interaktif, transaksi **atomik** (Prisma `$transaction`), stok berkurang otomatis |
| **Produk** | List + form tambah (kategori, satuan, harga, stok, kedaluwarsa) |
| **Pesanan Portal** | List + detail dengan **Accept/Reject** — flow terbaru: cek alamat dulu, transaksi & stok otomatis dibuat saat accept, cek stok/expired sebelum accept (F-INT-04) |
| **Portal Pemesanan** | Landing (banner wilayah layanan + katalog), Cart (localStorage, client-side), Checkout (COD/Transfer/QRIS, consent checkbox wajib, **tanpa upload bukti bayar** — sesuai keputusan flow terakhir) |

### 🚧 Belum dikerjakan (bagian backend/frontend yang tersisa)
- Modul: Kategori (CRUD), Stok/Inventori (Stock In/Out/Adjustment + riwayat), Produk Kedaluwarsa (halaman khusus), Riwayat Transaksi (list+detail+cetak ulang), Laporan (semua jenis+export), Pengguna (CRUD akun Kasir), Pengaturan (Profil Toko, Threshold, Rekening/QRIS)
- Halaman edit produk (baru ada tambah)
- Cetak struk / print preview (F-CASH-07/09)
- Validasi form yang lebih ketat + pesan error per-field (bilingual)
- Middleware proteksi role di level route (saat ini baru dicek session ada/tidak, belum admin-only vs kasir-only per halaman)
- Testing

## Panduan Ganti Icon (Emoji → Gambar)

Saat ini ikon masih pakai emoji supaya cepat dan tidak perlu asset. Untuk ganti ke gambar/logo asli:

- **Sidebar POS**: edit `src/components/pos/Sidebar.tsx` dan `MobileNav.tsx`, cari object `ICONS` di atas — ganti `dashboard: "▦"` jadi `dashboard: <img src="/icons/dashboard.svg" className="h-5 w-5" />` (dan render `{ICONS[key]}` langsung, sudah kompatibel karena berupa ReactNode).
- **Logo toko**: cari teks `🛒` di `Sidebar.tsx`, `Navbar.tsx` (POS & Portal), dan `login/page.tsx` — ganti dengan `<img src={logoUrl} className="h-6 w-6" />`, idealnya ambil dari `getStoreSetting().logoUrl` biar dinamis.
- Simpan file gambar di folder `public/`, akses lewat path `/nama-file.svg` (tanpa awalan `public`).

## Fitur Baru di Revisi Ini

- **Halaman Kategori** (`/kategori`) — CRUD kategori produk, terintegrasi dengan Produk & Portal.
- **Search navbar fleksibel** — satu search bar di navbar POS, otomatis relevan sesuai halaman aktif (produk di Kasir, nomor/nama/WA di Pesanan) lewat query param `?q=`.
- **Halaman Katalog penuh** (`/katalog`) — grid semua produk dengan filter kategori, terpisah dari homepage (gaya Shopee/Tokopedia).
- **CaesAi** — widget chat floating di Portal. **Frontend only**, balasan masih simulasi statis (`getMockReply()` di `CaesAiWidget.tsx`) — sengaja belum disambungkan ke AI backend beneran, jadi masih ada "PR" yang jelas untuk pengembangan lanjutan.
- Menu **Pengguna dihapus** dari sidebar (belum ada kebutuhan manajemen akun terpisah untuk versi ini).


- **Cart Portal disimpan di localStorage**, bukan database (BR/simplifikasi yang disepakati).
- **Bukti pembayaran Transfer/QRIS TIDAK diunggah lewat web** — dikoordinasikan manual via WhatsApp setelah admin accept (lihat `src/actions/order.ts`, komentar di `acceptOrder`).
- Session pakai cookie JSON sederhana (`src/lib/auth.ts`), BUKAN JWT bertanda tangan. Cukup untuk skala PGBL/demo; untuk produksi nyata sebaiknya upgrade ke NextAuth.js atau Supabase Auth.
- Semua field uang bertipe `Int` (Rupiah tanpa desimal) — lihat catatan Architecture Review soal floating point.
