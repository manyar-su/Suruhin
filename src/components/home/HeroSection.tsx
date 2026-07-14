import React, { useState } from 'react';
import {
  ArrowRight,
  Bike,
  Dumbbell,
  MapPin,
  Popcorn,
  Search,
  ShieldCheck,
  ShoppingBasket,
  Star,
  Wallet,
} from 'lucide-react';
import { getStaticAssetPath } from '../../lib/assetPaths';

interface HeroSectionProps {
  onSearch: (query: string) => void;
  onNavigate: (path: string) => void;
}

const quickServices = [
  { label: 'Temenin Nonton', slug: 'temenin-nonton', icon: Popcorn },
  { label: 'Antar Jemput', slug: 'antar-jemput-sekolah', icon: MapPin },
  { label: 'Teman Olahraga', slug: 'teman-olahraga', icon: Dumbbell },
  { label: 'Teman Hiking', slug: 'temenin-hiking', icon: Bike },
  { label: 'Titip Belanja', slug: 'titip-belanja-harian', icon: ShoppingBasket },
];

const trustItems = [
  { label: 'Aman & Terpercaya', icon: ShieldCheck },
  { label: 'Talent Terverifikasi', icon: Star },
  { label: 'Pembayaran Aman', icon: Wallet },
];

const benefitItems = [
  {
    title: 'Pembayaran Aman',
    description: 'Dana kamu ditahan sampai layanan selesai.',
    icon: Wallet,
  },
  {
    title: 'On Time Guarantee',
    description: 'Talent datang tepat waktu sesuai janji.',
    icon: ShieldCheck,
  },
  {
    title: 'Rating & Ulasan',
    description: 'Bantu kamu pilih talent terbaik.',
    icon: Star,
  },
];

export function HeroSection({ onSearch, onNavigate }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,173,74,0.24),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(255,184,77,0.18),_transparent_30%),linear-gradient(180deg,_#fffdf8_0%,_#fff_58%,_#f8fbff_100%)] pt-26 pb-10 lg:pt-34 lg:pb-14">
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/85 to-transparent pointer-events-none" />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end">
          <div className="hidden items-center gap-3 rounded-full border border-white/80 bg-white/92 px-5 py-3 text-sm font-semibold text-[#172033] shadow-[0_20px_55px_rgba(8,43,92,0.08)] backdrop-blur lg:flex">
            {trustItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <React.Fragment key={item.label}>
                  {index > 0 && <span className="h-5 w-px bg-slate-200" />}
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff5df] text-[#f7ab19]">
                      <Icon size={16} />
                    </span>
                    <span>{item.label}</span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="grid items-end gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="relative z-10 max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#ffcc8d] bg-white/86 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#f7a11c] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#f7a11c]" />
              Marketplace Jasa Lokal
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[0.94] tracking-[-0.05em] text-[#081a44] sm:text-6xl lg:text-[5.65rem]">
              Butuh Teman
              <br />
              atau Bantuan?
              <br />
              <span className="bg-gradient-to-r from-[#ffb315] via-[#ffb315] to-[#ff9d00] bg-clip-text text-transparent">
                Suruhin Aja!
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#172033]/78 sm:text-[1.45rem]">
              Pesan berbagai layanan harian dari talent terverifikasi di sekitarmu dengan
              <span className="font-extrabold text-[#081a44]"> aman</span>,
              <span className="font-extrabold text-[#081a44]"> cepat</span>, dan
              <span className="font-extrabold text-[#081a44]"> praktis</span>.
            </p>

            <form
              onSubmit={handleSearchSubmit}
              className="mt-8 flex w-full max-w-4xl flex-col gap-3 rounded-[2rem] border border-white/85 bg-white/88 p-3 shadow-[0_30px_70px_rgba(8,43,92,0.1)] backdrop-blur md:flex-row md:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[1.35rem] border border-slate-100 bg-[#fbfcff] px-4 py-3.5">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#081a44] shadow-sm">
                  <MapPin size={20} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Lokasi Anda</p>
                  <p className="truncate text-base font-black text-[#081a44]">Tasikmalaya</p>
                </div>
              </div>

              <div className="flex min-w-0 flex-[1.2] items-center gap-3 rounded-[1.35rem] border border-slate-100 bg-[#fbfcff] px-4 py-3.5">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#081a44] shadow-sm">
                  <Search size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Pilih Layanan</p>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Mau dibantu apa hari ini?"
                    className="w-full bg-transparent text-base font-black text-[#081a44] placeholder:font-semibold placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex h-[4.2rem] items-center justify-center gap-2 rounded-[1.6rem] bg-[#ffc31b] px-7 text-lg font-black text-[#081a44] shadow-[0_16px_32px_rgba(255,195,27,0.34)] transition hover:-translate-y-0.5 hover:bg-[#ffb400] cursor-pointer"
              >
                <span>Cari Talent</span>
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="mt-7">
              <p className="mb-3 text-sm font-black text-[#081a44]">Layanan Populer 🔥</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {quickServices.map((service) => {
                  const Icon = service.icon;
                  return (
                    <button
                      key={service.slug}
                      onClick={() => onNavigate(`/layanan/${service.slug}`)}
                      className="group rounded-[1.55rem] border border-white/90 bg-white/88 px-4 py-4 text-left shadow-[0_18px_42px_rgba(8,43,92,0.06)] transition hover:-translate-y-1 hover:shadow-[0_22px_46px_rgba(8,43,92,0.12)] cursor-pointer"
                    >
                      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f5f8ff] text-[#4b7be5] transition group-hover:bg-[#fff4d5] group-hover:text-[#f5a000]">
                        <Icon size={20} />
                      </span>
                      <span className="line-clamp-2 text-sm font-black leading-snug text-[#081a44]">{service.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-[2.6rem] border border-white/80 bg-white/70 shadow-[0_32px_80px_rgba(8,43,92,0.14)]">
              <img
                src={getStaticAssetPath('ui/hero-reference.png')}
                alt="Hero Suruhin"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 rounded-[2rem] bg-[#0b204c] p-5 text-white shadow-[0_28px_80px_rgba(8,43,92,0.18)] md:grid-cols-3 md:px-8 md:py-6">
          {benefitItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-start gap-4 border-white/10 md:border-r md:pr-6 last:border-r-0">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#ffc31b]">
                  <Icon size={24} />
                </span>
                <div>
                  <h3 className="text-xl font-black">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/72">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
