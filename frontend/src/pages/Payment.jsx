import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, CreditCard, LockKeyhole, Upload } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { formatRupiah } from '../services/api';
import { QRCodeSVG } from 'qrcode.react';

const methods = [
  { key: 'transfer', title: 'Transfer bank', detail: 'Kirim bukti transfer untuk diverifikasi' },
  { key: 'qris', title: 'QRIS', detail: 'Pembayaran akan ditinjau oleh kasir' },
  { key: 'ewallet', title: 'E-wallet', detail: 'OVO, GoPay, atau DANA' },
  { key: 'cash', title: 'Tunai', detail: 'Bayar kepada kurir atau kasir outlet' }
];
export default function Payment() {
  const { id } = useParams(); const navigate = useNavigate();
  const [order, setOrder] = useState(null); const [method, setMethod] = useState('transfer'); const [proof, setProof] = useState(null); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [complete, setComplete] = useState(false);
  useEffect(() => { api.get(`/orders/my-orders/${id}`).then(({ data }) => setOrder(data)).catch((requestError) => setError(requestError.response?.data?.message || 'Pesanan tidak ditemukan.')); }, [id]);
  const paid = (order?.payments || []).filter((payment) => payment.status === 'paid').reduce((sum, payment) => sum + Number(payment.amount), 0);
  const remaining = Math.max(0, Number(order?.finalTotal || 0) - paid);
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    if (method === 'transfer' && !proof) { setError('Pilih gambar bukti transfer terlebih dahulu.'); setBusy(false); return; }
    try {
      const { data } = await api.post('/payments', { orderId: order.id, amount: remaining, method });
      if (method === 'transfer' && proof) { const body = new FormData(); body.append('proof', proof); await api.post(`/payments/${data.payment.id}/upload`, body); }
      setComplete(true);
    } catch (requestError) { setError(requestError.response?.data?.message || 'Pembayaran belum dapat dicatat.'); }
    finally { setBusy(false); }
  };
  if (!order && !error) return <div className="screen-loader"><span className="loader-mark">R</span><span>Menyiapkan pembayaran...</span></div>;
  if (complete) return <div className="payment-complete page-enter"><span className="payment-complete-icon"><CheckCircle2 size={34} /></span><span className="eyebrow">PEMBAYARAN TERCATAT</span><h1>Terima kasih.</h1><p>{method === 'transfer' ? 'Bukti transfer Anda sudah diterima dan menunggu verifikasi tim Revina.' : 'Pembayaran Anda tercatat dan menunggu konfirmasi tim Revina.'}</p><div><span>KODE PESANAN</span><strong>{order?.orderCode}</strong><span>JUMLAH</span><strong>{formatRupiah(remaining)}</strong></div><button className="button button-primary" onClick={() => navigate(`/my-orders/${order.id}`)}>Kembali ke detail pesanan</button></div>;
  return <div className="page-enter payment-page"><Link to={`/my-orders/${id}`} className="back-link"><ArrowLeft size={15} /> Kembali ke pesanan</Link>
    {error && <div className="alert-error payment-error">{error}</div>}
    <div className="payment-title"><span className="eyebrow">PEMBAYARAN AMAN</span><h1>Selesaikan pembayaran.</h1><p>Pesanan <strong>{order?.orderCode}</strong> · {order?.package?.name}</p></div>
    {order?.paymentStatus === 'paid' || remaining <= 0 ? <section className="payment-paid"><CheckCircle2 size={24} /><div><strong>Pesanan ini sudah lunas.</strong><span>Terima kasih telah menggunakan layanan Laundry Revina.</span></div><Link to={`/my-orders/${id}`} className="text-link">Lihat detail <ArrowLeft size={14} /></Link></section> : <div className="payment-layout"><form className="panel payment-form" onSubmit={submit}><div className="panel-heading"><div><span className="eyebrow">PILIH METODE</span><h2>Cara pembayaran</h2></div><LockKeyhole size={18} /></div><div className="payment-method-grid">{methods.map((item) => <button type="button" key={item.key} onClick={() => setMethod(item.key)} className={`payment-method-card${method === item.key ? ' selected' : ''}`}><span className="payment-method-radio" /><strong>{item.title}</strong><small>{item.detail}</small></button>)}</div>
      {method === 'transfer' && <label className="proof-upload"><Upload size={18} /><span><strong>{proof?.name || 'Unggah bukti transfer'}</strong><small>JPG, PNG, atau WEBP · Maks. 5 MB</small></span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setProof(event.target.files?.[0] || null)} /></label>}
      {method === 'qris' && <div className="qris-demo"><QRCodeSVG value={`REVINA-DEMO|${order?.orderCode}|${remaining}`} size={146} level="M" /><span><strong>QRIS demo · {order?.orderCode}</strong><small>Simulasi kode order, bukan kode merchant. Pembayaran dikonfirmasi oleh kasir.</small></span></div>}
      {method === 'ewallet' && <div className="payment-verification"><CreditCard size={16} /><span>Pilih OVO, GoPay, atau DANA saat menghubungi kasir. Status pesanan diperbarui setelah pembayaran diterima.</span></div>}
      {method === 'cash' && <div className="payment-verification"><CreditCard size={16} /><span>Bayar kepada kurir saat penjemputan atau kepada kasir di outlet.</span></div>}
      <div className="payment-verification"><CreditCard size={16} /><span>Semua pembayaran diperiksa oleh tim Laundry Revina. Status pesanan akan berubah menjadi dikonfirmasi setelah pembayaran diverifikasi.</span></div>
      <button className="button button-primary button-full" disabled={busy}>{busy ? 'Mengirim pembayaran...' : `Konfirmasi ${formatRupiah(remaining)}`}</button>
    </form><aside className="panel payment-summary-panel"><span className="eyebrow">RINCIAN TAGIHAN</span><h2>{order?.package?.name}</h2><div className="summary-line"><span>Berat pesanan</span><strong>{Number(order?.weight).toLocaleString('id-ID')} {order?.package?.unit}</strong></div><div className="summary-line"><span>Total pesanan</span><strong>{formatRupiah(order?.finalTotal)}</strong></div><div className="summary-line"><span>Sudah dibayar</span><strong>{formatRupiah(paid)}</strong></div><div className="summary-divider" /><div className="summary-total"><span>Sisa pembayaran</span><strong>{formatRupiah(remaining)}</strong></div><small className="summary-footnote">Kode: {order?.orderCode}</small></aside></div>}
  </div>;
}