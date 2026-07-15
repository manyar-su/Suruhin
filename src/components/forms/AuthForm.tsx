import React, { useState } from 'react';
import { Phone, Lock, User, KeyRound, CheckCircle, ShieldCheck, TimerReset, Search, BriefcaseBusiness, ArrowRight } from 'lucide-react';
import { Button } from '../shared/Button';
import { Talent } from '../../types';
import {
  checkAuthSubmitThrottle,
  checkLoginAttempt,
  clearLoginAttempts,
  createUserSession,
  getFailedAttemptSummary,
  isPhoneAlreadyRegistered,
  normalizePhone,
  recordFailedLogin,
  registerCustomCredential,
  resolveLoginUser,
  upsertCustomTalent,
} from '../../lib/authSession';
import { firstValidationError, validatePhone, validatePin, validateRequiredText } from '../../lib/validation/forms';

interface AuthFormProps {
  initialMode?: 'login' | 'register';
  onSuccess: (user: Talent) => void;
  onSelectRegistrationRole?: (role: 'customer' | 'talent') => void;
}

export function AuthForm({ initialMode = 'login', onSuccess, onSelectRegistrationRole }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Login Form States
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register Form States
  const [registerName, setRegisterName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerGender, setRegisterGender] = useState('Pria');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState('');
  const [securityMessage, setSecurityMessage] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSecurityMessage('');

    const normalizedPhone = normalizePhone(loginPhone);
    const normalizedPin = loginPassword.trim();
    const validationError = firstValidationError(
      validatePhone(loginPhone),
      validatePin(normalizedPin)
    );

    if (validationError) {
      setError(validationError);
      return;
    }

    const throttle = checkAuthSubmitThrottle('login');
    if (!throttle.allowed) {
      setError(throttle.message);
      return;
    }

    const attemptStatus = checkLoginAttempt(normalizedPhone);
    if (!attemptStatus.allowed) {
      setError(attemptStatus.message);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const loggedUser = resolveLoginUser(normalizedPhone, normalizedPin);

      if (!loggedUser) {
        setIsSubmitting(false);
        const guard = recordFailedLogin(normalizedPhone);
        const summary = getFailedAttemptSummary(normalizedPhone);
        if (guard.lockedUntil && summary?.lockMessage) {
          setError(summary.lockMessage);
          return;
        }
        setError(
          summary?.remainingAttempts !== undefined
            ? `Nomor atau PIN tidak cocok. Sisa percobaan: ${summary.remainingAttempts}.`
            : 'Nomor atau PIN tidak cocok.'
        );
        return;
      }

      clearLoginAttempts(normalizedPhone);
      createUserSession(loggedUser);
      setIsSubmitting(false);
      setIsDone(true);
      setSecurityMessage('Sesi aman berhasil dibuat. Aktivitas dashboard akan dipantau otomatis.');
      setTimeout(() => {
        onSuccess(loggedUser);
      }, 1000);
    }, 1000);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSecurityMessage('');

    const normalizedPhone = normalizePhone(registerPhone);
    const normalizedPin = registerPassword.trim();
    const validationError = firstValidationError(
      validateRequiredText(registerName, 'Nama lengkap wajib diisi.'),
      validatePhone(registerPhone),
      validatePin(normalizedPin)
    );

    if (validationError) {
      setError(validationError);
      return;
    }
    if (isPhoneAlreadyRegistered(normalizedPhone)) {
      setError('Nomor ini sudah terdaftar. Silakan masuk menggunakan akun yang ada.');
      return;
    }

    const throttle = checkAuthSubmitThrottle('register');
    if (!throttle.allowed) {
      setError(throttle.message);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsDone(true);

      const newTalentUser: Talent = {
        id: `t-custom-${Date.now()}`,
        slug: registerName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: registerName,
        gender: registerGender as 'Pria' | 'Wanita',
        age: 24,
        location: 'Tawang, Kota Tasikmalaya',
        bio: 'Mitra Talent Suruhin baru yang berdedikasi tinggi, amanah, sopan, dan ramah untuk wilayah Tasikmalaya.',
        avatar: registerGender === 'Wanita' ? 'talent-02.webp' : 'talent-01.webp',
        services: ['titip-belanja-harian', 'antar-barang-lokal', 'bersih-bersih-rumah-kos'],
        skills: ['Sopan Santun', 'Belanja Cepat', 'Kejujuran Utama'],
        languages: ['Bahasa Indonesia', 'Sunda'],
        joinedYear: 2026,
        rating: 5.0,
        reviewCount: 0,
        completedOrders: 0,
        verified: true,
        available: true,
        schedule: [
          { day: 'Senin', time: '08:00 - 17:00', available: true },
          { day: 'Selasa', time: '08:00 - 17:00', available: true },
          { day: 'Rabu', time: '08:00 - 17:00', available: true },
          { day: 'Kamis', time: '08:00 - 17:00', available: true },
          { day: 'Jumat', time: '08:00 - 17:00', available: true },
          { day: 'Sabtu', time: '08:00 - 17:00', available: true },
          { day: 'Minggu', time: '08:00 - 17:00', available: true }
        ]
      };

      upsertCustomTalent(newTalentUser);
      registerCustomCredential(normalizedPhone, normalizedPin, newTalentUser.id);
      createUserSession(newTalentUser);
      setSecurityMessage('Akun baru diamankan dengan sesi aktif dan limit percobaan login.');

      setTimeout(() => {
        onSuccess(newTalentUser);
      }, 1000);
    }, 1000);
  };

  if (isDone) {
    return (
      <div className="py-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#18A957] flex items-center justify-center mx-auto shadow-md">
          <CheckCircle size={24} />
        </div>
        <h3 className="text-lg font-black text-[#082B5C]">
          {mode === 'login' ? 'Masuk Berhasil!' : 'Pendaftaran Sukses!'}
        </h3>
        <p className="text-xs text-gray-500">{securityMessage || 'Menghubungkan sesi aman Anda...'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Selector Tabs */}
      <div className="grid grid-cols-2 bg-slate-50 p-1 rounded-xl border border-slate-100 mb-2">
        <button
          onClick={() => {
            setMode('login');
            setError('');
          }}
          className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            mode === 'login' ? 'bg-white text-[#FF6500] shadow-xs' : 'text-gray-400'
          }`}
        >
          Masuk Akun
        </button>
        <button
          onClick={() => {
            setMode('register');
            setError('');
          }}
          className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            mode === 'register' ? 'bg-white text-[#FF6500] shadow-xs' : 'text-gray-400'
          }`}
        >
          Daftar Baru
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-[#E5484D] text-xs font-bold rounded-xl border border-red-100">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-[#082B5C]/10 bg-[#082B5C]/[0.03] p-3 text-[11px] text-[#082B5C] leading-relaxed space-y-2">
        <div className="flex items-center gap-2 font-bold">
          <ShieldCheck size={14} className="text-[#FF6500]" />
          <span>Proteksi sesi aktif</span>
        </div>
        <div className="flex items-start gap-2">
          <TimerReset size={13} className="mt-0.5 text-[#FF6500] shrink-0" />
          <span>Login dibatasi 5 kali percobaan per 15 menit. Jika gagal terus, akses dikunci sementara 30 menit.</span>
        </div>
        {mode === 'login' && (
          <p className="text-[10px] text-[#082B5C]/70">
            Gunakan nomor WhatsApp dan PIN yang sudah terdaftar pada akun Anda.
          </p>
        )}
      </div>

      {/* LOGIN VIEW */}
      {mode === 'login' ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">No. WhatsApp</label>
            <div className="relative flex items-center bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm">
              <Phone size={16} className="text-gray-400 mr-2.5 shrink-0" />
              <input
                type="tel"
                required
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
                placeholder="Contoh: 08123456789"
                className="w-full bg-transparent text-[#172033] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Password PIN</label>
            <div className="relative flex items-center bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm">
              <Lock size={16} className="text-gray-400 mr-2.5 shrink-0" />
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                inputMode="numeric"
                maxLength={6}
                placeholder="Masukkan PIN rahasia Anda"
                className="w-full bg-transparent text-[#172033] focus:outline-none"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            fullWidth
            className="font-extrabold text-xs tracking-wider uppercase pt-3.5 pb-3.5"
          >
            Masuk Akun
          </Button>
        </form>
      ) : (
        /* REGISTER VIEW */
        onSelectRegistrationRole ? (
          <div className="space-y-4">
            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => onSelectRegistrationRole('customer')}
                className="group rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:border-[#FF6500]/30 hover:bg-orange-50/20"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FF6500]/10 text-[#FF6500]">
                    <Search size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-black text-[#082B5C]">Daftar sebagai Customer</h4>
                    <p className="mt-1 text-[11px] leading-relaxed text-gray-500">Cari talent, buat order, dan pantau layanan.</p>
                  </div>
                  <ArrowRight size={16} className="text-[#FF6500] transition group-hover:translate-x-1" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => onSelectRegistrationRole('talent')}
                className="group rounded-2xl border border-[#082B5C]/10 bg-[#082B5C] p-4 text-left text-white shadow-sm transition hover:bg-[#0b356f]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#FF6500]">
                    <BriefcaseBusiness size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-black">Daftar sebagai Talent</h4>
                    <p className="mt-1 text-[11px] leading-relaxed text-white/70">Ajukan profil, dokumen, jasa, dan tarif.</p>
                  </div>
                  <ArrowRight size={16} className="text-[#FF6500] transition group-hover:translate-x-1" />
                </div>
              </button>
            </div>

            <p className="rounded-2xl bg-slate-50 p-3 text-[10px] leading-relaxed text-gray-500">
              Pendaftaran lengkap dipisahkan agar dokumen customer dan talent tersimpan ke tabel serta bucket Supabase yang benar.
            </p>
          </div>
        ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Nama Lengkap</label>
            <div className="relative flex items-center bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm">
              <User size={16} className="text-gray-400 mr-2.5 shrink-0" />
              <input
                type="text"
                required
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full bg-transparent text-[#172033] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">No. WhatsApp Aktif</label>
            <div className="relative flex items-center bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm">
              <Phone size={16} className="text-gray-400 mr-2.5 shrink-0" />
              <input
                type="tel"
                required
                value={registerPhone}
                onChange={(e) => setRegisterPhone(e.target.value)}
                placeholder="Contoh: 08123456789"
                className="w-full bg-transparent text-[#172033] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Jenis Kelamin</label>
            <div className="grid grid-cols-2 gap-2">
              {['Pria', 'Wanita'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setRegisterGender(g)}
                  className={`py-2.5 text-xs font-bold rounded-lg border transition-all text-center cursor-pointer ${
                    registerGender === g
                      ? 'bg-[#082B5C] border-[#082B5C] text-white'
                      : 'bg-slate-50 border-slate-100 text-[#082B5C]'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Buat Password PIN</label>
            <div className="relative flex items-center bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm">
              <KeyRound size={16} className="text-gray-400 mr-2.5 shrink-0" />
              <input
                type="password"
                required
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                inputMode="numeric"
                maxLength={6}
                placeholder="Buat PIN minimal 4 angka"
                className="w-full bg-transparent text-[#172033] focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50/50 rounded-xl text-[10px] text-gray-500 leading-relaxed">
            *Dengan menekan Daftar, Anda menyetujui seluruh tata krama, hukum adat Priangan, serta sanksi asusila ketat platform Suruhin.
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            fullWidth
            className="font-extrabold text-xs tracking-wider uppercase pt-3.5 pb-3.5"
          >
            Daftar Akun Baru
          </Button>
        </form>
        )
      )}
    </div>
  );
}
