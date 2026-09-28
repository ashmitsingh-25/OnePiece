import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const Dashboard = () => {
  const [registration, setRegistration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState('');
  const [countdown, setCountdown] = useState({ d: '00', h: '00', m: '00', s: '00' });
  const [departureInput, setDepartureInput] = useState('2026-10-04T08:00');
  const [targetDate, setTargetDate] = useState<Date>(() => new Date('2026-10-04T08:00'));
  const navigate = useNavigate();

  useEffect(() => {
    fetchRegistration();
    const interval = setInterval(fetchRegistration, 5000);
    
    // Live countdown tick
    const cdTimer = setInterval(() => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setCountdown({ d: '00', h: '00', m: '00', s: '00' });
      } else {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setCountdown({
          d: String(d).padStart(2, '0'),
          h: String(h).padStart(2, '0'),
          m: String(m).padStart(2, '0'),
          s: String(s).padStart(2, '0'),
        });
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(cdTimer);
    };
  }, [targetDate]);

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

      {/* Top Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Countdown Widget */}
        <div className="card" style={{ background: '#02101f', border: '1px solid #1a365d', borderRadius: '8px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ color: 'var(--parchment)', fontSize: '0.9rem', fontWeight: 'bold' }}>📅 SET SAIL DATE & TIME EVENT</div>
            <div style={{ background: 'var(--gold)', color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>COUNTDOWN</div>
          </div>
          <h2 style={{ color: 'var(--gold)', fontFamily: 'var(--font-pirate)', fontSize: '1.8rem', marginBottom: '1.5rem' }}>
            {targetDate.toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).toUpperCase()}
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'DAYS', value: countdown.d },
              { label: 'HOURS', value: countdown.h },
              { label: 'MINUTES', value: countdown.m },
              { label: 'SECONDS', value: countdown.s }
            ].map((t, i) => (
              <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '1rem 0', textAlign: 'center' }}>
                <div style={{ color: 'var(--gold)', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>{t.value}</div>
                <div style={{ color: 'var(--parchment)', fontSize: '0.7rem' }}>{t.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--white)' }}>
            <div>🌊 <span style={{ color: 'var(--parchment)' }}>Tide:</span> <strong>Full Moon Spring Surge</strong></div>
            <div>🌬️ <span style={{ color: 'var(--parchment)' }}>Wind:</span> <strong>East-South-East (24 Knots)</strong></div>
          </div>
        </div>

        {/* Schedule Widget */}
        <div className="card" style={{ background: '#02101f', border: '1px solid #1a365d', borderRadius: '8px', padding: '1.5rem' }}>
          <div style={{ color: 'var(--parchment)', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            ⚓ SCHEDULE DEPARTURE EVENT FOR {registration.ship.name.toUpperCase()}
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <input 
              type="datetime-local" 
              value={departureInput} 
              onChange={(e) => setDepartureInput(e.target.value)} 
              style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--gold)', padding: '0.8rem', borderRadius: '4px', outline: 'none' }} 
            />
            <button 
              className="btn-primary" 
              onClick={() => setTargetDate(new Date(departureInput))}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.8rem', fontSize: '1rem' }}
            >
              💾 UPDATE SCHEDULE
            </button>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => {
                const now = new Date();
                setDepartureInput(now.toISOString().slice(0,16));
                setTargetDate(now);
              }}
              style={{ flex: 2, background: 'linear-gradient(to right, #8b0000, #b22222)', color: 'var(--white)', border: 'none', padding: '0.8rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              🚨 SET SAIL NOW (RAISE ANCHOR)
            </button>
            <button style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--gold)', padding: '0.8rem', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              🌅 DAWN TIDE
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="card" style={{ 
        position: 'relative', 
        background: '#010b14', 
        border: '1px solid var(--gold)', 
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '3rem',
        padding: '0'
      }}>
        {/* Chart Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ fontSize: '2rem' }}>🧭</div>
            <div>
              <h2 style={{ color: 'var(--gold)', margin: 0, fontSize: '1.2rem', textTransform: 'uppercase' }}>GRAND LINE NAUTICAL CHART: {registration.ship.name}</h2>
              <div style={{ color: 'var(--parchment)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                Speed: <strong>28 Knots</strong> • Current Sector: <strong>{progress >= 100 ? "Elegia" : progress >= 50 ? "Water 7 → Sabaody" : "Reverse Mountain → Drum Island"}</strong>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'var(--parchment)', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '1px' }}>GRAND LINE PROGRESS</div>
            <div style={{ color: 'var(--gold)', fontSize: '1.5rem', fontWeight: 'bold' }}>{progress}% / 100%</div>
          </div>
        </div>

        {/* The Map Canvas */}
        <div style={{ height: '400px', width: '100%', position: 'relative' }}>
          {/* Grid Background */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {/* Base Path */}
            <path d="M 5 80 C 8 72, 9 65, 12 65 C 16 65, 17 75, 20 75 C 23 75, 24 45, 27 45 C 30 45, 31 70, 33 70 C 36 70, 38 60, 40 60 C 44 60, 45 20, 48 20 C 51 20, 53 80, 55 80 C 58 80, 60 60, 62 60 C 65 60, 66 95, 68 95 C 71 95, 72 65, 74 65 C 76 65, 77 40, 78 40 C 80 40, 81 75, 82 75 C 84 75, 85 35, 86 35 C 88 35, 89 70, 91 70 C 94 70, 95 45, 97 45" 
                  fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            <path d="M 5 80 C 8 72, 9 65, 12 65 C 16 65, 17 75, 20 75 C 23 75, 24 45, 27 45 C 30 45, 31 70, 33 70 C 36 70, 38 60, 40 60 C 44 60, 45 20, 48 20 C 51 20, 53 80, 55 80 C 58 80, 60 60, 62 60 C 65 60, 66 95, 68 95 C 71 95, 72 65, 74 65 C 76 65, 77 40, 78 40 C 80 40, 81 75, 82 75 C 84 75, 85 35, 86 35 C 88 35, 89 70, 91 70 C 94 70, 95 45, 97 45" 
                  fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            
            {/* Progress Path */}
            <path d="M 5 80 C 8 72, 9 65, 12 65 C 16 65, 17 75, 20 75 C 23 75, 24 45, 27 45 C 30 45, 31 70, 33 70 C 36 70, 38 60, 40 60 C 44 60, 45 20, 48 20 C 51 20, 53 80, 55 80 C 58 80, 60 60, 62 60 C 65 60, 66 95, 68 95 C 71 95, 72 65, 74 65 C 76 65, 77 40, 78 40 C 80 40, 81 75, 82 75 C 84 75, 85 35, 86 35 C 88 35, 89 70, 91 70 C 94 70, 95 45, 97 45" 
                  pathLength="100" fill="none" stroke="var(--gold)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"
                  strokeDasharray="100" strokeDashoffset={100 - progress} filter="url(#glow)" style={{ transition: 'stroke-dashoffset 2s ease-in-out' }} />
          </svg>

          {/* Islands Markers */}
          {[
            { name: 'Reverse Mountain', icon: '⛰️', x: 5, y: 80 },
            { name: 'Whisky Peak', icon: '🌵', x: 12, y: 65 },
            { name: 'Little Garden', icon: '🦕', x: 20, y: 75 },
            { name: 'Drum Island', icon: '❄️', x: 27, y: 45 },
            { name: 'Alabasta', icon: '🏜️', x: 33, y: 70 },
            { name: 'Jaya', icon: '✖️', x: 40, y: 60 },
            { name: 'Skypiea', icon: '☁️', x: 48, y: 20 },
            { name: 'Water 7', icon: '⛲', x: 55, y: 80 },
            { name: 'Enies Lobby', icon: '⚖️', x: 62, y: 60 },
            { name: 'Fishman Island', icon: '🧜‍♀️', x: 68, y: 95 },
            { name: 'Sabaody', icon: '🫧', x: 74, y: 65 },
            { name: 'Dressrosa', icon: '🌻', x: 78, y: 40 },
            { name: 'Zou', icon: '🐘', x: 82, y: 75 },
            { name: 'Wano Kuni', icon: '🌸', x: 86, y: 35 },
            { name: 'Egghead', icon: '🤖', x: 91, y: 70 },
            { name: 'Elegia (Concert)', icon: '🎵', x: 97, y: 45 },
          ].map((island, i) => {
            // Determine if the island has been reached based on progress (rough approximation)
            const islandProgressRequired = (i / 15) * 100;
            const isReached = progress >= islandProgressRequired;
            return (
              <div key={island.name} style={{ position: 'absolute', top: `${island.y}%`, left: `${island.x}%`, transform: 'translate(-50%, -50%)', textAlign: 'center', zIndex: 10 }}>
                <div style={{ 
                  width: '30px', height: '30px', borderRadius: '50%', 
                  background: isReached ? 'var(--gold)' : '#111', 
                  border: `2px solid ${isReached ? '#fff' : 'rgba(255,255,255,0.2)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', boxShadow: isReached ? '0 0 15px var(--gold)' : 'none',
                  transition: 'all 1s ease',
                  margin: '0 auto'
                }}>
                  {island.icon}
                </div>
                <div style={{ color: isReached ? 'var(--white)' : 'var(--parchment)', fontSize: '0.7rem', marginTop: '0.3rem', fontWeight: 'bold', whiteSpace: 'nowrap', textShadow: '1px 1px 2px #000', transition: 'color 1s ease' }}>
                  {island.name}
                </div>
              </div>
            );
          })}

          {/* The Ship Icon (Overlay) */}
          <div style={{ 
            position: 'absolute', 
            top: progress >= 100 ? '45%' : progress >= 50 ? '80%' : '75%', // Rough approx of Y coordinate based on progress checkpoints
            left: `calc(5% + ${progress * 0.9}%)`, 
            transform: 'translate(-50%, -50%)',
            fontSize: '3rem', 
            transition: 'all 2s ease-in-out',
            animation: 'rocking 2s infinite ease-in-out',
            zIndex: 20,
            filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.8))',
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '50%',
            padding: '5px',
            border: '2px solid var(--gold)'
          }}>
            {shipIcon}
          </div>
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
