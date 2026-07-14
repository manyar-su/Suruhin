import React, { useState } from 'react';
import { KeyRound, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../shared/Button';

interface MeetingPinVerificationProps {
  pinCode: string;
  role: 'customer' | 'talent';
  onVerify: (enteredPin: string) => Promise<boolean>;
  isSubmitting?: boolean;
}

export function MeetingPinVerification({
  pinCode,
  role,
  onVerify,
  isSubmitting = false
}: MeetingPinVerificationProps) {
  const [enteredPin, setEnteredPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (enteredPin.length !== 6) {
      setError('PIN keamanan harus terdiri dari 6 digit.');
      return;
    }

    const isMatch = await onVerify(enteredPin);
    if (isMatch) {
      setSuccess(true);
    } else {
      setError('PIN salah atau kedaluwarsa. Silakan periksa kembali dengan pelanggan.');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-md text-left space-y-4">
      {/* Icon and Titles */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-[#FF6500] border border-orange-100">
          <KeyRound size={20} />
        </div>
        <div>
          <h4 className="text-sm font-black text-[#082B5C] uppercase tracking-wider">
            Verifikasi Keamanan Pertemuan
          </h4>
          <p className="text-[10px] text-gray-400 font-bold mt-0.5">
            Metode PIN Keamanan Enkripsi Dua Arah
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-[#E5484D] text-[10px] font-bold rounded-xl flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Customer View: Display PIN to give to talent */}
      {role === 'customer' ? (
        <div className="space-y-4 text-center py-4 bg-slate-50/50 rounded-2xl border border-slate-100">
          <div className="space-y-1">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-gray-400">
              BERIKAN PIN INI KEPADA TALENT
            </span>
            <div className="text-3xl font-black text-[#082B5C] tracking-widest py-1 font-mono">
              {pinCode}
            </div>
            <p className="text-[10px] text-gray-500 font-medium px-4 leading-relaxed">
              Tunjukkan atau sebutkan PIN 6-digit di atas saat Anda bertemu dengan talent untuk memulai hitungan layanan secara resmi.
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-1 text-[9px] text-emerald-600 font-bold">
            <ShieldCheck size={12} />
            <span>Mencegah salah orang & melindungi asuransi pesanan</span>
          </div>
        </div>
      ) : (
        /* Talent View: Form to type customer PIN */
        <form onSubmit={handleVerifySubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase">
              Masukkan PIN dari Pelanggan
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={enteredPin}
              onChange={(e) => {
                // allow digits only
                const val = e.target.value.replace(/\D/g, '');
                setEnteredPin(val);
                setError('');
              }}
              placeholder="Contoh: 482913"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-center text-lg font-black tracking-widest text-[#082B5C] placeholder-gray-300 font-mono focus:outline-none focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500] transition-all"
            />
            <span className="block text-[9px] text-gray-400 font-bold text-center mt-1">
              Jangan memasukkan PIN sembarangan. Batas toleransi adalah 3 kali percobaan salah.
            </span>
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            fullWidth
            className="font-extrabold text-xs py-3"
          >
            <span>VERIFIKASI PIN & MULAI LAYANAN</span>
          </Button>
        </form>
      )}
    </div>
  );
}
