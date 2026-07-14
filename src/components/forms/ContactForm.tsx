import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { Button } from '../shared/Button';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Pertanyaan Umum');
  const [message, setMessage] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Nama lengkap wajib diisi.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Alamat email tidak valid.');
      return;
    }
    if (!phone.trim()) {
      setError('Nomor telepon / WhatsApp wajib diisi.');
      return;
    }
    if (!message.trim()) {
      setError('Pesan tidak boleh kosong.');
      return;
    }

    setIsSubmitting(true);

    // Simulate submission
    setTimeout(() => {
      setIsSubmitted(true);
      setIsSubmitting(false);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    }, 1200);
  };

  if (isSubmitted) {
    return (
      <div className="bg-emerald-50/50 border border-emerald-500/20 p-8 rounded-3xl text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#18A957] text-white flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 size={24} />
        </div>
        <h3 className="text-lg font-black text-[#082B5C]">Pesan Anda Berhasil Terkirim!</h3>
        <p className="text-xs text-gray-600 leading-relaxed max-w-sm mx-auto">
          Terima kasih telah menghubungi kami. Tim Layanan Pelanggan Suruhin akan memproses masukan Anda dan merespons via email atau WhatsApp dalam 24 jam.
        </p>
        <button
          onClick={() => setIsSubmitted(false)}
          className="text-xs font-bold text-[#FF6500] hover:underline cursor-pointer"
        >
          Kirim Pesan Lainnya
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xl space-y-4 text-left">
      <h3 className="text-base font-black text-[#082B5C] border-l-3 border-[#FF6500] pl-2 uppercase tracking-wider mb-2">
        Kirim Pesan Bantuan
      </h3>

      {error && (
        <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100 text-left">
          {error}
        </p>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Nama Lengkap</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Budi Santoso"
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Alamat Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Contoh: budi@email.com"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">No. WhatsApp Aktif</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contoh: 08123456789"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Topik Pertanyaan</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-[#082B5C] font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500]"
          >
            <option value="Pertanyaan Umum">Pertanyaan Umum (Cara Kerja / Layanan)</option>
            <option value="Kerja Sama Mitra">Pendaftaran Mitra & Kemitraan Usaha</option>
            <option value="Keluhan Layanan">Keluhan Terhadap Perilaku Talent / Pengguna</option>
            <option value="Kendala Teknis">Kendala Pembayaran / Penggunaan Sistem</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Isi Pesan Detail</label>
          <textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tuliskan keluhan atau pertanyaan Anda secara lengkap..."
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500]"
          />
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        loading={isSubmitting}
        fullWidth
        className="font-extrabold text-xs tracking-wider uppercase mt-2.5 shadow-md shadow-orange-500/10"
      >
        <span>Kirim Pesan</span>
        <Send size={14} className="ml-2" />
      </Button>
    </form>
  );
}
