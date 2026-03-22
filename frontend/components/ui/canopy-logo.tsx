import React from 'react';

export interface CanopyLogoProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export function CanopyLogo({ className = "", width = 300, height = 100 }: CanopyLogoProps) {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 300 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Soft inner glow gradient */}
        <radialGradient id="canopyGrad" cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f3f4f6" />
        </radialGradient>
        
        {/* Autumn Leaves Gradient */}
        <linearGradient id="leafGrad1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>

        {/* Spring Canopy Gradient */}
        <linearGradient id="leafGrad2" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* The beautiful heart container path */}
        <clipPath id="heartClip">
          <path d="M 50 30 A 20 20 0 0 1 90 30 Q 90 60 50 85 Q 10 60 10 30 A 20 20 0 0 1 50 30 Z" />
        </clipPath>
      </defs>

      <g transform="translate(5, 5)">
        {/* Heart Background */}
        <path 
          d="M 50 30 A 20 20 0 0 1 90 30 Q 90 60 50 85 Q 10 60 10 30 A 20 20 0 0 1 50 30 Z" 
          fill="url(#canopyGrad)" 
        />
        
        {/* Stylized Vector Leaves inside the heart clip */}
        <g clipPath="url(#heartClip)">
           {/* Abstract organic fluid shapes simulating the canopy */}
           <path d="M -10 -10 C 30 50, 80 10, 110 -10 Z" fill="url(#leafGrad1)" opacity="0.8" />
           <path d="M 110 100 C 60 40, 20 90, -10 100 Z" fill="url(#leafGrad2)" opacity="0.8" />
           
           {/* Delicate stylized branches drawing from bottom center */}
           <path d="M 50 85 Q 48 60 55 45 Q 65 30 75 25 M 55 45 Q 40 35 25 35 M 50 60 Q 30 50 20 50" 
                 stroke="#2c1a12" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85" />
        </g>

        {/* Crisp Teal Outline */}
        <path 
          d="M 50 30 A 20 20 0 0 1 90 30 Q 90 60 50 85 Q 10 60 10 30 A 20 20 0 0 1 50 30 Z" 
          stroke="#46a8a5" 
          strokeWidth="6" 
          strokeLinejoin="round" 
          strokeLinecap="round" 
        />
      </g>

      {/* Main Branding Text */}
      <text 
        x="115" 
        y="72" 
        fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" 
        fontWeight="800" 
        fontSize="54" 
        fill="#46a8a5"
        letterSpacing="-1.5"
      >
        Canopy
      </text>
    </svg>
  );
}
