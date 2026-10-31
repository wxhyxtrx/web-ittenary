# PRD: Web Liburan Aay dan Wull

## Tujuan
Satu web pribadi di HP untuk melihat jadwal, outfit, makan, packing, dan catatan jadwal liburan Banyuwangi dan Bali, 25 November sampai 5 Desember 2026.

## Pengguna
Wull dan Aay, terutama saat di perjalanan.

## Halaman

### Hari Ini
- Membuka hari yang sesuai tanggal perangkat.
- Sebelum trip membuka 25 November, setelah trip membuka 5 Desember.
- Menampilkan jadwal, outfit, makan, link Maps, dan hal yang belum pasti.

### Semua Hari
- Daftar 11 hari.
- Bisa membuka detail tiap hari.

### Packing
- Tab Aay, Wull, dan Bersama.
- Dikelompokkan per kategori.
- Menampilkan progres dan jumlah hari barang dipakai.
- Centang tersimpan di perangkat masing-masing.

### Cek Jadwal
- Menampilkan status aman, mepet, atau bentrok.
- Warna selalu disertai teks status.

## Aturan data
- `trip-data.json` adalah satu-satunya sumber isi.
- Field kosong tampil sebagai "Belum diisi", bukan dikarang.
- Item `tentative` tampil dengan label "Belum pasti".
- Link rumah tidak dimasukkan ke web.
- Jangan tambahkan nomor penerbangan, kode booking, nomor telepon, atau alamat rumah.

## Tidak dibuat
Login, database, sinkron centang, unggah foto, peta tertanam, notifikasi, dan panel admin.

## Selesai jika
- Enak dipakai di lebar 375px, tanpa scroll horizontal.
- Semua menu berjalan dengan data dari JSON.
- Centang packing tetap ada setelah refresh.
- Link Maps membuka tab baru.
- Web tetap berjalan kalau penyimpanan browser diblokir.
