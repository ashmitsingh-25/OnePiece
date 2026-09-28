import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const Dashboard = () => {
  const [registration, setRegistration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRegistration();
    const interval = setInterval(fetchRegistration, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (registration?.status === 'OFFERED' && registration?.expires_at) {
      const timer = setInterval(() => {
        const remaining = registration.expires_at - Date.now();
        if (remaining <= 0) {
          setTimeRemaining('00:00');
          clearInterval(timer);
        } else {
          const m = Math.floor(remaining / 60000);
          const s = Math.floor((remaining % 60000) / 1000);
          setTimeRemaining(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [registration?.status, registration?.expires_at]);

  const fetchRegistration = async () => {
    const regId = localStorage.getItem('registrationId');
    if (!regId) {
      navigate('/');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/registration/${regId}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setRegistration(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'accept' | 'decline' | 'cancel') => {
    if (!registration) return;
    try {
      const res = await fetch(`${API_URL}/registration/${registration.id}/${action}`, {
        method: 'POST'
      });
      if (res.ok) {
        if (action === 'decline' || action === 'cancel') {
          localStorage.removeItem('registrationId');
          navigate('/register');
        } else {
          fetchRegistration();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '4rem', fontSize: '2rem' }}>Loading Voyage...</div>;
  if (error || !registration) return <div className="container">Error: {error}</div>;

  const getShipIcon = (shipName: string) => {
    if (shipName.includes('SUNNY')) return '🏴‍☠️';
    if (shipName.includes('TANG')) return '⚓';
    if (shipName.includes('FORCE')) return '🏴';
    if (shipName.includes('MOBY')) return '🐋';
    return '🏴‍☠️';
  };

  const shipIcon = getShipIcon(registration.ship.name);
  
  // Calculate map progress
  let progress = 10;
  if (registration.status === 'OFFERED') progress = 50;
  if (registration.status === 'CONFIRMED') progress = 100;

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem', animation: 'sailIn 1s ease' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '0.5rem', textShadow: '2px 2px 10px rgba(0,0,0,0.8)' }}>🧭 MY VOYAGE</h1>
        <p style={{ fontSize: '1.5rem', color: 'var(--parchment)', fontStyle: 'italic' }}>Your journey to Uta's Concert</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ textAlign: 'center', padding: '1rem', borderTop: '4px solid var(--gold)' }}>
          <div style={{ color: 'var(--parchment)', fontSize: '0.9rem' }}>PIRATE</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{registration.pirate_name}</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '1rem', borderTop: '4px solid var(--gold)' }}>
          <div style={{ color: 'var(--parchment)', fontSize: '0.9rem' }}>SHIP</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{shipIcon} {registration.ship.name}</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '1rem', borderTop: '4px solid var(--gold)' }}>
          <div style={{ color: 'var(--parchment)', fontSize: '0.9rem' }}>TICKET</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--gold)' }}>{registration.ship.price?.toLocaleString() || '15,000'} Berries</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '1rem', borderTop: '4px solid var(--gold)' }}>
          <div style={{ color: 'var(--parchment)', fontSize: '0.9rem' }}>STATUS</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: registration.status === 'CONFIRMED' ? '#2ecc71' : registration.status === 'OFFERED' ? 'var(--gold)' : 'var(--parchment)' }}>
            {registration.status}
          </div>
        </div>
      </div>

      <h2 style={{ color: 'var(--gold)', marginBottom: '1.5rem', textAlign: 'center' }}>🧭 YOUR GRAND LINE JOURNEY</h2>

      {/* Interactive Map */}
      <div className="card" style={{ 
        position: 'relative', 
        height: '400px', 
        background: 'linear-gradient(to bottom, #071f3b, #031326)', 
        border: '4px solid var(--wood-brown)', 
        overflow: 'hidden',
        marginBottom: '3rem'
      }}>
        {/* Ocean Background & Waves */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 2px, transparent 2px)', backgroundSize: '40px 40px', opacity: 0.5 }}></div>
        
        {/* Route Line */}
        <div style={{ position: 'absolute', top: '50%', left: '10%', right: '10%', height: '4px', borderBottom: '4px dashed rgba(255, 215, 0, 0.3)' }}></div>
        <div style={{ position: 'absolute', top: '50%', left: '10%', width: `${progress * 0.8}%`, height: '4px', borderBottom: '4px dashed var(--gold)', transition: 'width 2s ease-in-out' }}></div>

        {/* Islands */}
        <div style={{ position: 'absolute', top: '40%', left: '5%', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', cursor: 'pointer', transition: 'transform 0.3s' }} onMouseOver={e => e.currentTarget.style.transform='scale(1.2)'} onMouseOut={e => e.currentTarget.style.transform='scale(1)'}>🏝️</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--parchment)', fontWeight: 'bold' }}>STARTING ISLAND</div>
        </div>
        
        <div style={{ position: 'absolute', top: '40%', left: '45%', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', cursor: 'pointer', transition: 'transform 0.3s' }} onMouseOver={e => e.currentTarget.style.transform='scale(1.2)'} onMouseOut={e => e.currentTarget.style.transform='scale(1)'}>🧭</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--parchment)', fontWeight: 'bold' }}>GRAND LINE</div>
        </div>

        <div style={{ position: 'absolute', top: '35%', right: '5%', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', filter: progress === 100 ? 'drop-shadow(0 0 20px var(--gold))' : 'none', transition: 'all 1s' }}>🎤</div>
          <div style={{ fontSize: '1rem', color: 'var(--gold)', fontWeight: 'bold', textShadow: '1px 1px 2px #000' }}>UTA'S CONCERT</div>
        </div>

        {/* The Ship */}
        <div style={{ 
          position: 'absolute', 
          top: '38%', 
          left: `calc(5% + ${progress * 0.8}%)`, 
          fontSize: '4rem', 
          transition: 'left 3s ease-in-out',
          animation: 'rocking 2s infinite ease-in-out',
          zIndex: 10
        }}>
          {shipIcon}
        </div>
      </div>

      {registration.status === 'CONFIRMED' && (
        <div style={{ textAlign: 'center', animation: 'sailIn 1s ease' }}>
          <h2 style={{ color: '#2ecc71', fontSize: '2.5rem', marginBottom: '2rem' }}>🎉 YOUR VOYAGE IS COMPLETE!</h2>
          <p style={{ color: 'var(--parchment)', fontSize: '1.2rem', marginBottom: '3rem' }}>Your ship is ready to sail to Uta's Concert.</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '3rem' }}>
            {/* Voyage Pass */}
            <div className="card" style={{ 
              width: '100%',
              maxWidth: '400px', 
              background: 'linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(0,0,0,0.8) 100%)',
              border: '2px solid var(--gold)',
              boxShadow: '0 0 30px rgba(212,175,55,0.3)',
              position: 'relative',
              textAlign: 'left'
            }}>
              <div style={{ position: 'absolute', top: '-15px', right: '-15px', fontSize: '3rem' }}>🌟</div>
              <h3 style={{ borderBottom: '2px dashed var(--gold)', paddingBottom: '1rem', marginBottom: '1.5rem', letterSpacing: '3px', textAlign: 'center' }}>🏴‍☠️ VOYAGE PASS</h3>
              
              <div style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
                <p style={{ textAlign: 'center', color: 'var(--gold)', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '1rem' }}>UTA'S CONCERT</p>
                <p><strong>Captain:</strong> <span style={{ color: 'var(--white)' }}>{registration.pirate_name}</span></p>
                <p><strong>Ship:</strong> <span style={{ color: 'var(--white)' }}>{registration.ship.name}</span></p>
                <p><strong>Total:</strong> <span style={{ color: 'var(--white)' }}>{registration.ship.price?.toLocaleString()} 🪙 BERRIES</span></p>
              </div>

              <div style={{ margin: '2rem auto 0 auto', width: '150px', height: '150px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                <div style={{ width: '130px', height: '130px', background: 'repeating-linear-gradient(45deg, #000, #000 10px, #fff 10px, #fff 20px)' }}></div>
              </div>
              <p style={{ textAlign: 'center', marginTop: '1rem', fontStyle: 'italic', color: 'var(--gold)' }}>"Your voyage awaits, Captain."</p>

              <button className="btn-secondary" style={{ marginTop: '2rem', width: '100%', borderColor: 'var(--red)', color: 'var(--red)' }} onClick={() => handleAction('cancel')}>
                Abandon Ship (Cancel)
              </button>
            </div>

            {/* Bounty Poster */}
            <div className="card" style={{ 
              width: '100%',
              maxWidth: '350px', 
              background: 'url(/parchment.jpg) center/cover',
              backgroundColor: '#e6d5b8', /* fallback */
              border: '10px solid #5c3a21',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.8)',
              color: '#3e2723',
              padding: '2rem',
              fontFamily: 'Times New Roman, serif',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <h2 style={{ fontSize: '3rem', margin: '0 0 1rem 0', color: '#2c1e16', textShadow: 'none', borderBottom: '2px solid #5c3a21', paddingBottom: '0.5rem', width: '100%', textAlign: 'center' }}>
                ☠️ WANTED ☠️
              </h2>
              
              <div style={{ width: '100%', height: '200px', border: '4px solid #5c3a21', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.1)' }}>
                <span style={{ fontSize: '6rem' }}>🧑‍🚀</span>
              </div>
              
              <h1 style={{ fontSize: '2.5rem', color: '#2c1e16', textShadow: 'none', margin: '0 0 0.5rem 0', textTransform: 'uppercase', textAlign: 'center' }}>
                {registration.pirate_name}
              </h1>
              <p style={{ fontStyle: 'italic', fontSize: '1.2rem', marginBottom: '1.5rem', color: '#5c3a21' }}>"THE GRAND LINE RECRUIT"</p>
              
              <h3 style={{ fontSize: '1.5rem', color: '#2c1e16', textShadow: 'none', margin: '0 0 1rem 0' }}>
                BOUNTY: {registration.ship.price?.toLocaleString()} 🪙
              </h3>
              
              <div style={{ width: '100%', fontSize: '1.1rem', fontWeight: 'bold', borderTop: '1px solid #5c3a21', paddingTop: '1rem' }}>
                <p style={{ margin: '0.5rem 0', color: '#3e2723' }}>SHIP: {registration.ship.name}</p>
                <p style={{ margin: '0.5rem 0', color: '#3e2723' }}>DESTINATION: UTA'S CONCERT</p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '2rem' }}>
                <button style={{ flex: 1, padding: '0.5rem', background: '#3e2723', color: '#e6d5b8', border: 'none', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => alert('Downloading Bounty Poster...')}>
                  DOWNLOAD
                </button>
                <button style={{ flex: 1, padding: '0.5rem', background: '#5c3a21', color: '#e6d5b8', border: 'none', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => alert('Sharing Voyage...')}>
                  SHARE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {registration.status === 'WAITLISTED' && (
        <div style={{ textAlign: 'center', animation: 'sailIn 1s ease' }}>
          <h2 style={{ color: 'var(--parchment)' }}>⚓ YOUR SHIP IS CURRENTLY WAITING FOR A SEAT</h2>
          <div className="card" style={{ display: 'inline-block', marginTop: '1rem', padding: '2rem 4rem', fontSize: '1.2rem' }}>
            <p style={{ margin: '0 0 1rem 0' }}>Position in fleet: <strong style={{ fontSize: '2rem', color: 'var(--gold)' }}>#{registration.queuePosition}</strong></p>
            <p style={{ margin: 0, color: 'var(--parchment)' }}>People Ahead: {registration.queuePosition - 1}</p>
          </div>
          <div style={{ marginTop: '2rem' }}>
            <button className="btn-secondary" style={{ borderColor: 'var(--red)', color: 'var(--red)' }} onClick={() => handleAction('cancel')}>Leave Waitlist</button>
          </div>
        </div>
      )}

      {registration.status === 'OFFERED' && (
        <div style={{ textAlign: 'center', animation: 'sailIn 0.5s ease' }}>
          <div className="card" style={{ 
            background: 'rgba(211, 47, 47, 0.2)', 
            border: '2px solid var(--red)', 
            boxShadow: '0 0 30px rgba(211,47,47,0.5)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <div style={{ fontSize: '4rem', animation: 'rocking 1s infinite ease-in-out', marginBottom: '1rem' }}>🐌</div>
            <h2 style={{ color: 'var(--red)', letterSpacing: '2px' }}>🚨 DEN DEN MUSHI TRANSMISSION</h2>
            <p style={{ fontSize: '1.5rem', fontStyle: 'italic', margin: '1rem 0' }}>
              "An opening has appeared aboard the {registration.ship.name}!"
            </p>
            <p style={{ color: 'var(--parchment)' }}>Your ship has received a treasure-seat offer.</p>
            
            <div style={{ margin: '2rem 0', padding: '1rem', background: 'rgba(0,0,0,0.5)', borderRadius: '8px' }}>
              <div style={{ color: 'var(--gold)', fontWeight: 'bold' }}>⏱ HAKI ACCEPTANCE WINDOW</div>
              <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--white)', fontFamily: 'monospace' }}>{timeRemaining}</div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.2rem', background: '#2ecc71', color: '#000' }} onClick={() => handleAction('accept')}>
                [ CLAIM MY SEAT ]
              </button>
              <button className="btn-secondary" style={{ padding: '1rem 2rem', borderColor: 'var(--red)', color: 'var(--red)' }} onClick={() => handleAction('decline')}>
                [ DECLINE ]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
