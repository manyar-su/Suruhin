# Suruhin

Suruhin adalah marketplace jasa lokal untuk membantu kebutuhan harian warga Tasikmalaya dan sekitarnya. Pengguna dapat mencari talent terverifikasi untuk antar jemput, temani aktivitas, titip belanja, bantuan rumah tangga, sampai jasa digital dalam satu pengalaman web yang mobile-friendly.

## Fitur Utama

- Katalog jasa lokal dengan kategori dan detail layanan
- Profil talent, ulasan, dan status ketersediaan
- Simulasi booking lengkap dengan perhitungan biaya
- Dashboard talent, customer, dan admin berbasis data lokal
- Tracking pesanan, ekstensi layanan, tips, komplain, dan refund simulatif
- CTA WhatsApp untuk proses pemesanan dan bantuan cepat

## Teknologi

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Lucide React
- Motion

## Menjalankan Proyek

1. Install dependensi:
   `npm install`
2. Jalankan mode development:
   `npm run dev`
3. Build production:
   `npm run build`
4. Cek type safety:
   `npm run lint`

## Konfigurasi

Variabel yang disiapkan di `.env.example` bersifat opsional untuk pengembangan peta dan integrasi lokasi. Proyek ini tidak lagi bergantung pada AI Studio atau Gemini runtime.

## Deploy

Repositori ini disiapkan untuk deploy ke Vercel sebagai aplikasi Vite static dengan SPA rewrites, sehingga route seperti `/layanan/antar-jemput-sekolah` tetap dapat dibuka langsung di production.
