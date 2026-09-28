import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const shipImages: Record<number, string> = {
  1: '/luffy_ship.jpg',
  2: '/law_ship.jpg',
  3: '/shanks_ship.jpg',
  4: '/kaido_ship.jpg'
};

const shipClasses: Record<number, string> = {
  1: 'luffy',
  2: 'law',
  3: 'shanks',
  4: 'kaido'
};

const Registration = () => {
  const [ships, setShips] = useState<any[]>([]);
  const [selectedShip, setSelectedShip] = useState<any>(null);
  const [boardingMode, setBoardingMode] = useState(false);
  const [paymentMode, setPaymentMode] = useState(false);
  const [registeredId, setRegisteredId] = useState<string | null>(null);
  const [isBoardingAnimation, setIsBoardingAnimation] = useState(false);
  
  const [pirateName, setPirateName] = useState(localStorage.getItem('pirateName') || '');
  const [email, setEmail] = useState(localStorage.getItem('pirateEmail') || '');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [crewSize, setCrewSize] = useState(1);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const VoyageProgressBar = ({ step }: { step: number }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', background: 'rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '10px' }}>
      <div style={{ textAlign: 'center', opacity: step >= 1 ? 1 : 0.4 }}>
        <div style={{ fontSize: '2rem' }}>🏝️</div>
        <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>EAST BLUE</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--gold)' }}>Choose Ship</div>
      </div>
      <div style={{ flex: 1, height: '2px', background: step >= 2 ? 'var(--gold)' : 'rgba(255,255,255,0.2)', margin: '0 1rem', position: 'relative' }}>
        {step >= 1 && step < 2 && <div style={{ position: 'absolute', top: '-15px', left: '50%', fontSize: '1.5rem', animation: 'rocking 2s infinite' }}>🚢</div>}
      </div>
      <div style={{ textAlign: 'center', opacity: step >= 2 ? 1 : 0.4 }}>
        <div style={{ fontSize: '2rem' }}>☠️</div>
        <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>NEW WORLD</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--gold)' }}>Identify Crew</div>
      </div>
      <div style={{ flex: 1, height: '2px', background: step >= 3 ? 'var(--gold)' : 'rgba(255,255,255,0.2)', margin: '0 1rem', position: 'relative' }}>
        {step >= 2 && step < 3 && <div style={{ position: 'absolute', top: '-15px', left: '50%', fontSize: '1.5rem', animation: 'rocking 2s infinite' }}>🚢</div>}
      </div>
      <div style={{ textAlign: 'center', opacity: step >= 3 ? 1 : 0.4 }}>
        <div style={{ fontSize: '2rem' }}>💰</div>
        <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>TREASURE</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--gold)' }}>Payment</div>
      </div>
    </div>
  );

  useEffect(() => {
    fetchShips();
    const interval = setInterval(fetchShips, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchShips = async () => {
    try {
      const res = await fetch(`${API_URL}/ships`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setShips(data);
    } catch (e: any) {
      console.error(e);
      setError('Failed to load ships: ' + e.message);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pirateName, fullName, email, phoneNumber, shipId: selectedShip.id })
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "📜 Your registration scroll is incomplete.");
        return;
      }

      setRegisteredId(data.id);
      localStorage.setItem('registrationId', data.id);
      
      // Move to Payment/Treasure Chest Screen instead of dashboard
      setPaymentMode(true);
    } catch (e) {
      setError("Failed to register. The sea is rough.");
    }
  };

  const handleBoardClick = () => {
    setIsBoardingAnimation(true);
    setTimeout(() => {
      setBoardingMode(true);
      setIsBoardingAnimation(false);
    }, 1500);
  };

  // 1. Initial State: Four Ships
  if (!selectedShip) {
    return (
      <div className="container" style={{ animation: 'sailIn 1.5s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
        <VoyageProgressBar step={1} />
        <div style={{ textAlign: 'center', marginBottom: '3rem', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ border: '3px solid var(--gold)', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary)', boxShadow: '0 0 20px var(--gold)' }}>
              🧭
            </div>
          </div>
          <h1>CHOOSE YOUR SHIP</h1>
          <p style={{ fontSize: '1.2rem', fontStyle: 'italic', color: 'var(--parchment)' }}>
            Four captains. Four vessels. One legendary concert.
          </p>
        </div>

        {ships.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '3rem', fontSize: '1.5rem', color: 'var(--gold)' }}>
            <p>Loading the fleet...</p>
            {error && <p className="red-text">{error}</p>}
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '3rem' 
          }}>
            {ships.map(ship => {
            const isFull = ship.totalOccupied >= ship.capacity;
            const percentage = (ship.totalOccupied / ship.capacity) * 100;
            
            return (
              <div key={ship.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2 style={{ fontSize: '2.5rem', textShadow: '2px 2px 8px #000', marginBottom: '1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>{ship.name}</h2>
                <div 
                  className={`ship-container ${shipClasses[ship.id]}`}
                  style={{ backgroundImage: `url(${shipImages[ship.id]})`, width: '100%' }}
                  onClick={() => setSelectedShip(ship)}
                >
                  <div className="ship-content">
                  
                  <div style={{ background: 'rgba(0,0,0,0.7)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--gold)' }}>
                    <div className="progress-container" style={{ marginBottom: '1rem' }}>
                      <div className="progress-bar" style={{ 
                        width: `${Math.min(percentage, 100)}%`,
                        background: isFull ? 'var(--red)' : 'var(--gold)'
                      }}></div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{ship.totalOccupied} / {ship.capacity} SEATS CLAIMED</span>
                        <span>{isFull ? `${ship.waitlistCount || 0} WAITLISTED` : `${ship.capacity - ship.totalOccupied} SEATS AVAILABLE`}</span>
                      </div>
                      <div style={{ color: 'var(--gold)', fontSize: '1.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0.5rem 0' }}>
                        🎟️ {ship.price?.toLocaleString()} Berries
                      </div>
                    </div>
                    
                    <div style={{ marginTop: '0.5rem', fontSize: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                      {isFull ? (
                        <>
                          <div className="red-text">🔴 SHIP FULL</div>
                          <div style={{ fontSize: '1rem', color: 'var(--white)' }}>⚓ WAITLIST OPEN</div>
                          <button className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>[ JOIN WAITLIST ]</button>
                        </>
                      ) : (
                        <>
                          <div className="green-text">🟢 OPEN FOR BOARDING</div>
                          <button className="btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>[ BOARD THIS SHIP ]</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              </div>
            );
          })}
        </div>
        )}
      </div>
    );
  }

  // 2. Cinematic Detail View / Animation / Registration Scroll
  const isFull = selectedShip.totalOccupied >= selectedShip.capacity;

  return (
    <div className="container">
      {!selectedShip ? <VoyageProgressBar step={1} /> : !boardingMode ? <VoyageProgressBar step={1} /> : !paymentMode ? <VoyageProgressBar step={2} /> : <VoyageProgressBar step={3} />}
      
      {isBoardingAnimation ? (
        <div style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <div style={{ fontSize: '5rem', animation: 'float 0.5s infinite', textShadow: '0 0 50px var(--gold)' }}>🏴‍☠️</div>
          <h1 style={{ animation: 'flash 1s infinite' }}>BOARDING {selectedShip.name}...</h1>
        </div>
      ) : paymentMode ? (
        <div style={{ animation: 'sailIn 0.8s ease', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '5rem', marginBottom: '1rem', animation: 'rocking 2s infinite' }}>💰</div>
          <h1 style={{ color: 'var(--gold)', fontSize: '3.5rem', textShadow: '2px 2px 10px #000' }}>TREASURE CHEST</h1>
          <p style={{ fontSize: '1.5rem', color: 'var(--parchment)' }}>Your voyage requires</p>
          <div style={{ margin: '2rem 0', padding: '2rem', background: 'rgba(0,0,0,0.6)', border: '2px solid var(--gold)', borderRadius: '15px' }}>
            <div style={{ fontSize: '3rem', color: 'var(--gold)', fontWeight: 'bold' }}>🪙 {selectedShip.price?.toLocaleString()} BERRIES</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1.5rem', fontSize: '1.2rem', textAlign: 'left' }}>
              <div>
                <p><strong>Ship:</strong> {selectedShip.name}</p>
                <p><strong>Captain:</strong> {pirateName}</p>
              </div>
              <div>
                <p><strong>Event:</strong> Uta's Concert</p>
                <p><strong>Crew Size:</strong> {crewSize}</p>
              </div>
            </div>
          </div>
          <button className="btn-primary" style={{ fontSize: '2rem', padding: '1.5rem 3rem', width: '100%', background: 'linear-gradient(to right, #B8860B, #FFD700)' }} onClick={() => navigate('/dashboard')}>
            🏴‍☠️ CLAIM YOUR TREASURE
          </button>
        </div>
      ) : !boardingMode ? (
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', animation: 'sailIn 0.8s ease' }}>
          <div style={{ border: '3px solid var(--gold)', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }}>
            <img src={shipImages[selectedShip.id]} style={{ width: '100%', height: '300px', objectFit: 'cover' }} alt={selectedShip.name} />
              <div style={{ background: 'rgba(7, 30, 61, 0.9)', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>☠️</div>
              <h1 style={{ fontSize: '3rem' }}>{selectedShip.name}</h1>
              <h3 style={{ color: 'var(--parchment)', marginBottom: '2rem' }}>GRAND LINE SECTION</h3>
              
              <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>{selectedShip.totalOccupied} / {selectedShip.capacity} SEATS CLAIMED</span>
              </div>
              
              <div style={{ fontSize: '2rem', color: 'var(--gold)', marginBottom: '1.5rem', fontWeight: 'bold' }}>
                🎟️ {selectedShip.price?.toLocaleString()} Berries
              </div>

              <div style={{ marginBottom: '2rem', fontSize: '1.2rem' }}>
                {isFull ? (
                  <div>
                    <span className="red-text" style={{ fontWeight: 'bold' }}>🔴 SHIP FULL</span>
                    <p style={{ marginTop: '0.5rem', color: 'var(--parchment)' }}>Every cabin aboard this vessel has been claimed.</p>
                  </div>
                ) : (
                  <span className="green-text" style={{ fontWeight: 'bold' }}>🟢 OPEN FOR BOARDING</span>
                )}
              </div>
              
              <p style={{ fontSize: '1.3rem', marginBottom: '2rem' }}>Ready to sail with this crew?</p>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="btn-primary" onClick={handleBoardClick}>
                  {isFull ? 'JOIN THE GRAND LINE WAITLIST' : 'BOARD THIS SHIP'}
                </button>
                <button className="btn-secondary" onClick={() => setSelectedShip(null)}>
                  VIEW OTHER SHIPS
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ animation: 'sailIn 0.8s ease' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2>YOU ARE BOARDING:</h2>
            <h1 className="gold-text" style={{ fontSize: '3rem' }}>{selectedShip.name}</h1>
          </div>
          
          <div className="registration-scroll">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '3rem' }}>☠️</div>
              <h1 style={{ color: 'var(--dark-brown)', fontFamily: 'var(--font-pirate)', fontSize: '3rem' }}>IDENTIFY YOUR CREW</h1>
              <p style={{ fontWeight: 'bold' }}>GRAND LINE ENTRY DOCUMENT</p>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: '5px', marginBottom: '2rem', textAlign: 'center' }}>
              <p>Capacity: <strong>{selectedShip.totalOccupied} / {selectedShip.capacity}</strong></p>
              {isFull ? (
                <p className="red-text" style={{ fontWeight: 'bold' }}>Waitlist Position: #{selectedShip.waitlistCount + 1}</p>
              ) : (
                <p className="green-text" style={{ fontWeight: 'bold' }}>Available Seats: {selectedShip.capacity - selectedShip.totalOccupied}</p>
              )}
            </div>

            {error && (
              <div style={{ background: 'rgba(178, 34, 34, 0.2)', padding: '1rem', border: '2px solid var(--red)', marginBottom: '1rem', borderRadius: '4px', color: 'var(--red)', fontWeight: 'bold' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>CAPTAIN NAME</label>
                <input type="text" placeholder="Your legendary moniker" value={pirateName} onChange={e => setPirateName(e.target.value)} required />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>GOVERNMENT NAME (FULL NAME)</label>
                <input type="text" placeholder="Government Name" value={fullName} onChange={e => setFullName(e.target.value)} required />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>DEN DEN MUSHI FREQUENCY (EMAIL)</label>
                <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>TRANSPONDER NUMBER (PHONE)</label>
                <input type="tel" placeholder="Contact Number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required />
              </div>
              
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>BUILD YOUR CREW</label>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px' }}>
                  <button type="button" className="btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={() => setCrewSize(Math.max(1, crewSize - 1))}>−</button>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{crewSize}</div>
                  <button type="button" className="btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={() => setCrewSize(Math.min(20, crewSize + 1))}>+</button>
                </div>
                <div style={{ textAlign: 'center', marginTop: '0.5rem', color: 'var(--dark-brown)' }}>
                  Your crew has {crewSize} {crewSize === 1 ? 'member' : 'members'}.
                  <br />
                  <span style={{ letterSpacing: '2px', fontSize: '1.2rem', marginTop: '0.5rem', display: 'inline-block' }}>
                    {Array(crewSize).fill('👤').slice(0, 10).join('')}{crewSize > 10 ? '...' : ''}
                  </span>
                </div>
              </div>
              
              <button type="submit" className="btn-primary" style={{ width: '100%', fontSize: '1.5rem', padding: '1rem' }}>
                🏴‍☠️ {isFull ? 'JOIN WAITLIST' : 'PROCEED TO TREASURE'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Registration;
