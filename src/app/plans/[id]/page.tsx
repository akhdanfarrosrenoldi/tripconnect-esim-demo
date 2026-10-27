"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Globe2, Mail, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { rupiah } from "@/lib/format";

type Plan = { id: string; name: string; description: string; quotaGb: number; validityDays: number; priceIdr: number; destination: { name: string; emoji: string } };

export default function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => { fetch(`/api/plans/${id}`).then(r => r.ok ? r.json() : null).then(setPlan).finally(() => setLoading(false)); }, [id]);

  async function checkout(event: React.FormEvent) {
    event.preventDefault(); setError(""); setSubmitting(true);
    try {
      const response = await fetch("/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ planId: id, buyerEmail: email }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Gagal membuat pesanan.");
      router.push(data.paymentUrl);
    } catch (err) { setError(err instanceof Error ? err.message : "Terjadi kesalahan."); setSubmitting(false); }
  }

  return <><SiteHeader/><main className="inner-main"><div className="container"><div className="breadcrumb"><Link href="/">Beranda</Link> / <Link href="/#paket">Paket eSIM</Link> / Detail paket</div>{loading ? <div className="panel">Memuat paket...</div> : !plan ? <div className="panel">Paket tidak ditemukan. <Link href="/">Kembali ke beranda</Link></div> : <div className="checkout-grid"><div className="panel"><div className="detail-flag">{plan.destination.emoji}</div><div className="eyebrow">TRAVEL eSIM • {plan.destination.name.toUpperCase()}</div><h1 className="page-title" style={{marginTop:14}}>{plan.name}</h1><p className="page-subtitle">{plan.description}</p><div className="detail-meta"><span><Globe2 size={16}/> {plan.destination.name}</span><span>{plan.quotaGb} GB Data</span><span>{plan.validityDays} Hari Aktif</span></div><div style={{marginTop:35,paddingTop:25,borderTop:"1px solid var(--line)"}}><h3 style={{fontSize:17}}>Yang kamu dapatkan</h3><p style={{display:"flex",gap:9,alignItems:"center",color:"var(--muted)"}}><CheckCircle2 size={18} color="var(--blue)"/> Paket data perjalanan sesuai pilihanmu</p><p style={{display:"flex",gap:9,alignItems:"center",color:"var(--muted)"}}><Mail size={18} color="var(--blue)"/> Konfirmasi otomatis melalui email setelah pembayaran sukses</p><p style={{display:"flex",gap:9,alignItems:"center",color:"var(--muted)"}}><ShieldCheck size={18} color="var(--blue)"/> Alur pembayaran simulasi yang aman untuk demo</p></div></div><div><form className="panel" onSubmit={checkout}><div className="eyebrow">RINGKASAN PESANAN</div><h2 style={{font:"800 22px 'Plus Jakarta Sans'",margin:"12px 0 22px"}}>Siap untuk terhubung?</h2><div className="summary-row"><span>Paket</span><b>{plan.name}</b></div><div className="summary-row"><span>Masa aktif</span><b>{plan.validityDays} hari</b></div><div className="summary-total"><span>Total</span><strong>{rupiah(plan.priceIdr)}</strong></div><div className="form-group"><label htmlFor="buyerEmail">Email penerima konfirmasi</label><input id="buyerEmail" className="form-input" type="email" required placeholder="nama@gmail.com" value={email} onChange={e => setEmail(e.target.value)}/><span className="form-note">Gunakan alamat Gmail milikmu untuk melihat email konfirmasi setelah pembayaran simulasi berhasil.</span></div>{error && <div className="error-box">{error}</div>}<button className="button button-blue full-button" disabled={submitting}>{submitting ? "Membuat pesanan..." : "Lanjut ke pembayaran"}<ArrowRight size={17}/></button><div className="notice">Ini adalah technical test. Pembayaran dan produk eSIM bersifat simulasi; tidak ada uang yang ditagihkan atau eSIM aktif yang diterbitkan.</div></form></div></div>}</div></main><SiteFooter/></>;
}
