import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Package, Search, ShoppingBag } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { formatRupiah, formatTanggal } from '../services/api';
import StatusBadge from '../components/StatusBadge';

const tabs = [{ key: 'all', label: 'Semua' }, { key: 'active', label: 'Aktif' }, { key: 'done', label: 'Selesai' }, { key: 'cancelled', label: 'Dibatalkan' }];
export default function MyOrders() {
  const [orders, setOrders] = useState([]); const [filter, setFilter] = useState('all'); const [query, setQuery] = useState(''); const [page, setPage] = useState(1); const [error, setError] = useState('');
  const [params] = useSearchParams();
  useEffect(() => { if (params.get('filter') === 'active') setFilter('active'); api.get('/orders/my-orders').then(({ data }) => setOrders(data)).catch((requestError) => setError(requestError.response?.data?.message || 'Riwayat pesanan tidak dapat dimuat.')); }, []);
  const filtered = useMemo(() => orders.filter((order) => {
    const matchesTab = filter === 'all' || (filter === 'active' && !['delivered', 'cancelled'].includes(order.status)) || (filter === 'done' && order.status === 'delivered') || (filter === 'cancelled' && order.status === 'cancelled');
    return matchesTab && `${order.orderCode} ${order.package?.name || ''}`.toLowerCase().includes(query.toLowerCase());
  }), [orders, filter, query]);
  const pageSize = 6; const pages = Math.max(1, Math.ceil(filtered.length / pageSize)); const shown = filtered.slice((page - 1) * pageSize, page * pageSize);
  return <div className="page-enter my-orders-page"><div className="page-heading"><div><div className="eyebrow">PERJALANAN CUCIAN ANDA</div><h1>Pesanan saya</h1><p>Semua order dan pembaruannya tersimpan di sini.</p></div><Link to="/create-order" className="button button-primary"><ShoppingBag size={16} /> Pesan laundry</Link></div>
    {error && <div className="alert-error">{error}</div>}
    <div className="orders-toolbar"><div className="order-tabs">{tabs.map((tab) => <button key={tab.key} className={filter === tab.key ? 'selected' : ''} onClick={() => { setFilter(tab.key); setPage(1); }}>{tab.label}<span>{orders.filter((order) => tab.key === 'all' || (tab.key === 'active' && !['delivered', 'cancelled'].includes(order.status)) || (tab.key === 'done' && order.status === 'delivered') || (tab.key === 'cancelled' && order.status === 'cancelled')).length}</span></button>)}</div><label className="orders-search"><Search size={16} /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Cari kode pesanan" /></label></div>
    <div className="my-order-list">{shown.map((order) => <article className="my-order-card" key={order.id}><div className="my-order-main"><span className="my-order-package"><Package size={18} /></span><div><div className="my-order-code">{order.orderCode}<span>·</span>{formatTanggal(order.createdAt)}</div><h2>{order.package?.name}</h2><p>{Number(order.weight).toLocaleString('id-ID')} {order.package?.unit} · {order.pickupMethod === 'pickup' ? 'Dijemput kurir' : 'Antar ke outlet'}</p></div></div><div className="my-order-price"><StatusBadge status={order.status} /><strong>{formatRupiah(order.finalTotal)}</strong><small>{order.paymentStatus === 'paid' ? 'Lunas' : 'Belum dibayar'}</small></div><div className="my-order-actions">{order.paymentStatus !== 'paid' && order.status !== 'cancelled' && <Link to={`/payment/${order.id}`} className="button button-primary">Bayar</Link>}<Link to={`/my-orders/${order.id}`} className="button button-quiet">Detail <ArrowRight size={14} /></Link></div></article>)}
      {!shown.length && <div className="customer-empty orders-empty"><Package size={25} /><strong>{query ? 'Pesanan tidak ditemukan' : 'Belum ada pesanan di bagian ini'}</strong><span>{query ? 'Coba cari dengan kode pesanan yang berbeda.' : 'Pilih layanan dan biarkan kami merawat pakaian Anda.'}</span>{filter === 'all' && <Link to="/create-order" className="button button-primary">Buat pesanan pertama</Link>}</div>}
    </div>
    {filtered.length > pageSize && <div className="pagination"><span>Menampilkan {Math.min(filtered.length, (page - 1) * pageSize + 1)}–{Math.min(filtered.length, page * pageSize)} dari {filtered.length}</span><div><button aria-label="Halaman sebelumnya" disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronLeft size={16} /></button><strong>{page} / {pages}</strong><button aria-label="Halaman berikutnya" disabled={page === pages} onClick={() => setPage(page + 1)}><ChevronRight size={16} /></button></div></div>}
  </div>;
}