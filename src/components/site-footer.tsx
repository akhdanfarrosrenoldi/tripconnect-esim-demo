import Link from "next/link";

export function SiteFooter() {
  return <footer className="site-footer"><div className="container footer-inner">
    <div><Link href="/" className="brand footer-brand">trip<span>connect</span><i>.</i></Link><p>Demo pemesanan travel eSIM untuk technical test.<br/>Bukan produk atau layanan resmi JavaMifi.</p></div>
    <div className="footer-links"><Link href="/#paket">Paket eSIM</Link><Link href="/admin">CMS Admin</Link><span>© 2026 TripConnect Demo</span></div>
  </div></footer>;
}
