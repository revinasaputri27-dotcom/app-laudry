import { useEffect, useState } from 'react';
import { ArrowLeft, Search, Waves } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { formatRupiah } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Timeline from '../components/Timeline';

export default function TrackOrder() {
  const [params] = useSearchParams(); const { user } = useAuth();
  const [id, setId] = useState(params.get('code') || params.get('id') || ''); const [order, setOrder] = useState(null); const [myOrders, setMyOrders] = useState([]); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { if (user?.role === 'customer') api.get('/orders/my-orders').then(({ data }) => setMyOrders(data)).catch(() => {}); }, [user]);
  useEffect(() => { if (id) lookup(null, id); }, []);
  useEffect(() => {
    if (!id) return undefined;
    const timer = window.setInterval(() => api.get(`/orders/track/${encodeURIComponent(id.trim())}`).then(({ data }) => setOrder(data)).catch(() => {}), 30000);
    return () => window.clearInterval(timer);
  }, [id]);
  async function lookup(event, target = id) {
    event?.preventDefault(); if (!target.trim()) return;
    setBusy(true); setError(''); setOrder(null);
    try { const { data } = await api.get(`/orders/track/${encodeURIComponent(target.trim())}`); setOrder(data); }
    catch (err) { setError(err.response?.status === 404 ? 'Kode pesanan tidak ditemukan. Periksa kembali kode pada detail order.' : 'Pelacakan belum dapat dimuat. Coba beberapa saat lagi.'); }
    finally { setBusy(false); }
  }
  const due = order && new Date(new Date(order.createdAt).getTime() + Number(order.package?.estimasiHari || 0) * 86400000);
  return <main className="track-page">
    <header className="track-header"><Link to="/" className="auth-brand"><span className="brand-mark"><Waves size={21} /></span><span>revina<small>LAUNDRY STUDIO</small></span></Link><Link to={user ? '/dashboard' : '/login'} className="back-link"><ArrowLeft size={15} /> {user ? 'Kembali ke akun' : 'Masuk'}</Link></header>
    <section className="track-content"><div className="eyebrow">PEMBARUAN PESANAN</div><h1>Di mana cucian<br /><em>Anda sekarang?</em></h1><p>Masukkan kode order untuk melihat perjalanan pakaian Anda.</p>
      {myOrders.length > 0 && <label className="field-label track-select-label">Pilih pesanan Anda<select value={id} onChange={(event) => { setId(event.target.value); if (event.target.value) lookup(null, event.target.value); }}><option value="">Pilih kode pesanan</option>{myOrders.map((item) => <option value={item.orderCode} key={item.id}>{item.orderCode} · {item.package?.name}</option>)}</select></label>}
      <form className="track-search" onSubmit={(event) => lookup(event)}><Search size={19} /><input aria-label="Kode pesanan" value={id} onChange={(event) => setId(event.target.value)} placeholder="Contoh: LRV-20261001-001" /><button className="button button-primary" disabled={busy}>{busy ? 'Mencari...' : 'Lacak order'}</button></form>
      {error && <div className="alert-error track-alert">{error}</div>}
      {order && <article className="track-result page-enter"><div className="track-result-head"><div><span className="eyebrow">{order.orderCode}</span><h2>Perjalanan pesanan</h2></div><StatusBadge status={order.status} /></div>
        <Timeline status={order.status} history={order.statusHistory || []} />
        <div className="track-details"><div><span>PELANGGAN</span><strong>{order.customer?.name}</strong></div><div><span>LAYANAN</span><strong>{order.package?.name}</strong></div><div><span>BERAT</span><strong>{Number(order.weight).toLocaleString('id-ID')} {order.package?.unit}</strong></div><div><span>TOTAL</span><strong>{formatRupiah(order.finalTotal)}</strong></div><div><span>ESTIMASI SELESAI</span><strong>{due ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(due) : '—'}</strong></div><div><span>PEMBAYARAN</span><strong>{order.paymentStatus === 'paid' ? 'Sudah dibayar' : 'Belum dibayar'}</strong></div></div>
      </article>}
    </section><footer className="track-footer">LAUNDRY REVINA <span>·</span> Cucian bersih, hati tenang.</footer>
  </main>;
}