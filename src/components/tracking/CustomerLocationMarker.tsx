import React from 'react';

interface CustomerLocationMarkerProps {
  x: number;
  y: number;
}

export function CustomerLocationMarker({ x, y }: CustomerLocationMarkerProps) {
  return (
    <g className="cursor-pointer" transform={`translate(${x}, ${y})`}>
      <circle cx="0" cy="0" r="14" fill="#FF6500" fillOpacity="0.1" className="animate-ping" style={{ animationDuration: '3s' }} />
      <circle cx="0" cy="0" r="6" fill="#FF6500" stroke="#FFFFFF" strokeWidth="1.5" />
    </g>
  );
}
