import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { API_URL } from './config';
import LiveBackground from './components/LiveBackground';
import Login from './pages/Login';
import Home from './pages/Home';
import Registration from './pages/Registration';
import Dashboard from './pages/Dashboard';
import Crew from './pages/Crew';
import Admin from './pages/Admin';

const Navigation = () => {
  const location = useLocation();
  const [balance, setBalance] = useState(125000);

  useEffect(() => {
    const fetchBalance = async () => {
      const regId = localStorage.getItem('registrationId');
      if (!regId) {
        setBalance(125000);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/registration/${regId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'CONFIRMED' || data.status === 'OFFERED') {
            setBalance(125000 - (data.ship?.price || 15000));
          } else {
            setBalance(125000);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    
    fetchBalance();
    // Set up an interval to keep it updated when they register/cancel
    const interval = setInterval(fetchBalance, 3000);
    return () => clearInterval(interval);
  }, []);

  if (location.pathname === '/') return null; // No nav on login page

  return (
    <div className="container">
      <nav className="nav">
        <div className="nav-brand">
          <span style={{ fontSize: '1.5rem' }}>🏴‍☠️</span> UTA'S CONCERT
        </div>
        <div className="nav-links">
          <Link to="/home" className={location.pathname === '/home' ? 'active' : ''}>Grand Line</Link>
          <Link to="/register" className={location.pathname === '/register' ? 'active' : ''}>Choose Your Ship</Link>
          <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>My Voyage</Link>
          <Link to="/crew" className={location.pathname === '/crew' ? 'active' : ''}>My Crew</Link>
          <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>Control Room</Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ color: 'var(--gold)', fontWeight: 'bold', textShadow: '1px 1px 2px #000' }}>
            💰 {balance.toLocaleString()} Berries
          </div>
        </div>
      </nav>
    </div>
  );
};

const BackgroundManager = () => {
  return <LiveBackground />;
};

function App() {
  return (
    <Router>
      <BackgroundManager />
      <Navigation />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/crew" element={<Crew />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
