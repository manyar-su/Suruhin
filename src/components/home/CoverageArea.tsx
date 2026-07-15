import { MapPin, ExternalLink, Navigation, ArrowUpRight } from 'lucide-react';
import { locations } from '../../data/locations';
import { SectionHeader } from '../shared/SectionHeader';

interface CoverageAreaProps {
  onSelectArea: (locationName: string) => void;
}

export function CoverageArea({ onSelectArea }: CoverageAreaProps) {
  const prianganMapUrl =
    'https://www.openstreetmap.org/export/embed.html?bbox=107.65%2C-7.65%2C108.75%2C-6.75&layer=mapnik&marker=-7.3506%2C108.2172';

  return (
    <section className="py-16 bg-white relative overflow-hidden border-b border-slate-50">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column - Region listings */}
          <div className="lg:col-span-6 text-left">
            <SectionHeader
              tagline="Wilayah Operasional"
              title="Jangkauan Layanan Suruhin"
              description="Saat ini kami melayani dan berfokus penuh di Kota Tasikmalaya dan daerah sekitarnya di Priangan Timur demi memastikan respons bantuan super cepat."
              align="left"
            />

            {/* List of Locations in a Clean Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 mt-8">
              {locations.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => onSelectArea(loc.name)}
                  className="group p-5 bg-[#F5F7FA]/40 hover:bg-orange-50/40 border border-slate-100 hover:border-[#FF6500]/15 rounded-2xl transition-all duration-300 cursor-pointer flex items-start gap-3"
                >
                  <div className="p-2.5 bg-white text-[#FF6500] group-hover:bg-[#FF6500] group-hover:text-white rounded-xl shadow-xs transition-colors shrink-0">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#082B5C] group-hover:text-[#FF6500] transition-colors flex items-center gap-1.5 mb-1">
                      <span>{loc.name}</span>
                      <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-[#FF6500]" />
                    </h3>
                    <p className="text-[11px] text-[#172033]/65 leading-relaxed line-clamp-2 max-w-[200px]">
                      {loc.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Real map */}
          <div className="lg:col-span-6 flex items-center justify-center relative">
            <div className="relative w-full max-w-md bg-gradient-to-br from-[#082B5C] to-slate-900 rounded-3xl p-8 text-white overflow-hidden shadow-2xl border border-white/5 min-h-[380px] flex flex-col justify-between">
              <div className="relative z-1 flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#FF6500] uppercase tracking-wider flex items-center gap-1">
                  <Navigation size={12} /> Priangan Timur Hub
                </span>
                <span className="text-[9px] font-bold bg-white/10 px-2 py-0.5 rounded-full border border-white/15 flex items-center gap-1">
                  <MapPin size={10} className="text-[#18A957]" /> Peta Nyata
                </span>
              </div>

              <div className="relative z-1 my-5 overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/8 shadow-inner">
                <iframe
                  title="Peta wilayah operasional Suruhin"
                  src={prianganMapUrl}
                  className="h-56 w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-[#082B5C]/25 to-transparent" />
              </div>

              <div className="relative z-1 flex flex-wrap gap-2 text-[10px] font-black text-white/80">
                {['Bandung', 'Garut', 'Tasikmalaya', 'Ciamis', 'Banjar'].map((label) => (
                  <span key={label} className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1">
                    {label}
                  </span>
                ))}
              </div>

              <div className="relative z-1 flex items-center justify-between text-left text-xs text-gray-300 border-t border-white/5 pt-4">
                <div>
                  <div className="font-extrabold text-white text-sm">250+ Talent</div>
                  <div className="text-[10px] text-gray-400">Aktif Pekan Ini</div>
                </div>
                <div className="text-right">
                  <a
                    href="https://www.openstreetmap.org/?mlat=-7.3506&mlon=108.2172#map=9/-7.3506/108.2172"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-extrabold text-[#18A957] text-sm"
                  >
                    Buka Peta
                    <ExternalLink size={12} />
                  </a>
                  <div className="text-[10px] text-gray-400">Tasikmalaya & Priangan Timur</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
