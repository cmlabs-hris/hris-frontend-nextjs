'use client'; // <-- Baris ini sangat penting!

import React, { useState, useEffect } from 'react';

// Komponen untuk bubble animasi di latar belakang
export default function AnimatedBubbles() {
  // State untuk menyimpan elemen bubble setelah dibuat
  const [bubbles, setBubbles] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    const generatedBubbles = Array.from({ length: 15 }).map((_, i) => (
      <div
        key={i}
        className="absolute bg-blue-500/20 rounded-full animate-bubble"
        style={{
          width: `${Math.random() * 200 + 50}px`,
          height: `${Math.random() * 200 + 50}px`,
          left: `${Math.random() * 100}%`,
          animationDuration: `${Math.random() * 20 + 15}s`,
          animationDelay: `${Math.random() * 10}s`,
          bottom: '-100px',
        }}
      />
    ));
    setBubbles(generatedBubbles);
  }, []); 

  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      {bubbles}
    </div>
  );
};

