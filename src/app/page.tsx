"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, ChevronDown, Globe2, Headphones, Plane, Search, ShieldCheck, Smartphone, Sparkles, Wifi } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { rupiah } from "@/lib/format";

type Destination = { id: string; code: string; name: string; emoji: string };
type Plan = { id: string; name: string; quotaGb: number; validityDays: number; priceIdr: number; description: string; destination: Destination };

export default function HomePage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [destination, setDestination] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([fetch("/api/destinations").then(r => r.json()), fetch("/api/plans").then(r => r.json())])
      .then(([d, p]) => { setDestinations(Array.isArray(d) ? d : []); setPlans(Array.isArray(p) ? p : []); })
      .finally(() => setLoading(false));
  }, []);
  const visiblePlans = useMemo(() => plans.filter(p =>
    (destination === "all" || p.destination.code === destination) &&
    `${p.name} ${p.destination.name}`.toLowerCase().includes(query.toLowerCase())
  ), [plans, destination, query]);

  return <>
    <SiteHeader />
    <main>
      <section className="hero"><div className="hero-grid container">
        <div className="hero-copy">
          <div className="eyebrow hero-eyebrow"><Sparkles size={15}/> Internet lancar ke mana pun</div>
          <h1>Jelajah dunia.<br/><span>Tetap terhubung.</span></h1>
          <p>Travel eSIM praktis untuk setiap perjalanan. Pilih destinasi, temukan paket yang pas, dan siap terkoneksi tanpa ribet.</p>
          <div className="hero-actions"><Link href="/#paket" className="button button-yellow">Temukan paketmu <ArrowRight size={18}/></Link><span className="hero-note"><Check size={17}/> Alur demo mudah dicoba</span></div>
          <div className="hero-stats"><div><strong>5</strong><span>Destinasi demo</span></div><div><strong>7</strong><span>Paket contoh</span></div><div><strong>100%</strong><span>Digital</span></div></div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
          <div className="globe-visual"><div className="globe-lat lat-1"/><div className="globe-lat lat-2"/><div className="globe-long long-1"/><div className="globe-long long-2"/><span className="globe-plane">✈</span></div>
          <div className="sim-card"><div className="sim-top"><span className="sim-brand">trip<span>connect</span><i>.</i></span><Wifi size={24}/></div><div className="sim-chip">▦</div><div className="sim-bottom"><b>GLOBAL eSIM</b><span>Stay connected, anywhere.</span></div></div>
          <div className="floating-badge badge-japan"><span>🇯🇵</span><div><strong>Japan</strong><small>Connected</small></div><span className="badge-dot"/></div>
          <div className="floating-badge badge-sg"><span>🇸🇬</span><div><strong>Singapore</strong><small>Ready to explore</small></div></div>
        </div>
      </div><div className="hero-wave"/></section>

      <section className="trust-strip"><div className="container trust-grid"><div><Globe2/><span>Pilih destinasi favorit</span></div><div><Smartphone/><span>Tanpa kartu fisik</span></div><div><ShieldCheck/><span>Pembayaran aman*</span></div><div><Headphones/><span>Alur mudah dipahami</span></div></div></section>

      <section id="paket" className="packages section"><div className="container">
        <div className="section-heading"><div><div className="eyebrow">PAKET PERJALANAN</div><h2>Internet siap sebelum<br/><span>petualangan dimulai.</span></h2><p>Pilih paket eSIM yang sesuai dengan destinasi dan lama perjalananmu.</p></div><div className="section-emblem"><Plane size={28}/></div></div>
        <div className="filter-panel"><label className="search-box"><Search size={19}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari destinasi atau paket..." /></label><div className="select-wrap"><Globe2 size={18}/><select value={destination} onChange={e => setDestination(e.target.value)}><option value="all">Semua destinasi</option>{destinations.map(d => <option key={d.id} value={d.code}>{d.name}</option>)}</select><ChevronDown size={17}/></div></div>
        <div className="plan-grid">{loading ? <div className="empty-state">Memuat paket perjalanan...</div> : visiblePlans.length ? visiblePlans.map((plan, index) => <article className="plan-card" key={plan.id}><div className="plan-top"><div className="flag-circle">{plan.destination.emoji}</div><span className="plan-tag">{index === 0 ? "FAVORIT" : "TRAVEL eSIM"}</span></div><div className="plan-destination">{plan.destination.name}</div><h3>{plan.name}</h3><p>{plan.description}</p><div className="plan-features"><span><Wifi size={16}/> {plan.quotaGb} GB Data</span><span><Sparkles size={16}/> {plan.validityDays} Hari</span></div><div className="plan-bottom"><div><small>Mulai dari</small><strong>{rupiah(plan.priceIdr)}</strong></div><Link href={`/plans/${plan.id}`} aria-label={`Lihat ${plan.name}`} className="round-arrow"><ArrowUpRight size={22}/></Link></div></article>) : <div className="empty-state">Belum ada paket yang cocok. Coba destinasi lain.</div>}</div>
        <p className="demo-disclaimer">*Seluruh paket, harga, pembayaran, dan kode aktivasi di situs ini adalah simulasi untuk technical test.</p>
      </div></section>

      <section id="cara-kerja" className="how-section section"><div className="container"><div className="eyebrow">CARA KERJA</div><h2>Hanya 3 langkah,<br/><span>langsung siap berangkat.</span></h2><div className="steps-grid"><div className="step-card"><span className="step-number">01</span><div className="step-icon"><Globe2/></div><h3>Pilih destinasi</h3><p>Cari negara tujuan dan pilih paket data yang sesuai dengan rencana perjalananmu.</p></div><div className="step-card"><span className="step-number">02</span><div className="step-icon"><Smartphone/></div><h3>Selesaikan pesanan</h3><p>Isi email dan coba alur pembayaran simulasi dengan aman dan transparan.</p></div><div className="step-card"><span className="step-number">03</span><div className="step-icon"><Wifi/></div><h3>Cek emailmu</h3><p>Setelah pembayaran berhasil, konfirmasi simulasi dikirim otomatis lewat n8n.</p></div></div></div></section>

      <section className="cta-section"><div className="container cta-box"><div><div className="eyebrow">READY TO EXPLORE?</div><h2>Koneksi siap.<br/>Petualangan menanti.</h2><p>Temukan paket perjalanan yang cocok untuk destinasi berikutnya.</p></div><Link href="/#paket" className="button button-yellow">Lihat semua paket <ArrowRight size={18}/></Link><div className="cta-decoration">✦</div></div></section>
    </main><SiteFooter />
  </>;
}
