# Project Execution Plan (PEP)

## 1. Ringkasan

| Item | Rencana |
| --- | --- |
| Proyek | Travel eSIM Ordering & Fulfillment Demo |
| Konteks | Technical test Fullstack Developer untuk JavaMifi |
| Acuan | [BRD.md](BRD.md) dan [recruit-brief.md](recruit-brief.md) |
| Tenggat | Rabu, 28 Oktober 2026 pukul 23.59 WIB |
| Hasil akhir | Repository GitHub/GitLab berisi website, CMS, API, mock payment, workflow n8n, README, dan bukti alur demo |
| Status | Tahap wajib telah diimplementasikan; verifikasi tercatat di [QA-TEST.md](QA-TEST.md) |

## 2. Target alur end-to-end

1. Admin login ke CMS dan mempublikasikan paket eSIM.
2. Website membaca paket melalui API internal dan menampilkannya kepada pengunjung.
3. Pengunjung mengisi email, memilih paket, dan membuat pesanan `pending`.
4. Mock gateway menampilkan halaman checkout dan mengirim callback hasil `paid` atau `failed` ke backend.
5. Untuk pesanan `paid`, backend mengirim event ke n8n.
6. n8n mengirim email konfirmasi **simulasi** yang benar-benar diterima di Gmail penguji, lalu melaporkan hasilnya ke aplikasi.
7. Pengunjung dan admin melihat status pesanan yang sesuai; pembayaran gagal tidak mengirim email sukses.

Pembayaran tidak memindahkan uang dan kode eSIM tidak mengaktifkan layanan. Keduanya harus ditandai sebagai simulasi di UI dan README.

## 3. Keputusan arsitektur

| Komponen | Pilihan kerja | Tanggung jawab |
| --- | --- | --- |
| Website dan CMS | Next.js + TypeScript | UI publik dan UI admin. |
| API/backend | Next.js Route Handlers dan modul layanan terpisah | Validasi, aturan bisnis, pesanan, callback payment, integrasi n8n. |
| Database | PostgreSQL | Paket, admin, pesanan, status pembayaran, dan status konfirmasi. |
| Payment | Mock gateway lokal | Sesi checkout, hasil sukses/gagal, callback terverifikasi. |
| Automation | n8n | Menerima event pembayaran sukses, mengirim email, melaporkan hasil. |
| Email | SMTP Resend yang dikonfigurasi di n8n | Pengiriman email nyata ke Gmail penguji. API key Resend disimpan di credential n8n, bukan repository. |

Struktur kode memisahkan UI publik, UI admin, API handlers, layanan payment/fulfillment, akses data, dan workflow n8n. Struktur aktual dijelaskan di [ITA.md](ITA.md).

## 4. Urutan eksekusi

| Tahap | Pekerjaan | Hasil/bukti selesai | Prioritas |
| --- | --- | --- | --- |
| 0. Persiapan | Inisialisasi proyek, database, environment contoh, data contoh, struktur modul, dan repository. | Aplikasi serta database dapat dijalankan lokal. | Wajib |
| 1. Katalog dan CMS | Model destinasi/paket, API katalog, halaman publik, login admin, CRUD paket, daftar pesanan. | Perubahan paket di CMS tampak di website. | Wajib |
| 2. Pemesanan | Form checkout, validasi server, snapshot harga, pembuatan order, halaman status. | Pesanan `pending` tersimpan dan dapat dilihat di CMS. | Wajib |
| 3. Pembayaran | Sesi mock checkout, hasil sukses/gagal, callback terverifikasi dan idempoten. | Order berubah ke `paid`/`failed`; callback berulang tidak menggandakan proses. | Wajib |
| 4. n8n dan Gmail | Workflow webhook → email → pelaporan hasil. Hubungkan akun pengirim di n8n. | Email sungguhan diterima di Gmail penguji hanya untuk order `paid`. | Wajib |
| 5. Dokumentasi dan verifikasi | README, diagram arsitektur, file ekspor workflow, langkah demo, uji alur utama. | Reviewer dapat menjalankan dan memahami sistem dari repository. | Wajib |
| 6. Tambahan | Deployment publik, sandbox payment nyata, fitur katalog tambahan. | Dikerjakan hanya jika seluruh tahap wajib selesai. | Opsional |

### Gerbang integrasi yang diperiksa lebih awal

Sebelum menyelesaikan seluruh UI, uji bahwa n8n dapat menerima webhook dan akun pengirim dapat mengirim satu email ke Gmail penguji. Jika pengiriman gagal, penyebabnya dapat diselesaikan tanpa menunggu alur aplikasi selesai. Hasil akhir tetap harus diuji melalui event pembayaran dari aplikasi, bukan hanya menjalankan workflow secara manual.

## 5. Rancangan data minimum

- **Destination:** ID, nama, kode negara/wilayah, status aktif.
- **Plan:** ID, destinasi, nama, kuota, masa berlaku, harga, status aktif.
- **Admin:** ID, identitas login, password hash.
- **Order:** ID, kode publik, email pembeli, paket dan harga saat pembelian, total, status pembayaran, waktu dibuat/diperbarui.
- **PaymentSession/Event:** ID, order ID, token/sesi mock, hasil callback, waktu pemrosesan, kunci idempotensi.
- **Fulfillment:** order ID, status konfirmasi, waktu pengiriman, referensi eksekusi n8n atau pesan email, pesan kesalahan bila ada.

Data pesanan tidak boleh mengandalkan harga paket terkini setelah checkout. Email dan informasi pesanan yang tampil di halaman status harus dibatasi agar tidak mengekspos data pembeli lain.

## 6. Kontrak integrasi minimum

| Alur | Input utama | Output utama | Catatan |
| --- | --- | --- | --- |
| API katalog | Destinasi/filter | Paket aktif | Dipakai website publik. |
| API order | Paket, email | Order ID, total, status `pending` | Validasi dan harga dihitung di server. |
| Buat sesi payment | Order ID | URL/token checkout mock | Token tidak boleh mudah ditebak. |
| Callback payment | Payment ID, hasil, bukti autentikasi | Status order | Hanya callback valid; proses idempoten. |
| Backend → n8n | Event `order.paid` dan order ID | Penerimaan event | Webhook lokal diakses melalui loopback; jangan buka port n8n ke internet tanpa autentikasi tambahan. |
| n8n → backend | Order ID, hasil email, bukti autentikasi | Status fulfillment | Mencegah pembaruan status oleh pihak tidak sah. |

Endpoint utama diringkas di README. Validasi input ada di `src/lib/schemas.ts`, sedangkan pemrosesan payment/fulfillment ada di `src/modules/`.

## 7. Rencana verifikasi

| Skenario | Hasil yang harus terlihat |
| --- | --- |
| Admin mengubah harga atau menonaktifkan paket | Website menampilkan perubahan; paket nonaktif tidak bisa dipesan. |
| Pengunjung membuat order | Order `pending` dengan harga yang benar muncul di CMS. |
| Mock payment berhasil | Order `paid`; n8n berjalan; satu email masuk ke Gmail penguji; CMS mencatat hasil konfirmasi. |
| Mock payment gagal | Order `failed`; tidak ada email konfirmasi sukses. |
| Callback sukses dikirim ulang | Status tetap benar; tidak ada email kedua. |
| Akses CMS tanpa login | Halaman/API admin menolak akses. |
| Menjalankan dari README | Reviewer dapat menyiapkan environment, database, n8n, dan data contoh. |

Hasil kasus positif dan negatif, termasuk bukti email yang diterima di Gmail, dicatat di [QA-TEST.md](QA-TEST.md) tanpa memuat secret.

## 8. Dependensi saat review

| Dependensi | Langkah reviewer |
| --- | --- |
| Aplikasi lokal | Ikuti README untuk Node.js, Docker Compose, migrasi, seed, dan start aplikasi. |
| Email nyata | Impor dan aktifkan workflow n8n; isi credential SMTP Resend milik reviewer sendiri. Tanpa itu, payment tetap berjalan dan status email tampil `ERROR`. |

## 9. Kriteria selesai dan penyerahan

Pekerjaan dinyatakan siap disubmit jika semua tahap wajib pada bagian 4 selesai dan skenario verifikasi pada bagian 7 lulus. Repository harus berisi source code, `README.md`, contoh variabel environment tanpa secret, migrasi/seed database, file ekspor workflow n8n, dan diagram arsitektur. Pastikan source code sudah diunggah ke GitHub/GitLab dan tautan repository diserahkan sebelum **28 Oktober 2026 pukul 23.59 WIB**.
