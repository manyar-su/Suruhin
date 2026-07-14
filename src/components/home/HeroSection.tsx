import React, { useState } from 'react';
import { Search, Shield, ShieldCheck, CheckCircle2, Star, CreditCard } from 'lucide-react';
import { getStaticAssetPath } from '../../lib/assetPaths';
import { FallbackImage } from '../shared/FallbackImage';

interface HeroSectionProps {
  onSearch: (query: string) => void;
  onNavigate: (path: string) => void;
}

export function HeroSection({ onSearch, onNavigate }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const popularSearches = [
    { label: 'Antar sekolah', slug: 'antar-jemput-sekolah' },
    { label: 'Temenin nonton', slug: 'temenin-nonton' },
    { label: 'Temenin hiking', slug: 'temenin-hiking' },
    { label: 'Titip belanja', slug: 'titip-belanja-harian' },
    { label: 'Antar barang', slug: 'antar-barang-lokal' },
  ];

  return (
    <section className="relative pt-24 pb-16 lg:pt-36 lg:pb-24 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent overflow-hidden">
      {/* Background vector grids */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-1 opacity-20 pointer-events-none">
        <svg width="100%" height="100%" className="text-gray-300">
          <defs>
            <pattern id="hero-dots" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-dots)" />
        </svg>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Side Content */}
          <div className="lg:col-span-7 flex flex-col items-start text-left z-10">
            {/* Tagline / Alert */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF6500]/10 border border-[#FF6500]/20 text-[#FF6500] text-xs font-bold mb-6">
              <Shield size={14} className="fill-[#FF6500]/10" />
              <span>Jasa Bantuan Lokal Tasikmalaya Teraman</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#082B5C] leading-tight tracking-tight mb-4">
              Apa aja, <span className="text-[#FF6500] relative">Suruhin aja.<span className="absolute left-0 bottom-1 w-full h-2 bg-[#FF6500]/10 rounded-full -z-1" /></span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-[#172033]/80 leading-relaxed mb-8 max-w-lg">
              Temukan talent terlatih dan terpercaya untuk membantu berbagai aktivitas sehari-hari Anda di Tasikmalaya. Cepat, aman, bersahabat, dan tersedia di sekitar Anda.
            </p>

            {/* Large Search Bar */}
            <form onSubmit={handleSearchSubmit} className="w-full max-w-2xl bg-white p-2 rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 flex flex-col sm:flex-row items-stretch gap-2 mb-5">
              <div className="flex-1 flex items-center gap-2.5 px-4 py-2 sm:py-0">
                <Search size={20} className="text-[#082B5C] opacity-40 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Mau dibantu apa hari ini?"
                  className="w-full text-sm sm:text-base text-[#172033] bg-transparent placeholder-slate-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-[#FF6500] hover:bg-[#e05900] text-white font-bold text-sm sm:text-base px-7 py-3.5 rounded-xl sm:rounded-2xl transition-all duration-200 shadow-sm shadow-orange-200 cursor-pointer text-center flex items-center justify-center gap-2"
              >
                <span>Cari Layanan</span>
              </button>
            </form>

            {/* Popular searches */}
            <div className="flex flex-wrap items-center gap-2 mb-8 text-left">
              <span className="text-xs font-bold text-[#082B5C]/55">Populer:</span>
              {popularSearches.map((search) => (
                <button
                  key={search.slug}
                  onClick={() => onNavigate(`/layanan/${search.slug}`)}
                  className="text-xs font-semibold text-[#172033]/70 hover:text-[#FF6500] bg-white hover:bg-orange-50/50 border border-slate-100 px-3 py-1.5 rounded-full transition-all cursor-pointer"
                >
                  {search.label}
                </button>
              ))}
            </div>

            {/* Trust Pile Indicators */}
            <div className="flex flex-wrap items-center gap-6 border-t border-slate-100 pt-6 w-full">
              {/* User Avatar Stack */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  {[
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80',
                    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=80&h=80',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80',
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80'
                  ].map((avatar, idx) => (
                    <img
                      key={idx}
                      src={avatar}
                      alt={`Pelanggan puas ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-8.5 h-8.5 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
                    />
                  ))}
                </div>
                <div className="text-left">
                  <div className="text-sm font-black text-[#082B5C]">10.000+</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pengguna Puas</div>
                </div>
              </div>

              {/* Rating Star */}
              <div className="flex items-center gap-2 border-l border-slate-100 pl-6">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className="fill-[#FF6500] stroke-[#FF6500]" />
                  ))}
                </div>
                <div className="text-left">
                  <div className="text-sm font-black text-[#082B5C]">4.9 / 5</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">2.560+ Ulasan</div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-4 border-l border-slate-100 pl-6">
                <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                  <CheckCircle2 size={14} className="text-[#18A957]" />
                  <span>Verified Talent</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                  <CreditCard size={14} className="text-[#FF6500]" />
                  <span>Aman</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side Mockup */}
          <div className="lg:col-span-5 relative hidden md:block">
            {/* Main Visual placeholder styled elegantly */}
            <div className="relative w-full max-w-md mx-auto aspect-4/5 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
              <FallbackImage
                src={getStaticAssetPath('jasa/hero-suruhin.webp')}
                alt="Talent Suruhin Siap Membantu"
                type="service"
                categorySlug="temenin"
                className="w-full h-full object-cover"
              />

              {/* Soft overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              
              {/* Overlay description inside card */}
              <div className="absolute bottom-6 left-6 right-6 text-left text-white z-10">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF6500] mb-1">Mitra Tasikmalaya</p>
                <h3 className="text-xl font-extrabold leading-tight">Kang Asep & Rizky</h3>
                <p className="text-xs text-white/80 mt-0.5">Talent Terverifikasi Suruhin</p>
              </div>
            </div>

            {/* FLOATING CARD 1: Aman & Terpercaya */}
            <div className="absolute top-10 -left-10 bg-white p-4 rounded-2xl shadow-xl border border-slate-50 flex items-center gap-3 animate-bounce" style={{ animationDuration: '4s' }}>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <ShieldCheck size={20} className="fill-blue-100" />
              </div>
              <div className="text-left">
                <div className="text-sm font-extrabold text-[#082B5C]">Aman & Terpercaya</div>
                <div className="text-[10px] text-gray-400 font-bold">100% Talent Diverifikasi</div>
              </div>
            </div>

            {/* FLOATING CARD 2: Rating */}
            <div className="absolute bottom-16 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-50 flex items-center gap-3 animate-bounce" style={{ animationDuration: '5s' }}>
              <div className="p-2.5 bg-orange-50 text-[#FF6500] rounded-xl">
                <Star size={20} className="fill-orange-100" />
              </div>
              <div className="text-left">
                <div className="text-sm font-extrabold text-[#082B5C]">Proteksi Maksimal</div>
                <div className="text-[10px] text-gray-400 font-bold">Pesanan Dilindungi Hukum</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
