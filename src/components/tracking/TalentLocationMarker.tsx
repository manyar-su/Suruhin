import React from 'react';

interface TalentLocationMarkerProps {
  x: number;
  y: number;
  rotation?: number;
}

export function TalentLocationMarker({ x, y, rotation = 45 }: TalentLocationMarkerProps) {
  return (
    <g className="cursor-pointer" transform={`translate(${x}, ${y})`}>
      {/* Pulse effect */}
      <circle cx="0" cy="0" r="20" fill="#082B5C" fillOpacity="0.1" className="animate-ping" style={{ animationDuration: '2s' }} />
      {/* Outer pin ring */}
      <circle cx="0" cy="0" r="9" fill="#082B5C" stroke="#FFFFFF" strokeWidth="2.5" className="shadow-lg" />
      {/* Direction indicator */}
      <polygon points="-3.5,3 0,-4.5 3.5,3 0,1" fill="#FFFFFF" transform={`rotate(${rotation})`} />
    </g>
  );
}
