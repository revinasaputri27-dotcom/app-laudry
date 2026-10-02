import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ChevronDown, LogOut, Menu, UserRound, WashingMachine, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onMenu }) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const roleName = { admin: 'Administrator', kasir: 'Kasir', customer: 'Pelanggan' }[user?.role] || user?.role;
  if (user?.role === 'customer') return (
    <header className="customer-navbar">
      <Link to="/dashboard" className="customer-brand"><span className="brand-mark"><WashingMachine size={20} /></span><span>revina<small>LAUNDRY STUDIO</small></span></Link>
      <button type="button" className="customer-mobile-toggle" aria-label="Buka navigasi" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button>
      <nav className={`customer-nav-links${mobileOpen ? ' nav-open' : ''}`}>
        <NavLink to="/dashboard" onClick={() => setMobileOpen(false)}>Beranda</NavLink>
        <NavLink to="/create-order" onClick={() => setMobileOpen(false)}>Pesan laundry</NavLink>
        <NavLink to="/my-orders" onClick={() => setMobileOpen(false)}>Pesanan saya</NavLink>
        <NavLink to="/packages" onClick={() => setMobileOpen(false)}>Paket</NavLink>
        <NavLink to="/track" onClick={() => setMobileOpen(false)}>Lacak</NavLink>
      </nav>
      <div className="customer-account-wrap">
        <button type="button" className="customer-account" onClick={() => setProfileOpen(!profileOpen)} aria-expanded={profileOpen}><span className="avatar">{user?.name?.slice(0, 1)?.toUpperCase()}</span><span>{user?.name?.split(' ')[0]}</span><ChevronDown size={14} /></button>
        {profileOpen && <div className="account-menu"><Link to="/profile" onClick={() => setProfileOpen(false)}><UserRound size={15} /> Profil saya</Link><Link to="/address" onClick={() => setProfileOpen(false)}>Alamat tersimpan</Link><button onClick={logout}><LogOut size={15} /> Keluar</button></div>}
      </div>
    </header>
  );
  return (
    <header className="topbar">
      <button type="button" className="icon-button mobile-menu" onClick={onMenu} aria-label="Buka navigasi"><Menu size={20} /></button>
      <div className="topbar-context"><span>OPERASIONAL</span><strong>Laundry Revina</strong></div>
      <div className="topbar-actions">
        <div className="user-chip"><span className="avatar">{user?.name?.slice(0, 1)?.toUpperCase()}</span><span><strong>{user?.name}</strong><small>{roleName}</small></span></div>
        <button type="button" className="icon-button logout-button" onClick={logout} title="Keluar" aria-label="Keluar"><LogOut size={18} /></button>
      </div>
    </header>
  );
}