import React from 'react';
import { MapPin, Navigation, HelpCircle, X } from 'lucide-react';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'customer' | 'talent';
  onGrant: (type: 'always' | 'once' | 'deny') => void;
}

export function LocationPermissionModal({
  isOpen,
  onClose,
  role,
  onGrant
}: LocationPermissionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl border border-slate-100 text-center space-y-5 animate-scale-up">
        {/* Top Header & close button */}
        <div className="flex justify-end">
          <button onClick={onClose} className="p-1.5 hover:bg-slate-50 text-gray-400 rounded-full cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* Icon Frame */}
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-[#FF6500] border-4 border-orange-100 animate-pulse">
          <Navigation size={26} className="rotate-45" />
        </div>

        {/* Title & Body description */}
        <div className="space-y-2">
          <h3 className="text-base font-black text-[#082B5C]">
            Aktifkan Izin Lokasi Suruhin
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed px-1">
            {role === 'customer' 
              ? 'Suruhin membutuhkan akses lokasi untuk menentukan titik pertemuan, melihat posisi talent, dan membantu proses layanan berlangsung dengan aman.' 
              : 'Bagikan lokasi saat perjalanan agar pengguna dapat melihat estimasi kedatangan Anda. Tracking akan berhenti setelah layanan selesai.'
            }
          </p>
        </div>

        {/* Choices Buttons Stack */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => onGrant('always')}
            className="w-full py-3 bg-[#FF6500] hover:bg-[#e05900] text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-orange-500/10 active:scale-95"
          >
            Izinkan selama pesanan berlangsung
          </button>
          
          <button
            onClick={() => onGrant('once')}
            className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-[#082B5C] font-extrabold text-xs rounded-xl transition-all cursor-pointer border border-slate-200/50 active:scale-95"
          >
            Izinkan sekali ini saja
          </button>

          <button
            onClick={() => onGrant('deny')}
            className="w-full py-3 hover:bg-red-50 text-red-500 font-bold text-[11px] rounded-xl transition-all cursor-pointer active:scale-95"
          >
            Jangan izinkan (Gunakan Update Manual)
          </button>
        </div>

        {/* Privacy Note Footer */}
        <div className="text-[10px] text-gray-400 leading-relaxed border-t border-slate-50 pt-3">
          🔒 Izin lokasi Anda dienkripsi penuh dan otomatis dihentikan setelah layanan berakhir.
        </div>
      </div>
    </div>
  );
}
