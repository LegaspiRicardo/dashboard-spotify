// components/ui/GridScanBackground.tsx
"use client";
import React from 'react';

const GridScanBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gray-900">
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgb(147 51 234 / 0.4) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(147 51 234 / 0.4) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Primera línea  */}
      <div
        className="absolute left-0 right-0 h-3 bg-gradient-to-r from-transparent via-purple-400/70 to-transparent blur-xl"
        style={{
          boxShadow: '0 0 35px 15px rgba(147, 51, 234, 0.4)',
          animation: 'scan 12s ease-in-out infinite'
        }}
      />

      {/* Segunda línea */}
      <div
        className="absolute left-0 right-0 h-3 bg-gradient-to-r from-transparent via-green-700/60 to-transparent blur-xl"
        style={{
          boxShadow: '0 0 35px 12px rgba(16, 185, 129, 0.3)',
          animation: 'scan 12s ease-in-out infinite 6s'
        }}
      />


      {/* Overlay para suavizar */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-transparent to-gray-900/60" />
    </div>
  );
};

export default GridScanBackground;