import React, { useState } from 'react';
import { ShieldAlert, Phone, HelpCircle, X, ShieldCheck } from 'lucide-react';
import { Button } from '../shared/Button';

interface EmergencyButtonProps {
  bookingId: string;
  onRaiseIncident: (type: string, desc: string) => void;
  isSubmitting?: boolean;
}

export function EmergencyButton({
  bookingId,
  onRaiseIncident,
  isSubmitting = false
}: EmergencyButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [incidentType, setIncidentType] = useState('Merasa tidak aman');
  const [desc, setDesc] = useState('');
  const [reported, setReported] = useState(false);

  const handleSubmit = () => {
    onRaiseIncident(incidentType, desc);
    setReported(true);
    setShowConfirm(false);
  };

  return (
    <div className="text-left w-full">
      {/* Red Floating or Block Emergency SOS trigger */}
      <button
        onClick={() => {
          setShowConfirm(true);
          setReported(false);
        }}
        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-500/10 active:scale-95 transition-all uppercase tracking-wider"
      >
        <ShieldAlert size={16} className="animate-pulse" />
        <span>Bantuan Darurat (SOS)</span>
      </button>

      {/* Confirmation and reporting dialog popups */}
      {showConfirm && (
        <div className="fixed inset-0 bg-red-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl border border-red-100 text-center space-y-4 animate-scale-up">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-red-600 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert size={18} /> DARURAT (SOS)
              </h3>
              <button
                onClick={() => setShowConfirm(false)}
                className="p-1 hover:bg-slate-50 text-gray-400 rounded-full cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="text-xs text-gray-500 leading-relaxed">
              Anda akan mengirimkan peringatan darurat ke admin Suruhin. Mohon konfirmasi alasan bantuan di bawah ini.
            </div>

            {/* Selector list */}
            <div className="space-y-3 pt-2 text-left">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">
                  Jenis Kendala Darurat
                </label>
                <select
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs text-[#172033] focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="Merasa tidak aman">Merasa tidak aman</option>
                  <option value="Talent atau pengguna tidak sesuai identitas">Talent atau pengguna tidak sesuai identitas</option>
                  <option value="Pelecehan">Pelecehan / Tindak kekerasan</option>
                  <option value="Ancaman">Ancaman</option>
                  <option value="Kecelakaan">Kecelakaan di jalan</option>
                  <option value="Masalah lokasi">Salah alamat / Tersesat</option>
                  <option value="Masalah lainnya">Masalah lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">
                  Deskripsi Singkat (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Contoh: Saya terjatuh dari motor / Saya merasa terancam dengan perkataannya..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-[#172033] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            {/* Emergency Hotline Details */}
            <div className="p-3.5 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-between gap-2">
              <div className="text-left space-y-0.5">
                <span className="text-[8px] font-bold text-red-500 uppercase tracking-wider block">Hotline Polresta Tasikmalaya</span>
                <span className="text-sm font-black text-red-700 font-mono">(0265) 331110</span>
              </div>
              <a
                href="tel:0265331110"
                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md cursor-pointer transition-colors"
              >
                <Phone size={14} />
              </a>
            </div>

            {/* Confirm buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setShowConfirm(false)}
                className="py-2.5 bg-slate-50 hover:bg-slate-100 text-gray-500 font-bold text-xs rounded-xl cursor-pointer"
              >
                Batalkan
              </button>
              <Button
                onClick={handleSubmit}
                variant="danger"
                loading={isSubmitting}
                className="font-extrabold text-xs py-2.5"
              >
                KIRIM ALERT SOS
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success reporting notice banner */}
      {reported && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-2xl flex items-start gap-2.5 mt-3 animate-scale-up">
          <ShieldAlert size={16} className="text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h5 className="font-bold">Laporan Darurat Dikirim!</h5>
            <p className="text-[10px] text-red-700 leading-relaxed font-semibold">
              Sinyal bantuan darurat, koordinat GPS terakhir Anda, dan log pemesanan telah dikirimkan ke Tim Admin Pengawas Keselamatan Suruhin. Tim kami akan segera menghubungi Anda.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
