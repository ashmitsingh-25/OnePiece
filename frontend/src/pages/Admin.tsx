import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

const Admin = () => {
  const [ships, setShips] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const resShips = await fetch(`${API_URL}/ships`);
      const dataShips = await resShips.json();
      setShips(dataShips);

      const resRegs = await fetch(`${API_URL}/admin/all`);
      const dataRegs = await resRegs.json();
      setRegistrations(dataRegs);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSimulateExpire = async (id: string) => {
    try {
      await fetch(`${API_URL}/admin/simulate_expire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await fetch(`${API_URL}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'CANCEL' })
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await fetch(`${API_URL}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'ACCEPT' })
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const totalConfirmed = ships.reduce((sum, s) => sum + s.confirmedCount, 0);
  const totalOffered = ships.reduce((sum, s) => sum + s.offeredCount, 0);
  const totalWaitlisted = ships.reduce((sum, s) => sum + s.waitlistCount, 0);
  const totalCapacity = ships.reduce((sum, s) => sum + s.capacity, 0);

  return (
    <div className="container" style={{ maxWidth: '1400px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>GRAND LINE CONTROL ROOM</h1>
      
      {/* Global Stats */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div className="card" style={{ flex: '1', minWidth: '150px', textAlign: 'center' }}>
          <h3>TOTAL CAPACITY</h3>
          <p style={{ fontSize: '2rem' }}>{totalCapacity}</p>
        </div>
        <div className="card" style={{ flex: '1', minWidth: '150px', textAlign: 'center' }}>
          <h3>CONFIRMED</h3>
          <p style={{ fontSize: '2rem', color: 'var(--green)' }}>{totalConfirmed}</p>
        </div>
        <div className="card" style={{ flex: '1', minWidth: '150px', textAlign: 'center' }}>
          <h3>ACTIVE OFFERS</h3>
          <p style={{ fontSize: '2rem', color: '#3498db' }}>{totalOffered}</p>
        </div>
        <div className="card" style={{ flex: '1', minWidth: '150px', textAlign: 'center' }}>
          <h3>WAITLISTED</h3>
          <p style={{ fontSize: '2rem', color: 'var(--gold)' }}>{totalWaitlisted}</p>
        </div>
      </div>

      {/* Ships */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {ships.map(ship => {
          const shipRegs = registrations.filter(r => r.ship_id === ship.id);
          const confirmedList = shipRegs.filter(r => r.status === 'CONFIRMED');
          const waitlist = shipRegs.filter(r => r.status === 'WAITLISTED').sort((a,b) => a.created_at - b.created_at);
          const offers = shipRegs.filter(r => r.status === 'OFFERED');

          return (
            <div key={ship.id} className="card">
              <h2>{ship.name}</h2>
              <p style={{ marginBottom: '1rem', borderBottom: '1px solid var(--gold)', paddingBottom: '0.5rem' }}>
                {ship.totalOccupied} / {ship.capacity} Seats Used
              </p>
              
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ color: '#3498db' }}>ACTIVE OFFERS ({offers.length})</h4>
                {offers.length === 0 ? <p style={{ fontSize: '0.9rem' }}>None</p> : (
                  <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem' }}>
                    {offers.map(o => (
                      <li key={o.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', background: 'rgba(52, 152, 219, 0.2)', padding: '0.5rem' }}>
                        <span>{o.pirate_name}</span>
                        <div>
                          <button onClick={() => handleAccept(o.id)} style={{ background: 'var(--green)', color: 'white', border: 'none', padding: '2px 5px', marginRight: '5px', cursor: 'pointer' }}>Accept</button>
                          <button onClick={() => handleSimulateExpire(o.id)} style={{ background: 'var(--red)', color: 'white', border: 'none', padding: '2px 5px', cursor: 'pointer' }}>Expire</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ color: 'var(--gold)' }}>WAITLIST ({waitlist.length})</h4>
                {waitlist.length === 0 ? <p style={{ fontSize: '0.9rem' }}>Empty</p> : (
                  <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem' }}>
                    {waitlist.slice(0,5).map((w, i) => (
                      <li key={w.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <span>#{i+1} {w.pirate_name}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--parchment)' }}>Waiting</span>
                      </li>
                    ))}
                    {waitlist.length > 5 && <li style={{ fontSize: '0.8rem' }}>+ {waitlist.length - 5} more</li>}
                  </ul>
                )}
              </div>

              <div>
                <h4 style={{ color: 'var(--green)' }}>CONFIRMED ({confirmedList.length})</h4>
                {confirmedList.length === 0 ? <p style={{ fontSize: '0.9rem' }}>None</p> : (
                  <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', maxHeight: '100px', overflowY: 'auto' }}>
                    {confirmedList.map(c => (
                      <li key={c.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <span>{c.pirate_name}</span>
                        <button onClick={() => handleCancel(c.id)} style={{ background: 'var(--red)', color: 'white', border: 'none', padding: '2px 5px', cursor: 'pointer', fontSize: '0.7rem' }}>Cancel</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Admin;
