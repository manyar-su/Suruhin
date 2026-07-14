import React from 'react';

interface MeetingPointMarkerProps {
  x: number;
  y: number;
}

export function MeetingPointMarker({ x, y }: MeetingPointMarkerProps) {
  return (
    <g className="cursor-pointer" transform={`translate(${x}, ${y})`}>
      <circle cx="0" cy="0" r="18" fill="none" stroke="#FF6500" strokeWidth="1.5" strokeDasharray="3,2" className="animate-spin" style={{ animationDuration: '20s' }} />
      <circle cx="0" cy="0" r="9" fill="#FFFFFF" stroke="#FF6500" strokeWidth="2" />
      <circle cx="0" cy="0" r="4" fill="#FF6500" />
      
      {/* Floating pin pin pointer */}
      <g transform="translate(-7, -20)">
        <path d="M 7,0 C 3,0 0,3 0,7 C 0,12 7,17 7,17 C 7,17 14,12 14,7 C 14,3 11,0 7,0 Z" fill="#FF6500" stroke="#FFFFFF" strokeWidth="1" />
        <circle cx="7" cy="6" r="2.5" fill="#FFFFFF" />
      </g>
    </g>
  );
}
