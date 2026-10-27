# Brief Technical Test Rekrutmen

## Ketentuan dari recruiter

> Selamat Sore,
> Untuk proses recruitmentnya akan di lanjutkan ke tahap technical test ya.
>
> Untuk technical test, kandidat diminta membuat website beserta CMSnya.
>
> Ketentuan:
>
> - Aplikasi wajib mengimplementasikan:
>   - API Connection (integrasi dengan API eksternal atau internal).
>   - Payment Gateway (boleh menggunakan sandbox/mock payment).
>   - Automation Tools menggunakan n8n.
> - Objective yang akan dinilai adalah konsep aplikasi, struktur sistem, pembagian modul, serta implementasi arsitektur.
> - Frontend diharapkan menggunakan framework modern (selain PHP/HTML murni, misalnya React, Vue, Next.js, Angular, dll.)
> - Backend bebas menggunakan teknologi apa pun, namun sebisa mungkin tidak menggunakan Firebase.
> - Source code diunggah ke GitHub/GitLab dan menyertakan README yang berisi cara instalasi, menjalankan aplikasi, serta penjelasan singkat arsitektur dan fitur.
> - Hasil pengerjaan disubmit paling lambat hari Rabu pukul 23.59 WIB.

## Ringkasan kebutuhan

| Area | Kebutuhan yang perlu terlihat saat demo |
| --- | --- |
| Website | Antarmuka pengguna dengan framework frontend modern. |
| CMS | Antarmuka admin untuk mengelola konten atau data inti aplikasi; perubahan terlihat pada website. |
| API connection | Alur request dan response yang nyata ke API internal atau eksternal. |
| Payment gateway | Alur transaksi dengan status pembayaran yang jelas; sandbox atau mock diperbolehkan. |
| n8n | Workflow otomatis yang dipicu oleh peristiwa aplikasi dan menghasilkan tindakan yang dapat dibuktikan. |
| Arsitektur | Modul dan tanggung jawabnya jelas; alur data antarkomponen dapat dijelaskan. |
| Penyerahan | Repository GitHub/GitLab dan README untuk instalasi, menjalankan, arsitektur, serta fitur. |

## Pemetaan ketentuan HR dan status saat ini

Status di bawah menggambarkan hasil implementasi saat pembaruan terakhir. Email nyata sudah diterima di Gmail penguji; publikasi repository masih memerlukan penyelesaian.

| Ketentuan HR | Rencana pemenuhan | Status implementasi |
| --- | --- | --- |
| Membuat website beserta CMS | Website katalog/checkout eSIM dan CMS admin untuk destinasi, paket serta pesanan | Dibuat dan diuji lokal |
| API Connection (eksternal atau internal) | Website dan CMS memakai endpoint API internal untuk katalog dan pesanan | Dibuat dan diuji lokal |
| Payment Gateway (sandbox/mock boleh) | Mock payment dengan status `pending`, `paid`, dan `failed` | Dibuat dan diuji lokal |
| Automation Tools menggunakan n8n | Event pembayaran berhasil memicu workflow konfirmasi simulasi | Workflow aktif; email nyata diterima di Inbox Gmail penguji |
| Konsep aplikasi | Demo pemesanan travel eSIM yang relevan dengan bisnis JavaMifi | Diwujudkan sebagai TripConnect Demo |
| Struktur sistem, pembagian modul, implementasi arsitektur | Pisahkan UI publik, CMS, API, bisnis, data, payment, dan automation; jelaskan dengan diagram | Dibuat; diagram arsitektur di README |
| Frontend framework modern | Next.js + TypeScript | Dibuat |
| Backend bebas, sebisa mungkin bukan Firebase | Backend melalui Next.js Route Handlers dan PostgreSQL | Dibuat tanpa Firebase |
| Source code GitHub/GitLab | Unggah aplikasi ke repository | Belum diunggah |
| README instalasi, menjalankan, arsitektur, fitur | Tulis README lengkap setelah implementasi | Dibuat |
| Submit Rabu pukul 23.59 WIB | Serahkan sebelum 28 Oktober 2026 pukul 23.59 WIB | Belum dilakukan; tanggal dikonfirmasi kandidat |

## Analisis awal

Fokus penilaian yang disebutkan recruiter adalah **konsep, struktur sistem, pembagian modul, dan implementasi arsitektur**. Karena itu, satu alur lengkap yang bekerja dari website sampai CMS, pembayaran, dan n8n kemungkinan lebih kuat daripada banyak fitur yang terpisah tetapi belum selesai.

### Konteks JavaMifi

Menurut [situs resminya](https://www.javamifi.com/), JavaMifi menyediakan WiFi portable, travel eSIM, dan SIM card untuk kebutuhan koneksi saat bepergian. [Alur sewa WiFi](https://www.javamifi.com/wifi) mencakup pemilihan destinasi, paket, metode pengiriman/pengambilan, dan pembayaran. Pada [halaman produk eSIM](https://shop.javamifi.com/store/travel-esim-indonesia), informasi eSIM dikirim melalui email setelah pembayaran berhasil.

### Usulan konsep yang relevan

**Travel eSIM Ordering & Fulfillment Demo:** pengguna memilih negara tujuan dan paket data, mengisi email, membuat pesanan, lalu melakukan pembayaran sandbox/mock. Setelah status pembayaran berhasil, backend menerbitkan event ke n8n. Workflow n8n mengirim email konfirmasi berisi **kode aktivasi contoh** dan instruksi simulasi. Admin mengelola destinasi, paket, harga, dan pesanan lewat CMS.

Konsep ini sengaja berupa **simulasi independen yang terinspirasi bisnis JavaMifi**, bukan integrasi ke sistem internal mereka atau penerbitan eSIM sungguhan. Alur eSIM tidak memerlukan inventaris modem, pengiriman, dan pengembalian perangkat, sehingga lebih realistis untuk tenggat singkat. Jika ingin menunjukkan proses operasional yang lebih kaya, sewa WiFi portable bisa menjadi alternatif setelah alur inti selesai.

### Arah teknis untuk posisi fullstack developer

**Usulan stack awal:** Next.js + TypeScript untuk website, CMS, dan endpoint API; PostgreSQL untuk data; ORM untuk akses data; n8n sebagai layanan terpisah. Semua dapat dijalankan lokal dengan konfigurasi environment dan, bila diperlukan, Docker Compose. Pilihan ORM dan payment gateway ditetapkan setelah mempertimbangkan pengalaman kandidat serta waktu tersisa.

Next.js mendukung [Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers) untuk endpoint API dan webhook. n8n menyediakan [Webhook node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/) untuk menerima event dari backend. Walaupun website, CMS, dan API dapat berada dalam satu repository/aplikasi, kode perlu dipisah menurut tanggung jawab: UI publik, UI admin, layanan bisnis, akses data, adaptor pembayaran, dan pengiriman event automation.

**Alur inti yang perlu didemokan:**

1. Admin membuat atau mengubah paket eSIM di CMS; katalog publik menampilkan hasilnya melalui API internal.
2. Pengunjung memilih paket dan mengisi email; backend memvalidasi input, menghitung harga di server, lalu menyimpan pesanan berstatus `pending`.
3. Mock/sandbox payment mengubah status pesanan menjadi `paid` atau `failed` melalui endpoint yang terautentikasi/terverifikasi. Perubahan status harus aman jika callback dikirim lebih dari sekali.
4. Setelah `paid`, backend mengirim event ke webhook n8n. Workflow mengirim konfirmasi simulasi dan menyimpan hasil eksekusi untuk bukti demo.
5. CMS menampilkan status pembayaran dan status pengiriman konfirmasi.

**Prioritas pengerjaan:** alur lengkap di atas, README dan diagram arsitektur, baru kemudian tambahan seperti pencarian/filter paket atau integrasi API eksternal. Integrasi API internal sudah memenuhi bunyi ketentuan recruiter; bila memakai API eksternal, fungsinya harus jelas dan tidak membuat alur utama bergantung pada layanan yang tidak stabil.

### Rekomendasi untuk dua ketentuan yang tidak dirinci HR

1. **Payment gateway:** gunakan mock gateway lokal yang memiliki sesi pembayaran dan halaman checkout tersendiri. Pengguna memilih hasil **berhasil** atau **gagal** di halaman tersebut; mock gateway mengirim callback terverifikasi ke backend. Backend memperbarui status pesanan secara idempoten. Dengan demikian, demo menunjukkan batas antara aplikasi dan penyedia pembayaran, bukan hanya tombol yang langsung mengubah status pesanan. Tidak ada transaksi uang sungguhan.
2. **Automasi n8n:** setelah callback pembayaran berhasil diproses, backend mengirim event berisi ID pesanan ke webhook n8n. Workflow mengambil data yang diperlukan, mengirim email konfirmasi **simulasi ke alamat Gmail nyata**, lalu melaporkan hasilnya kembali agar status konfirmasi dapat dilihat di CMS. Pengiriman nyata memerlukan akun/kredensial pengirim yang dikonfigurasi di n8n dan tidak dimasukkan ke repository. Sertakan file ekspor workflow, cara impor/aktivasi, dan langkah melihat eksekusinya dalam README.

**Bukti demo minimum:** satu pesanan sukses menghasilkan status `paid`, satu eksekusi n8n, dan satu email simulasi yang diterima di Gmail penguji; satu pesanan gagal menghasilkan status `failed` tanpa email sukses. Pengulangan callback untuk pesanan sukses tidak boleh mengirim konfirmasi kedua.

### Modul minimum yang disarankan

1. **Website publik:** pilih destinasi dan paket eSIM, checkout, dan halaman status pesanan.
2. **CMS/admin:** autentikasi admin, pengelolaan destinasi/paket/harga, serta daftar dan detail pesanan.
3. **Backend/API:** endpoint katalog, pesanan, integrasi pembayaran, dan webhook/status pembayaran.
4. **Database:** destinasi, paket, admin, pesanan, serta riwayat status pembayaran yang diperlukan.
5. **Payment:** sandbox gateway atau mock dengan skenario berhasil dan gagal yang bisa didemokan.
6. **n8n:** workflow yang menerima event pembayaran berhasil, mengirim email konfirmasi simulasi, dan menyimpan bukti hasil eksekusi.

### Hal yang perlu diputuskan sebelum implementasi

- Apakah konsep demo eSIM ini sesuai dengan posisi yang dilamar dan ekspektasi recruiter.
- Stack frontend, backend, database, serta cara menjalankan layanan lokal.
- Pilihan payment sandbox atau mock, termasuk kredensial dan batasan lingkungan demo.
- Pemicu dan keluaran workflow n8n; apakah membutuhkan layanan eksternal tambahan.
- Batas minimum fitur CMS dan autentikasi admin.
- Cara reviewer menjalankan demo: lokal, deployment, atau keduanya.
- Tenggat telah dikonfirmasi kandidat: **Rabu, 28 Oktober 2026 pukul 23.59 WIB**.

## Checklist penyerahan

- [ ] Website dan CMS dapat dijalankan.
- [ ] Integrasi API dapat ditunjukkan.
- [ ] Alur pembayaran sandbox/mock dapat ditunjukkan sampai status akhir.
- [ ] Workflow n8n dan hasil eksekusinya dapat ditunjukkan.
- [ ] Struktur modul dan diagram/alur arsitektur dijelaskan di README.
- [ ] README memuat prasyarat, variabel environment, instalasi, cara menjalankan, dan fitur.
- [ ] Source code diunggah ke GitHub/GitLab sebelum tenggat.
