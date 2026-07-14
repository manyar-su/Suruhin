import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

interface LostConnectionNoticeProps {
  lostSinceMinutes?: number;
  onRetry?: () => void;
}

export function LostConnectionNotice({
  lostSinceMinutes = 3,
  onRetry
}: LostConnectionNoticeProps) {
  return (
    <div className="p-4 bg-red-50/80 border border-red-100 text-red-800 text-xs font-semibold rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
      <div className="flex items-start gap-2.5">
        <WifiOff size={16} className="text-red-600 shrink-0 mt-0.5 sm:mt-0" />
        <div>
          <h5 className="font-bold text-red-900">Koneksi GPS Terputus</h5>
          <p className="text-[10px] text-red-700/80 mt-0.5 leading-relaxed font-medium">
            Lokasi talent belum dapat diperbarui secara real-time. Lokasi terakhir tercatat sekitar {lostSinceMinutes} menit yang lalu.
          </p>
        </div>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-extrabold flex items-center gap-1 shrink-0 cursor-pointer shadow-xs transition-colors"
        >
          <RefreshCw size={10} className="animate-spin" style={{ animationDuration: '4s' }} />
          <span>Hubungkan Ulang</span>
        </button>
      )}
    </div>
  );
}
