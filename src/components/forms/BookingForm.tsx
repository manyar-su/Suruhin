import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Clock, MapPin, Notebook, User, Calculator, ArrowRight } from 'lucide-react';
import { Service, Talent } from '../../types';
import { formatCurrency } from '../../lib/formatCurrency';
import { generateOrderId } from '../../lib/utils';
import { generateBookingMessage, generateWhatsAppUrl } from '../../lib/whatsapp';
import { Button } from '../shared/Button';
import { FallbackImage } from '../shared/FallbackImage';
import { useTalentCatalog } from '../../hooks/useTalentCatalog';
import { getTalentAvatarPath } from '../../lib/assetPaths';
import { firstValidationError, validatePhone, validateRequiredText } from '../../lib/validation/forms';

interface BookingFormProps {
  service: Service;
  selectedTalentSlug?: string;
  onSuccess?: () => void;
}

export function BookingForm({ service, selectedTalentSlug, onSuccess }: BookingFormProps) {
  const talents = useTalentCatalog();

  // Find matching talents for this service
  const matchingTalents = useMemo(() => {
    return talents.filter((t) => t.services.includes(service.slug) && t.available);
  }, [service.slug, talents]);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [duration, setDuration] = useState(1); // Hours or sessions
  const [locationAddress, setLocationAddress] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [selectedTalentId, setSelectedTalentId] = useState(() => {
    if (selectedTalentSlug) {
      const match = talents.find(t => t.slug === selectedTalentSlug);
      return match ? match.id : (matchingTalents[0]?.id || '');
    }
    return matchingTalents[0]?.id || '';
  });

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state if selectedTalentSlug changes externally
  useEffect(() => {
    if (selectedTalentSlug) {
      const match = talents.find(t => t.slug === selectedTalentSlug);
      if (match) {
        setSelectedTalentId(match.id);
      }
    }
  }, [selectedTalentSlug, talents]);

  useEffect(() => {
    if (matchingTalents.length === 0) {
      setSelectedTalentId('');
      return;
    }

    if (!matchingTalents.some((talent) => talent.id === selectedTalentId)) {
      setSelectedTalentId(matchingTalents[0].id);
    }
  }, [matchingTalents, selectedTalentId]);

  // Selected Talent Object
  const selectedTalent = useMemo(() => {
    return talents.find((t) => t.id === selectedTalentId);
  }, [selectedTalentId]);

  // Price Calculations
  const platformFee = 5000; // Flat platform fee
  const servicePriceTotal = service.price * duration;
  const grandTotal = servicePriceTotal + platformFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const validationError = firstValidationError(
      validateRequiredText(customerName, 'Nama lengkap harus diisi.'),
      validatePhone(customerPhone),
      validateRequiredText(bookingDate, 'Silakan pilih tanggal pelaksanaan.'),
      validateRequiredText(bookingTime, 'Silakan tentukan jam mulai.'),
      validateRequiredText(locationAddress, 'Alamat lengkap lokasi pelaksanaan harus diisi.'),
      validateRequiredText(selectedTalentId, 'Silakan pilih Talent pendamping.')
    );

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSubmitting(true);

    // Simulate order placement
    setTimeout(() => {
      const orderId = generateOrderId();
      const payload = {
        orderId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        serviceTitle: service.title,
        talentName: selectedTalent?.name || 'Talent Rekomendasi Suruhin',
        date: bookingDate,
        time: bookingTime,
        duration: `${duration} ${service.slug.includes('antar') ? 'Sesi/Jarak' : 'Jam'}`,
        location: locationAddress.trim(),
        notes: additionalNotes.trim(),
        price: servicePriceTotal,
        platformFee,
        total: grandTotal
      };

      const message = generateBookingMessage(payload);
      const url = generateWhatsAppUrl(message);

      // Open WhatsApp in new tab
      window.open(url, '_blank', 'noopener,noreferrer');
      
      setIsSubmitting(false);
      if (onSuccess) {
        onSuccess();
      }
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      {formError && (
        <div className="p-4 bg-red-50 border border-red-200 text-[#E5484D] text-xs font-bold rounded-2xl flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E5484D]" />
          <span>{formError}</span>
        </div>
      )}

      {/* Step 1: Data Pemesan */}
      <div className="space-y-4">
        <h4 className="text-sm font-black text-[#082B5C] border-l-3 border-[#FF6500] pl-2 uppercase tracking-wider">
          1. Data Diri Pemesan
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
              Nama Lengkap
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-[#172033] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
              No. WhatsApp Aktif
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Contoh: 08123456789"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-[#172033] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500] transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Jadwal & Durasi */}
      <div className="space-y-4">
        <h4 className="text-sm font-black text-[#082B5C] border-l-3 border-[#FF6500] pl-2 uppercase tracking-wider">
          2. Atur Jadwal & Durasi
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
              Pilih Tanggal
            </label>
            <div className="relative">
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
              Jam Mulai
            </label>
            <div className="relative">
              <input
                type="time"
                required
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
              {service.slug.includes('antar') ? 'Sesi/Jarak Pengantaran' : 'Durasi Bantuan (Jam)'}
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDuration(Math.max(1, duration - 1))}
                className="w-11 h-11 bg-slate-100 hover:bg-slate-200 text-[#082B5C] font-bold rounded-xl flex items-center justify-center cursor-pointer select-none"
              >
                -
              </button>
              <span className="w-10 text-center font-bold text-[#082B5C]">{duration}</span>
              <button
                type="button"
                onClick={() => setDuration(Math.min(12, duration + 1))}
                className="w-11 h-11 bg-slate-100 hover:bg-slate-200 text-[#082B5C] font-bold rounded-xl flex items-center justify-center cursor-pointer select-none"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: Lokasi & Catatan */}
      <div className="space-y-4">
        <h4 className="text-sm font-black text-[#082B5C] border-l-3 border-[#FF6500] pl-2 uppercase tracking-wider">
          3. Alamat Lokasi Pertemuan
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
              Alamat Lengkap (Tasikmalaya & Sekitarnya)
            </label>
            <div className="relative">
              <textarea
                required
                rows={2}
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                placeholder="Contoh: Perum Permata Regency Blok B-12, Cihideung, Kota Tasikmalaya"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-[#172033] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
              Catatan Instruksi Khusus (Opsional)
            </label>
            <div className="relative">
              <textarea
                rows={2}
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Contoh: Tolong bawakan helm anak satu lagi, atau gunakan kemeja sopan."
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-[#172033] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500] transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Step 4: Pilih Talent */}
      <div className="space-y-4">
        <h4 className="text-sm font-black text-[#082B5C] border-l-3 border-[#FF6500] pl-2 uppercase tracking-wider">
          4. Pilih Talent Suruhin
        </h4>
        {matchingTalents.length > 0 ? (
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-gray-500 uppercase">
              Pilih Mitra yang Tersedia untuk Layanan Ini
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
              {matchingTalents.map((t) => {
                const isSelected = t.id === selectedTalentId;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTalentId(t.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                      isSelected
                        ? 'bg-orange-50/40 border-[#FF6500] shadow-sm'
                        : 'bg-slate-50 border-slate-100 hover:bg-slate-100/70 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white border border-slate-200 overflow-hidden shrink-0 shadow-sm">
                        <FallbackImage
                          src={getTalentAvatarPath(t.avatar, t.name)}
                          alt={t.name}
                          type="talent"
                          gender={t.gender}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-1.5">
                          <h5 className="text-xs font-extrabold text-[#082B5C]">{t.name}</h5>
                          {t.verified && (
                            <span className="text-[9px] bg-blue-100 text-blue-800 px-1 py-0.2 rounded-sm font-bold">
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {t.gender} • {t.age} Thn • {t.rating.toFixed(1)} ★ ({t.reviewCount} Ulasan)
                        </p>
                      </div>
                    </div>
                    
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                      isSelected
                        ? 'bg-[#FF6500] border-[#FF6500] text-white'
                        : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <span className="text-[10px] font-black">✓</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 text-[#FF6500] text-xs font-semibold">
            Semua talent spesialis untuk layanan ini sedang sibuk. Silakan lakukan pemesanan, tim admin kami akan mencarikan Talent alternatif via WhatsApp.
          </div>
        )}
      </div>

      {/* Step 5: Ringkasan Biaya */}
      <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
        <h4 className="text-xs font-bold text-[#082B5C] uppercase tracking-wider flex items-center gap-1.5 mb-1">
          <Calculator size={14} className="text-[#FF6500]" /> Ringkasan Pembayaran
        </h4>
        
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-gray-500">
            <span>Harga Layanan ({duration} x {formatCurrency(service.price)})</span>
            <span className="font-bold text-[#172033]">{formatCurrency(servicePriceTotal)}</span>
          </div>
          <div className="flex items-center justify-between text-gray-500">
            <span>Biaya Layanan Platform (Flat)</span>
            <span className="font-bold text-[#172033]">{formatCurrency(platformFee)}</span>
          </div>
          <div className="border-t border-gray-200 pt-3 flex items-center justify-between text-sm">
            <span className="font-extrabold text-[#082B5C]">Total Pembayaran</span>
            <span className="font-black text-lg text-[#FF6500]">{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Final Action Button */}
      <Button
        type="submit"
        variant="primary"
        loading={isSubmitting}
        fullWidth
        className="font-extrabold text-base shadow-xl shadow-orange-500/15"
      >
        <span>Konfirmasi & Hubungi Admin WhatsApp</span>
        <ArrowRight size={18} className="ml-2 animate-pulse" />
      </Button>

      <p className="text-[10px] text-gray-400 text-center leading-relaxed">
        *Setelah klik tombol di atas, detail pesanan akan disiapkan otomatis dan Anda akan diarahkan langsung ke WhatsApp Official Suruhin untuk konfirmasi ketersediaan kilat.
      </p>
    </form>
  );
}
