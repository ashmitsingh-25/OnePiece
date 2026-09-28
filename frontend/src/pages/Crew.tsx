import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

const canonCrews = [
  {
    shipId: 1,
    ship: "1000 SUNNY",
    color: "#E8C14A",
    members: ["Monkey D. Luffy", "Roronoa Zoro", "Nami", "Usopp", "Sanji", "Tony Tony Chopper", "Nico Robin", "Franky", "Brook", "Jinbe"]
  },
  {
    shipId: 2,
    ship: "POLAR TANG",
    color: "#2980b9",
    members: ["Trafalgar D. Water Law", "Bepo", "Shachi", "Penguin", "Jean Bart", "Hakugan", "Ikkaku"]
  },
  {
    shipId: 3,
    ship: "RED FORCE",
    color: "#B22222",
    members: ["Shanks", "Benn Beckman", "Lucky Roux", "Yasopp", "Limejuice", "Bonk Punch", "Monster", "Building Snake", "Hongo", "Howling Gab"]
  },
  {
    shipId: 4,
    ship: "MOBY DICK",
    color: "#e0e0e0",
    members: ["Edward Newgate (Whitebeard)", "Marco the Phoenix", "Portgas D. Ace", "Jozu", "Vista", "Blamenco", "Rakuyo", "Namur", "Blenheim", "Curiel"]
  }
];

const Crew = () => {
  const [registrations, setRegistrations] = useState<any[]>([]);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/all`);
      if (res.ok) {
        const data = await res.json();
        // Only show confirmed or offered people as part of the crew
        setRegistrations(data.filter((r: any) => r.status === 'CONFIRMED' || r.status === 'OFFERED'));
      }
    } catch (e) {
      console.error('Failed to fetch registered crew', e);
    }
  };

  return (
    <div className="container" style={{ marginTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '4rem', textShadow: '0 0 20px rgba(212, 175, 55, 0.5)' }}>MY CREW</h1>
        <p style={{ color: 'var(--parchment)', fontSize: '1.2rem' }}>
          The legendary pirates sailing across the Grand Line!
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4rem' }}>
        <img 
          src="/crew_extra.jpg" 
          alt="Pirate Crew" 
          style={{ 
            width: '100%', 
            maxWidth: '900px', 
            borderRadius: '15px', 
            border: '5px solid var(--gold)', 
            boxShadow: '0 15px 40px rgba(0,0,0,0.6)' 
          }} 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {canonCrews.map((crew, index) => {
          const registeredCrew = registrations.filter(r => r.ship_id === crew.shipId);
          
          return (
            <div key={index} className="card" style={{ borderTop: `5px solid ${crew.color}`, backgroundColor: 'rgba(7, 30, 61, 0.85)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px dashed var(--parchment)', paddingBottom: '1rem' }}>
                <span style={{ fontSize: '2rem' }}>{crew.shipId === 4 ? '🐋' : '🏴‍☠️'}</span>
                <h2 style={{ fontSize: '1.8rem', color: crew.color, textShadow: '1px 1px 2px #000', margin: 0 }}>
                  {crew.ship}
                </h2>
              </div>
              <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                {crew.members.map((member, mIndex) => (
                  <li key={`canon-${mIndex}`} style={{ 
                    padding: '0.5rem 0', 
                    fontSize: '1.2rem', 
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <span style={{ color: 'var(--gold)', fontSize: '0.8rem' }}>⚔️</span> 
                    <span style={{ opacity: 0.8 }}>{member}</span>
                  </li>
                ))}
                
                {/* Render the registered users for this ship */}
                {registeredCrew.map((reg, rIndex) => (
                  <li key={`reg-${rIndex}`} style={{ 
                    padding: '0.75rem 0', 
                    fontSize: '1.2rem', 
                    borderBottom: rIndex !== registeredCrew.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <span style={{ fontSize: '1.2rem' }}>🧑‍🚀</span> 
                    <strong style={{ color: 'var(--green)' }}>{reg.pirate_name}</strong>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      background: 'var(--gold)', 
                      color: '#000', 
                      padding: '2px 6px', 
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      marginLeft: 'auto'
                    }}>
                      NEW RECRUIT
                    </span>
                  </li>
                ))}
                {registeredCrew.length === 0 && (
                  <li style={{ padding: '0.5rem 0', fontStyle: 'italic', color: 'var(--parchment)', fontSize: '0.9rem', textAlign: 'center' }}>
                    No new recruits yet
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Crew;
