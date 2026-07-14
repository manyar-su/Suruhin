import React, { useState } from 'react';
import { Mail, Phone, Lock, User, KeyRound, Sparkles, CheckCircle } from 'lucide-react';
import { Button } from '../shared/Button';
import { Talent } from '../../types';
import { talents } from '../../data/talents';

interface AuthFormProps {
  initialMode?: 'login' | 'register';
  onSuccess: (user: Talent) => void;
}

export function AuthForm({ initialMode = 'login', onSuccess }: AuthFormProps) {
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!loginPhone.trim() || loginPhone.length < 9) {
      setError('Nomor WhatsApp tidak valid.');
      return;
    }
    if (!loginPassword.trim() || loginPassword.length < 4) {
      setError('Password PIN harus minimal 4 digit.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsDone(true);
      
      // Look for a custom registered talent, or default to the first mock talent (Rizky Pratama)
      const savedCustom = localStorage.getItem('suruhin_custom_talent');
      let loggedUser: Talent = talents[0]; // Default: Rizky Pratama
      if (savedCustom) {
        try {
          loggedUser = JSON.parse(savedCustom);
        } catch (e) {
          console.error(e);
        }
      }
      
      localStorage.setItem('suruhin_user', JSON.stringify(loggedUser));
      setTimeout(() => {
        onSuccess(loggedUser);
      }, 1000);
    }, 1000);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!registerName.trim()) {
      setError('Nama lengkap wajib diisi.');
      return;
    }
    if (!registerPhone.trim() || registerPhone.length < 9) {
      setError('Nomor WhatsApp tidak valid.');
      return;
    }
    if (!registerPassword.trim() || registerPassword.length < 4) {
      setError('Password PIN harus minimal 4 digit.');
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

      localStorage.setItem('suruhin_custom_talent', JSON.stringify(newTalentUser));
      localStorage.setItem('suruhin_user', JSON.stringify(newTalentUser));

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
        <p className="text-xs text-gray-500">Menghubungkan sesi aman Anda...</p>
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
      )}
    </div>
  );
}
