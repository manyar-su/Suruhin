import React from 'react';
import { Compass } from 'lucide-react';

interface RecenterMapButtonProps {
  onRecenter: () => void;
  active?: boolean;
}

export function RecenterMapButton({ onRecenter, active = false }: RecenterMapButtonProps) {
  return (
    <button
      onClick={onRecenter}
      className={`w-10 h-10 rounded-xl shadow-md flex items-center justify-center border transition-all cursor-pointer active:scale-95 ${
        active
          ? 'bg-[#FF6500] border-[#FF6500] text-white'
          : 'bg-white border-slate-100 text-[#082B5C] hover:bg-slate-50'
      }`}
      title="Recenter Map"
    >
      <Compass size={18} className={active ? 'animate-pulse' : ''} />
    </button>
  );
}
