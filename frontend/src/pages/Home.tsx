import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '10vh' }}>
      
      {/* Spotlight Effects */}
      <div style={{ position: 'fixed', top: '-20%', left: '20%', width: '10vw', height: '150vh', background: 'linear-gradient(rgba(255,105,180,0.2), transparent)', transform: 'rotate(-30deg)', pointerEvents: 'none', zIndex: 1 }}></div>
      <div style={{ position: 'fixed', top: '-20%', right: '20%', width: '10vw', height: '150vh', background: 'linear-gradient(rgba(147,112,219,0.2), transparent)', transform: 'rotate(30deg)', pointerEvents: 'none', zIndex: 1 }}></div>

      <div style={{ animation: 'float 6s infinite ease-in-out', position: 'relative', zIndex: 2 }}>
        <h1 style={{ fontSize: '6rem', marginBottom: '0.5rem', color: '#fff', textShadow: '0 0 20px #ff69b4, 0 0 40px #9370db, 0 0 60px #ff1493', fontFamily: 'var(--font-pirate)' }}>
          🎤 UTA'S CONCERT
        </h1>
        <h2 style={{ color: '#f8c291', fontSize: '2.5rem', marginBottom: '1rem', fontStyle: 'italic', letterSpacing: '2px', textShadow: '0 0 10px #e15f41' }}>
          "THE VOICE OF THE GRAND LINE"
        </h2>
        <p style={{ fontSize: '1.5rem', color: 'var(--white)', marginBottom: '3rem', fontWeight: 'bold' }}>
          Four legendary ships.<br/>Eighty seats.<br/>One unforgettable voyage.
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
          <button className="btn-primary" onClick={() => navigate('/register')} style={{ padding: '1.2rem 3.5rem', fontSize: '1.5rem', borderRadius: '50px' }}>
            CHOOSE YOUR SHIP
          </button>
          <button className="btn-secondary" onClick={() => navigate('/dashboard')} style={{ padding: '1.2rem 3.5rem', fontSize: '1.5rem', borderRadius: '50px' }}>
            VIEW MY VOYAGE
          </button>
        </div>
      </div>
      
      {/* Decorative Music Particles */}
      <div style={{ position: 'absolute', top: '20%', left: '10%', fontSize: '3rem', opacity: 0.5, animation: 'float 4s infinite linear' }}>♪</div>
      <div style={{ position: 'absolute', top: '30%', right: '15%', fontSize: '4rem', opacity: 0.3, animation: 'float 6s infinite linear reverse' }}>♫</div>
      <div style={{ position: 'absolute', top: '70%', left: '20%', fontSize: '2rem', opacity: 0.6, animation: 'float 5s infinite linear' }}>♬</div>
      <div style={{ position: 'absolute', top: '60%', right: '10%', fontSize: '3.5rem', opacity: 0.4, animation: 'float 7s infinite linear reverse' }}>♪</div>
    </div>
  );
};

export default Home;
