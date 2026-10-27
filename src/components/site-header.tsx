import Link from "next/link";
import { Globe2, ArrowUpRight } from "lucide-react";

export function SiteHeader() {
  return <header className="site-header">
    <div className="container nav-inner">
      <Link href="/" className="brand"><span className="brand-icon"><Globe2 size={23} strokeWidth={2.5}/></span><span>trip<span>connect</span><i>.</i></span></Link>
      <nav className="nav-links"><Link href="/#paket">Paket eSIM</Link><Link href="/#cara-kerja">Cara kerja</Link><Link href="/admin">CMS Demo</Link></nav>
      <Link href="/#paket" className="nav-cta">Jelajahi paket <ArrowUpRight size={16}/></Link>
    </div>
  </header>;
}
