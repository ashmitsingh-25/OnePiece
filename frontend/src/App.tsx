import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import OceanBackground from './components/OceanBackground';
import Login from './pages/Login';
import Home from './pages/Home';
import Registration from './pages/Registration';
import Dashboard from './pages/Dashboard';
import Crew from './pages/Crew';
import Admin from './pages/Admin';

const Navigation = () => {
  const location = useLocation();
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
      </nav>
    </div>
  );
};

function App() {
  return (
    <Router>
      <OceanBackground />
      <div className="grand-line-map"></div>
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
