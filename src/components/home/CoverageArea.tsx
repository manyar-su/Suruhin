import { MapPin, Globe, Compass, ArrowUpRight } from 'lucide-react';
import { locations } from '../../data/locations';
import { SectionHeader } from '../shared/SectionHeader';

interface CoverageAreaProps {
  onSelectArea: (locationName: string) => void;
}

export function CoverageArea({ onSelectArea }: CoverageAreaProps) {
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

          {/* Right Column - Premium Stylized DOT MAP representation */}
          <div className="lg:col-span-6 flex items-center justify-center relative">
            <div className="relative w-full max-w-md bg-gradient-to-br from-[#082B5C] to-slate-900 rounded-3xl p-8 text-white overflow-hidden shadow-2xl border border-white/5 min-h-[380px] flex flex-col justify-between">
              
              {/* Grid Background Overlay */}
              <div className="absolute inset-0 opacity-5 mix-blend-overlay">
                <svg width="100%" height="100%">
                  <pattern id="map-grid" width="15" height="15" patternUnits="userSpaceOnUse">
                    <path d="M 15 0 L 0 0 0 15" fill="none" stroke="white" strokeWidth="1" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#map-grid)" />
                </svg>
              </div>

              {/* Header inside Map Box */}
              <div className="relative z-1 flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#FF6500] uppercase tracking-wider flex items-center gap-1">
                  <Compass size={12} className="animate-spin" style={{ animationDuration: '8s' }} /> Priangan Timur Hub
                </span>
                <span className="text-[9px] font-bold bg-white/10 px-2 py-0.5 rounded-full border border-white/15 flex items-center gap-1">
                  <Globe size={10} className="text-[#18A957]" /> Live Density
                </span>
              </div>

              {/* Stylized Dots Map Design */}
              <div className="relative w-full h-44 my-auto flex items-center justify-center z-1">
                {/* SVG Connecting lines */}
                <svg className="absolute inset-0 w-full h-full text-[#FF6500]/25 stroke-current fill-none">
                  <path d="M 200 80 L 120 120 L 280 120 Z M 200 80 L 200 150 L 120 120 Z M 280 120 L 200 150 M 120 120 L 150 40 L 200 80" strokeWidth="1.5" strokeDasharray="3,3" />
                </svg>

                {/* Dot 1: Bandung (Left top) */}
                <div className="absolute top-10 left-[25%] flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                  <span className="text-[8px] font-bold text-white/50 mt-1">Bandung</span>
                </div>

                {/* Dot 2: Garut (Left mid) */}
                <div className="absolute top-28 left-[15%] flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                  <span className="text-[8px] font-bold text-white/50 mt-1">Garut</span>
                </div>

                {/* Dot 3: Tasikmalaya Kota (Center Hub - Large) */}
                <div className="absolute top-16 left-[50%] -translate-x-1/2 flex flex-col items-center">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-8 h-8 rounded-full bg-[#FF6500]/30 animate-ping" />
                    <div className="w-4 h-4 rounded-full bg-[#FF6500] border-2 border-white shadow-lg" />
                  </div>
                  <span className="text-[10px] font-black text-white mt-1.5 bg-[#FF6500] px-2 py-0.5 rounded-md shadow-md">
                    TASIKMALAYA
                  </span>
                </div>

                {/* Dot 4: Ciamis (Right top) */}
                <div className="absolute top-24 right-[15%] flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                  <span className="text-[8px] font-bold text-white/50 mt-1">Ciamis</span>
                </div>

                {/* Dot 5: Banjar (Right bottom) */}
                <div className="absolute bottom-6 right-[25%] flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  <span className="text-[8px] font-bold text-white/50 mt-1">Banjar</span>
                </div>
              </div>

              {/* Map footnote details */}
              <div className="relative z-1 flex items-center justify-between text-left text-xs text-gray-300 border-t border-white/5 pt-4">
                <div>
                  <div className="font-extrabold text-white text-sm">250+ Talent</div>
                  <div className="text-[10px] text-gray-400">Aktif Pekan Ini</div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-[#18A957] text-sm">Online & Aman</div>
                  <div className="text-[10px] text-gray-400">Operasional 24 Jam</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
