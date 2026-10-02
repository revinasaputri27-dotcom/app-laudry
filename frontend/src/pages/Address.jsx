import { useCallback, useEffect, useState } from 'react';
import { Check, Edit3, MapPin, Plus, Star, Trash2 } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';

const blank = { label: 'Rumah', address: '', city: '', postalCode: '', notes: '', isDefault: false };
export default function Address() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const returnTo = params.get('return');
  const [rows, setRows] = useState([]); const [open, setOpen] = useState(params.get('new') === '1'); const [editing, setEditing] = useState(null); const [form, setForm] = useState(blank); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const load = useCallback(() => api.get('/addresses').then(({ data }) => setRows(data)).catch((requestError) => setError(requestError.response?.data?.message || 'Alamat tidak dapat dimuat.')), []);
  useEffect(() => { load(); }, [load]);
  const start = (row = null) => { setEditing(row); setForm(row ? { label: row.label, address: row.address, city: row.city, postalCode: row.postalCode, notes: row.notes || '', isDefault: row.isDefault } : { ...blank, isDefault: rows.length === 0 }); setError(''); setOpen(true); };
  const close = () => { setOpen(false); setEditing(null); };
  const save = async (event) => {
    event.preventDefault(); setError('');
    try {
      if (editing) await api.put(`/addresses/${editing.id}`, form); else await api.post('/addresses', form);
      close(); setNotice('Alamat berhasil disimpan.'); await load();
      if (!editing && returnTo) navigate(returnTo);
    } catch (requestError) { setError(requestError.response?.data?.message || 'Alamat belum dapat disimpan.'); }
  };
  const setDefault = async (row) => { try { await api.patch(`/addresses/${row.id}/default`); setNotice('Alamat utama diperbarui.'); load(); } catch (requestError) { setError(requestError.response?.data?.message || 'Alamat utama tidak dapat diperbarui.'); } };
  const remove = async (row) => { if (!window.confirm(`Hapus alamat ${row.label}?`)) return; try { await api.delete(`/addresses/${row.id}`); setNotice('Alamat berhasil dihapus.'); load(); } catch (requestError) { setError(requestError.response?.data?.message || 'Alamat tidak dapat dihapus.'); } };
  return <div className="page-enter address-page">
    <div className="page-heading"><div><div className="eyebrow">ALAMAT PENJEMPUTAN</div><h1>Alamat tersimpan</h1><p>Pilih alamat utama untuk mempercepat pesanan berikutnya.</p></div><button className="button button-primary" onClick={() => start()}><Plus size={16} /> Tambah alamat</button></div>
    {error && <div className="alert-error">{error}</div>}{notice && <div className="alert-success">{notice}</div>}
    <div className="saved-address-grid">{rows.map((row) => <article className={`saved-address-card${row.isDefault ? ' primary-address' : ''}`} key={row.id}><div className="saved-address-top"><span className="address-card-icon"><MapPin size={18} /></span>{row.isDefault && <span className="default-label"><Star size={12} fill="currentColor" /> Alamat utama</span>}</div><h2>{row.label}</h2><p>{row.address}</p><div className="address-city">{row.city} · {row.postalCode}</div>{row.notes && <small className="address-notes">Patokan: {row.notes}</small>}<div className="saved-address-actions">{!row.isDefault && <button type="button" className="address-text-button" onClick={() => setDefault(row)}>Jadikan utama</button>}<div className="row-actions"><button className="icon-button" onClick={() => start(row)} title="Ubah alamat" aria-label="Ubah alamat"><Edit3 size={16} /></button><button className="icon-button danger-icon" onClick={() => remove(row)} title="Hapus alamat" aria-label="Hapus alamat"><Trash2 size={16} /></button></div></div></article>)}
      {!rows.length && <div className="address-empty"><MapPin size={26} /><strong>Belum ada alamat tersimpan</strong><span>Tambahkan alamat agar kami tahu ke mana pesanan perlu dijemput.</span><button className="button button-primary" onClick={() => start()}><Plus size={15} /> Tambah alamat pertama</button></div>}
    </div>
    {returnTo && <Link to={returnTo} className="back-link address-return"><Check size={14} /> Kembali ke pemesanan</Link>}
    {open && <Modal title={editing ? 'Ubah alamat' : 'Tambah alamat baru'} onClose={close}><form className="form-stack modal-form" onSubmit={save}>
      <label className="field-label">Label alamat<select value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value })}><option>Rumah</option><option>Kantor</option><option>Lainnya</option></select></label>
      <label className="field-label">Alamat lengkap<textarea rows="3" required value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} placeholder="Nama jalan, nomor, RT/RW, kelurahan" /></label>
      <div className="form-grid"><label className="field-label">Kota<input required value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} /></label><label className="field-label">Kode pos<input inputMode="numeric" required value={form.postalCode} onChange={(event) => setForm({ ...form, postalCode: event.target.value })} /></label></div>
      <label className="field-label">Patokan <span className="optional-note">OPSIONAL</span><input value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Contoh: pagar putih, dekat minimarket" /></label>
      <label className="checkbox-line"><input type="checkbox" checked={form.isDefault} onChange={(event) => setForm({ ...form, isDefault: event.target.checked })} /> Jadikan alamat utama</label>
      {error && <div className="alert-error">{error}</div>}<div className="modal-actions"><button type="button" className="button button-quiet" onClick={close}>Batal</button><button className="button button-primary">Simpan alamat</button></div>
    </form></Modal>}
  </div>;
}