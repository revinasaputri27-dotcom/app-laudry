import { useState } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Packages from './pages/Packages';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Payments from './pages/Payments';
import Users from './pages/Users';
import TrackOrder from './pages/TrackOrder';
import Home from './pages/Home';
import CreateOrder from './pages/CreateOrder';
import MyOrders from './pages/MyOrders';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';
import Address from './pages/Address';
import Payment from './pages/Payment';

function Protected({ admin = false, customerOnly = false, staffOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="screen-loader"><span className="loader-mark">R</span><span>Menyiapkan ruang kerja...</span></div>;
  if (!user) return <Navigate to="/" replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  if (customerOnly && user.role !== 'customer') return <Navigate to="/dashboard" replace />;
  if (staffOnly && user.role === 'customer') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

function Workspace() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const customer = user?.role === 'customer';
  return (
    <div className={`app-shell${customer ? ' customer-shell' : ''}`}>
      {!customer && <><div className={`sidebar-overlay${menuOpen ? ' visible' : ''}`} onClick={() => setMenuOpen(false)} />
      <div className={`sidebar-wrap${menuOpen ? ' menu-open' : ''}`}><Sidebar /></div></>}
      <div className="workspace-main">
        <Navbar onMenu={() => setMenuOpen((open) => !open)} />
        <main className="page-content"><Outlet /></main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/track" element={<TrackOrder />} />
      <Route element={<Protected />}>
        <Route element={<Workspace />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/packages" element={<Packages />} />
          <Route element={<Protected staffOnly />}>
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/payments" element={<Payments />} />
            <Route element={<Protected admin />}><Route path="/users" element={<Users />} /></Route>
          </Route>
          <Route element={<Protected customerOnly />}>
            <Route path="/create-order" element={<CreateOrder />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/my-orders/:id" element={<OrderDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/address" element={<Address />} />
            <Route path="/payment/:id" element={<Payment />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}