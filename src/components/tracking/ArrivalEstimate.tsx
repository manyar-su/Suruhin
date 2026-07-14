import React from 'react';
import { Clock, MapPin, Calendar } from 'lucide-react';
import { formatETA } from '../../lib/maps/eta';
import { formatDistance } from '../../lib/maps/distance';

interface ArrivalEstimateProps {
  distanceKm: number;
  etaMinutes: number;
  meetingPlaceName?: string;
  bookedTimeText?: string;
}

export function ArrivalEstimate({
  distanceKm,
  etaMinutes,
  meetingPlaceName = 'Titik Pertemuan',
  bookedTimeText = 'Hari Ini'
}: ArrivalEstimateProps) {
  return (
    <div className="bg-gradient-to-br from-[#082B5C] to-[#0A3D80] text-white p-5 rounded-3xl shadow-md space-y-4 text-left">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-orange-400">
            ESTIMASI KEDATANGAN
          </span>
          <h4 className="text-xl font-black mt-1">
            {formatETA(etaMinutes)}
          </h4>
          <p className="text-[10px] text-slate-300 font-medium mt-1">
            Menuju <span className="font-bold text-white">{meetingPlaceName}</span> ({formatDistance(distanceKm)})
          </p>
        </div>
        <div className="p-3 bg-white/10 rounded-2xl">
          <Clock size={20} className="text-orange-400" />
        </div>
      </div>

      {/* Progress slider visually */}
      <div className="space-y-1">
        <div className="w-full bg-white/10 rounded-full h-1.5 relative overflow-hidden">
          <div
            className="bg-orange-400 h-full rounded-full transition-all duration-1000"
            style={{ width: `${Math.max(10, Math.min(100, 100 - (distanceKm * 15)))}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-slate-300 font-bold">
          <span>Keberangkatan</span>
          <span>Tiba di Lokasi</span>
        </div>
      </div>

      <div className="border-t border-white/10 pt-3 flex items-center gap-4 text-[10px] text-slate-300 font-medium">
        <div className="flex items-center gap-1">
          <Calendar size={12} className="text-orange-400" />
          <span>{bookedTimeText}</span>
        </div>
        <div className="flex items-center gap-1 border-l border-white/10 pl-4">
          <MapPin size={12} className="text-orange-400" />
          <span>Tasikmalaya</span>
        </div>
      </div>
    </div>
  );
}
