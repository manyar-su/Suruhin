import React, { useEffect, useMemo, useState } from 'react';
import { Container } from '../components/layout/Container';
import { FallbackImage } from '../components/shared/FallbackImage';
import { Rating } from '../components/shared/Rating';
import { BookingForm } from '../components/forms/BookingForm';
import { MapPin, ShieldCheck, ArrowLeft, Star, Briefcase, Calendar, Sparkles, CheckCircle, Mail, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../lib/formatCurrency';
import { TalentReviewSystem } from '../components/talent/TalentReviewSystem';
import { useTalentCatalog } from '../hooks/useTalentCatalog';
import { useServiceCatalog } from '../hooks/useServiceCatalog';
import { getTalentAvatarPath } from '../lib/assetPaths';

interface TalentDetailProps {
  slug: string;
  navigate: (path: string) => void;
}

export function TalentDetail({ slug, navigate }: TalentDetailProps) {
  const talents = useTalentCatalog();
  const services = useServiceCatalog();

  // Find current talent
  const talent = useMemo(() => {
    return talents.find((t) => t.slug === slug);
  }, [slug, talents]);

  // Find services supported by this talent
  const supportedServices = useMemo(() => {
    if (!talent) return [];
    return services.filter((s) => talent.services.includes(s.slug));
  }, [services, talent]);

  // Selected booking service state
  const [selectedServiceSlug, setSelectedServiceSlug] = useState(() => {
    return supportedServices[0]?.slug || '';
  });

  useEffect(() => {
    if (!supportedServices.some((service) => service.slug === selectedServiceSlug)) {
      setSelectedServiceSlug(supportedServices[0]?.slug || '');
    }
  }, [selectedServiceSlug, supportedServices]);

  const activeService = useMemo(() => {
    return services.find((s) => s.slug === selectedServiceSlug);
  }, [selectedServiceSlug, services]);

  // Combined real-time rating states updated by the TalentReviewSystem
  const [averageRating, setAverageRating] = useState(() => talent?.rating || 0);
  const [totalReviewsCount, setTotalReviewsCount] = useState(() => talent?.reviewCount || 0);

  if (!talent) {
    return (
      <div className="py-32 text-center">
        <Container>
          <div className="max-w-md mx-auto space-y-4">
            <h2 className="text-xl font-bold text-[#082B5C]">Profil Talent Tidak Ditemukan</h2>
            <p className="text-xs text-gray-500">Maaf, Talent yang Anda cari tidak tersedia atau sedang sibuk.</p>
            <button
              onClick={() => navigate('/talent')}
              className="px-5 py-2.5 bg-[#FF6500] hover:bg-[#e05900] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Kembali ke Daftar Talent
            </button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-24 bg-slate-50/50 min-h-screen">
      <Container>
        {/* Back Link Breadcrumb */}
        <button
          onClick={() => navigate('/talent')}
          className="inline-flex items-center gap-1 text-xs font-black text-[#082B5C] hover:text-[#FF6500] mb-8 cursor-pointer group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Kembali ke Daftar Talent</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Profile info, Bio, Reviews */}
          <div className="lg:col-span-7 space-y-8 text-left">
            
            {/* Profil Card Info */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
              {/* Photo */}
              <div className="w-28 h-28 rounded-3xl overflow-hidden bg-slate-100 border-4 border-slate-100 shadow-md shrink-0 relative">
                <FallbackImage
                  src={getTalentAvatarPath(talent.avatar, talent.name)}
                  alt={talent.name}
                  type="talent"
                  gender={talent.gender}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Bio details */}
              <div className="flex-1 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-[#082B5C] flex items-center gap-2 justify-center sm:justify-start">
                      <span>{talent.name}</span>
                      {talent.verified && (
                        <span className="p-1 bg-blue-50 border border-blue-100 text-blue-600 rounded-lg inline-flex items-center justify-center shadow-xs" title="Verified Talent">
                          <ShieldCheck size={16} className="fill-blue-100" />
                        </span>
                      )}
                    </h1>
                    <p className="text-xs font-bold text-gray-400 mt-1">
                      {talent.gender} • {talent.age} Tahun
                    </p>
                  </div>

                  {/* Status Availability */}
                  <span
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs flex items-center gap-1.5 self-center sm:self-start border ${
                      talent.available
                        ? 'bg-emerald-50 border-emerald-500/10 text-[#18A957]'
                        : 'bg-gray-50 border-gray-100 text-gray-500'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${talent.available ? 'bg-[#18A957]' : 'bg-gray-400'}`} />
                    {talent.available ? 'Tersedia' : 'Sibuk'}
                  </span>
                </div>

                {/* Rating and Orders completed row */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-5 border-t border-slate-50 pt-3.5 text-xs text-[#172033]/70 font-semibold">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="fill-[#FF6500] stroke-[#FF6500]" />
                    <span className="text-[#172033] font-black">{averageRating.toFixed(1)}</span>
                    <span className="text-gray-400 font-normal">({totalReviewsCount} Ulasan)</span>
                  </div>

                  <div className="flex items-center gap-1 border-l border-slate-200 pl-4">
                    <CheckCircle size={14} className="text-[#18A957]" />
                    <span>{talent.completedOrders}+ Pesanan Selesai</span>
                  </div>

                  <div className="flex items-center gap-1 border-l border-slate-200 pl-4">
                    <MapPin size={14} className="text-[#FF6500]" />
                    <span>{talent.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* About & Bio Text */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-3.5">
              <h3 className="text-base font-extrabold text-[#082B5C] border-l-3 border-[#FF6500] pl-2 uppercase tracking-wider">
                Tentang Saya
              </h3>
              <p className="text-xs sm:text-sm text-[#172033]/75 leading-relaxed">
                {talent.bio}
              </p>
            </div>

            {/* Supported/Offered Services checklist */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-[#082B5C] flex items-center gap-1.5">
                <Briefcase size={16} className="text-[#FF6500]" />
                <span>Keahlian & Layanan yang Ditawarkan</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {supportedServices.map((srv) => (
                  <div
                    key={srv.id}
                    onClick={() => {
                      setSelectedServiceSlug(srv.slug);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`p-4 border rounded-2xl cursor-pointer transition-all flex items-start justify-between gap-4 select-none ${
                      selectedServiceSlug === srv.slug
                        ? 'bg-orange-50/40 border-[#FF6500]/25 shadow-xs'
                        : 'bg-white border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-black text-[#082B5C]">{srv.title}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{srv.shortDescription}</p>
                      <span className="text-xs font-bold text-[#FF6500] block mt-2">
                        {formatCurrency(srv.price)}
                      </span>
                    </div>
                    <span className="text-[10px] font-black uppercase text-[#082B5C] bg-[#082B5C]/5 px-2.5 py-1 rounded-lg">Pilih</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule & Availability */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-[#082B5C] flex items-center gap-1.5">
                <Calendar size={16} className="text-[#FF6500]" />
                <span>Jadwal Aktif / Hari Kerja</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {talent.schedule.map((item, idx) => (
                  <span
                    key={idx}
                    className={`text-xs font-bold px-3.5 py-2 rounded-xl border flex flex-col items-start gap-0.5 ${
                      item.available
                        ? 'bg-blue-50/60 border-blue-100 text-[#082B5C]'
                        : 'bg-slate-50 border-slate-100 text-gray-400 line-through'
                    }`}
                  >
                    <span className="font-extrabold">{item.day}</span>
                    <span className="text-[10px] font-medium opacity-85">{item.time}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Specialized Skill tags */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-[#082B5C] flex items-center gap-1.5">
                <Sparkles size={16} className="text-[#FF6500]" />
                <span>Keahlian & Sertifikasi Khusus</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {talent.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-bold text-gray-500 bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-xl"
                  >
                    ✔ {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Modular Review and Star Rating System */}
            <TalentReviewSystem
              talent={talent}
              supportedServices={supportedServices}
              onRatingUpdated={(avg, count) => {
                setAverageRating(avg);
                setTotalReviewsCount(count);
              }}
            />

          </div>

          {/* RIGHT COLUMN: Sticky Booking Panel */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-xl">
              
              {/* If no active service is chosen (fallback check) */}
              {activeService ? (
                <div>
                  <div className="text-left mb-6 border-b border-slate-50 pb-4">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Menyewa Jasa Dari {talent.name}</span>
                    <h3 className="text-base font-black text-[#082B5C] mt-1.5">{activeService.title}</h3>
                  </div>

                  {/* Booking Form overlay */}
                  <BookingForm
                    service={activeService}
                    selectedTalentSlug={talent.slug}
                    onSuccess={() => {
                      alert('Pemesanan sukses! Anda dialihkan ke WhatsApp Admin.');
                    }}
                  />
                </div>
              ) : (
                <div className="p-4 text-center space-y-3">
                  <AlertCircle className="mx-auto text-orange-500" size={24} />
                  <p className="text-xs text-gray-500">Silakan pilih keahlian/layanan di samping terlebih dahulu untuk melakukan pemesanan.</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
