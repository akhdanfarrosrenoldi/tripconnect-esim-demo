# QA Test — TripConnect Demo

## Tujuan dan batas

Dokumen ini mencatat pengujian dari checkout baru dengan database terpisah. Fokusnya adalah kriteria penerimaan BRD dan ketentuan recruiter: website, CMS, API internal, mock payment, n8n, serta email nyata. Pembayaran dan kode eSIM tetap simulasi.

## Lingkungan pengujian

| Item | Nilai |
| --- | --- |
| Tanggal | 27 Oktober 2026 (clone/API) dan 28 Oktober 2026 (UI desktop, n8n, Gmail), WIB |
| Sumber | Clone terpisah untuk pengujian alur; instalasi, migrasi, dan seed diverifikasi ulang dari clone repository publik pada revisi `aad9085`. |
| Aplikasi | Next.js pada port 3100 |
| Database | PostgreSQL `tripconnect_qa`, terpisah dari database demo |
| n8n | Instance lokal dengan workflow `order-paid` dan credential SMTP Resend yang sudah tersedia |
| Penerima email | Gmail penguji; alamat dan credential tidak disimpan di dokumen ini |

## Langkah setup dari checkout baru

1. Clone repository, salin `.env.example` ke `.env`, dan isi secret/admin/email secara lokal. Untuk isolasi pengujian, ubah `DATABASE_URL` ke database QA, `APP_URL` ke `http://localhost:3100`, dan `N8N_CALLBACK_BASE_URL` ke `http://host.docker.internal:3100`.
2. Jalankan `npm ci`; skrip `postinstall` menghasilkan Prisma Client secara otomatis.
3. Jalankan `docker compose up -d`, `npx prisma migrate deploy`, dan `npm run db:seed`.
4. Jalankan `npm run dev -- --port 3100`, kemudian uji endpoint dan alur browser/API.
5. Jalankan `npm run build` dan `npm run lint` dari clone tersebut.

## Matriks kasus positif

| ID | Kasus | Ekspektasi | Hasil aktual |
| --- | --- | --- | --- |
| P01 | Install, migrasi, seed dari clone baru | Aplikasi dapat dijalankan; paket contoh tersedia | **Lulus**: clone publik pada revisi `aad9085` menjalankan `npm ci` → Prisma Client tergenerate → migrasi/seed lulus; 5 destinasi dan 7 paket terbuat. |
| P02 | Katalog dan angka beranda | API memberi paket aktif; jumlah destinasi/paket sesuai data | **Lulus**: awal 5/7; setelah tambah paket, beranda menampilkan 5/8. |
| P03 | Login admin yang benar | Sesi dibuat; API admin dapat diakses | **Lulus**: login 200, API admin 200. |
| P04 | CMS buat/ubah/nonaktifkan paket | Perubahan tercermin di katalog; paket nonaktif hilang | **Lulus**: paket QA dibuat, harga berubah 55.000→65.000, lalu hilang dari API publik saat dinonaktifkan. |
| P05 | Buat pesanan paket aktif | Status `PENDING`; harga disalin dari server | **Lulus**: order tetap Rp65.000 setelah harga katalog diubah menjadi Rp75.000. |
| P06 | Pembayaran sukses | Status `PAID`; satu payment event dan fulfillment | **Lulus**: satu event dan satu fulfillment; hasil terlihat di API CMS. |
| P07 | Automasi n8n dan email | Fulfillment `SENT`; eksekusi n8n dan email Gmail terbukti | **Lulus**: `SENT` dengan SMTP message ID; email pesanan `b38d86c525ba6c4093972641` terlihat langsung di Inbox Gmail pukul 15.40 WIB. |
| P08 | Pembayaran gagal | Status `FAILED`; tanpa fulfillment/email sukses | **Lulus**: order `FAILED`, tidak ada fulfillment. |
| P09 | Build dan lint | Keduanya lulus | **Lulus** dari clone QA: `npm run build` dan `npm run lint` exit 0. |

## Matriks kasus negatif

| ID | Kasus | Ekspektasi | Hasil aktual |
| --- | --- | --- | --- |
| N01 | Akses API admin tanpa login | HTTP 401 | **Lulus**: 401. |
| N02 | Login dengan password salah | HTTP 401 | **Lulus**: 401. |
| N03 | Data order tidak valid | HTTP 400; tidak membuat order | **Lulus**: email invalid menghasilkan 400. |
| N04 | Order paket nonaktif | HTTP 404; tidak membuat order | **Lulus**: 404. |
| N05 | Hasil mock payment di luar `PAID`/`FAILED` | HTTP 400; order tetap `PENDING` | **Lulus**: 400. |
| N06 | Callback payment tanpa signature yang valid | HTTP 401; order tetap `PENDING` | **Lulus**: 401 dan status tetap `PENDING`. |
| N07 | Ulangi pembayaran/callback pada order final | Tidak menambah event atau fulfillment; tidak mengirim email kedua | **Lulus**: callback ulang menandai `duplicate`; event dan fulfillment tetap satu. Inbox menunjukkan satu pesan untuk kode QA tersebut. |
| N08 | Callback fulfillment tanpa token sah | HTTP 401; status tidak berubah | **Lulus**: 401. |
| N09 | Sesi pembayaran kedaluwarsa | HTTP 404; status order tetap `PENDING` | **Lulus**: GET/POST 404 dan order tetap `PENDING`. |
| N10 | URL status order acak | HTTP 404; data pembeli tidak bocor | **Lulus**: 404 tanpa data pembeli. |

## Catatan hasil dan batas pembuktian

Clone dari URL GitHub publik pada revisi `aad9085` menjalankan `npm ci`, `npx prisma migrate deploy`, dan `npm run db:seed` dengan exit 0. Aplikasi dari clone tersebut di port 3200 mengembalikan 7 paket melalui API dan HTTP 401 untuk API admin tanpa login.

- `SENT` dan SMTP message ID menunjukkan layanan pengirim menerima pesan. Penerimaan akhir diverifikasi terpisah dengan melihat subjek dan kode order QA di Inbox Gmail penguji pada 27 Oktober 2026.
- Kasus negatif API diuji melalui HTTP dan inspeksi database QA. Alur browser desktop dan CMS diuji ulang secara manual pada 28 Oktober 2026 seperti tercatat di bawah.
- Pengujian memakai mock payment yang diizinkan HR, bukan transaksi uang sungguhan. Kredensial SMTP tidak terdapat di clone/repository; clone memakai credential n8n lokal yang sudah dikonfigurasi sebelumnya.
- `npm audit` masih melaporkan 4 advisori tingkat **high** pada pohon dependensi Prisma (`deepmerge-ts` dan `effect` serta paket induknya). Perbaikan otomatis yang ditawarkan npm adalah upgrade Prisma major, sehingga belum diterapkan pada demo dengan tenggat singkat. Ini risiko pemeliharaan dependensi, bukan kegagalan kasus fungsional di atas.

## Uji ulang UI desktop dan email (28 Oktober 2026)

Pengujian dilakukan pada viewport browser **1440 × 900**, aplikasi lokal port 3000, database demo lokal, n8n lokal yang sudah dikonfigurasi, dan Gmail penerima yang sudah login. Ini uji UI di instalasi yang ada; hasil clone bersih tetap mengacu pada bagian sebelumnya.

| Alur | Hasil aktual |
| --- | --- |
| Beranda dan katalog | **Lulus**: 5 destinasi/7 paket aktif tampil. Filter Malaysia menyisakan paket Malaysia; pencarian `Singapore` dengan filter itu menampilkan keadaan tanpa hasil. |
| Detail dan validasi checkout | **Lulus**: detail Singapore Quick Trip 3GB memuat harga Rp39.000. Email tidak valid ditolak validasi browser; email valid membuat sesi mock payment. |
| Pembayaran sukses | **Lulus**: order `b0865803a9a9fc4b6e128c35` menjadi `PAID`; halaman status berubah dari email `PROCESSING` menjadi `SENT`. Membuka ulang sesi final hanya menampilkan tautan status pesanan, tanpa tombol pembayaran ulang. |
| Pembayaran gagal | **Lulus**: order `765a965e987965c8206126eb` menjadi `FAILED`, tanpa fulfillment. Pencarian kode order itu di Gmail tidak menemukan email. |
| CMS autentikasi | **Lulus**: password salah ditolak; login akun QA sementara berhasil; logout dan reload kembali menampilkan form login. Akun QA sementara dihapus setelah pengujian. |
| CMS pesanan | **Lulus**: daftar menampilkan order sukses `PAID`/`SENT` dan order gagal `FAILED`/tanpa email. Detail order sukses menampilkan SMTP Message ID. |
| CMS destinasi/paket | **Lulus**: destinasi dan paket QA dibuat lewat form UI, destinasi diubah, harga paket diubah Rp45.000→Rp55.000 dan terlihat di katalog publik. Form paket kosong ditolak. Paket dan destinasi dinonaktifkan lalu hilang dari katalog. Data QA sementara dihapus dari database setelahnya; katalog kembali 5 destinasi/7 paket. |
| n8n | **Lulus**: workflow `TripConnect - Paid Order Email` aktif. Eksekusi terbaru ID 9 berstatus `Success` pada 19.13 WIB, 28 Oktober 2026. |
| Gmail nyata | **Lulus**: Inbox Gmail penerima memuat tepat satu hasil untuk kode order sukses tersebut dari `onboarding@resend.dev` pukul 19.13 WIB. Isi email menyebut paket Singapore Quick Trip 3GB dan kode demo `DEMO-B0865803`. |
| URL order tidak dikenal | **Lulus**: halaman status menampilkan “Pesanan tidak ditemukan.” |

Pengujian ini tidak mencakup viewport ponsel sesuai cakupan uji desktop. Setup akun n8n/Resend baru dari nol belum diulang pada 28 Oktober; workflow dan SMTP lokal yang sudah dikonfigurasi berhasil dipakai untuk pengiriman nyata.
