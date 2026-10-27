"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CircleCheck, Clock3, Mail, XCircle } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { rupiah } from "@/lib/format";

type Order = { publicCode: string; planName: string; destinationName: string; amountIdr: number; paymentStatus: "PENDING"|"PAID"|"FAILED"; fulfillment: { status: string; error: string|null }|null };

export default function OrderPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    const load = () => fetch(`/api/orders/${code}`, { cache: "no-store" }).then(r => r.ok ? r.json() : null).then(data => { if (active) { setOrder(data); setLoading(false); } });
    load(); const interval = setInterval(load, 5000);
    return () => { active = false; clearInterval(interval); };
  }, [code]);
  const icon = order?.paymentStatus === "PAID" ? <CircleCheck size={35}/> : order?.paymentStatus === "FAILED" ? <XCircle size={35}/> : <Clock3 size={35}/>;
  return <><SiteHeader/><main className="inner-main"><div className="container"><div className="breadcrumb"><Link href="/">Beranda</Link> / Status pesanan</div><div className="panel center-panel"><div className="status-icon">{icon}</div><div className="eyebrow">STATUS PESANAN</div><h1 className="page-title" style={{marginTop:13}}>{loading ? "Memuat..." : order?.paymentStatus === "PAID" ? "Pembayaran berhasil!" : order?.paymentStatus === "FAILED" ? "Pembayaran gagal" : "Menunggu pembayaran"}</h1>{!loading && !order ? <div className="error-box">Pesanan tidak ditemukan.</div> : order && <><p className="page-subtitle">{order.paymentStatus === "PAID" ? "Pesananmu berhasil dicatat. Konfirmasi simulasi sedang diproses melalui n8n." : order.paymentStatus === "FAILED" ? "Pembayaran simulasi gagal. Tidak ada email konfirmasi sukses yang dikirim." : "Selesaikan pembayaran simulasi untuk melanjutkan pesanan."}</p><span className={`status-badge status-${order.paymentStatus}`}>{order.paymentStatus}</span><div style={{marginTop:24,textAlign:"left"}}><div className="summary-row"><span>Nomor pesanan</span><b>{order.publicCode.slice(0,10).toUpperCase()}</b></div><div className="summary-row"><span>Paket</span><b>{order.planName}</b></div><div className="summary-row"><span>Destinasi</span><b>{order.destinationName}</b></div><div className="summary-total"><span>Total</span><strong>{rupiah(order.amountIdr)}</strong></div></div>{order.fulfillment && <div className="notice" style={{textAlign:"left",display:"flex",gap:10,alignItems:"center"}}><Mail size={18}/><span>Status email: <b>{order.fulfillment.status}</b>{order.fulfillment.status === "SENT" ? ". Cek inbox Gmail dan folder spam." : ". Halaman ini diperbarui otomatis."}</span></div>}<Link href="/" className="button button-blue" style={{marginTop:25}}>Kembali ke beranda <ArrowRight size={17}/></Link></>}</div></div></main><SiteFooter/></>;
}
