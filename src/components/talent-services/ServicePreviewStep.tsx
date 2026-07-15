import { useState } from 'react';
import { Clock, MapPin, Shield, Star, Check, AlertCircle } from 'lucide-react';
import { TalentService, TalentServiceImage, TalentServiceSchedule } from '../../types';
import { formatCurrency } from '../../lib/formatCurrency';

interface ServicePreviewStepProps {
  data: Partial<TalentService>;
}

export function ServicePreviewStep({ data }: ServicePreviewStepProps) {
  const [duration, setDuration] = useState(data.minimumDurationMinutes || 120);

  const basePrice = data.basePrice || 30000;
  const pricingType = data.pricingType || 'HOURLY';

  // Calculate order price simulation
  const hoursCount = duration / 60;
  const serviceFee = pricingType === 'HOURLY' ? basePrice * hoursCount : basePrice;
  const platformFee = Math.round(serviceFee * 0.1); // 10% Platform fee simulation
  const totalReceived = serviceFee - platformFee;

  const primaryImage = data.images?.find(img => img.isPrimary)?.url || (data.images?.[0]?.url || 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=400');

  return (
    <div className="space-y-6 text-left">
      <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-2xl flex items-start gap-2 text-amber-800">
        <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[10px] font-bold leading-normal">
          Ini adalah tampilan pratinjau (preview) interaktif. Anda dapat meninjau bagaimana jasa Anda akan terlihat oleh calon pelanggan, serta mensimulasikan perhitungan pendapatannya.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: Information */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Visual */}
          <div className="aspect-video w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-100 relative shadow-sm">
            <img src={primaryImage} alt={data.title} className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4 bg-[#FF6500] text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md">
              {data.categoryName || 'Layanan Custom'}
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="text-xl font-black text-[#082B5C] tracking-tight">{data.title || 'Judul Layanan Belum Diisi'}</h2>
            <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-bold text-gray-500">
              {data.serviceMode === 'ONLINE' ? (
                <span className="bg-orange-50 text-[#FF6500] px-2 py-0.5 rounded-md font-extrabold uppercase">Virtual Online</span>
              ) : (
                <>
                  <MapPin size={12} className="text-[#FF6500]" />
                  <span>{data.district || 'Kecamatan'}, {data.city || 'Kota Tasikmalaya'}</span>
                  <span className="text-gray-300">•</span>
                  <span>Radius Layanan: {data.serviceRadiusKm || 10} Km</span>
                  {data.serviceMode === 'ONLINE_OFFLINE' && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="bg-blue-50 text-[#082B5C] px-2 py-0.5 rounded-md font-extrabold">Online & Offline</span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-[#082B5C] uppercase tracking-wider">Deskripsi Layanan</h3>
            <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-wrap">
              {data.description || 'Deskripsi lengkap belum diisi.'}
            </p>
          </div>

          <hr className="border-slate-100" />

          {/* Rules / Included & Excluded */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Included */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md inline-block uppercase tracking-wider">SUDAH TERMASUK</h4>
              <ul className="space-y-1">
                {data.includedItems?.map((item, i) => (
                  <li key={i} className="text-xs text-gray-500 flex items-start gap-1.5 leading-relaxed">
                    <Check size={12} className="text-emerald-500 shrink-0 mt-1 font-black" />
                    <span>{item}</span>
                  </li>
                ))}
                {(!data.includedItems || data.includedItems.length === 0) && (
                  <p className="text-[10px] text-gray-400 italic">Belum ditentukan.</p>
                )}
              </ul>
            </div>

            {/* Excluded */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-black text-rose-800 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-md inline-block uppercase tracking-wider">BELUM TERMASUK</h4>
              <ul className="space-y-1">
                {data.excludedItems?.map((item, i) => (
                  <li key={i} className="text-xs text-gray-500 flex items-start gap-1.5 leading-relaxed">
                    <span className="text-rose-500 font-extrabold shrink-0 select-none">•</span>
                    <span>{item}</span>
                  </li>
                ))}
                {(!data.excludedItems || data.excludedItems.length === 0) && (
                  <p className="text-[10px] text-gray-400 italic">Belum ditentukan.</p>
                )}
              </ul>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Schedule */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-[#082B5C] uppercase tracking-wider">Jadwal Operasional Jasa</h3>
            <div className="flex flex-wrap gap-1.5">
              {data.schedules?.filter(s => s.isActive).map((sch) => (
                <div key={sch.id} className="bg-slate-50 border border-slate-100/50 px-2.5 py-1.5 rounded-xl text-center min-w-[70px]">
                  <p className="text-[10px] font-black text-[#082B5C]">{sch.dayName}</p>
                  <p className="text-[9px] text-gray-400 font-bold">{sch.startTime} - {sch.endTime}</p>
                </div>
              ))}
              {(!data.schedules || data.schedules.filter(s => s.isActive).length === 0) && (
                <p className="text-[10px] text-gray-400 italic">Belum menentukan jadwal operasional.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Interactive Booking Calculator Widget */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4">
            <div className="flex items-baseline justify-between border-b border-slate-50 pb-3">
              <span className="text-xs font-black text-[#082B5C] uppercase tracking-wider">Simulasi Harga</span>
              <div className="text-right">
                <span className="text-lg font-black text-[#FF6500]">{formatCurrency(basePrice)}</span>
                <span className="text-[10px] text-gray-400 font-bold">
                  {pricingType === 'HOURLY' ? ' / jam' : pricingType === 'PER_SESSION' ? ' / sesi' : ' / hari'}
                </span>
              </div>
            </div>

            {/* Price negotiability & instant booking indicator */}
            <div className="flex flex-wrap gap-1.5">
              {data.negotiable && (
                <span className="text-[9px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-md">Bisa Nego</span>
              )}
              {data.instantBookingAvailable && (
                <span className="text-[9px] font-bold text-[#FF6500] bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-md">Instan Booking</span>
              )}
              <span className="text-[9px] font-bold text-gray-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                Tracking: {data.trackingMode === 'ARRIVAL_ONLY' ? 'Kedatangan' : data.trackingMode === 'REQUIRED_DURING_TRAVEL' ? 'Wajib Perjalanan' : 'Opsional'}
              </span>
            </div>

            {/* Duration Selector for Hourly */}
            {pricingType === 'HOURLY' && (
              <div className="space-y-1.5 text-left">
                <div className="flex justify-between text-[10px] font-bold text-[#082B5C] uppercase tracking-wide">
                  <span>Pilih Durasi Jasa</span>
                  <span className="text-[#FF6500]">{hoursCount} Jam</span>
                </div>
                <input
                  type="range"
                  min={data.minimumDurationMinutes || 120}
                  max={data.maximumDurationMinutes || 480}
                  step={30}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-[#FF6500] h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-gray-400 font-bold">
                  <span>Min: {(data.minimumDurationMinutes || 120) / 60} jam</span>
                  <span>Maks: {(data.maximumDurationMinutes || 480) / 60} jam</span>
                </div>
              </div>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-2 border-t border-slate-50 pt-3">
              <h5 className="text-[10px] font-black text-[#082B5C] uppercase tracking-wider text-left">Rincian Pendapatan Anda</h5>
              
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>
                    Biaya Jasa {pricingType === 'HOURLY' ? `(${hoursCount} Jam)` : ''}
                  </span>
                  <span className="font-bold text-[#082B5C]">{formatCurrency(serviceFee)}</span>
                </div>
                <div className="flex justify-between text-xs text-rose-500">
                  <span>Komisi Platform Suruhin (10%)</span>
                  <span className="font-bold">-{formatCurrency(platformFee)}</span>
                </div>
                <hr className="border-dashed border-slate-100" />
                <div className="flex justify-between text-xs font-black text-emerald-600 bg-emerald-50 p-2 rounded-xl">
                  <span>Bersih yang Anda Terima</span>
                  <span>{formatCurrency(totalReceived)}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled
              className="w-full bg-[#082B5C]/10 text-[#082B5C]/60 text-xs font-black py-3 rounded-2xl cursor-not-allowed uppercase tracking-wide mt-2"
            >
              Order (Simulasi Pembelian)
            </button>
          </div>

          {/* Secure disclaimer */}
          <div className="bg-slate-50 border border-slate-100/50 rounded-2xl p-4 flex gap-2.5">
            <Shield className="text-[#FF6500] shrink-0 mt-0.5" size={16} />
            <div className="space-y-0.5 text-left">
              <h6 className="text-[10px] font-black text-[#082B5C] uppercase tracking-wider">Garansi Transaksi Aman</h6>
              <p className="text-[9px] text-gray-400 leading-normal">
                Uang pelanggan akan ditampung di rekber Suruhin, dan baru ditransfer ke saldo dompet Anda setelah layanan selesai dikonfirmasi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
