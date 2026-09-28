import React from 'react';

const OceanBackground = () => {
  return (
    <div className="ocean-bg">
      <div className="stars"></div>
      <div style={{
        position: 'absolute',
        bottom: 0,
        width: '200%',
        height: '30vh',
        background: 'linear-gradient(to top, rgba(11, 79, 113, 0.8), transparent)',
        animation: 'wave 15s infinite linear'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-5vh',
        width: '200%',
        height: '25vh',
        background: 'linear-gradient(to top, var(--primary), transparent)',
        animation: 'wave 10s infinite linear reverse'
      }}></div>
    </div>
  );
};

export default OceanBackground;
