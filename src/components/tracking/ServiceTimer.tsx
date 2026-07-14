import React, { useState, useEffect } from 'react';
import { Clock, Plus, Hourglass, CheckSquare, AlertCircle } from 'lucide-react';
import { Button } from '../shared/Button';
import { Booking } from '../../types';

interface ServiceTimerProps {
  booking: Booking;
  onExtendRequest?: (minutes: number) => void;
  onCompleteService?: () => void;
  role: 'customer' | 'talent' | 'admin';
  isSubmitting?: boolean;
}

export function ServiceTimer({
  booking,
  onExtendRequest,
  onCompleteService,
  role,
  isSubmitting = false
}: ServiceTimerProps) {
  // We simulate a countdown timer for active services
  const durationMinutes = booking.bookedDurationMinutes || (booking.duration * 60) || 120;
  const [minutesLeft, setMinutesLeft] = useState(durationMinutes);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    // Tick down simulated remaining time
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev === 0) {
          setMinutesLeft(m => {
            if (m === 0) {
              clearInterval(timer);
              return 0;
            }
            return m - 1;
          });
          return 59;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time display: "01:24:16"
  const formatTime = (mins: number, secs: number) => {
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${pad(hrs)}:${pad(m)}:${pad(secs)}`;
  };

  // Extension custom prompt
  const [showExtendInput, setShowExtendInput] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('30');

  const handleExtendClick = (m: number) => {
    if (onExtendRequest) {
      onExtendRequest(m);
      setShowExtendInput(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-md text-left space-y-5">
      {/* Icon and title header */}
      <div className="flex items-center justify-between border-b border-slate-50 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
            <Hourglass className="animate-spin" style={{ animationDuration: '6s' }} size={18} />
          </div>
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">
              Layanan Berlangsung
            </h4>
            <span className="text-[10px] text-gray-400 font-bold block mt-0.5">
              Timer durasi berjalan akurat
            </span>
          </div>
        </div>

        <span className="px-3 py-1 bg-emerald-50 text-[#18A957] border border-emerald-100 text-[10px] font-black rounded-full uppercase tracking-wider">
          AKTIF
        </span>
      </div>

      {/* Countdown Timer Center Stage */}
      <div className="text-center py-5 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2">
        <span className="text-[9px] font-extrabold uppercase tracking-widest text-gray-400">
          Waktu Tersisa Layanan
        </span>
        <div className="text-4xl font-black text-[#082B5C] font-mono tracking-widest">
          {formatTime(minutesLeft, secondsLeft)}
        </div>
        
        <div className="flex items-center justify-center gap-5 text-[10px] text-gray-400 font-semibold pt-1">
          <div>Dimulai: <span className="font-extrabold text-[#082B5C]">{booking.time || '13:05'}</span></div>
          <div className="border-l border-slate-200 h-3" />
          <div>Durasi Dipesan: <span className="font-extrabold text-[#082B5C]">{booking.duration} Jam</span></div>
        </div>
      </div>

      {/* Action triggers depending on role */}
      <div className="space-y-3">
        
        {/* Complete service action (for talent to submit, customer to confirm) */}
        {role === 'talent' && (
          <Button
            onClick={onCompleteService}
            variant="success"
            loading={isSubmitting}
            fullWidth
            className="font-extrabold text-xs py-3 shadow-lg shadow-emerald-500/10"
          >
            <CheckSquare size={15} className="mr-1" />
            <span>KONFIRMASI LAYANAN TELAH SELESAI</span>
          </Button>
        )}

        {/* Extensions Request forms */}
        <div className="space-y-2.5">
          <button
            onClick={() => setShowExtendInput(!showExtendInput)}
            className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-[#082B5C] text-xs font-bold rounded-xl border border-slate-200/50 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <Plus size={14} className="text-[#082B5C]" />
            <span>Ajukan Perpanjangan Waktu (Service Extension)</span>
          </button>

          {showExtendInput && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 animate-scale-up">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Pilih Durasi Tambahan
              </label>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleExtendClick(30)}
                  className="py-2 bg-white hover:bg-orange-50 hover:text-[#FF6500] hover:border-[#FF6500] text-gray-600 font-extrabold text-[10px] rounded-lg border border-slate-200 cursor-pointer transition-all"
                >
                  +30 Menit
                </button>
                <button
                  onClick={() => handleExtendClick(60)}
                  className="py-2 bg-white hover:bg-orange-50 hover:text-[#FF6500] hover:border-[#FF6500] text-gray-600 font-extrabold text-[10px] rounded-lg border border-slate-200 cursor-pointer transition-all"
                >
                  +1 Jam
                </button>
                <button
                  onClick={() => handleExtendClick(120)}
                  className="py-2 bg-white hover:bg-orange-50 hover:text-[#FF6500] hover:border-[#FF6500] text-gray-600 font-extrabold text-[10px] rounded-lg border border-slate-200 cursor-pointer transition-all"
                >
                  +2 Jam
                </button>
              </div>

              {/* Custom input */}
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  placeholder="Durasi custom (menit)"
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-[#172033] w-full focus:outline-none focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500]"
                />
                <button
                  onClick={() => handleExtendClick(Number(customMinutes) || 30)}
                  className="bg-[#FF6500] hover:bg-[#e05900] text-white px-4 py-1.5 text-xs font-bold rounded-lg shrink-0 cursor-pointer transition-colors"
                >
                  Ajukan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
