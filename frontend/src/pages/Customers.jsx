import { useCallback, useEffect, useState } from 'react';
import { Edit3, Plus, Trash2, Users } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';

const empty = { name: '', phone: '', address: '' };
export default function Customers() {
  const [rows, setRows] = useState([]); const [editing, setEditing] = useState(null); const [form, setForm] = useState(empty); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const load = useCallback(() => api.get('/customers').then(({ data }) => setRows(data)).catch((err) => setError(err.response?.data?.message || 'Data pelanggan tidak dapat dimuat.')), []);
  useEffect(() => { load(); }, [load]);
  const open = (row = null) => { setEditing(row || false); setForm(row ? { name: row.name, phone: row.phone, address: row.address } : empty); setError(''); };
  const save = async (event) => { event.preventDefault(); setError(''); try { if (editing) await api.put(`/customers/${editing.id}`, form); else await api.post('/customers', form); setEditing(null); setNotice('Data pelanggan tersimpan.'); load(); } catch (err) { setError(err.response?.data?.message || 'Data tidak dapat disimpan.'); } };
  const remove = async (row) => { if (!window.confirm(`Hapus pelanggan ${row.name}?`)) return; try { await api.delete(`/customers/${row.id}`); setNotice('Pelanggan berhasil dihapus.'); load(); } catch (err) { setError(err.response?.data?.message || 'Pelanggan tidak dapat dihapus.'); } };
  return <div className="page-enter">
    <div className="page-heading"><div><div className="eyebrow">HUBUNGAN PELANGGAN</div><h1>Data pelanggan</h1><p>Informasi pelanggan dan alamat pengantaran.</p></div><button className="button button-primary" onClick={() => open()}><Plus size={17} /> Tambah pelanggan</button></div>
    {error && <div className="alert-error">{error}</div>}{notice && <div className="alert-success">{notice}</div>}
    <div className="panel data-panel"><div className="panel-heading"><div><span className="eyebrow">BUKU PELANGGAN</span><h2>{rows.length} pelanggan</h2></div><span className="panel-count"><Users size={15} /> TERDAFTAR</span></div>
      <div className="table-scroll"><table><thead><tr><th>ID</th><th>Nama</th><th>Telepon</th><th>Alamat</th><th>Aksi</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td className="id-cell">#{String(row.id).padStart(4, '0')}</td><td className="person-cell"><span className="person-avatar">{row.name.slice(0, 1).toUpperCase()}</span>{row.name}</td><td>{row.phone}</td><td className="address-cell">{row.address}</td><td><div className="row-actions"><button className="icon-button" onClick={() => open(row)} title="Ubah pelanggan" aria-label="Ubah pelanggan"><Edit3 size={16} /></button><button className="icon-button danger-icon" onClick={() => remove(row)} title="Hapus pelanggan" aria-label="Hapus pelanggan"><Trash2 size={16} /></button></div></td></tr>)}{!rows.length && <tr><td className="empty-cell" colSpan="5">Belum ada pelanggan. Tambahkan pelanggan pertama.</td></tr>}</tbody></table></div>
    </div>
    {editing !== null && <Modal title={editing ? 'Ubah pelanggan' : 'Tambah pelanggan'} onClose={() => setEditing(null)}><form className="form-stack modal-form" onSubmit={save}>
      <label className="field-label">Nama lengkap<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label className="field-label">Nomor telepon<input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label><label className="field-label">Alamat<textarea rows="3" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>
      {error && <div className="alert-error">{error}</div>}<div className="modal-actions"><button type="button" className="button button-quiet" onClick={() => setEditing(null)}>Batal</button><button className="button button-primary">Simpan pelanggan</button></div>
    </form></Modal>}
  </div>;
}