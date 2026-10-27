# QA Test — TripConnect Demo

## Tujuan dan batas

Dokumen ini mencatat pengujian dari checkout baru dengan database terpisah. Fokusnya adalah kriteria penerimaan BRD dan ketentuan recruiter: website, CMS, API internal, mock payment, n8n, serta email nyata. Pembayaran dan kode eSIM tetap simulasi.

## Lingkungan pengujian

| Item | Nilai |
| --- | --- |
| Tanggal | 27 Oktober 2026 (WIB) |
| Sumber | Clone baru dari repository, commit dicatat setelah pengujian |
| Aplikasi | Next.js pada port 3100 |
| Database | PostgreSQL `tripconnect_qa`, terpisah dari database demo |
| n8n | Instance lokal dengan workflow `order-paid` dan credential SMTP Resend yang sudah tersedia |
| Penerima email | Gmail penguji; alamat dan credential tidak disimpan di dokumen ini |

## Langkah setup dari checkout baru

1. Clone repository dan jalankan `npm ci`.
2. Salin `.env.example` ke `.env`, isi secret/admin/email secara lokal, ubah `DATABASE_URL` ke database QA, `APP_URL` ke `http://localhost:3100`, dan `N8N_CALLBACK_BASE_URL` ke `http://host.docker.internal:3100`.
3. Jalankan `docker compose up -d`, `npx prisma migrate deploy`, dan `npm run db:seed`.
4. Jalankan `npm run dev -- --port 3100`, kemudian uji endpoint dan alur browser/API.
5. Jalankan `npm run build` dan `npm run lint` dari clone tersebut.

## Matriks kasus positif

| ID | Kasus | Ekspektasi | Hasil aktual |
| --- | --- | --- | --- |
| P01 | Install, migrasi, seed dari clone baru | Aplikasi dapat dijalankan; paket contoh tersedia | Menunggu eksekusi |
| P02 | Katalog dan angka beranda | API memberi paket aktif; jumlah destinasi/paket sesuai data | Menunggu eksekusi |
| P03 | Login admin yang benar | Sesi dibuat; API admin dapat diakses | Menunggu eksekusi |
| P04 | CMS buat/ubah/nonaktifkan paket | Perubahan tercermin di katalog; paket nonaktif hilang | Menunggu eksekusi |
| P05 | Buat pesanan paket aktif | Status `PENDING`; harga disalin dari server | Menunggu eksekusi |
| P06 | Pembayaran sukses | Status `PAID`; satu payment event dan fulfillment | Menunggu eksekusi |
| P07 | Automasi n8n dan email | Fulfillment `SENT`; eksekusi n8n dan email Gmail terbukti | Menunggu eksekusi |
| P08 | Pembayaran gagal | Status `FAILED`; tanpa fulfillment/email sukses | Menunggu eksekusi |
| P09 | Build dan lint | Keduanya lulus | Menunggu eksekusi |

## Matriks kasus negatif

| ID | Kasus | Ekspektasi | Hasil aktual |
| --- | --- | --- | --- |
| N01 | Akses API admin tanpa login | HTTP 401 | Menunggu eksekusi |
| N02 | Login dengan password salah | HTTP 401 | Menunggu eksekusi |
| N03 | Data order tidak valid | HTTP 400; tidak membuat order | Menunggu eksekusi |
| N04 | Order paket nonaktif | HTTP 404; tidak membuat order | Menunggu eksekusi |
| N05 | Hasil mock payment di luar `PAID`/`FAILED` | HTTP 400; order tetap `PENDING` | Menunggu eksekusi |
| N06 | Callback payment tanpa signature yang valid | HTTP 401; order tetap `PENDING` | Menunggu eksekusi |
| N07 | Ulangi pembayaran/callback pada order final | Tidak menambah event atau fulfillment; tidak mengirim email kedua | Menunggu eksekusi |
| N08 | Callback fulfillment tanpa token sah | HTTP 401; status tidak berubah | Menunggu eksekusi |
| N09 | Sesi pembayaran kedaluwarsa | HTTP 404; status order tetap `PENDING` | Menunggu eksekusi |
| N10 | URL status order acak | HTTP 404; data pembeli tidak bocor | Menunggu eksekusi |

## Catatan hasil dan batas pembuktian

Hasil setiap kasus diisi setelah pengujian. `SENT` dan SMTP message ID menunjukkan layanan pengirim menerima pesan; penerimaan di Gmail perlu dikonfirmasi terpisah. Pengujian ini memakai mock payment yang memang diizinkan HR, bukan transaksi ke gateway uang sungguhan.
