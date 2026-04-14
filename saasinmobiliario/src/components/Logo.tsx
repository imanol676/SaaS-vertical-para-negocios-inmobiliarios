import React from 'react';

export default function Logo({ className = "h-8 w-auto", variant = 'default' }: { className?: string, variant?: 'default' | 'white' }) {
  const isWhite = variant === 'white';
  const brandColor = isWhite ? "#ffffff" : "#2f869e"; 
  const textColor = isWhite ? "#ffffff" : "#0f172a"; 
  
  return (
    <svg viewBox="0 0 160 50" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Chimenea */}
      <rect x="30" y="8" width="6" height="12" fill={brandColor} />
      
      {/* Techo (Roof) */}
      <path 
        d="M 15 26 L 80 6 L 145 26" 
        stroke={brandColor} 
        strokeWidth="5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Texto */}
      <text 
        x="80" 
        y="44" 
        fontFamily="inherit"
        fontWeight="800" 
        fontSize="24" 
        fill={textColor} 
        textAnchor="middle"
        letterSpacing="-0.5"
      >
        Estateos
      </text>
    </svg>
  );
}
