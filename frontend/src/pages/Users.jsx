import { useCallback, useEffect, useState } from 'react';
import { Edit3, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';

const blank = { name: '', email: '', password: '', role: 'kasir' };
export default function Users() {
  const [rows, setRows] = useState([]); const [editing, setEditing] = useState(null); const [form, setForm] = useState(blank); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const current = JSON.parse(localStorage.getItem('revina_user') || '{}');
  const load = useCallback(() => api.get('/users').then(({ data }) => setRows(data)).catch((err) => setError(err.response?.data?.message || 'Data pengguna tidak dapat dimuat.')), []);
  useEffect(() => { load(); }, [load]);
  const open = (row = null) => { setEditing(row || false); setForm(row ? { name: row.name, email: row.email, password: '', role: row.role } : blank); setError(''); };
  const save = async (event) => { event.preventDefault(); setError(''); const payload = { ...form }; if (!payload.password) delete payload.password; try { if (editing) await api.put(`/users/${editing.id}`, payload); else await api.post('/users', payload); setEditing(null); setNotice('Data pengguna berhasil disimpan.'); load(); } catch (err) { setError(err.response?.data?.message || 'Data pengguna tidak dapat disimpan.'); } };
  const remove = async (row) => { if (!window.confirm(`Hapus akun ${row.name}?`)) return; try { await api.delete(`/users/${row.id}`); setNotice('Akun berhasil dihapus.'); load(); } catch (err) { setError(err.response?.data?.message || 'Akun tidak dapat dihapus.'); } };
  return <div className="page-enter">
    <div className="page-heading"><div><div className="eyebrow">AKSES DAN PERAN</div><h1>Data pengguna</h1><p>Kelola akun yang dapat mengakses sistem.</p></div><button className="button button-primary" onClick={() => open()}><Plus size={17} /> Tambah pengguna</button></div>
    {error && <div className="alert-error">{error}</div>}{notice && <div className="alert-success">{notice}</div>}
    <div className="panel data-panel"><div className="panel-heading"><div><span className="eyebrow">AKUN SISTEM</span><h2>{rows.length} pengguna</h2></div><span className="panel-count"><ShieldCheck size={15} /> ADMINISTRASI</span></div>
      <div className="table-scroll"><table><thead><tr><th>ID</th><th>Nama</th><th>Email</th><th>Peran</th><th>Aksi</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td className="id-cell">#{String(row.id).padStart(4, '0')}</td><td className="person-cell"><span className="person-avatar">{row.name.slice(0, 1).toUpperCase()}</span>{row.name}</td><td>{row.email}</td><td><span className={`role-badge role-${row.role}`}>{row.role}</span></td><td><div className="row-actions"><button className="icon-button" onClick={() => open(row)} title="Ubah data dan atur ulang kata sandi" aria-label="Ubah pengguna"><Edit3 size={16} /></button>{row.id !== current.id && <button className="icon-button danger-icon" onClick={() => remove(row)} title="Hapus pengguna" aria-label="Hapus pengguna"><Trash2 size={16} /></button>}</div></td></tr>)}{!rows.length && <tr><td className="empty-cell" colSpan="5">Belum ada akun pengguna.</td></tr>}</tbody></table></div>
    </div>
    {editing !== null && <Modal title={editing ? 'Ubah pengguna' : 'Tambah pengguna'} onClose={() => setEditing(null)}><form className="form-stack modal-form" onSubmit={save}>
      <label className="field-label">Nama lengkap<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label className="field-label">Alamat email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
      <label className="field-label">{editing ? 'Kata sandi baru (opsional)' : 'Kata sandi'}<input type="password" minLength="8" required={!editing} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editing ? 'Kosongkan jika tidak diubah' : 'Minimal 8 karakter'} /></label>
      <label className="field-label">Peran<select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="admin">Admin</option><option value="kasir">Kasir</option><option value="customer">Customer</option></select></label>
      {error && <div className="alert-error">{error}</div>}<div className="modal-actions"><button type="button" className="button button-quiet" onClick={() => setEditing(null)}>Batal</button><button className="button button-primary">Simpan pengguna</button></div>
    </form></Modal>}
  </div>;
}