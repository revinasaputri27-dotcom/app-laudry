import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, Edit3, PackagePlus, Plus, Trash2 } from 'lucide-react';
import api, { formatRupiah } from '../services/api';
import Modal from '../components/Modal';
import { Link } from 'react-router-dom';

const initialForm = { name: '', pricePerKg: '', estimasiHari: '', estimasiJam: '', minWeight: 1, description: '', category: 'cuci', unit: 'kg', icon: 'WashingMachine', isActive: true };
const categories = [{ key: 'semua', label: 'Semua layanan' }, { key: 'cuci', label: 'Cuci' }, { key: 'setrika', label: 'Setrika' }, { key: 'express', label: 'Express' }, { key: 'premium', label: 'Premium' }, { key: 'khusus', label: 'Khusus' }];
export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [category, setCategory] = useState('semua');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const admin = JSON.parse(localStorage.getItem('revina_user') || '{}').role === 'admin';
  const customer = JSON.parse(localStorage.getItem('revina_user') || '{}').role === 'customer';
  const filtered = category === 'semua' ? packages : packages.filter((item) => item.category === category);
  const load = useCallback(() => api.get('/packages').then(({ data }) => setPackages(data)).catch((err) => setError(err.response?.data?.message || 'Paket tidak dapat dimuat.')), []);
  useEffect(() => { load(); }, [load]);
  const startEdit = (item = null) => { setEditing(item || false); setForm(item ? { ...initialForm, ...item } : initialForm); setError(''); };
  const save = async (event) => {
    event.preventDefault(); setError('');
    try {
      if (editing) await api.put(`/packages/${editing.id}`, form); else await api.post('/packages', form);
      setEditing(null); setNotice(editing ? 'Paket berhasil diperbarui.' : 'Paket berhasil ditambahkan.'); load();
    } catch (err) { setError(err.response?.data?.message || 'Paket tidak dapat disimpan.'); }
  };
  const remove = async (item) => {
    if (!window.confirm(`Hapus paket ${item.name}?`)) return;
    try { await api.delete(`/packages/${item.id}`); setNotice('Paket berhasil dihapus.'); load(); }
    catch (err) { setError(err.response?.data?.message || 'Paket tidak dapat dihapus.'); }
  };
  return <div className="page-enter">
    <div className="page-heading"><div><div className="eyebrow">KATALOG LAYANAN</div><h1>{customer ? 'Temukan perawatan yang pas.' : 'Paket laundry'}</h1><p>{customer ? 'Pilih layanan sesuai kebutuhan pakaian Anda.' : 'Kelola pilihan perawatan untuk setiap kebutuhan.'}</p></div>{admin && <button className="button button-primary" onClick={() => startEdit()}><Plus size={17} /> Tambah paket</button>}</div>
    {error && <div className="alert-error">{error}</div>}{notice && <div className="alert-success">{notice}</div>}
    <div className="category-filter">{categories.map((item) => <button type="button" key={item.key} className={category === item.key ? 'selected' : ''} onClick={() => setCategory(item.key)}>{item.label}</button>)}</div>
    <div className="package-grid">{filtered.map((item, index) => <article className="package-card" key={item.id} style={{ animationDelay: `${index * 45}ms` }}>
      <div className="package-card-top"><span className={`package-stamp stamp-${index % 4}`}><PackagePlus size={19} /></span><span className="package-code">{item.category}</span>{admin && <div className="row-actions"><button className="icon-button" onClick={() => startEdit(item)} title="Ubah paket" aria-label="Ubah paket"><Edit3 size={16} /></button><button className="icon-button danger-icon" onClick={() => remove(item)} title="Hapus paket" aria-label="Hapus paket"><Trash2 size={16} /></button></div>}</div>
      <h2>{item.name}</h2><p>{item.description}</p><div className="package-price">{formatRupiah(item.pricePerKg)}<span> / {item.unit}</span></div><div className="package-estimate"><span>WAKTU PENGERJAAN</span><strong>{item.estimasiJam ? `${item.estimasiJam} jam` : `${item.estimasiHari} hari`}</strong></div><div className="package-minimum">Minimum pemesanan <strong>{item.minWeight} {item.unit}</strong></div>
      {customer && <Link to={`/create-order?packageId=${item.id}`} className="button button-primary package-choose">Pilih layanan <ArrowRight size={14} /></Link>}
    </article>)}{!packages.length && <div className="empty-state">Belum ada paket layanan.</div>}</div>
    {editing !== null && <Modal title={editing ? 'Ubah paket' : 'Tambah paket'} onClose={() => setEditing(null)}><form className="form-stack modal-form" onSubmit={save}>
      <label className="field-label">Nama paket<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
      <div className="form-grid"><label className="field-label">Harga per unit<input type="number" min="1" required value={form.pricePerKg} onChange={(e) => setForm({ ...form, pricePerKg: e.target.value })} /></label><label className="field-label">Satuan<select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}><option value="kg">Kilogram</option><option value="pasang">Pasang</option><option value="m²">Meter persegi</option></select></label></div>
      <div className="form-grid"><label className="field-label">Estimasi hari<input type="number" min="1" required value={form.estimasiHari} onChange={(e) => setForm({ ...form, estimasiHari: e.target.value })} /></label><label className="field-label">Minimal jumlah<input type="number" min="1" step="0.1" required value={form.minWeight} onChange={(e) => setForm({ ...form, minWeight: e.target.value })} /></label></div>
      <label className="field-label">Kategori<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option value="cuci">Cuci</option><option value="setrika">Setrika</option><option value="express">Express</option><option value="premium">Premium</option><option value="khusus">Khusus</option></select></label>
      <label className="field-label">Deskripsi<textarea rows="3" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
      {error && <div className="alert-error">{error}</div>}<div className="modal-actions"><button type="button" className="button button-quiet" onClick={() => setEditing(null)}>Batal</button><button className="button button-primary">Simpan paket</button></div>
    </form></Modal>}
  </div>;
}