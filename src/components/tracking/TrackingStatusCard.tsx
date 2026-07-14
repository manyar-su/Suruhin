import React from 'react';
import { Phone, MessageSquare, ShieldAlert, Navigation, ChevronRight } from 'lucide-react';
import { Booking } from '../../types';
import { formatDistance } from '../../lib/maps/distance';
import { formatETA } from '../../lib/maps/eta';

interface TrackingStatusCardProps {
  booking: Booking;
  distanceKm: number;
  etaMinutes: number;
  lastUpdatedText?: string;
  onOpenChat?: () => void;
  onCallMasked?: () => void;
  onOpenHelp?: () => void;
  role?: 'customer' | 'talent' | 'admin';
}

export function TrackingStatusCard({
  booking,
  distanceKm,
  etaMinutes,
  lastUpdatedText = '10 detik lalu',
  onOpenChat,
  onCallMasked,
  onOpenHelp,
  role = 'customer'
}: TrackingStatusCardProps) {
  
  // Talent mock details
  const vehicleName = 'Honda Beat';
  const vehicleNumber = 'Z 1234 AB';
  const talentName = booking.customerName === 'Siti Aminah' ? 'Rizky Pratama' : 'Rizky Pratama';
  const avatarUrl = ''; // fallback avatar will be used

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-md space-y-4 text-left">
      {/* Header Info: Status message */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-50 pb-3">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF6500]">
            STATUS PERJALANAN
          </span>
          <h4 className="text-sm font-black text-[#082B5C] mt-0.5">
            {booking.status === 'TALENT_PREPARING' && 'Talent sedang mempersiapkan perjalanan'}
            {booking.status === 'TALENT_ON_THE_WAY' && 'Talent sedang meluncur ke lokasi Anda'}
            {booking.status === 'TALENT_NEARBY' && 'Talent sudah berada di sekitar Anda!'}
            {booking.status === 'TALENT_ARRIVED' && 'Talent telah tiba di titik pertemuan'}
            {booking.status === 'SERVICE_ACTIVE' && 'Layanan sedang aktif berlangsung'}
            {booking.status === 'WAITING_PAYMENT' && 'Menunggu Pembayaran Pesanan'}
            {booking.status === 'PAYMENT_VERIFICATION' && 'Verifikasi Pembayaran Escrow'}
            {booking.status === 'WAITING_MEETING_CONFIRMATION' && 'Menunggu Konfirmasi Pertemuan'}
          </h4>
        </div>
        
        {/* Status Badge */}
        <span className="px-2.5 py-1 bg-orange-50 text-[#FF6500] text-[9px] font-extrabold rounded-full border border-orange-500/10 uppercase tracking-wider">
          {booking.status.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Talent Info & Vehicle Details */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar frame */}
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-[#082B5C] text-sm overflow-hidden shrink-0 shadow-xs">
            RP
          </div>
          <div>
            <h5 className="text-xs font-extrabold text-[#082B5C]">{talentName}</h5>
            <p className="text-[10px] text-gray-400 font-bold mt-0.5">
              {vehicleName} • <span className="font-extrabold text-gray-500">{vehicleNumber}</span>
            </p>
          </div>
        </div>

        {/* ETA & Distance stats */}
        <div className="text-right shrink-0">
          <div className="text-xs font-black text-[#FF6500]">
            {formatETA(etaMinutes)}
          </div>
          <div className="text-[10px] text-gray-400 font-bold mt-0.5">
            Jarak: {formatDistance(distanceKm)}
          </div>
        </div>
      </div>

      {/* Active Location Freshness */}
      <div className="bg-slate-50 rounded-2xl px-3 py-2 flex items-center justify-between text-[10px] text-gray-500 font-medium border border-slate-100/50">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Sinyal GPS Talent Baik
        </span>
        <span>Diperbarui {lastUpdatedText}</span>
      </div>

      {/* Primary Action Buttons: Call, Chat, SOS Help */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        <button
          onClick={onOpenChat}
          className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-[#082B5C] text-xs font-bold rounded-xl border border-slate-200/50 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
        >
          <MessageSquare size={14} className="text-[#082B5C]" />
          <span>Chat</span>
        </button>

        <button
          onClick={onCallMasked}
          className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-[#082B5C] text-xs font-bold rounded-xl border border-slate-200/50 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
        >
          <Phone size={14} className="text-[#082B5C]" />
          <span>Telepon</span>
        </button>

        <button
          onClick={onOpenHelp}
          className="py-2.5 px-3 bg-red-50 hover:bg-red-100 text-[#E5484D] text-xs font-bold rounded-xl border border-red-200/30 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
        >
          <ShieldAlert size={14} className="text-[#E5484D]" />
          <span>Bantuan</span>
        </button>
      </div>
    </div>
  );
}
