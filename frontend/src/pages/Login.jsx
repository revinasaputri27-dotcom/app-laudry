import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Waves } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (event) => {
    event.preventDefault(); setError(''); setBusy(true);
    try { await login(form); navigate('/dashboard'); }
    catch (err) { setError(err.response?.data?.message || 'Tidak dapat masuk. Periksa koneksi server.'); }
    finally { setBusy(false); }
  };

  return (
    <main className="auth-layout">
      <section className="auth-story">
        <div className="auth-brand"><span className="brand-mark"><Waves size={21} /></span><span>revina<small>LAUNDRY STUDIO</small></span></div>
        <div className="story-copy"><span className="eyebrow">RUANG KERJA REVINA</span><h1>Perawatan terbaik,<br /><em>selalu terasa.</em></h1><p>Atur pesanan, layanan, dan pelanggan dalam satu ruang yang rapi.</p></div>
        <div className="story-foot"><span className="story-rule" /> Cucian bersih, hati tenang.</div>
        <span className="story-number">01 / 03</span>
      </section>
      <section className="auth-form-side">
        <div className="auth-form-wrap">
          <div className="auth-overline">SELAMAT DATANG KEMBALI</div>
          <h2>Masuk ke akun</h2>
          <p className="auth-subtitle">Lanjutkan pekerjaan laundry hari ini.</p>
          {location.state?.registered && <div className="alert-success">Akun berhasil dibuat. Silakan masuk untuk melanjutkan.</div>}
          {error && <div className="alert-error" role="alert">{error}</div>}
          <form className="form-stack" onSubmit={submit}>
            <label className="field-label">Alamat email<input autoComplete="email" type="email" required placeholder="nama@email.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
            <label className="field-label">Kata sandi<span className="password-field"><input autoComplete="current-password" type={showPassword ? 'text' : 'password'} required placeholder="Masukkan kata sandi" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /><button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>
            <button className="button button-primary button-full" disabled={busy}>{busy ? 'Memeriksa...' : <>Masuk <ArrowRight size={17} /></>}</button>
          </form>
          <div className="auth-bottom">Belum memiliki akun? <Link to="/register">Daftar di sini</Link></div>
          <Link to="/track" className="track-text-link">Lacak pesanan tanpa masuk <ArrowRight size={14} /></Link>
        </div>
        <div className="auth-copyright">© 2026 Laundry Revina · Dengan sepenuh hati</div>
      </section>
    </main>
  );
}