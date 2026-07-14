import { PricingType } from '../../types';

interface PricingDurationStepProps {
  pricingType: PricingType;
  setPricingType: (val: PricingType) => void;
  basePrice: number;
  setBasePrice: (val: number) => void;
  minimumDurationMinutes: number;
  setMinimumDurationMinutes: (val: number) => void;
  maximumDurationMinutes: number;
  setMaximumDurationMinutes: (val: number) => void;
  negotiable: boolean;
  setNegotiable: (val: boolean) => void;
  instantBookingAvailable: boolean;
  setInstantBookingAvailable: (val: boolean) => void;
  errors: Record<string, string>;
}

export function PricingDurationStep({
  pricingType,
  setPricingType,
  basePrice,
  setBasePrice,
  minimumDurationMinutes,
  setMinimumDurationMinutes,
  maximumDurationMinutes,
  setMaximumDurationMinutes,
  negotiable,
  setNegotiable,
  instantBookingAvailable,
  setInstantBookingAvailable,
  errors
}: PricingDurationStepProps) {
  const durationOptions = [
    { value: 30, label: '30 Menit' },
    { value: 60, label: '1 Jam' },
    { value: 90, label: '1.5 Jam' },
    { value: 120, label: '2 Jam' },
    { value: 180, label: '3 Jam' },
    { value: 240, label: '4 Jam' },
    { value: 300, label: '5 Jam' },
    { value: 360, label: '6 Jam' },
    { value: 480, label: '8 Jam' },
    { value: 600, label: '10 Jam' },
    { value: 720, label: '12 Jam' }
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Pricing Type selection */}
      <div className="space-y-1.5">
        <label className="text-xs font-extrabold text-[#082B5C] uppercase tracking-wider block">
          Skema Penarifan Harga <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['HOURLY', 'PER_SESSION', 'PER_DAY'] as PricingType[]).map((type) => {
            let label = 'Per Jam';
            let desc = 'Sesuai durasi pemesanan';
            if (type === 'PER_SESSION') {
              label = 'Per Sesi';
              desc = 'Tarif flat per aktivitas';
            } else if (type === 'PER_DAY') {
              label = 'Harian';
              desc = 'Tarif flat per hari penuh';
            }

            return (
              <button
                key={type}
                type="button"
                onClick={() => setPricingType(type)}
                className={`p-3.5 border rounded-2xl flex flex-col items-center justify-center text-center gap-1 transition-all cursor-pointer ${
                  pricingType === type
                    ? 'border-[#FF6500] bg-orange-50/10 text-[#FF6500] ring-1 ring-[#FF6500]/35'
                    : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-[#082B5C]'
                }`}
              >
                <span className="text-xs font-black leading-none">{label}</span>
                <span className="text-[9px] text-gray-400 font-bold leading-normal">{desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Base Price input */}
      <div className="space-y-1.5">
        <label className="text-xs font-extrabold text-[#082B5C] uppercase tracking-wider block">
          {pricingType === 'HOURLY' ? 'Harga per Jam' : pricingType === 'PER_SESSION' ? 'Harga per Sesi' : 'Harga per Hari'} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-[#082B5C] opacity-40">Rp</span>
          <input
            type="number"
            value={basePrice || ''}
            onChange={(e) => setBasePrice(Number(e.target.value))}
            placeholder={pricingType === 'HOURLY' ? '30000' : pricingType === 'PER_SESSION' ? '120000' : '250000'}
            className={`w-full bg-slate-50 border rounded-2xl pl-10 pr-4 py-3 text-xs font-black text-[#172033] focus:bg-white focus:border-[#FF6500] focus:outline-none transition-all ${
              errors.basePrice ? 'border-rose-400' : 'border-slate-100'
            }`}
          />
        </div>
        <p className="text-[9px] text-gray-400">
          Masukkan tarif tanpa titik atau koma. Minimal Rp 10.000 dan maksimal Rp 1.000.000.
        </p>
        {errors.basePrice && (
          <p className="text-[10px] font-bold text-rose-500">{errors.basePrice}</p>
        )}
      </div>

      {/* Negotiable Price Switch */}
      <div className="bg-slate-50 border border-slate-100/30 rounded-2xl p-4 flex items-center justify-between">
        <div className="space-y-0.5 text-left pr-4">
          <h4 className="text-xs font-extrabold text-[#082B5C]">Bisa Nego Harga</h4>
          <p className="text-[10px] text-gray-400 leading-normal">
            Pengguna dapat menawar harga melalui chat sebelum booking disepakati.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setNegotiable(!negotiable)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            negotiable ? 'bg-[#FF6500]' : 'bg-slate-200'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              negotiable ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Booking Durations if HOURLY */}
      {pricingType === 'HOURLY' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-[#082B5C] uppercase tracking-wider block">
              Min. Durasi Pemesanan
            </label>
            <select
              value={minimumDurationMinutes}
              onChange={(e) => setMinimumDurationMinutes(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold text-[#082B5C] focus:bg-white focus:border-[#FF6500] focus:outline-none cursor-pointer transition-all"
            >
              {durationOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-[#082B5C] uppercase tracking-wider block">
              Maks. Durasi Pemesanan
            </label>
            <select
              value={maximumDurationMinutes}
              onChange={(e) => setMaximumDurationMinutes(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold text-[#082B5C] focus:bg-white focus:border-[#FF6500] focus:outline-none cursor-pointer transition-all"
            >
              {durationOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Instant Booking Switch */}
      <div className="bg-slate-50 border border-slate-100/30 rounded-2xl p-4 flex items-center justify-between">
        <div className="space-y-0.5 text-left pr-4">
          <h4 className="text-xs font-extrabold text-[#082B5C]">Instant Booking Aktif</h4>
          <p className="text-[10px] text-gray-400 leading-normal">
            Pemesanan langsung disetujui otomatis tanpa perlu persetujuan manual dari Anda terlebih dahulu.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setInstantBookingAvailable(!instantBookingAvailable)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            instantBookingAvailable ? 'bg-[#FF6500]' : 'bg-slate-200'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              instantBookingAvailable ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
