import React from 'react';

const crews = [
  {
    ship: "Mugiwara no Luffy (Thousand Sunny)",
    color: "#E8C14A",
    members: ["Monkey D. Luffy", "Roronoa Zoro", "Nami", "Usopp", "Sanji", "Tony Tony Chopper", "Nico Robin", "Franky", "Brook", "Jinbe"]
  },
  {
    ship: "Shin'ei no Law (Polar Tang)",
    color: "#2980b9",
    members: ["Trafalgar D. Water Law", "Bepo", "Shachi", "Penguin", "Jean Bart", "Hakugan", "Ikkaku"]
  },
  {
    ship: "Akagami no Shankusu (Red Force)",
    color: "#B22222",
    members: ["Shanks", "Benn Beckman", "Lucky Roux", "Yasopp", "Limejuice", "Bonk Punch", "Monster", "Building Snake", "Hongo", "Howling Gab"]
  },
  {
    ship: "Hyakujū no Kaidō (Mammoth)",
    color: "#4a148c",
    members: ["Kaido", "King the Conflagration", "Queen the Plague", "Jack the Drought", "Ulti", "Page One", "Who's-Who", "Black Maria", "Sasaki", "Basil Hawkins"]
  }
];

const Crew = () => {
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
        {crews.map((crew, index) => (
          <div key={index} className="card" style={{ borderTop: `5px solid ${crew.color}`, backgroundColor: 'rgba(7, 30, 61, 0.85)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px dashed var(--parchment)', paddingBottom: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>🏴‍☠️</span>
              <h2 style={{ fontSize: '1.8rem', color: crew.color, textShadow: '1px 1px 2px #000', margin: 0 }}>
                {crew.ship}
              </h2>
            </div>
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
              {crew.members.map((member, mIndex) => (
                <li key={mIndex} style={{ 
                  padding: '0.5rem 0', 
                  fontSize: '1.2rem', 
                  borderBottom: mIndex !== crew.members.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ color: 'var(--gold)', fontSize: '0.8rem' }}>⚔️</span> {member}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Crew;
