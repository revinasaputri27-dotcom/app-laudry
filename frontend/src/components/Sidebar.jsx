import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Users, ClipboardList, CreditCard, UserRound, Search, Waves, Plus, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/dashboard', label: 'Ringkasan', icon: LayoutDashboard },
  { to: '/orders', label: 'Transaksi order', icon: ClipboardList },
  { to: '/customers', label: 'Pelanggan', icon: Users },
  { to: '/packages', label: 'Paket layanan', icon: Package },
  { to: '/payments', label: 'Pembayaran', icon: CreditCard },
  { to: '/users', label: 'Pengguna', icon: UserRound, admin: true }
];
const customerLinks = [
  { to: '/dashboard', label: 'Beranda', icon: LayoutDashboard },
  { to: '/create-order', label: 'Pesan laundry', icon: Plus },
  { to: '/my-orders', label: 'Pesanan saya', icon: ClipboardList },
  { to: '/packages', label: 'Paket layanan', icon: Package },
  { to: '/address', label: 'Alamat tersimpan', icon: MapPin },
  { to: '/profile', label: 'Profil saya', icon: UserRound }
];

export default function Sidebar() {
  const { user } = useAuth();
  const visibleLinks = user?.role === 'customer' ? customerLinks : links.filter((link) => !link.admin || user?.role === 'admin');
  return (
    <aside className="sidebar">
      <NavLink to="/dashboard" className="brand-lockup">
        <span className="brand-mark"><Waves size={22} /></span>
        <span><strong>revina</strong><small>LAUNDRY STUDIO</small></span>
      </NavLink>
      <div className="sidebar-caption">MENU UTAMA</div>
      <nav className="side-links">
        {visibleLinks.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>
            <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-caption">LAYANAN PELANGGAN</div>
        <NavLink to="/track" className="side-link"><Search size={18} /><span>Lacak cucian</span></NavLink>
        <div className="sidebar-note"><span className="open-indicator" /> Buka hari ini <strong>08.00–20.00</strong></div>
      </div>
      <span className="sidebar-version">LAUNDRY REVINA · 2026</span>
    </aside>
  );
}