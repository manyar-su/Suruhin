import { testimonials } from '../../data/testimonials';
import { SectionHeader } from '../shared/SectionHeader';
import { Rating } from '../shared/Rating';
import { Quote } from 'lucide-react';

export function Testimonials() {
  return (
    <section className="py-16 bg-[#F5F7FA]/35 border-t border-slate-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-10 left-10 w-48 h-48 bg-[#FF6500]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <SectionHeader
          tagline="Ulasan Pelanggan"
          title="Apa Kata Mereka Tentang Kami?"
          description="Ratusan warga Tasikmalaya telah terbantu menyelesaikan urusan sehari-hari mereka dengan lebih praktis."
          align="center"
        />

        {/* Testimonials Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((test) => (
            <div
              key={test.id}
              className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full relative group hover:border-orange-500/10"
              style={{ borderRadius: '20px' }} // Specified: "Border radius card 20px"
            >
              {/* Quote icon watermarked */}
              <Quote size={40} className="text-orange-500/10 absolute top-6 right-6 select-none" />

              <div>
                {/* Rating component */}
                <div className="mb-4">
                  <Rating value={test.rating} showText={false} size={14} />
                </div>

                {/* Content text */}
                <p className="text-xs sm:text-sm text-[#172033]/80 italic leading-relaxed text-left mb-6 font-medium">
                  “ {test.content} ”
                </p>
              </div>

              {/* Customer Profiling */}
              <div className="flex items-center gap-3.5 border-t border-slate-50 pt-5">
                {/* Simulated Avatar with Initials */}
                <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center text-[#FF6500] font-black text-xs border-2 border-white shadow-sm shrink-0">
                  {test.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                
                <div className="text-left">
                  <h4 className="text-sm font-black text-[#082B5C] leading-none mb-1">
                    {test.name}
                  </h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">
                    {test.role} • <span className="text-[#FF6500]/70 font-semibold">{test.location}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
