import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Waves } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/dashboard" replace />;
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    if (form.password !== form.confirmPassword) { setError('Konfirmasi kata sandi tidak sama.'); setBusy(false); return; }
    try { const { confirmPassword, ...details } = form; await register(details); navigate('/login', { state: { registered: true } }); }
    catch (err) { setError(err.response?.data?.message || 'Pendaftaran gagal. Silakan coba kembali.'); }
    finally { setBusy(false); }
  };
  return (
    <main className="auth-layout register-layout">
      <section className="auth-story">
        <div className="auth-brand"><span className="brand-mark"><Waves size={21} /></span><span>revina<small>LAUNDRY STUDIO</small></span></div>
        <div className="story-copy"><span className="eyebrow">LANGKAH PERTAMA</span><h1>Rawat pakaian,<br /><em>lebih sederhana.</em></h1><p>Buat akun pelanggan untuk mulai menikmati layanan Laundry Revina.</p></div>
        <div className="story-foot"><span className="story-rule" /> Bersihnya terasa berbeda.</div><span className="story-number">02 / 03</span>
      </section>
      <section className="auth-form-side"><div className="auth-form-wrap">
        <Link to="/login" className="back-link"><ArrowLeft size={15} /> Kembali masuk</Link>
        <div className="auth-overline">AKUN PELANGGAN</div><h2>Buat akun baru</h2><p className="auth-subtitle">Isi data berikut untuk mendaftar.</p>
        {error && <div className="alert-error" role="alert">{error}</div>}
        <form className="form-stack" onSubmit={submit}>
          <label className="field-label">Nama lengkap<input autoComplete="name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nama Anda" /></label>
          <label className="field-label">Alamat email<input autoComplete="email" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="nama@email.com" /></label>
          <label className="field-label">Nomor telepon<input autoComplete="tel" type="tel" required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="08xxxxxxxxxx" /></label>
          <label className="field-label">Kata sandi<input autoComplete="new-password" type="password" minLength="8" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Minimal 8 karakter" /></label>
          <label className="field-label">Konfirmasi kata sandi<input autoComplete="new-password" type="password" minLength="8" required value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} placeholder="Ulangi kata sandi" /></label>
          <button className="button button-primary button-full" disabled={busy}>{busy ? 'Mendaftarkan...' : <>Daftar <ArrowRight size={17} /></>}</button>
        </form>
        <div className="auth-bottom">Sudah memiliki akun? <Link to="/login">Masuk</Link></div>
      </div><div className="auth-copyright">© 2026 Laundry Revina · Dengan sepenuh hati</div></section>
    </main>
  );
}