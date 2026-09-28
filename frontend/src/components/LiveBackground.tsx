import React, { useEffect, useState } from 'react';
import './LiveBackground.css';

const LiveBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized mouse position (-1 to 1)
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Parallax calculations (subtle movement)
  const bgTransform = `translate(${mousePosition.x * -15}px, ${mousePosition.y * -15}px) scale(1.05)`;
  const fogTransform = `translate(${mousePosition.x * -25}px, ${mousePosition.y * -10}px)`;

  return (
    <div className="live-background-container">
      {/* 1. Base Image with Parallax */}
      <div 
        className="live-background-base" 
        style={{ transform: bgTransform }}
      ></div>

      {/* 2. Shimmering Water Reflections Overlay */}
      <div className="water-shimmer"></div>

      {/* 3. Fog and Sea Mist */}
      <div 
        className="sea-mist"
        style={{ transform: fogTransform }}
      ></div>

      {/* 4. Glowing Atmospheric Particles */}
      <div className="particles-container">
        {[...Array(30)].map((_, i) => (
          <div 
            key={i} 
            className="glowing-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${10 + Math.random() * 20}s`,
              animationDelay: `${-Math.random() * 20}s`,
              opacity: 0.1 + Math.random() * 0.4,
              transform: `scale(${0.5 + Math.random() * 1})`
            }}
          ></div>
        ))}
      </div>

      {/* 5. Flying Birds */}
      <div className="birds-container">
        <div className="bird bird-1"></div>
        <div className="bird bird-2"></div>
        <div className="bird bird-3"></div>
      </div>

      {/* 6. Darkening Overlay for UI readability (center and bottom) */}
      <div className="ui-readability-overlay"></div>
    </div>
  );
};

export default LiveBackground;
