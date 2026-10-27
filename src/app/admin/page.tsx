"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, Globe2, LogOut, MapPin, Package, Plus, Save, ShoppingBag } from "lucide-react";
import { rupiah } from "@/lib/format";

type Destination = { id: string; code: string; name: string; emoji: string; isActive: boolean };
type Plan = { id: string; name: string; description: string; quotaGb: number; validityDays: number; priceIdr: number; isActive: boolean; destinationId: string; destination: Destination };
type Order = { id: string; publicCode: string; buyerEmail: string; planName: string; destinationName: string; quotaGb: number; validityDays: number; amountIdr: number; paymentStatus: string; createdAt: string; fulfillment: { status: string; emailMessageId: string|null; error: string|null }|null };
type Admin = { id: string; email: string };
type Form = { destinationId: string; name: string; description: string; quotaGb: number; validityDays: number; priceIdr: number; isActive: boolean };
const blank: Form = { destinationId: "", name: "", description: "", quotaGb: 5, validityDays: 7, priceIdr: 49000, isActive: true };
type DestinationForm = Omit<Destination, "id">;
const blankDestination: DestinationForm = { code: "", name: "", emoji: "🌏", isActive: true };

export default function AdminPage() {
  const [admin, setAdmin] = useState<Admin|null>(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"overview"|"destinations"|"plans"|"orders">("overview");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [editing, setEditing] = useState<string|null>(null);
  const [form, setForm] = useState<Form>(blank);
  const [editingDestination, setEditingDestination] = useState<string|null>(null);
  const [destinationForm, setDestinationForm] = useState<DestinationForm>(blankDestination);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadData() {
    const [p, o, d] = await Promise.all([
      fetch("/api/admin/plans").then(r => r.json()),
      fetch("/api/admin/orders").then(r => r.json()),
      fetch("/api/admin/destinations").then(r => r.json()),
    ]);
    setPlans(Array.isArray(p) ? p : []); setOrders(Array.isArray(o) ? o : []); setDestinations(Array.isArray(d) ? d : []);
  }
  useEffect(() => {
    fetch("/api/admin/me").then(r => r.ok ? r.json() : null).then(user => { setAdmin(user); if (user) loadData(); }).finally(() => setChecking(false));
  }, []);

  async function login(event: React.FormEvent) {
    event.preventDefault(); setError("");
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
    const data = await response.json();
    if (!response.ok) { setError(data.message || "Login gagal."); return; }
    setAdmin(data); setPassword(""); await loadData();
  }
  async function logout() { await fetch("/api/admin/logout", { method: "POST" }); setAdmin(null); }
  function startEdit(plan?: Plan) {
    setEditing(plan?.id ?? "new"); setMessage("");
    setForm(plan ? { destinationId: plan.destinationId, name: plan.name, description: plan.description, quotaGb: plan.quotaGb, validityDays: plan.validityDays, priceIdr: plan.priceIdr, isActive: plan.isActive } : { ...blank, destinationId: destinations.find(d => d.isActive)?.id ?? "" });
    setTab("plans");
  }
  async function savePlan(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setError(""); setMessage("");
    const url = editing === "new" ? "/api/admin/plans" : `/api/admin/plans/${editing}`;
    try {
      const response = await fetch(url, { method: editing === "new" ? "POST" : "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Gagal menyimpan paket.");
      setEditing(null); setMessage("Paket berhasil disimpan. Perubahan langsung terlihat di website."); await loadData();
    } catch (err) { setError(err instanceof Error ? err.message : "Gagal menyimpan paket."); }
    finally { setSaving(false); }
  }
  async function togglePlan(plan: Plan) {
    const response = await fetch(`/api/admin/plans/${plan.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ destinationId: plan.destinationId, name: plan.name, description: plan.description, quotaGb: plan.quotaGb, validityDays: plan.validityDays, priceIdr: plan.priceIdr, isActive: !plan.isActive }) });
    if (response.ok) await loadData(); else setError("Gagal mengubah status paket.");
  }
  function startDestinationEdit(destination?: Destination) {
    setEditingDestination(destination?.id ?? "new"); setMessage("");
    setDestinationForm(destination ? { code: destination.code, name: destination.name, emoji: destination.emoji, isActive: destination.isActive } : blankDestination);
    setTab("destinations");
  }
  async function saveDestination(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setError(""); setMessage("");
    const url = editingDestination === "new" ? "/api/admin/destinations" : `/api/admin/destinations/${editingDestination}`;
    try {
      const response = await fetch(url, { method: editingDestination === "new" ? "POST" : "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(destinationForm) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Gagal menyimpan destinasi.");
      setEditingDestination(null); setMessage("Destinasi berhasil disimpan."); await loadData();
    } catch (err) { setError(err instanceof Error ? err.message : "Gagal menyimpan destinasi."); }
    finally { setSaving(false); }
  }
  async function toggleDestination(destination: Destination) {
    const response = await fetch(`/api/admin/destinations/${destination.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ code: destination.code, name: destination.name, emoji: destination.emoji, isActive: !destination.isActive }) });
    if (response.ok) await loadData(); else setError("Gagal mengubah status destinasi.");
  }

  if (checking) return <div className="login-page"><div className="login-card">Memuat CMS...</div></div>;
  if (!admin) return <div className="login-page"><form className="login-card" onSubmit={login}><Link href="/" className="brand"><span className="brand-icon"><Globe2 size={23}/></span><span>trip<span>connect</span><i>.</i></span></Link><h1>Masuk ke CMS</h1><p>Kelola paket eSIM dan pantau pesanan dari satu tempat.</p><div className="form-group"><label>Email admin</label><input className="form-input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com"/></div><div className="form-group"><label>Password</label><input className="form-input" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password admin"/></div>{error && <div className="error-box">{error}</div>}<button className="button button-blue full-button">Masuk CMS</button><p className="form-note">Akun admin dibuat melalui perintah seed sesuai README.</p></form></div>;

  const paid = orders.filter(o => o.paymentStatus === "PAID").length;
  return <div className="admin-shell"><aside className="admin-sidebar"><Link href="/" className="brand"><span className="brand-icon"><Globe2 size={21}/></span><span>trip<span>connect</span><i>.</i></span></Link><nav className="admin-nav"><button className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}><BarChart3 size={17}/> Ringkasan</button><button className={tab === "destinations" ? "active" : ""} onClick={() => setTab("destinations")}><MapPin size={17}/> Destinasi</button><button className={tab === "plans" ? "active" : ""} onClick={() => setTab("plans")}><Package size={17}/> Kelola paket</button><button className={tab === "orders" ? "active" : ""} onClick={() => { setTab("orders"); loadData(); }}><ShoppingBag size={17}/> Pesanan</button><Link href="/"><ArrowLeft size={17}/> Lihat website</Link><button onClick={logout}><LogOut size={17}/> Keluar</button></nav></aside><main className="admin-main"><div className="admin-top"><div><h1>{tab === "overview" ? "Ringkasan" : tab === "destinations" ? "Kelola Destinasi" : tab === "plans" ? "Kelola Paket" : "Daftar Pesanan"}</h1><p>Dashboard operasional travel eSIM demo</p></div><span className="admin-user">{admin.email}</span></div>{error && <div className="error-box">{error}</div>}{message && <div className="success-box">{message}</div>}
    {tab === "overview" && <><div className="admin-grid"><div className="metric"><span>Total paket</span><strong>{plans.length}</strong></div><div className="metric"><span>Total pesanan</span><strong>{orders.length}</strong></div><div className="metric"><span>Pembayaran berhasil</span><strong>{paid}</strong></div></div><div className="admin-section"><div className="admin-section-header"><h2>Pesanan terbaru</h2><button className="small-button" onClick={() => setTab("orders")}>Lihat semua</button></div><OrderTable orders={orders.slice(0,5)}/></div></>}
    {tab === "destinations" && <>
      <div className="admin-section">
        <div className="admin-section-header"><h2>Destinasi</h2><button className="button button-blue" onClick={() => startDestinationEdit()}><Plus size={17}/> Tambah destinasi</button></div>
        <div className="table-wrap"><table className="data-table"><thead><tr><th>Kode</th><th>Destinasi</th><th>Status</th><th>Aksi</th></tr></thead><tbody>
          {destinations.map(destination => <tr key={destination.id}><td>{destination.code}</td><td>{destination.emoji} {destination.name}</td><td><span className={`status-badge ${destination.isActive ? "status-PAID" : "status-FAILED"}`}>{destination.isActive ? "Aktif" : "Nonaktif"}</span></td><td><button className="small-button" onClick={() => startDestinationEdit(destination)}>Ubah</button> <button className="small-button" onClick={() => toggleDestination(destination)}>{destination.isActive ? "Nonaktifkan" : "Aktifkan"}</button></td></tr>)}
        </tbody></table></div>
      </div>
      {editingDestination && <form className="admin-section" onSubmit={saveDestination}><div className="admin-section-header"><h2>{editingDestination === "new" ? "Tambah destinasi" : "Ubah destinasi"}</h2><button type="button" className="small-button" onClick={() => setEditingDestination(null)}>Tutup</button></div><div className="admin-form">
        <div className="form-group"><label>Kode</label><input className="form-input" required maxLength={12} value={destinationForm.code} onChange={e => setDestinationForm({...destinationForm,code:e.target.value.toUpperCase()})}/></div>
        <div className="form-group"><label>Nama</label><input className="form-input" required value={destinationForm.name} onChange={e => setDestinationForm({...destinationForm,name:e.target.value})}/></div>
        <div className="form-group"><label>Emoji bendera</label><input className="form-input" required value={destinationForm.emoji} onChange={e => setDestinationForm({...destinationForm,emoji:e.target.value})}/></div>
        <div className="form-group"><label>Status</label><select className="form-input" value={destinationForm.isActive ? "active" : "inactive"} onChange={e => setDestinationForm({...destinationForm,isActive:e.target.value === "active"})}><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select></div>
        <button className="button button-blue" disabled={saving}><Save size={17}/>{saving ? "Menyimpan..." : "Simpan destinasi"}</button>
      </div></form>}
    </>}    {tab === "plans" && <><div className="admin-section"><div className="admin-section-header"><h2>Paket eSIM</h2><button className="button button-blue" onClick={() => startEdit()}><Plus size={17}/> Tambah paket</button></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Paket</th><th>Destinasi</th><th>Data / Masa aktif</th><th>Harga</th><th>Status</th><th>Aksi</th></tr></thead><tbody>{plans.map(plan => <tr key={plan.id}><td><b>{plan.name}</b></td><td>{plan.destination.emoji} {plan.destination.name}</td><td>{plan.quotaGb} GB / {plan.validityDays} hari</td><td>{rupiah(plan.priceIdr)}</td><td><span className={`status-badge ${plan.isActive ? "status-PAID" : "status-FAILED"}`}>{plan.isActive ? "Aktif" : "Nonaktif"}</span></td><td><button className="small-button" onClick={() => startEdit(plan)}>Ubah</button> <button className="small-button" onClick={() => togglePlan(plan)}>{plan.isActive ? "Nonaktifkan" : "Aktifkan"}</button></td></tr>)}</tbody></table></div></div>{editing && <form className="admin-section" onSubmit={savePlan}><div className="admin-section-header"><h2>{editing === "new" ? "Tambah paket" : "Ubah paket"}</h2><button type="button" className="small-button" onClick={() => setEditing(null)}>Tutup</button></div><div className="admin-form"><div className="form-group"><label>Destinasi</label><select className="form-input" value={form.destinationId} onChange={e => setForm({...form,destinationId:e.target.value})}>{destinations.map(d => <option key={d.id} value={d.id}>{d.emoji} {d.name}</option>)}</select></div><div className="form-group"><label>Nama paket</label><input className="form-input" required value={form.name} onChange={e => setForm({...form,name:e.target.value})}/></div><div className="form-group span-2"><label>Deskripsi</label><textarea className="form-input form-textarea" required value={form.description} onChange={e => setForm({...form,description:e.target.value})}/></div><div className="form-group"><label>Kuota (GB)</label><input className="form-input" type="number" min="1" required value={form.quotaGb} onChange={e => setForm({...form,quotaGb:Number(e.target.value)})}/></div><div className="form-group"><label>Masa aktif (hari)</label><input className="form-input" type="number" min="1" required value={form.validityDays} onChange={e => setForm({...form,validityDays:Number(e.target.value)})}/></div><div className="form-group"><label>Harga (IDR)</label><input className="form-input" type="number" min="1000" required value={form.priceIdr} onChange={e => setForm({...form,priceIdr:Number(e.target.value)})}/></div><div className="form-group"><label>Status</label><select className="form-input" value={form.isActive ? "active" : "inactive"} onChange={e => setForm({...form,isActive:e.target.value === "active"})}><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select></div><button className="button button-blue" disabled={saving}><Save size={17}/>{saving ? "Menyimpan..." : "Simpan paket"}</button></div></form>}</>}
    {tab === "orders" && <div className="admin-section"><div className="admin-section-header"><h2>Semua pesanan</h2><button className="small-button" onClick={loadData}>Perbarui</button></div><OrderTable orders={orders}/></div>}
  </main></div>;
}

function OrderTable({ orders }: { orders: Order[] }) {
  const [selectedId, setSelectedId] = useState<string|null>(null);
  const selected = orders.find(order => order.id === selectedId);
  return <>
    <div className="table-wrap"><table className="data-table">
      <thead><tr><th>Pesanan</th><th>Pembeli</th><th>Paket</th><th>Total</th><th>Pembayaran</th><th>Email</th><th>Waktu</th><th>Aksi</th></tr></thead>
      <tbody>{orders.length ? orders.map(order => <tr key={order.id}>
        <td><b>{order.publicCode.slice(0,10).toUpperCase()}</b></td>
        <td>{order.buyerEmail}</td>
        <td>{order.planName}<br/><small>{order.destinationName}</small></td>
        <td>{rupiah(order.amountIdr)}</td>
        <td><span className={`status-badge status-${order.paymentStatus}`}>{order.paymentStatus}</span></td>
        <td>{order.fulfillment ? <span className={`status-badge status-${order.fulfillment.status}`}>{order.fulfillment.status}</span> : "—"}</td>
        <td>{new Date(order.createdAt).toLocaleString("id-ID")}</td>
        <td><button className="small-button" onClick={() => setSelectedId(selectedId === order.id ? null : order.id)}>{selectedId === order.id ? "Tutup" : "Detail"}</button></td>
      </tr>) : <tr><td colSpan={8} style={{textAlign:"center",padding:30}}>Belum ada pesanan.</td></tr>}</tbody>
    </table></div>
    {selected && <div className="order-detail">
      <h3>Detail pesanan {selected.publicCode.toUpperCase()}</h3>
      <dl>
        <div><dt>Pembeli</dt><dd>{selected.buyerEmail}</dd></div>
        <div><dt>Destinasi dan paket</dt><dd>{selected.destinationName} · {selected.planName}</dd></div>
        <div><dt>Kuota dan masa aktif</dt><dd>{selected.quotaGb} GB · {selected.validityDays} hari</dd></div>
        <div><dt>Total</dt><dd>{rupiah(selected.amountIdr)}</dd></div>
        <div><dt>Pembayaran</dt><dd>{selected.paymentStatus}</dd></div>
        <div><dt>Email</dt><dd>{selected.fulfillment?.status ?? "Belum diproses"}</dd></div>
        {selected.fulfillment?.emailMessageId && <div><dt>SMTP Message ID</dt><dd>{selected.fulfillment.emailMessageId}</dd></div>}
        {selected.fulfillment?.error && <div><dt>Kendala email</dt><dd>{selected.fulfillment.error}</dd></div>}
      </dl>
    </div>}
  </>;
}