import { useMemo, useState } from 'react';
import { getCustomServices } from '../data/mockExtensionData';
import { Container } from '../components/layout/Container';
import { FallbackImage } from '../components/shared/FallbackImage';
import { Rating } from '../components/shared/Rating';
import { BookingForm } from '../components/forms/BookingForm';
import { MapPin, ShieldAlert, BadgeCheck, Clock, Users, ArrowLeft, Star, Quote } from 'lucide-react';
import { getServiceImagePath, getTalentAvatarPath } from '../lib/assetPaths';
import { formatCurrency } from '../lib/formatCurrency';
import { useServiceCatalog } from '../hooks/useServiceCatalog';
import { useTalentCatalog } from '../hooks/useTalentCatalog';

interface LayananDetailProps {
  slug: string;
  navigate: (path: string) => void;
}

export function LayananDetail({ slug, navigate }: LayananDetailProps) {
  const [selectedTalentSlug, setSelectedTalentSlug] = useState<string | undefined>(undefined);

  // Dynamic filter states for selected service requirements
  const [filterGender, setFilterGender] = useState<string>('Semua');
  const [filterReadyToday, setFilterReadyToday] = useState<boolean>(false);
  const [filterSkill, setFilterSkill] = useState<string>('Semua');

  const combinedServices = useServiceCatalog();
  const talents = useTalentCatalog();

  // Find current service
  const service = useMemo(() => {
    return combinedServices.find((s) => s.slug === slug);
  }, [combinedServices, slug]);

  // Show the registered catalog talents for every service so users always see real available accounts.
  const serviceTalents = useMemo(() => {
    if (!service) return [];
    if (service.id.startsWith('ts-')) {
      const customSrv = getCustomServices().find(s => s.id === service.id);
      if (customSrv) {
        return talents.filter((t) => t.id === customSrv.talentId);
      }
    }
    return talents.filter((t) => t.available);
  }, [service, talents]);

  // Extract unique skills from talents available for this specific service
  const uniqueSkills = useMemo(() => {
    const list = new Set<string>();
    serviceTalents.forEach(t => {
      t.skills?.forEach(s => list.add(s));
    });
    return Array.from(list);
  }, [serviceTalents]);

  // Filter talents based on user requirements
  const filteredTalents = useMemo(() => {
    return serviceTalents.filter(t => {
      // 1. Gender Filter
      if (filterGender !== 'Semua' && t.gender !== filterGender) {
        return false;
      }
      // 2. Skill Filter
      if (filterSkill !== 'Semua' && !t.skills?.includes(filterSkill)) {
        return false;
      }
      // 3. Ready Today Filter
      if (filterReadyToday) {
        // Today's day in Indonesian
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const todayDay = days[new Date().getDay()];
        const todaySchedule = t.schedule?.find(s => s.day === todayDay);
        if (!todaySchedule || !todaySchedule.available || todaySchedule.time === 'Libur') {
          return false;
        }
      }
      return true;
    });
  }, [serviceTalents, filterGender, filterSkill, filterReadyToday]);

  if (!service) {
    return (
      <div className="py-32 text-center">
        <Container>
          <div className="max-w-md mx-auto space-y-4">
            <h2 className="text-xl font-bold text-[#082B5C]">Layanan Tidak Ditemukan</h2>
            <p className="text-xs text-gray-500">Maaf, layanan yang Anda cari tidak tersedia di platform Suruhin.</p>
            <button
              onClick={() => navigate('/layanan')}
              className="px-5 py-2.5 bg-[#FF6500] hover:bg-[#e05900] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Kembali ke Katalog
            </button>
          </div>
        </Container>
      </div>
    );
  }

  // Simulated reviews for this specific service
  const serviceReviews = [
    {
      name: 'Amelia Putri',
      rating: 5,
      date: 'Kemarin',
      role: 'Mahasiswi UNSIL',
      comment: `Sangat membantu sekali ketika saya tidak sempat keluar kosan. Talent ramah, sopan, dan pengantaran sangat cepat sampai tujuan!`
    },
    {
      name: 'Hendrik Wijaya',
      rating: 5,
      date: '3 hari yang lalu',
      role: 'Karyawan Swasta',
      comment: `Jasa yang sangat solutif untuk warga Tasik harian. Sangat profesional, amanah, dan harga sangat terjangkau.`
    }
  ];

  return (
    <div className="py-24 bg-slate-50/50 min-h-screen">
      <Container>
        {/* Back Link Breadcrumb */}
        <button
          onClick={() => navigate('/layanan')}
          className="mt-4 inline-flex items-center gap-1 text-xs font-black text-[#082B5C] hover:text-[#FF6500] mb-8 cursor-pointer group sm:mt-0"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Kembali ke Katalog Jasa</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT PANEL: Rich Details & Info */}
          <div className="lg:col-span-7 space-y-8 text-left">
            
            {/* Visual Header card */}
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="aspect-16/9 bg-slate-100 relative">
                <FallbackImage
                  src={getServiceImagePath(service.image)}
                  alt={service.title}
                  type="service"
                  categorySlug={service.category}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay Badge Category */}
                <span className="absolute bottom-6 left-6 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#082B5C] text-white shadow-md">
                  {service.categoryName}
                </span>
              </div>

              {/* Header Title Information */}
              <div className="p-6 md:p-8 space-y-4">
                <h1 className="text-2xl sm:text-3xl font-black text-[#082B5C] leading-tight">
                  {service.title}
                </h1>

                {/* Sub row rating and location */}
                <div className="flex flex-wrap items-center gap-6 text-xs text-[#172033]/70 font-semibold border-y border-slate-50 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <Star size={14} className="fill-[#FF6500] stroke-[#FF6500]" />
                    <span className="text-[#172033] font-black">{service.rating.toFixed(1)}</span>
                    <span className="text-gray-400 font-normal">({service.reviewCount} Ulasan)</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 border-l border-slate-200 pl-6">
                    <MapPin size={14} className="text-[#FF6500]" />
                    <span>{service.location}</span>
                  </div>

                  <div className="flex items-center gap-1.5 border-l border-slate-200 pl-6">
                    <Clock size={14} className="text-[#082B5C]" />
                    <span>Respons 15 Menit</span>
                  </div>
                </div>

                {/* Long description text */}
                <div className="space-y-4">
                  <h3 className="text-base font-extrabold text-[#082B5C]">Deskripsi Jasa</h3>
                  <p className="text-sm text-[#172033]/75 leading-relaxed">
                    {service.longDescription}
                  </p>
                </div>
              </div>
            </div>

            {/* List of Key Deliverables / Features */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-[#082B5C] border-l-3 border-[#FF6500] pl-2 uppercase tracking-wider">
                Apa Saja yang Anda Dapatkan?
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'Mitra terlatih & terverifikasi identitas',
                  'Garansi ketepatan waktu bantuan',
                  'Komunikasi sopan santun berbahasa Sunda & Indonesia',
                  'Harga jujur tanpa biaya tambahan tersembunyi',
                  'Jaminan perlindungan asuransi keamanan platform',
                  'Dukungan penuh tim CS Suruhin sepanjang pemesanan'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-[#172033]/80 font-medium">
                    <BadgeCheck size={16} className="text-[#18A957] shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Special Safety Protections Banner */}
            <div className="p-6 bg-orange-50/40 rounded-3xl border border-orange-100 flex gap-4">
              <div className="p-3 bg-white rounded-2xl text-[#FF6500] shadow-sm shrink-0 mt-1">
                <ShieldAlert size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-[#082B5C]">Komitmen Kesopanan & Proteksi Hukum</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Semua aktivitas di dalam layanan ini wajib mematuhi norma sosial dan hukum yang berlaku di Indonesia. Talent kami melarang keras segala tindak asusila, seksual, kencan, perjudian, atau tindakan melanggar hukum. Segala jenis pelanggaran akan otomatis kami laporkan ke kepolisian setempat.
                </p>
              </div>
            </div>

            {/* Recommended/Specialized Talents list */}
            {serviceTalents.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-50 pb-3">
                  <div>
                    <h3 className="text-base font-black text-[#082B5C] flex items-center gap-1.5">
                      <Users size={18} className="text-[#FF6500]" />
                      <span>Pilih Talent Spesialis Layanan Ini</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Filter dan pilih mitra terbaik yang sesuai dengan kebutuhan spesifik Anda.
                    </p>
                  </div>
                  <span className="text-[10px] bg-[#FF6500]/10 text-[#FF6500] font-extrabold px-2.5 py-1 rounded-md self-start sm:self-auto">
                    {serviceTalents.length} Talent Terdaftar
                  </span>
                </div>

                {/* Sleek Dynamic Filter Controls */}
                <div className="bg-[#F5F7FA] p-4 rounded-2xl border border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Gender Select */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Jenis Kelamin</label>
                    <div className="flex bg-white rounded-lg p-0.5 border border-slate-100">
                      {['Semua', 'Pria', 'Wanita'].map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setFilterGender(g)}
                          className={`flex-1 py-1 rounded-md text-[10px] font-extrabold cursor-pointer transition-all ${
                            filterGender === g
                              ? 'bg-[#082B5C] text-white shadow-2xs'
                              : 'text-gray-400 hover:text-[#082B5C]'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Skills Select */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Spesialisasi Tambahan</label>
                    <select
                      value={filterSkill}
                      onChange={(e) => setFilterSkill(e.target.value)}
                      className="w-full bg-white border border-slate-100 rounded-lg p-1.5 text-[10px] font-extrabold text-[#082B5C] focus:outline-none cursor-pointer"
                    >
                      <option value="Semua">Semua Keahlian ({uniqueSkills.length})</option>
                      {uniqueSkills.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Ready Today Toggle */}
                  <div className="space-y-1 flex flex-col justify-center">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Ketersediaan Waktu</label>
                    <button
                      type="button"
                      onClick={() => setFilterReadyToday(!filterReadyToday)}
                      className={`w-full py-1.5 rounded-lg border text-[10px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        filterReadyToday
                          ? 'bg-orange-50 border-[#FF6500] text-[#FF6500] shadow-2xs'
                          : 'bg-white border-slate-100 text-gray-500 hover:border-slate-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${filterReadyToday ? 'bg-[#FF6500] animate-pulse' : 'bg-gray-300'}`} />
                      <span>Siap Bertugas Hari Ini</span>
                    </button>
                  </div>
                </div>

                {/* Filter Results Summary */}
                <div className="flex items-center justify-between text-[11px] text-gray-400 font-semibold px-1">
                  <span>Menampilkan {filteredTalents.length} dari {serviceTalents.length} mitra spesialis</span>
                  {(filterGender !== 'Semua' || filterSkill !== 'Semua' || filterReadyToday) && (
                    <button
                      type="button"
                      onClick={() => {
                        setFilterGender('Semua');
                        setFilterSkill('Semua');
                        setFilterReadyToday(false);
                      }}
                      className="text-[#FF6500] font-bold hover:underline"
                    >
                      Reset Filter
                    </button>
                  )}
                </div>

                {filteredTalents.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                    {filteredTalents.map((t) => {
                      const isSelected = selectedTalentSlug === t.slug;
                      return (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTalentSlug(t.slug)}
                          className={`p-4 bg-slate-50 border rounded-2xl transition-all cursor-pointer flex flex-col items-center text-center relative group select-none ${
                            isSelected
                              ? 'border-[#FF6500] bg-orange-50/25 ring-2 ring-[#FF6500]/10 shadow-xs'
                              : 'border-slate-100 hover:border-orange-500/10 hover:bg-orange-50/10'
                          }`}
                        >
                          {/* Selected Indicator Badge */}
                          {isSelected && (
                            <span className="absolute top-3 right-3 bg-[#FF6500] text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs">
                              Terpilih
                            </span>
                          )}
                          
                          <div className="w-14 h-14 rounded-full bg-white border-2 border-white shadow-sm overflow-hidden mb-2.5">
                            <FallbackImage
                              src={getTalentAvatarPath(t.avatar, t.name)}
                              alt={t.name}
                              type="talent"
                              gender={t.gender}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <h4 className="text-xs font-black text-[#082B5C] group-hover:text-[#FF6500] transition-colors leading-tight">
                            {t.name}
                          </h4>
                          <p className="text-[10px] text-gray-400 mt-1">{t.gender} • {t.age} Thn</p>
                          <div className="flex items-center gap-1 mt-1 text-orange-500 font-bold text-[10px]">
                            <span>★ {t.rating.toFixed(1)}</span>
                            <span className="text-gray-300 font-normal">({t.reviewCount})</span>
                          </div>
                          
                          {/* Action buttons */}
                          <div className="grid grid-cols-2 gap-1.5 w-full mt-3.5 pt-3 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTalentSlug(t.slug);
                              }}
                              className={`py-1.5 rounded-lg text-[10px] font-black transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-[#FF6500] text-white'
                                  : 'bg-slate-200/60 hover:bg-slate-200 text-gray-700'
                              }`}
                            >
                              {isSelected ? 'Terpilih' : 'Pilih'}
                            </button>
                            
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/talent/${t.slug}`);
                              }}
                              className="py-1.5 bg-white border border-slate-200 hover:border-slate-300 hover:text-[#082B5C] text-gray-500 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                            >
                              Profil
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs text-gray-400">Tidak ada mitra spesialis yang cocok dengan filter kriteria Anda.</p>
                  </div>
                )}
              </div>
            )}

            {/* Client Service Reviews */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-5">
              <h3 className="text-base font-extrabold text-[#082B5C]">Ulasan Layanan Ini</h3>
              <div className="space-y-4 divide-y divide-slate-100">
                {serviceReviews.map((rev, idx) => (
                  <div key={idx} className={`pt-4 ${idx === 0 ? 'pt-0 border-t-0' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-[#082B5C]">{rev.name}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">{rev.role} • {rev.date}</p>
                      </div>
                      <Rating value={rev.rating} size={12} showText={false} />
                    </div>
                    <p className="text-xs text-gray-600 italic pl-3 border-l-2 border-[#FF6500]/40 leading-relaxed text-left">
                      “ {rev.comment} ”
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT PANEL: Sticky Booking Card Form */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-xl">
              <div className="flex items-baseline justify-between gap-2 mb-6 border-b border-slate-50 pb-4">
                <span className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Harga Sewa</span>
                <div>
                  <span className="text-2xl font-black text-[#FF6500]">
                    {formatCurrency(service.price)}
                  </span>
                  <span className="text-xs text-gray-400 font-bold ml-1">/{service.slug.includes('antar') ? 'Sesi' : 'Jam'}</span>
                </div>
              </div>

              {/* Embed Booking Form */}
              <BookingForm
                service={service}
                selectedTalentSlug={selectedTalentSlug}
                onSuccess={() => {
                  alert('Pemesanan sukses! Anda dialihkan ke WhatsApp Admin.');
                }}
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
