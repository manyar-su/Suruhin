import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';

interface ServiceModerationNoticeProps {
  status: string;
  rejectionReason?: string;
  moderationNotes?: string;
}

export function ServiceModerationNotice({ status, rejectionReason, moderationNotes }: ServiceModerationNoticeProps) {
  if (status === 'REJECTED' && rejectionReason) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex gap-3 text-left">
        <ShieldAlert className="text-rose-500 shrink-0 mt-0.5" size={18} />
        <div className="space-y-1">
          <h4 className="text-xs font-black text-rose-800 uppercase tracking-wider">Jasa Ditolak Admin</h4>
          <p className="text-[11px] text-rose-700 font-medium leading-relaxed">
            Alasan penolakan: <span className="italic font-bold">"{rejectionReason}"</span>
          </p>
          <p className="text-[10px] text-rose-500">
            Silakan perbaiki data di atas sesuai dengan catatan admin, lalu ajukan kembali untuk peninjauan ulang.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'PENDING_REVIEW') {
    return (
      <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 text-left">
        <Info className="text-amber-500 shrink-0 mt-0.5" size={18} />
        <div className="space-y-0.5">
          <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider">Sedang Ditinjau</h4>
          <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
            Jasa layanan Anda sedang masuk antrean moderasi dan diperiksa secara berkala oleh tim Admin Suruhin.
          </p>
          <p className="text-[9px] text-amber-500">
            Proses verifikasi biasanya memakan waktu maksimal 1x24 jam kerja.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
