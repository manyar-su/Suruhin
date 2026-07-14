import { TalentServiceSchedule, ServiceMode } from '../../types';

interface ScheduleLocationStepProps {
  city: string;
  setCity: (val: string) => void;
  district: string;
  setDistrict: (val: string) => void;
  serviceRadiusKm: number;
  setServiceRadiusKm: (val: number) => void;
  defaultMeetingAddress: string;
  setDefaultMeetingAddress: (val: string) => void;
  trackingMode: 'ARRIVAL_ONLY' | 'REQUIRED_DURING_TRAVEL' | 'OPTIONAL_DURING_SERVICE';
  setTrackingMode: (val: 'ARRIVAL_ONLY' | 'REQUIRED_DURING_TRAVEL' | 'OPTIONAL_DURING_SERVICE') => void;
  schedules: TalentServiceSchedule[];
  setSchedules: (val: TalentServiceSchedule[]) => void;
  errors: Record<string, string>;
  serviceMode?: ServiceMode;
}

export function ScheduleLocationStep({
  city,
  setCity,
  district,
  setDistrict,
  serviceRadiusKm,
  setServiceRadiusKm,
  defaultMeetingAddress,
  setDefaultMeetingAddress,
  trackingMode,
  setTrackingMode,
  schedules,
  setSchedules,
  errors,
  serviceMode = 'OFFLINE'
}: ScheduleLocationStepProps) {
  const districts = ['Cihideung', 'Cipedes', 'Indihiang', 'Kawalu', 'Mangkubumi', 'Purbaratu', 'Tamansari', 'Tawang', 'Cibeureum', 'Bungursari'];

  const daysOfWeek = [
    { dayOfWeek: 1, name: 'Senin' },
    { dayOfWeek: 2, name: 'Selasa' },
    { dayOfWeek: 3, name: 'Rabu' },
    { dayOfWeek: 4, name: 'Kamis' },
    { dayOfWeek: 5, name: 'Jumat' },
    { dayOfWeek: 6, name: 'Sabtu' },
    { dayOfWeek: 0, name: 'Minggu' }
  ];

  const handleToggleDay = (dayOfWeek: number, dayName: string) => {
    const existingIndex = schedules.findIndex(s => s.dayOfWeek === dayOfWeek);
    if (existingIndex > -1) {
      // Toggle off or update
      const updated = [...schedules];
      updated[existingIndex].isActive = !updated[existingIndex].isActive;
      setSchedules(updated);
    } else {
      // Add new active schedule
      const newSchedule: TalentServiceSchedule = {
        id: `sch-${Date.now()}-${dayOfWeek}`,
        talentServiceId: '',
        dayOfWeek,
        dayName,
        startTime: '08:00',
        endTime: '17:00',
        isActive: true
      };
      setSchedules([...schedules, newSchedule]);
    }
  };

  const handleUpdateTime = (dayOfWeek: number, field: 'startTime' | 'endTime', val: string) => {
    const updated = schedules.map(s => {
      if (s.dayOfWeek === dayOfWeek) {
        return { ...s, [field]: val };
      }
      return s;
    });
    setSchedules(updated);
  };

  const isOnlineOnly = serviceMode === 'ONLINE';

  return (
    <div className="space-y-6 text-left">
      {!isOnlineOnly ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
            {/* City */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-[#082B5C] uppercase tracking-wider block">
                Kota Layanan
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled
                className="w-full bg-slate-100 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold text-[#082B5C] focus:outline-none opacity-80 cursor-not-allowed"
              />
            </div>

            {/* District */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-[#082B5C] uppercase tracking-wider block">
                Kecamatan Utama <span className="text-red-500">*</span>
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className={`w-full bg-slate-50 border rounded-2xl px-4 py-3 text-xs font-bold text-[#082B5C] focus:bg-white focus:border-[#FF6500] focus:outline-none cursor-pointer transition-all ${
                  errors.district ? 'border-rose-400' : 'border-slate-100'
                }`}
              >
                <option value="">-- Pilih Kecamatan --</option>
                {districts.map(dist => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
              {errors.district && (
                <p className="text-[10px] font-bold text-rose-500">{errors.district}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
            {/* Service Radius */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-[#082B5C] uppercase tracking-wider block">
                Jangkauan Layanan (KM)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={serviceRadiusKm}
                  onChange={(e) => setServiceRadiusKm(Number(e.target.value))}
                  className="flex-grow accent-[#FF6500] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
                <span className="text-xs font-black text-[#082B5C] bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-xl shrink-0 min-w-[50px] text-center">
                  {serviceRadiusKm} Km
                </span>
              </div>
            </div>

            {/* Tracking Mode */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-[#082B5C] uppercase tracking-wider block">
                Metode Tracking Lokasi <span className="text-red-500">*</span>
              </label>
              <select
                value={trackingMode}
                onChange={(e) => setTrackingMode(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold text-[#082B5C] focus:bg-white focus:border-[#FF6500] focus:outline-none cursor-pointer transition-all"
              >
                <option value="ARRIVAL_ONLY">Hanya Saat Kedatangan</option>
                <option value="REQUIRED_DURING_TRAVEL">Wajib Selama Layanan</option>
                <option value="OPTIONAL_DURING_SERVICE">Opsional Selama Layanan</option>
              </select>
            </div>
          </div>

          {/* Default Meeting Address */}
          <div className="space-y-1.5 animate-in fade-in duration-200">
            <label className="text-xs font-extrabold text-[#082B5C] uppercase tracking-wider block">
              Alamat Pertemuan Default <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={defaultMeetingAddress}
              onChange={(e) => setDefaultMeetingAddress(e.target.value)}
              placeholder="Contoh: Depan Halte Kampus Unsil atau Samping Pos Satpam Gerbang Utama"
              className={`w-full bg-slate-50 border rounded-2xl px-4 py-3 text-xs text-[#172033] focus:bg-white focus:border-[#FF6500] focus:outline-none transition-all ${
                errors.defaultMeetingAddress ? 'border-rose-400' : 'border-slate-100'
              }`}
            />
            <p className="text-[9px] text-gray-400">
              Titik koordinat atau deskripsi lokasi acuan pertemuan awal dengan pelanggan. Minimal 10 karakter.
            </p>
            {errors.defaultMeetingAddress && (
              <p className="text-[10px] font-bold text-rose-500">{errors.defaultMeetingAddress}</p>
            )}
          </div>
        </>
      ) : (
        <div className="p-4 bg-orange-50/40 rounded-2xl border border-orange-100 text-[#082B5C] text-xs space-y-1 animate-in fade-in duration-200">
          <p className="font-extrabold text-[#FF6500]">Layanan Online Terpilih</p>
          <p className="text-gray-500 leading-normal">
            Karena Anda memilih metode layanan **ONLINE**, pengaturan lokasi utama, radius jangkauan, tracking GPS, dan alamat pertemuan default disembunyikan secara otomatis. Transaksi dan pengerjaan akan dilakukan secara virtual.
          </p>
        </div>
      )}

      {/* Weekly Schedule Planner */}
      <div className="space-y-3.5">
        <label className="text-xs font-extrabold text-[#082B5C] uppercase tracking-wider block">
          Jadwal Ketersediaan Mingguan
        </label>
        <p className="text-[9px] text-gray-400 leading-normal mb-2">
          Atur hari dan rentang jam berapa saja Anda siap menerima pesanan untuk layanan ini.
        </p>

        <div className="space-y-2">
          {daysOfWeek.map((day) => {
            const sch = schedules.find(s => s.dayOfWeek === day.dayOfWeek);
            const isActive = sch?.isActive || false;

            return (
              <div
                key={day.dayOfWeek}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border transition-all ${
                  isActive
                    ? 'border-[#FF6500]/30 bg-orange-50/5'
                    : 'border-slate-100 bg-slate-50/30'
                }`}
              >
                {/* Checkbox and Day Name */}
                <button
                  type="button"
                  onClick={() => handleToggleDay(day.dayOfWeek, day.name)}
                  className="flex items-center gap-3 text-left cursor-pointer focus:outline-none mb-2 sm:mb-0"
                >
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                    isActive ? 'bg-[#FF6500] border-[#FF6500] text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {isActive && <span className="text-[10px] font-black">✓</span>}
                  </div>
                  <span className={`text-xs font-bold ${isActive ? 'text-[#082B5C]' : 'text-gray-400'}`}>
                    {day.name}
                  </span>
                </button>

                {/* Time selection */}
                {isActive && (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-1 duration-150">
                    <input
                      type="time"
                      value={sch?.startTime || '08:00'}
                      onChange={(e) => handleUpdateTime(day.dayOfWeek, 'startTime', e.target.value)}
                      className="bg-white border border-slate-200 text-xs font-bold text-[#082B5C] rounded-lg px-2 py-1 focus:outline-none focus:border-[#FF6500]"
                    />
                    <span className="text-[10px] text-gray-400 font-bold">s/d</span>
                    <input
                      type="time"
                      value={sch?.endTime || '17:00'}
                      onChange={(e) => handleUpdateTime(day.dayOfWeek, 'endTime', e.target.value)}
                      className="bg-white border border-slate-200 text-xs font-bold text-[#082B5C] rounded-lg px-2 py-1 focus:outline-none focus:border-[#FF6500]"
                    />
                  </div>
                )}
                {!isActive && (
                  <span className="text-[10px] font-bold text-gray-400 pr-2">Libur / Tutup</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
