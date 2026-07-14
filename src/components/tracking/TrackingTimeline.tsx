import React from 'react';
import { CheckCircle2, Clock, Circle, ArrowDown } from 'lucide-react';
import { BookingStatus } from '../../types';

interface TrackingTimelineProps {
  currentStatus: BookingStatus;
  statusHistory?: { newStatus: BookingStatus; createdAt: string; notes?: string }[];
}

interface Step {
  status: BookingStatus;
  label: string;
  desc: string;
}

export function TrackingTimeline({
  currentStatus,
  statusHistory = []
}: TrackingTimelineProps) {
  
  // High level workflow steps
  const steps: Step[] = [
    { status: 'WAITING_PAYMENT', label: 'Belum Dibayar', desc: 'Menunggu pembayaran dari pelanggan' },
    { status: 'PAID', label: 'Pembayaran Diterima', desc: 'Dana ditahan aman di escrow Suruhin' },
    { status: 'TALENT_ACCEPTED', label: 'Talent Dikonfirmasi', desc: 'Pesanan diterima oleh mitra talent' },
    { status: 'TALENT_ON_THE_WAY', label: 'Dalam Perjalanan', desc: 'Talent meluncur ke titik pertemuan Anda' },
    { status: 'TALENT_ARRIVED', label: 'Talent Tiba', desc: 'Verifikasi pertemuan dengan PIN keamanan' },
    { status: 'SERVICE_ACTIVE', label: 'Layanan Aktif', desc: 'Layanan sedang berlangsung, timer berjalan' },
    { status: 'COMPLETED', label: 'Selesai', desc: 'Layanan selesai dan dana escrow dirilis' }
  ];

  // Helper to find step indexes
  const currentStepIdx = steps.findIndex(s => s.status === currentStatus) === -1
    ? (currentStatus === 'TALENT_NEARBY' ? 3 : (currentStatus === 'WAITING_MEETING_CONFIRMATION' ? 4 : steps.length - 2))
    : steps.findIndex(s => s.status === currentStatus);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm text-left space-y-4">
      <h3 className="text-sm font-black text-[#082B5C] uppercase tracking-wider border-l-3 border-[#FF6500] pl-2">
        Timeline Alur Pemesanan
      </h3>

      <div className="relative border-l border-slate-100 pl-6 ml-3 space-y-6">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStepIdx || currentStatus === 'COMPLETED';
          const isCurrent = idx === currentStepIdx && currentStatus !== 'COMPLETED';
          
          return (
            <div key={idx} className="relative group">
              {/* Timeline Indicator Node */}
              <div className="absolute -left-[31px] top-0.5">
                {isCompleted ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
                    ✓
                  </div>
                ) : isCurrent ? (
                  <div className="w-5 h-5 rounded-full bg-[#FF6500] text-white flex items-center justify-center font-bold text-xs shadow-md animate-pulse">
                    ●
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-slate-100 border-2 border-slate-200 text-gray-400 flex items-center justify-center font-bold text-xs">
                    
                  </div>
                )}
              </div>

              {/* Step Text Details */}
              <div className="space-y-1">
                <h4 className={`text-xs font-extrabold ${isCurrent ? 'text-[#FF6500]' : isCompleted ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {step.label}
                </h4>
                <p className="text-[10px] text-gray-400 font-medium">
                  {step.desc}
                </p>
                
                {/* Simulated timestamp if recorded */}
                {isCompleted && (
                  <span className="text-[9px] text-gray-300 font-semibold block">
                    Selesai diverifikasi otomatis
                  </span>
                )}
                {isCurrent && (
                  <span className="text-[9px] text-[#FF6500] font-bold block animate-pulse">
                    Sedang diproses...
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
