import React from 'react';
import { AlertTriangle, MapPin, RefreshCw } from 'lucide-react';

interface LocationAccuracyWarningProps {
  accuracyMeters?: number;
  onRecalibrate?: () => void;
}

export function LocationAccuracyWarning({
  accuracyMeters = 80,
  onRecalibrate
}: LocationAccuracyWarningProps) {
  if (accuracyMeters < 50) return null; // Good accuracy

  return (
    <div className="p-4 bg-amber-50/70 border border-amber-200 text-amber-800 text-xs font-semibold rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
      <div className="flex items-start gap-2.5">
        <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
        <div>
          <h5 className="font-bold text-amber-900">Akurasi GPS Rendah (~{accuracyMeters}m)</h5>
          <p className="text-[10px] text-amber-700/80 mt-0.5 font-medium leading-relaxed">
            Sinyal GPS perangkat Anda kurang akurat. Pastikan Anda berada di luar ruangan dengan pandangan langit bebas.
          </p>
        </div>
      </div>

      {onRecalibrate && (
        <button
          onClick={onRecalibrate}
          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-extrabold flex items-center gap-1 shrink-0 cursor-pointer shadow-xs transition-colors"
        >
          <RefreshCw size={10} />
          <span>Kalibrasi Ulang</span>
        </button>
      )}
    </div>
  );
}
