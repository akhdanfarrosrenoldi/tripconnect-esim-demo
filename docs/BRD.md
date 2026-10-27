# Business Requirements Document (BRD)

## 1. Informasi dokumen

| Item | Keterangan |
| --- | --- |
| Nama proyek | Travel eSIM Ordering & Fulfillment Demo |
| Tujuan | Technical test posisi Fullstack Developer untuk JavaMifi |
| Status | Ruang lingkup MVP telah diimplementasikan; lihat hasil QA di [QA-TEST.md](QA-TEST.md) |
| Sumber kebutuhan | Ketentuan recruiter dalam [recruit-brief.md](recruit-brief.md) |
| Tenggat | Rabu, 28 Oktober 2026 pukul 23.59 WIB (dikonfirmasi kandidat) |

## 2. Latar belakang

JavaMifi menyediakan layanan konektivitas perjalanan, termasuk WiFi portable, travel eSIM, dan SIM card. Technical test meminta kandidat membuat website beserta CMS yang menunjukkan integrasi API, pembayaran, dan automasi n8n. Aplikasi dalam dokumen ini adalah **prototipe independen** yang terinspirasi oleh alur pembelian travel eSIM. Aplikasi tidak terhubung ke sistem internal JavaMifi dan tidak menerbitkan eSIM sungguhan.

Referensi konteks bisnis: [situs JavaMifi](https://www.javamifi.com/) dan [contoh halaman produk eSIM](https://shop.javamifi.com/store/travel-esim-indonesia).

## 3. Masalah dan peluang

Calon pembeli perlu menemukan paket konektivitas berdasarkan tujuan perjalanan, memahami detail paket, dan menyelesaikan pembayaran. Tim operasional perlu mengelola paket serta memantau pesanan. Setelah pembayaran berhasil, proses konfirmasi harus berjalan konsisten tanpa langkah manual.

Prototipe ini menunjukkan bagaimana website pelanggan, CMS admin, API, pembayaran, dan automasi bekerja sebagai satu alur bisnis yang dapat diuji.

## 4. Tujuan bisnis

1. Memungkinkan pengunjung menemukan paket eSIM berdasarkan destinasi dan membuat pesanan.
2. Memungkinkan admin mengelola katalog dan memantau status pesanan melalui CMS.
3. Menunjukkan proses pembayaran simulasi dengan status transaksi yang jelas.
4. Mengotomasi konfirmasi pesanan setelah pembayaran berhasil menggunakan n8n.
5. Menyajikan rancangan modul dan alur data yang mudah dinilai untuk posisi Fullstack Developer.

## 5. Pemangku kepentingan dan pengguna

| Peran | Kebutuhan |
| --- | --- |
| Pengunjung/pembeli | Menemukan paket, memahami harga, membuat pesanan, dan melihat statusnya. |
| Admin operasional | Mengelola destinasi dan paket; melihat pesanan serta status pembayaran/konfirmasi. |
| Reviewer technical test | Menjalankan sistem, menguji alur utama, dan memahami arsitektur serta pembagian modul. |

## 6. Ruang lingkup MVP

### Termasuk

- Website publik: daftar paket, filter destinasi, detail paket, formulir checkout, dan status pesanan.
- CMS: login admin, tambah/ubah/nonaktifkan paket, daftar dan detail pesanan.
- API internal untuk katalog, pemesanan, pembayaran simulasi, dan data CMS.
- Penyimpanan data destinasi, paket, pesanan, dan status pembayaran.
- Pembayaran mock dengan hasil berhasil dan gagal; sandbox gateway dapat menggantikannya bila waktu dan kredensial tersedia.
- Workflow n8n yang dipicu ketika pembayaran berhasil dan mengirim email konfirmasi simulasi ke alamat Gmail penerima yang nyata.
- README, data contoh, dan instruksi menjalankan sistem.

### Di luar ruang lingkup MVP

- Penerbitan profil/QR eSIM asli dan integrasi operator telekomunikasi.
- Pembayaran uang sungguhan.
- Inventaris, pengiriman, dan pengembalian modem WiFi.
- Akun pelanggan, refund, promo, multi bahasa, dan analitik lanjutan.
- Integrasi ke sistem internal JavaMifi.

## 7. Alur bisnis utama

1. Admin login dan mempublikasikan paket eSIM untuk destinasi tertentu.
2. Pengunjung memilih destinasi, membaca detail paket, dan mengisi email saat checkout.
3. Sistem menghitung total di server dan membuat pesanan berstatus `pending`.
4. Pengunjung menjalankan pembayaran simulasi. Sistem menerima hasil `paid` atau `failed` dan menyimpan perubahan status.
5. Untuk pesanan `paid`, sistem mengirim event ke n8n satu kali secara logis. n8n membuat atau mengirim konfirmasi simulasi.
6. Pengunjung melihat status pesanan; admin melihat status pembayaran dan konfirmasi di CMS.

## 8. Kebutuhan fungsional

| ID | Kebutuhan | Prioritas | Kriteria penerimaan |
| --- | --- | --- | --- |
| FR-01 | Sistem menampilkan paket eSIM aktif beserta destinasi, kuota, masa berlaku, dan harga. | Wajib | Paket aktif dari CMS muncul di website; paket nonaktif tidak dapat dipesan. |
| FR-02 | Pengunjung dapat memilih destinasi dan melihat paket yang tersedia. | Wajib | Filter hanya menampilkan paket untuk destinasi yang dipilih. |
| FR-03 | Pengunjung dapat membuat pesanan dengan email dan satu paket. | Wajib | Input divalidasi; harga dihitung dari data server; pesanan tersimpan sebagai `pending`. |
| FR-04 | Pengunjung dapat melihat status pesanannya. | Wajib | Status yang ditampilkan sesuai data tersimpan dan tidak mengekspos data pesanan lain. |
| FR-05 | Admin dapat login dan logout dari CMS. | Wajib | Halaman dan API admin menolak pengguna yang belum terautentikasi. |
| FR-06 | Admin dapat membuat, mengubah, dan menonaktifkan paket. | Wajib | Perubahan tersimpan dan tercermin pada katalog publik. |
| FR-07 | Admin dapat melihat daftar serta detail pesanan. | Wajib | CMS menampilkan paket, email pemesan, total, waktu, status pembayaran, dan status konfirmasi. |
| FR-08 | Sistem menyediakan pembayaran mock/sandbox dengan hasil berhasil dan gagal. | Wajib | Status pesanan berubah sesuai hasil; total pesanan tidak dapat diubah dari sisi klien. |
| FR-09 | Sistem memproses callback pembayaran secara aman. | Wajib | Callback tidak sah ditolak; pengiriman ulang tidak membuat perubahan atau automasi ganda. |
| FR-10 | Pembayaran berhasil memicu workflow n8n. | Wajib | Eksekusi workflow dapat diperlihatkan dengan ID pesanan; email konfirmasi simulasi benar-benar diterima di inbox Gmail penguji. |
| FR-11 | Pembayaran gagal tidak memicu konfirmasi keberhasilan. | Wajib | Tidak ada konfirmasi berhasil untuk pesanan `failed`. |
| FR-12 | Reviewer dapat menjalankan aplikasi dari repository. | Wajib | README memuat prasyarat, environment, instalasi, data contoh, perintah menjalankan, arsitektur, dan skenario demo. |

## 9. Aturan bisnis

- Paket hanya dapat dipesan ketika berstatus aktif.
- Harga yang berlaku saat checkout disalin ke pesanan agar perubahan harga paket berikutnya tidak mengubah pesanan lama.
- Status pembayaran minimal: `pending`, `paid`, dan `failed`.
- Hanya transisi pembayaran yang valid yang boleh mengubah status pesanan; callback berulang bersifat idempoten.
- Konfirmasi simulasi hanya dikirim setelah status `paid` tercatat.
- Kode aktivasi/QR yang ditampilkan, bila ada, harus jelas bertanda **contoh** dan tidak mengklaim sebagai eSIM aktif.
- Admin dapat melihat data pembeli hanya untuk kebutuhan operasional demo.

## 10. Kebutuhan nonfungsional

| ID | Kebutuhan | Kriteria penerimaan |
| --- | --- | --- |
| NFR-01 | Keamanan dasar | Secret ada di environment, bukan repository; API admin dilindungi; input divalidasi di server. |
| NFR-02 | Keandalan alur | Kegagalan n8n tidak mengubah status pembayaran yang sudah berhasil; status konfirmasi dapat dilihat. |
| NFR-03 | Kemudahan menjalankan | Lingkungan lokal dapat disiapkan lewat instruksi README dan data contoh tanpa akses sistem internal JavaMifi. |
| NFR-04 | Kejelasan arsitektur | README memiliki diagram/alur komponen dan menjelaskan tanggung jawab setiap modul. |
| NFR-05 | Kemudahan demo | Skenario sukses dan gagal dapat dijalankan ulang dengan langkah yang terdokumentasi. |

## 11. Pemetaan ke ketentuan recruiter

| Ketentuan recruiter | Bukti yang ditargetkan |
| --- | --- |
| Website beserta CMS | Website pelanggan dan panel admin yang mengubah katalog. |
| API Connection | Request website/CMS ke API internal; endpoint dan contoh request dijelaskan. |
| Payment Gateway sandbox/mock | Checkout serta simulasi pembayaran sukses/gagal. |
| Automation Tools menggunakan n8n | Workflow webhook pembayaran berhasil dan bukti eksekusinya. |
| Konsep, struktur, modul, arsitektur | BRD ini, struktur kode, diagram komponen, dan penjelasan README. |
| Frontend framework modern | Frontend menggunakan Next.js + TypeScript. |
| Backend bebas, sebaiknya bukan Firebase | API aplikasi dan database PostgreSQL; tanpa Firebase. |
| GitHub/GitLab dan README | Repository source code dengan instruksi serta penjelasan fitur/arsitektur. |
| Rabu pukul 23.59 WIB | Submission sebelum 28 Oktober 2026 pukul 23.59 WIB. |

## 12. Indikator keberhasilan dan definisi selesai

MVP dinyatakan selesai ketika reviewer dapat: (1) menjalankan aplikasi dari README, (2) mengubah paket di CMS dan melihat perubahan pada website, (3) membuat pesanan, (4) menjalankan pembayaran sukses dan gagal, (5) melihat workflow n8n berjalan hanya untuk pembayaran sukses, dan (6) membaca pembagian modul serta arsitektur di repository.

## 13. Batas dan dependensi demo

| Item | Keputusan atau kebutuhan reviewer |
| --- | --- |
| Sistem JavaMifi | Demo independen; tidak memerlukan akses ke sistem internal JavaMifi. |
| Payment | Mock gateway lokal yang diizinkan recruiter; tidak memerlukan akun sandbox atau uang sungguhan. |
| Email nyata | Reviewer menyiapkan akun dan API key Resend sendiri di n8n bila ingin menerima email ke Gmail miliknya. Credential kandidat tidak ada di repository. |
| Cara menjalankan | Node.js, Docker Desktop, migrasi/seed, serta aktivasi workflow dijelaskan di README. |

## 14. Keputusan kerja dan hal yang belum diwajibkan HR

| Topik | Keputusan kerja |
| --- | --- |
| Konsep | Demo pemesanan travel eSIM. |
| Payment | Mock gateway lokal dengan halaman checkout, callback terverifikasi, dan penanganan callback berulang. |
| n8n | Webhook pembayaran sukses mengirim email konfirmasi simulasi ke alamat Gmail nyata dan melaporkan hasilnya ke CMS. |
| Demo | Aplikasi dapat dijalankan lokal dari repository dan README. |
| Tenggat | 28 Oktober 2026 pukul 23.59 WIB. |

HR tidak menyebut kewajiban URL deployment publik atau gateway sandbox nyata. Keduanya dapat menjadi tambahan bila alur wajib telah selesai dan masih ada waktu. Rincian bukti demo dicatat dalam [recruit-brief.md](recruit-brief.md). Dengan keputusan kerja ini, tidak ada ambiguitas yang menghalangi implementasi MVP.
