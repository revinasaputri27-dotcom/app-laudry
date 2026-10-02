import { useEffect, useState } from 'react';
import { ArrowDown, ArrowRight, Check, Clock3, MapPin, PackageCheck, ShieldCheck, Sparkles, Truck, WashingMachine } from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { formatRupiah } from '../services/api';
import { useAuth } from '../context/AuthContext';

const benefits = [
  { icon: Truck, title: 'Antar jemput gratis', copy: 'Biaya jemput gratis untuk pesanan minimal Rp 50.000.' },
  { icon: ShieldCheck, title: 'Cuci bersih bergaransi', copy: 'Setiap pakaian dirawat teliti oleh tim kami.' },
  { icon: PackageCheck, title: 'Lacak real-time', copy: 'Ikuti proses cucian dari dijemput sampai selesai.' },
  { icon: Sparkles, title: 'Pembayaran fleksibel', copy: 'Pilih tunai, transfer, QRIS, atau e-wallet.' }
];
const steps = [
  { no: '01', title: 'Pesan', copy: 'Tentukan alamat, layanan, dan waktu jemput.' },
  { no: '02', title: 'Kami jemput', copy: 'Kurir mengambil cucian sesuai jadwal.' },
  { no: '03', title: 'Kami rawat', copy: 'Pakaian dicuci dan dirapikan dengan cermat.' },
  { no: '04', title: 'Diantar', copy: 'Cucian bersih kembali ke alamat Anda.' }
];
const quotes = [
  { quote: 'Jemputnya tepat waktu, hasilnya juga wangi dan rapi. Praktis sekali.', name: 'Nadia P.', label: 'Pelanggan sejak 2024' },
  { quote: 'Paket express sangat membantu saat jadwal sedang padat.', name: 'Raka S.', label: 'Pelanggan sejak 2023' },
  { quote: 'Bisa lacak pesanan dengan mudah dan harganya jelas dari awal.', name: 'Mira A.', label: 'Pelanggan sejak 2025' }
];
const faqs = [
  ['Berapa lama proses laundry?', 'Waktu pengerjaan bergantung pada paket yang dipilih, mulai dari 6 jam hingga 4 hari. Estimasi ditampilkan sebelum pesanan dibuat.'],
  ['Kapan biaya antar jemput gratis?', 'Biaya jemput Rp 5.000 dan gratis jika total pesanan setelah diskon mencapai Rp 50.000.'],
  ['Bagaimana cara melacak cucian?', 'Buka menu Lacak dan masukkan kode pesanan yang tertera pada detail order.'],
  ['Metode pembayaran apa yang tersedia?', 'Pembayaran dapat dicatat dengan tunai, transfer bank, QRIS, dan e-wallet. Transfer dapat disertai unggahan bukti.']
];
const featuredFallback = [
  { id: null, name: 'Cuci Kering', pricePerKg: 5000, estimasiHari: 3, description: 'Cuci bersih, kering, dan siap dilipat.', category: 'cuci', unit: 'kg' },
  { id: null, name: 'Cuci Setrika', pricePerKg: 7000, estimasiHari: 3, description: 'Cucian bersih dan disetrika rapi.', category: 'cuci', unit: 'kg' },
  { id: null, name: 'Setrika Saja', pricePerKg: 4000, estimasiHari: 2, description: 'Pakaian disetrika hingga licin.', category: 'setrika', unit: 'kg' },
  { id: null, name: 'Express 24 Jam', pricePerKg: 12000, estimasiHari: 1, description: 'Selesai dalam waktu 24 jam.', category: 'express', unit: 'kg' }
];

export default function Home() {
  const { user } = useAuth();
  const [packages, setPackages] = useState([]);
  useEffect(() => { api.get('/packages').then(({ data }) => setPackages(data.slice(0, 4))).catch(() => setPackages(featuredFallback)); }, []);
  const orderLink = user?.role === 'customer' ? '/create-order' : user ? '/dashboard' : '/register';
  return <div className="home-page">
    <header className="home-nav"><Link to="/" className="customer-brand"><span className="brand-mark"><WashingMachine size={20} /></span><span>revina<small>LAUNDRY STUDIO</small></span></Link><nav><a href="#layanan">Layanan</a><a href="#cara-kerja">Cara kerja</a><a href="#ulasan">Ulasan</a><Link to="/track">Lacak order</Link></nav><div className="home-nav-actions"><Link to={user ? '/dashboard' : '/login'} className="home-login">{user ? 'Akun saya' : 'Masuk'}</Link><Link to={orderLink} className="button button-primary">Pesan sekarang <ArrowRight size={15} /></Link></div><a className="home-mobile-login" href={user ? '/dashboard' : '/login'}>Masuk</a></header>
    <main>
      <section className="home-hero">
        <div className="home-hero-copy"><span className="eyebrow">LAUNDRY PICK-UP & DELIVERY</span><h1>Rawat pakaian,<br /><em>lebih sederhana.</em></h1><p>Waktu Anda berharga. Biar kami yang merawat pakaian sehari-hari, dari jemput sampai kembali rapi.</p><div className="home-hero-actions"><Link to={orderLink} className="button button-primary">Pesan sekarang <ArrowRight size={16} /></Link><a href="#layanan" className="hero-discover">Kenali layanan <ArrowDown size={14} /></a></div><div className="home-proof"><span><Check size={13} /> Jadwal fleksibel</span><span><Check size={13} /> Harga transparan</span></div></div>
        <div className="home-hero-visual"><img src="/laundry-studio.svg" alt="Ilustrasi mesin cuci dan cucian yang tertata di studio Laundry Revina" /><div className="hero-image-label"><span className="hero-label-icon"><WashingMachine size={17} /></span><span><strong>Lebih ringan setiap hari</strong><small>Perawatan laundry dari Revina</small></span></div><span className="hero-image-index">01 — 04</span></div>
      </section>
      <section className="benefit-band" id="layanan"><div className="section-kicker">KENAPA REVINA</div><div className="benefit-grid">{benefits.map(({ icon: Icon, title, copy }, index) => <article className="benefit-item" key={title}><span className={`benefit-icon benefit-tone-${index}`}><Icon size={19} /></span><div><h2>{title}</h2><p>{copy}</p></div></article>)}</div></section>
      <section className="home-packages"><div className="section-heading"><div><span className="eyebrow">PILIHAN PELANGGAN</span><h2>Perawatan yang pas<br />untuk setiap hari.</h2></div><Link to={user ? '/packages' : '/register'} className="text-link">Lihat semua paket <ArrowRight size={15} /></Link></div><div className="popular-grid">{packages.map((item, index) => <article className="popular-card" key={item.id}><div className={`popular-number popular-tone-${index}`}>0{index + 1}</div><span className="eyebrow">{item.category}</span><h3>{item.name}</h3><p>{item.description}</p><div className="popular-meta"><strong>{formatRupiah(item.pricePerKg)}<small> / {item.unit}</small></strong><span><Clock3 size={13} /> {item.estimasiJam ? `${item.estimasiJam} jam` : `${item.estimasiHari} hari`}</span></div><Link to={orderLink} aria-label={`Pilih ${item.name}`} className="popular-arrow"><ArrowRight size={17} /></Link></article>)}{!packages.length && <div className="popular-empty">Paket layanan akan tampil setelah katalog tersedia.</div>}</div></section>
      <section className="how-section" id="cara-kerja"><div className="how-intro"><span className="eyebrow">SESEDERHANA ITU</span><h2>Empat langkah,<br /><em>lebih banyak waktu.</em></h2><p>Mulai dari pesan hingga pakaian kembali ke rumah, semua terpantau.</p><Link to={orderLink} className="button button-light">Mulai pesan <ArrowRight size={15} /></Link></div><div className="how-steps">{steps.map((step) => <article className="how-step" key={step.no}><span>{step.no}</span><div><h3>{step.title}</h3><p>{step.copy}</p></div></article>)}</div></section>
      <section className="reviews-section" id="ulasan"><div className="section-heading"><div><span className="eyebrow">CERITA PELANGGAN</span><h2>Dirawat dengan hati.</h2></div><div className="review-rating"><strong>4,9</strong><span>★★★★★<small>Rata-rata kepuasan pelanggan</small></span></div></div><div className="quote-grid">{quotes.map((item) => <article className="quote-card" key={item.name}><span className="quote-stars">★★★★★</span><blockquote>“{item.quote}”</blockquote><div><span className="quote-avatar">{item.name[0]}</span><span><strong>{item.name}</strong><small>{item.label}</small></span></div></article>)}</div></section>
      <section className="faq-section"><div><span className="eyebrow">ADA YANG INGIN DITANYAKAN?</span><h2>Jawaban yang<br /><em>Anda perlukan.</em></h2><Link to="/track" className="text-link">Lacak pesanan <ArrowRight size={15} /></Link></div><div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div></section>
      <section className="home-cta"><div><span className="eyebrow">MULAI HARI INI</span><h2>Waktu Anda kembali,<br /><em>pakaian tetap terawat.</em></h2></div><Link to={orderLink} className="button button-light">Pesan laundry <ArrowRight size={16} /></Link></section>
    </main>
    <footer className="home-footer"><Link to="/" className="customer-brand"><span className="brand-mark"><WashingMachine size={20} /></span><span>revina<small>LAUNDRY STUDIO</small></span></Link><div className="footer-contact"><span className="eyebrow">LAYANAN PELANGGAN</span><strong>Setiap hari, 08.00–20.00</strong><Link to="/track">Pusat bantuan & pelacakan</Link></div><div className="footer-address"><span className="eyebrow">AREA LAYANAN</span><strong><MapPin size={14} /> Bandung dan sekitarnya</strong><small>Pastikan layanan tersedia untuk alamat Anda saat membuat pesanan.</small></div><div className="footer-bottom">© 2026 Laundry Revina <span>Merawat pakaian, memberi ruang untuk hal yang berarti.</span></div></footer>
  </div>;
}