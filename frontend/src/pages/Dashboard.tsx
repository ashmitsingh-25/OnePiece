import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [data, setData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (data && data.status === 'OFFERED' && data.expires_at) {
      const timer = setInterval(() => {
        const remaining = data.expires_at - Date.now();
        if (remaining <= 0) {
          setTimeLeft(0);
          fetchData();
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [data]);

  const fetchData = async () => {
    const regId = localStorage.getItem('registrationId');
    if (!regId) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/api/registration/${regId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        localStorage.removeItem('registrationId');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    try {
      await fetch('http://localhost:3001/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: data.id, action })
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '10vh' }}><h2>Loading...</h2></div>;

  if (!data) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '10vh' }}>
        <h2>You are not registered for the concert.</h2>
        <button className="btn-primary" style={{ marginTop: '2rem' }} onClick={() => navigate('/register')}>
          CHOOSE YOUR SHIP
        </button>
      </div>
    );
  }

  const formatTime = (ms: number) => {
    if (ms <= 0) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container">
      <h1 style={{ textAlign: 'center', marginBottom: '3rem' }}>MY VOYAGE</h1>
      
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        
        <div className="card" style={{ flex: '1', minWidth: '300px', maxWidth: '600px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--gold)', paddingBottom: '1rem' }}>
             <div style={{ fontSize: '3rem' }}>🏴‍☠️</div>
             <div>
               <h2 style={{ marginBottom: '0' }}>Captain: {data.pirate_name}</h2>
               <p style={{ color: 'var(--parchment)' }}>Ship: {data.ship.name}</p>
             </div>
          </div>

          {/* Den Den Mushi Notifications */}
          <div style={{ marginBottom: '2rem' }}>
            {data.status === 'CONFIRMED' && (
              <div className="den-den-mushi">
                <div style={{ fontSize: '3rem' }}>📞</div>
                <div>
                  <h3 style={{ color: 'var(--gold)', marginBottom: '0.2rem' }}>DEN DEN MUSHI</h3>
                  <p>"Your seat aboard {data.ship.name} has been confirmed!"</p>
                </div>
              </div>
            )}
            
            {data.status === 'WAITLISTED' && (
              <div className="den-den-mushi">
                <div style={{ fontSize: '3rem' }}>📞</div>
                <div>
                  <h3 style={{ color: 'var(--gold)', marginBottom: '0.2rem' }}>DEN DEN MUSHI</h3>
                  <p>"Your current Grand Line queue position is #{data.queuePosition}."</p>
                </div>
              </div>
            )}
            
            {data.status === 'OFFERED' && (
              <div className="den-den-mushi" style={{ borderColor: 'var(--red)', animation: 'flash 2s infinite' }}>
                <div style={{ fontSize: '3rem' }}>📞</div>
                <div>
                  <h3 style={{ color: 'var(--red)', marginBottom: '0.2rem' }}>URGENT TRANSMISSION</h3>
                  <p>"A treasure seat has opened! You have 10 minutes to claim it."</p>
                </div>
              </div>
            )}
          </div>

          {data.status === 'WAITLISTED' && (
            <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.4)', padding: '2rem', borderRadius: '10px', border: '1px dashed var(--gold)' }}>
              <h3 style={{ marginBottom: '1rem' }}>GRAND LINE VOYAGE MAP</h3>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--parchment)' }}>YOUR POSITION:</p>
                  <p style={{ fontSize: '2.5rem', color: 'var(--gold)', fontWeight: 'bold' }}>#{data.queuePosition}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--parchment)' }}>PEOPLE AHEAD:</p>
                  <p style={{ fontSize: '2.5rem', color: 'var(--white)', fontWeight: 'bold' }}>{data.peopleAhead}</p>
                </div>
              </div>

              {/* Graphical Queue Line */}
              <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(0,0,0,0.5)', padding: '2rem', borderRadius: '8px' }}>
                <p style={{ fontWeight: 'bold', letterSpacing: '2px' }}>START</p>
                <div style={{ height: '30px', width: '3px', background: 'var(--parchment)', margin: '5px 0' }}></div>
                
                {Array.from({ length: Math.min(3, data.peopleAhead) }).map((_, i) => (
                  <React.Fragment key={i}>
                    <div style={{ fontSize: '2rem', background: '#333', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏴‍☠️</div>
                    <div style={{ height: '30px', width: '3px', background: 'var(--parchment)', margin: '5px 0' }}></div>
                  </React.Fragment>
                ))}
                
                {data.peopleAhead > 3 && (
                  <>
                    <div style={{ fontSize: '1.5rem', letterSpacing: '5px' }}>...</div>
                    <div style={{ height: '30px', width: '3px', background: 'var(--parchment)', margin: '5px 0' }}></div>
                  </>
                )}
                
                <div style={{ border: '3px solid var(--gold)', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'glow 1.5s infinite', background: 'var(--primary)', fontSize: '2rem' }}>⭐</div>
                <p style={{ fontWeight: 'bold', color: 'var(--gold)', marginTop: '10px', fontSize: '1.2rem' }}>YOU</p>
                
                <div style={{ height: '50px', width: '3px', background: 'var(--gold)', margin: '5px 0', borderStyle: 'dashed' }}></div>
                <div style={{ fontSize: '3rem', animation: 'float 2s infinite' }}>🏝️</div>
                <p style={{ fontWeight: 'bold', color: 'var(--green)', fontSize: '1.2rem', marginTop: '10px' }}>UTA'S CONCERT</p>
              </div>
            </div>
          )}

          {data.status === 'OFFERED' && timeLeft !== null && (
            <div style={{ textAlign: 'center', background: 'rgba(7, 30, 61, 0.9)', padding: '2rem', borderRadius: '10px', border: '2px solid var(--gold)', boxShadow: '0 0 30px rgba(212, 175, 55, 0.3)' }}>
              
              <div style={{ margin: '1rem 0 3rem 0' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  ⚡ <span style={{ letterSpacing: '2px' }}>HAKI ACCEPTANCE WINDOW</span> ⚡
                </h3>
                <div style={{ 
                  fontSize: '5rem', 
                  fontFamily: 'monospace', 
                  color: timeLeft < 60000 ? 'var(--red)' : 'var(--gold)',
                  textShadow: '0 0 10px rgba(0,0,0,0.8)'
                }}>
                  {formatTime(timeLeft)}
                </div>
                {timeLeft < 60000 && <p className="red-text" style={{ fontWeight: 'bold', animation: 'float 1s infinite', fontSize: '1.2rem' }}>Your Haki window is closing!</p>}
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn-primary" onClick={() => handleAction('ACCEPT')} style={{ padding: '1.5rem 3rem', fontSize: '1.5rem' }}>CLAIM MY TREASURE</button>
                <button className="btn-secondary" onClick={() => handleAction('DECLINE')} style={{ padding: '1.5rem 3rem' }}>DECLINE</button>
              </div>
            </div>
          )}

          {data.status === 'CONFIRMED' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                background: 'url("https://www.transparenttextures.com/patterns/old-map.png"), linear-gradient(45deg, #D4AF37, #E8C14A)', 
                color: 'var(--dark-brown)',
                padding: '3rem 2rem',
                borderRadius: '8px',
                border: '5px double var(--dark-brown)',
                marginTop: '1.5rem',
                position: 'relative',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
              }}>
                <div style={{ position: 'absolute', top: '10px', right: '10px', width: '50px', height: '50px', background: 'var(--red)', borderRadius: '50%', border: '2px solid var(--dark-brown)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', transform: 'rotate(15deg)' }}>
                  VIP
                </div>
                
                <h2 style={{ color: 'var(--dark-brown)', marginBottom: '0.5rem', fontFamily: 'var(--font-pirate)', fontSize: '3rem' }}>GOLDEN PASS</h2>
                <h3 style={{ letterSpacing: '3px', borderBottom: '2px solid var(--dark-brown)', paddingBottom: '1rem', marginBottom: '2rem' }}>UTA'S CONCERT</h3>
                
                <p style={{ margin: '1rem 0', fontWeight: 'bold', fontSize: '1.5rem' }}>{data.full_name.toUpperCase()}</p>
                <p style={{ fontSize: '1.2rem' }}>Ship: {data.ship.name}</p>
                
                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                  {/* Fake QR code */}
                  <div style={{ width: '100px', height: '100px', background: 'var(--dark-brown)', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '2px', padding: '5px' }}>
                     {Array.from({length: 25}).map((_, i) => <div key={i} style={{ background: Math.random() > 0.5 ? 'var(--gold)' : 'transparent' }}></div>)}
                  </div>
                </div>
                
                <p style={{ fontSize: '0.8rem', marginTop: '1rem' }}>REG-ID: {data.id.substring(0,8).toUpperCase()}</p>
              </div>
              
              <div style={{ marginTop: '3rem', background: 'rgba(0,0,0,0.5)', padding: '2rem', borderRadius: '10px' }}>
                <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontStyle: 'italic' }}>"Are you sure you want to abandon your treasure seat?"</p>
                <button className="btn-danger" onClick={() => handleAction('CANCEL')}>ABANDON MY SEAT</button>
              </div>
            </div>
          )}
          
          {(data.status === 'EXPIRED' || data.status === 'DECLINED' || data.status === 'CANCELLED') && (
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
               <h2 className="red-text" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>THE SHIP HAS SAILED.</h2>
               <p style={{ marginBottom: '2rem' }}>Your journey with this crew has ended.</p>
               <button className="btn-primary" onClick={() => {
                 localStorage.removeItem('registrationId');
                 navigate('/register');
               }}>PURSUE A NEW VOYAGE</button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
