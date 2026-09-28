import React from 'react';

const Crew = () => {
  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '5vh' }}>
      <h1>MY CREW</h1>
      <p style={{ color: 'var(--parchment)', fontSize: '1.2rem', marginBottom: '2rem' }}>
        The legendary pirates you're sailing with!
      </p>
      <img src="/crew_extra.jpg" alt="Pirate Crew" style={{ width: '100%', maxWidth: '800px', borderRadius: '10px', border: '5px solid var(--gold)', boxShadow: '0 10px 20px rgba(0,0,0,0.5)' }} />
    </div>
  );
};

export default Crew;
