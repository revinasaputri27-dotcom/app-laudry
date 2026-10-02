import { useEffect, useState } from 'react';
import { ArrowRight, Clock3, Package, Plus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { formatRupiah, formatTanggal } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [packages, setPackages] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([api.get('/dashboard/customer-stats'), api.get('/dashboard/my-orders'), api.get('/packages')])
      .then(([summary, orders, catalog]) => { setStats(summary.data); setRecent(orders.data); setPackages(catalog.data.slice(0, 4)); })
      .catch((requestError) => setError(requestError.response?.data?.message || 'Ringkasan pesanan belum dapat dimuat.'));
  }, []);
  return <div className="customer-dashboard page-enter">
    <div className="customer-welcome"><div><span className="eyebrow">RUANG PELANGGAN</span><h1>Hai, {user?.name?.split(' ')[0]} <span>👋</span></h1><p>Hari yang baik dimulai dari hal-hal yang terasa lebih ringan.</p></div><Link to="/create-order" className="button button-primary"><Plus size={17} /> Pesan laundry sekarang</Link></div>
    {error && <div className="alert-error">{error}</div>}
    <section className="stats-grid customer-stats"><StatCard label="Total pesanan" value={stats?.totalPesanan ?? '—'} detail="Sepanjang waktu" icon={Package} tone="mint" /><StatCard label="Sedang diproses" value={stats?.sedangDiproses ?? '—'} detail="Pesanan yang masih aktif" icon={Clock3} tone="blue" /><StatCard label="Selesai" value={stats?.selesai ?? '—'} detail="Pakaian sudah kembali" icon={Sparkles} tone="yellow" /><StatCard label="Total belanja" value={stats ? formatRupiah(stats.totalBelanja) : '—'} detail="Pembayaran terverifikasi" icon={Package} tone="peach" /></section>
    {stats?.totalPesanan === 0 && <section className="customer-promo"><span className="promo-icon"><Sparkles size={22} /></span><div><span className="eyebrow">SAMBUTAN DARI REVINA</span><h2>Diskon 20% untuk pesanan pertama.</h2><p>Potongan diterapkan otomatis pada pesanan pertama Anda.</p></div><Link to="/create-order" className="text-link">Gunakan promonya <ArrowRight size={15} /></Link></section>}
    <section className="customer-section"><div className="section-heading compact-heading"><div><span className="eyebrow">DALAM PROSES</span><h2>Pesanan aktif</h2></div><Link to="/my-orders?filter=active" className="text-link">Lihat semua <ArrowRight size={15} /></Link></div><div className="active-order-grid">{(stats?.pesananAktif || []).slice(0, 3).map((order) => <article className="customer-order-card" key={order.id}><div className="order-card-heading"><span className="order-code">{order.orderCode}</span><StatusBadge status={order.status} /></div><h3>{order.package?.name}</h3><div className="order-card-meta"><span>{Number(order.weight).toLocaleString('id-ID')} {order.package?.unit}</span><strong>{formatRupiah(order.finalTotal)}</strong></div><div className="order-card-footer"><small>{formatTanggal(order.createdAt)}</small><Link to={`/my-orders/${order.id}`}>Detail <ArrowRight size={13} /></Link><Link to={`/track?code=${encodeURIComponent(order.orderCode)}`}>Lacak</Link></div></article>)}{stats && !stats.pesananAktif?.length && <div className="customer-empty"><Package size={22} /><strong>Belum ada pesanan aktif</strong><span>Pesanan Anda akan muncul di sini.</span><Link to="/create-order" className="text-link">Buat pesanan pertama <ArrowRight size={14} /></Link></div>}</div></section>
    <section className="customer-section recent-orders-section"><div className="section-heading compact-heading"><div><span className="eyebrow">RIWAYAT TERBARU</span><h2>Pesanan terbaru</h2></div><Link to="/my-orders" className="text-link">Semua pesanan <ArrowRight size={15} /></Link></div><div className="panel customer-recent-list">{recent.map((order) => <Link className="recent-order-row" to={`/my-orders/${order.id}`} key={order.id}><span className="recent-order-icon"><Package size={17} /></span><span className="recent-order-main"><strong>{order.package?.name}</strong><small>{order.orderCode} · {formatTanggal(order.createdAt)}</small></span><span className="recent-order-total">{formatRupiah(order.finalTotal)}</span><StatusBadge status={order.status} /><ArrowRight size={15} /></Link>)}{!recent.length && <div className="customer-empty">Belum ada riwayat pesanan.</div>}</div></section>
    <section className="customer-section"><div className="section-heading compact-heading"><div><span className="eyebrow">PILIHAN UNTUK ANDA</span><h2>Paket populer</h2></div><Link to="/packages" className="text-link">Lihat katalog <ArrowRight size={15} /></Link></div><div className="dashboard-package-grid">{packages.map((item) => <Link to={`/create-order?packageId=${item.id}`} className="dashboard-package" key={item.id}><span className="package-tiny-icon"><Package size={17} /></span><span><strong>{item.name}</strong><small>{item.estimasiJam ? `${item.estimasiJam} jam` : `${item.estimasiHari} hari`} · {formatRupiah(item.pricePerKg)}/{item.unit}</small></span><ArrowRight size={15} /></Link>)}</div></section>
  </div>;
}