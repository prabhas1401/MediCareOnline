import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav style={{ background: '#007bff', padding: '10px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Poppins, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>🏥</span>
        <span style={{ fontWeight: 'bold' }}>Medicare +</span>
      </div>
      <div>
        {location.pathname === '/' ? (
          <>
            <Link to="/" style={{ color: 'white', margin: '0 10px', textDecoration: 'none' }}>Home</Link>
            <button onClick={() => scrollToSection('features')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', textDecoration: 'none' }}>Features</button>
            <button onClick={() => scrollToSection('contact')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', textDecoration: 'none' }}>Contact Us</button>
            {!token && <Link to="/login" style={{ color: 'white', margin: '0 10px', textDecoration: 'none' }}>Login</Link>}
            {!token && <Link to="/register" style={{ color: 'white', margin: '0 10px', textDecoration: 'none' }}>Register</Link>}
          </>
        ) : (
          <>
            <Link to="/" style={{ color: 'white', margin: '0 10px', textDecoration: 'none' }}>Home</Link>
            <button onClick={handleLogout} style={{ background: 'red', color: 'white', border: 'none', padding: '5px', margin: '0 10px' }}>Logout</button>
            {role === 'ADMIN' && <Link to="/admin" style={{ color: 'white', margin: '0 10px', textDecoration: 'none' }}>Admin Dashboard</Link>}
            {role === 'DOCTOR' && <Link to="/doctor" style={{ color: 'white', margin: '0 10px', textDecoration: 'none' }}>Doctor Dashboard</Link>}
            {role === 'PATIENT' && <Link to="/patient" style={{ color: 'white', margin: '0 10px', textDecoration: 'none' }}>Patient Dashboard</Link>}
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;