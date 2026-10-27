"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CreditCard, LockKeyhole } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { rupiah } from "@/lib/format";

type Session = { planName: string; destinationName: string; amountIdr: number; paymentStatus: string; publicCode: string };

export default function PaymentPage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter();
  const { token } = use(params);
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => { fetch(`/api/payment/session/${token}`).then(r => r.ok ? r.json() : null).then(setSession).finally(() => setLoading(false)); }, [token]);
  async function complete(result: "PAID" | "FAILED") {
    setSubmitting(true); setError("");
    try {
      const response = await fetch(`/api/payment/session/${token}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ result }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Gagal memproses pembayaran.");
      router.push(`/orders/${data.publicCode}`);
    } catch (err) { setError(err instanceof Error ? err.message : "Terjadi kesalahan."); setSubmitting(false); }
  }
  return <><SiteHeader/><main className="inner-main"><div className="container"><div className="breadcrumb"><Link href="/">Beranda</Link> / Pembayaran</div><div className="panel center-panel"><div className="status-icon"><CreditCard size={34}/></div><div className="eyebrow">MOCK PAYMENT GATEWAY</div><h1 className="page-title" style={{marginTop:13}}>Pembayaran simulasi</h1><p className="page-subtitle">Pilih hasil pembayaran untuk menguji callback gateway, perubahan status pesanan, dan automasi n8n.</p>{loading ? <p>Memuat sesi...</p> : !session ? <div className="error-box">Sesi pembayaran tidak tersedia atau kedaluwarsa.</div> : <><div className="summary-row"><span>Paket</span><b>{session.planName}</b></div><div className="summary-row"><span>Destinasi</span><b>{session.destinationName}</b></div><div className="summary-total"><span>Total simulasi</span><strong>{rupiah(session.amountIdr)}</strong></div>{session.paymentStatus === "PENDING" ? <><div className="payment-options"><button className="button button-blue" disabled={submitting} onClick={() => complete("PAID")}>Simulasikan sukses <ArrowRight size={17}/></button><button className="button button-outline" disabled={submitting} onClick={() => complete("FAILED")}>Simulasikan gagal</button></div>{error && <div className="error-box">{error}</div>}</> : <Link className="button button-blue full-button" href={`/orders/${session.publicCode}`}>Lihat status pesanan <ArrowRight size={17}/></Link>}</>}<div className="notice"><LockKeyhole size={14}/> Tidak ada kartu atau uang sungguhan yang diproses di halaman demo ini.</div></div></div></main><SiteFooter/></>;
}
