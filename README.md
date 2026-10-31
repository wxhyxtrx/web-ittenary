# Liburan Aay dan Wull

Web pribadi untuk rencana liburan Banyuwangi dan Bali, 25 November sampai 5 Desember 2026.

- `/`: jadwal, outfit, makan, packing, dan cek jadwal.
- `/edit`: form edit konten, memakai kata sandi edit.

## Coba di lokal

```bash
npm run dev
```

Buka `http://127.0.0.1:3100`. Kata sandi lokal: `lihat` dan `ubah`. Perubahan hilang saat server berhenti.

## Tes

```bash
npm test
```

## Environment Vercel

Isi semua nama di `.env.example`, lalu deploy ulang. `SUPABASE_SERVICE_ROLE_KEY` hanya untuk server.

## Foto

Sumber dan lisensi tertulis di `public/images.js` dan tampil di menu Semua hari.
