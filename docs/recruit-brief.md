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

Status di bawah menggambarkan hasil implementasi per 27 Oktober 2026. Email nyata sudah diterima di Gmail penguji dan source code telah dipublikasikan di [repository GitHub pribadi](https://github.com/akhdanfarrosrenoldi/tripconnect-esim-demo). Penyerahan tautan kepada recruiter tetap menjadi langkah kandidat.

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
| Source code GitHub/GitLab | Unggah aplikasi ke repository | Sudah diunggah ke GitHub publik |
| README instalasi, menjalankan, arsitektur, fitur | Tulis README lengkap setelah implementasi | Dibuat |
| Submit Rabu pukul 23.59 WIB | Serahkan sebelum 28 Oktober 2026 pukul 23.59 WIB | Belum dilakukan; tanggal dikonfirmasi kandidat |

## Konsep dan keputusan implementasi

**TripConnect Demo** adalah prototipe pemesanan travel eSIM yang terinspirasi bidang usaha JavaMifi. Prototipe ini independen: tidak memakai sistem internal JavaMifi, tidak memproses uang, dan tidak menerbitkan eSIM aktif.

- Website dan CMS memakai Next.js, React, dan TypeScript. Backend memakai Next.js Route Handlers, Prisma, dan PostgreSQL tanpa Firebase.
- Website serta CMS terhubung ke API internal untuk katalog, pesanan, dan data admin. API internal memenuhi pilihan integrasi yang tertulis dalam ketentuan HR.
- Pembayaran memakai mock gateway lokal dengan sesi checkout, hasil sukses/gagal, callback bertanda tangan, dan penanganan callback berulang. Mock payment secara eksplisit diperbolehkan HR.
- Pembayaran sukses memicu workflow n8n yang mengirim email konfirmasi simulasi melalui SMTP Resend dan melaporkan statusnya ke aplikasi. Email nyata telah terlihat di Inbox Gmail penguji.
- Admin mengelola destinasi dan paket serta memantau pesanan. Pembeli tidak memerlukan akun; role tambahan tidak diwajibkan HR.
- Reviewer dapat mengikuti [README](../README.md) untuk menjalankan aplikasi lokal. Untuk menguji email di Gmail miliknya, reviewer perlu mengisi credential Resend sendiri di n8n; credential tidak disimpan di Git.

Rincian kebutuhan ada di [BRD](BRD.md), struktur sistem di [ITA](ITA.md), dan hasil kasus positif/negatif di [QA-TEST](QA-TEST.md).

## Checklist penyerahan

- [x] Website dan CMS dapat dijalankan.
- [x] Integrasi API internal dapat ditunjukkan.
- [x] Alur pembayaran mock dapat ditunjukkan sampai status akhir.
- [x] Workflow n8n dan hasil eksekusi email ke Gmail dapat ditunjukkan.
- [x] Struktur modul dan diagram/alur arsitektur dijelaskan di README.
- [x] README memuat prasyarat, variabel environment, instalasi, cara menjalankan, dan fitur.
- [x] Source code diunggah ke GitHub/GitLab sebelum tenggat.
- [ ] Tautan repository diserahkan kepada recruiter sebelum 28 Oktober 2026 pukul 23.59 WIB.
