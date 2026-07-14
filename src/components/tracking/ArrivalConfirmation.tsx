import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import { Button } from '../shared/Button';

interface ArrivalConfirmationProps {
  distanceMeters: number;
  onConfirmArrival: (notes?: string) => void;
  isSubmitting?: boolean;
}

export function ArrivalConfirmation({
  distanceMeters,
  onConfirmArrival,
  isSubmitting = false
}: ArrivalConfirmationProps) {
  const [gpsInaccurate, setGpsInaccurate] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const isValidRadius = distanceMeters <= 150;

  const handleArrivalClick = () => {
    setError('');
    
    if (!isValidRadius && !gpsInaccurate) {
      setError(`Anda berada ${Math.round(distanceMeters)}m dari lokasi. Radius kedatangan maksimal adalah 150m.`);
      return;
    }

    if (gpsInaccurate && !reason.trim()) {
      setError('Harap masukkan alasan ketidakakuratan GPS terlebih dahulu.');
      return;
    }

    onConfirmArrival(gpsInaccurate ? `GPS bermasalah. Alasan: ${reason}` : undefined);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-md text-left space-y-4">
      <div className="space-y-1">
        <h4 className="text-sm font-black text-[#082B5C] uppercase tracking-wider border-l-3 border-[#FF6500] pl-2">
          Konfirmasi Kedatangan Talent
        </h4>
        <p className="text-[10px] text-gray-500 font-medium">
          Tekan tombol di bawah jika Anda sudah sampai di titik pertemuan dan siap menemui pengguna.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-[#E5484D] text-[10px] font-bold rounded-xl flex items-center gap-1.5">
          <AlertTriangle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* GPS Radius Validation Status */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
        isValidRadius 
          ? 'bg-emerald-50/50 border-emerald-500/10 text-emerald-800' 
          : 'bg-amber-50/60 border-amber-500/10 text-amber-800'
      }`}>
        <div className="space-y-0.5">
          <div className="text-xs font-extrabold flex items-center gap-1">
            {isValidRadius ? '📍 RADIUS KEDATANGAN VALID' : '⚠️ DI LUAR RADIUS LAYANAN'}
          </div>
          <p className="text-[9px] opacity-80 font-bold">
            Jarak Anda ke titik pertemuan: {Math.round(distanceMeters)} meter
          </p>
        </div>
        <span className={`px-2 py-0.5 text-[9px] font-black rounded-md ${
          isValidRadius ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
        }`}>
          {isValidRadius ? 'SIAP' : 'MIN 150M'}
        </span>
      </div>

      {/* Bypass GPS inaccurate toggle */}
      {!isValidRadius && (
        <div className="space-y-3 pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={gpsInaccurate}
              onChange={(e) => {
                setGpsInaccurate(e.target.checked);
                setError('');
              }}
              className="rounded border-slate-300 text-[#FF6500] focus:ring-[#FF6500]"
            />
            <span className="text-[10px] text-gray-500 font-bold">
              GPS Tidak Akurat? Berikan alasan kedatangan manual
            </span>
          </label>

          {gpsInaccurate && (
            <textarea
              rows={2}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Sebutkan patokan/alasan (misal: Sinyal buruk, saya sudah berdiri di depan pintu utama Alun-Alun)"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500] transition-all"
            />
          )}
        </div>
      )}

      {/* Trigger Button */}
      <Button
        onClick={handleArrivalClick}
        variant="primary"
        loading={isSubmitting}
        fullWidth
        className="font-extrabold text-xs py-3"
      >
        <CheckCircle2 size={15} className="mr-1" />
        <span>SAYA SUDAH TIBA DI TITIK PERTEMUAN</span>
      </Button>
    </div>
  );
}
