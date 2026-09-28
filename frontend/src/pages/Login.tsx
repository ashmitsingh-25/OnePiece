import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pirateName, setPirateName] = useState('');
  const [password, setPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    localStorage.setItem('pirateEmail', email);
    localStorage.setItem('pirateName', pirateName || 'Anonymous Pirate');
    navigate('/home');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      
      <div className="card" style={{ zIndex: 1, maxWidth: '500px', width: '90%', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', textShadow: '2px 2px 4px #000' }}>WELCOME ABOARD</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: 'var(--parchment)' }}>
          Enter the Grand Line and join Uta's Concert.
        </p>

        <form onSubmit={handleLogin}>
          {isCreating && (
            <input 
              type="text" 
              placeholder="Pirate Name / Full Name" 
              value={pirateName}
              onChange={e => setPirateName(e.target.value)}
              required
            />
          )}
          <input 
            type="email" 
            placeholder="Email (Grand Line ID)" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn-primary">
              {isCreating ? 'CREATE PIRATE IDENTITY' : 'BOARD THE SHIP'}
            </button>
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => setIsCreating(!isCreating)}
            >
              {isCreating ? 'ALREADY A CREW MEMBER?' : 'CREATE PIRATE IDENTITY'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
