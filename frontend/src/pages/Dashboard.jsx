import { useEffect, useState } from 'react';
import { ArrowRight, CircleDollarSign, ClipboardList, Package, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { formatRupiah, formatTanggal } from '../services/api';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import CustomerDashboard from './CustomerDashboard';

const statusNames = { pending: 'Menunggu konfirmasi', processing: 'Diproses', confirmed: 'Dikonfirmasi', picked_up: 'Dijemput kurir', washing: 'Dicuci', ironing: 'Disetrika', ready: 'Siap diambil', delivered: 'Selesai', cancelled: 'Dibatalkan' };

function StaffDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/dashboard/stats').then(({ data }) => setStats(data)).catch((err) => setError(err.response?.data?.message || 'Ringkasan belum dapat dimuat.')); }, []);
  return (
    <div className="page-enter">
      <div className="page-heading"><div><div className="eyebrow">RINGKASAN HARI INI</div><h1>Selamat bekerja.</h1><p>Pantau aktivitas Laundry Revina dalam satu pandangan.</p></div><div className="date-stamp">{new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}</div></div>
      {error && <div className="alert-error">{error}</div>}
      <section className="stats-grid">
        <StatCard label="Total order" value={stats?.totalOrder ?? '—'} detail="Seluruh transaksi tercatat" icon={ClipboardList} tone="mint" />
        <StatCard label="Pelanggan" value={stats?.totalPelanggan ?? '—'} detail="Pelanggan terdaftar" icon={Users} tone="peach" />
        <StatCard label="Paket layanan" value={stats?.totalPaket ?? '—'} detail="Pilihan layanan aktif" icon={Package} tone="blue" />
        <StatCard label="Pendapatan selesai" value={stats ? formatRupiah(stats.totalPendapatan) : '—'} detail="Dari order yang selesai" icon={CircleDollarSign} tone="yellow" />
      </section>
      <section className="dashboard-lower">
        <div className="panel recent-panel">
          <div className="panel-heading"><div><span className="eyebrow">AKTIVITAS TERBARU</span><h2>Order terbaru</h2></div><Link to="/orders" className="text-link">Semua order <ArrowRight size={15} /></Link></div>
          <div className="table-scroll"><table><thead><tr><th>ID</th><th>Pelanggan</th><th>Paket</th><th>Berat</th><th>Total</th><th>Status</th></tr></thead><tbody>
            {(stats?.orderTerbaru || []).map((order) => <tr key={order.id}><td className="id-cell">#{String(order.id).padStart(4, '0')}</td><td>{order.customer?.name || '—'}</td><td>{order.package?.name || '—'}</td><td>{Number(order.weight).toLocaleString('id-ID')} kg</td><td>{formatRupiah(order.total)}</td><td><span className={`status-pill status-${order.status}`}>{statusNames[order.status] || order.status}</span></td></tr>)}
            {!stats?.orderTerbaru?.length && <tr><td colSpan="6" className="empty-cell">Belum ada transaksi tercatat.</td></tr>}
          </tbody></table></div>
        </div>
        <aside className="quick-panel"><span className="eyebrow">AKSES CEPAT</span><h2>Mulai pekerjaan</h2><p>Pilih bagian yang ingin Anda kelola.</p>
          <Link to="/orders" className="quick-link"><span className="quick-icon coral"><ClipboardList size={17} /></span><span>Buat order baru</span><ArrowRight size={16} /></Link>
          <Link to="/customers" className="quick-link"><span className="quick-icon green"><Users size={17} /></span><span>Data pelanggan</span><ArrowRight size={16} /></Link>
          <Link to="/packages" className="quick-link"><span className="quick-icon blue"><Package size={17} /></span><span>Lihat paket</span><ArrowRight size={16} /></Link>
          <Link to="/track" className="quick-link"><span className="quick-icon yellow"><ArrowRight size={17} /></span><span>Lacak pesanan</span><ArrowRight size={16} /></Link>
        </aside>
      </section>
      <footer className="page-footer">LAUNDRY REVINA <span>·</span> Bekerja dengan teliti, melayani dengan hati.</footer>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  return user?.role === 'customer' ? <CustomerDashboard /> : <StaffDashboard />;
}