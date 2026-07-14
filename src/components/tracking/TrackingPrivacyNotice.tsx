import React from 'react';
import { Lock, ShieldCheck, EyeOff } from 'lucide-react';

export function TrackingPrivacyNotice() {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 text-left space-y-3.5">
      <div className="flex items-center gap-2">
        <Lock size={15} className="text-[#FF6500]" />
        <h4 className="text-xs font-black text-[#082B5C] uppercase tracking-wider">
          Perlindungan Privasi Lokasi Suruhin
        </h4>
      </div>

      <p className="text-[10px] text-gray-500 leading-relaxed font-semibold">
        Suruhin menjunjung tinggi keamanan data lokasi Anda secara maksimal:
      </p>

      <ul className="space-y-2 text-[10px] text-gray-400 font-bold">
        <li className="flex items-start gap-2">
          <ShieldCheck size={12} className="text-emerald-500 shrink-0 mt-0.5" />
          <span>Lokasi hanya dibagikan selama pesanan aktif untuk membantu proses pertemuan dan menjaga keamanan.</span>
        </li>
        <li className="flex items-start gap-2">
          <ShieldCheck size={12} className="text-emerald-500 shrink-0 mt-0.5" />
          <span>Pelacakan otomatis dihentikan dan dimatikan sepenuhnya setelah status pesanan selesai (COMPLETED) atau dibatalkan.</span>
        </li>
        <li className="flex items-start gap-2">
          <EyeOff size={12} className="text-emerald-500 shrink-0 mt-0.5" />
          <span>Alamat lengkap rumah Anda dilindungi dan tidak ditampilkan sebelum pembayaran pesanan dikonfirmasi oleh server.</span>
        </li>
      </ul>

      <p className="text-[9px] text-gray-400 italic">
        *Sesuai dengan kebijakan retensi data, riwayat detail pergerakan GPS akan dihapus permanen dari server kami dalam 7 hari.
      </p>
    </div>
  );
}
