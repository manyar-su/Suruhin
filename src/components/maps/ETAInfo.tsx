import type { ReactNode } from 'react';
import { Clock3, MapPinned, Route } from 'lucide-react';

interface ETAInfoProps {
  distanceKm: number | null;
  etaMinutes: number | null;
  isLoading?: boolean;
  statusDescription: string;
  statusLabel: string;
}

export function ETAInfo({ distanceKm, etaMinutes, isLoading = false, statusDescription, statusLabel }: ETAInfoProps) {
  return (
    <div className="rounded-[28px] border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FF6500]">Tracking perjalanan</p>
          <h3 className="mt-2 text-lg font-black text-[#082B5C]">{statusLabel}</h3>
          <p className="mt-1 text-xs text-[#172033]/70 leading-relaxed">{statusDescription}</p>
        </div>
        <div className="grid min-w-[180px] grid-cols-2 gap-3">
          <MetricCard
            icon={<Route size={15} className="text-[#FF6500]" />}
            label="Jarak"
            value={isLoading ? 'Menghitung...' : distanceKm === null ? '-' : `${distanceKm.toFixed(2)} km`}
          />
          <MetricCard
            icon={<Clock3 size={15} className="text-[#082B5C]" />}
            label="ETA"
            value={isLoading ? 'Menghitung...' : etaMinutes === null ? '-' : `${etaMinutes} menit`}
          />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-[11px] font-semibold text-[#082B5C]">
        <MapPinned size={14} className="text-[#18A957]" />
        <span>Tracking aktif hanya saat booking sedang berjalan, lalu dihentikan otomatis setelah selesai.</span>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</span>
      </div>
      <div className="text-sm font-black text-[#082B5C]">{value}</div>
    </div>
  );
}
