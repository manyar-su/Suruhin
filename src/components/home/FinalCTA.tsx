import { ArrowRight, HelpCircle } from 'lucide-react';
import { Button } from '../shared/Button';
import { Container } from '../layout/Container';

interface FinalCTAProps {
  onFindService: () => void;
  onJoinAsTalent: () => void;
}

export function FinalCTA({ onFindService, onJoinAsTalent }: FinalCTAProps) {
  return (
    <section className="py-20 bg-gradient-to-br from-[#082B5C] to-slate-900 text-white relative overflow-hidden">
      {/* Visual background vector layers */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#FF6500]/10 blur-3xl pointer-events-none" />
      <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-blue-500/15 blur-2xl pointer-events-none" />

      <Container className="relative z-1">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
          
          {/* Tag Icon Badge */}
          <div className="p-3 bg-white/5 border border-white/10 rounded-2xl mb-6">
            <HelpCircle size={24} className="text-[#FF6500]" />
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4">
            Ada yang Perlu Dibantu Hari Ini?
          </h2>

          {/* Description */}
          <p className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-2xl mb-10">
            Dapatkan bantuan harian tepercaya di sekitar Tasikmalaya dengan aman, cepat, dan penuh kesopanan. Apa aja? Suruhin aja.
          </p>

          {/* Buttons Row */}
          <div className="flex flex-col sm:flex-row items-center gap-4.5 w-full justify-center">
            <Button
              onClick={onFindService}
              variant="primary"
              size="lg"
              className="w-full sm:w-auto font-extrabold shadow-xl shadow-orange-500/10"
            >
              <span>Cari Layanan</span>
              <ArrowRight size={16} className="ml-2" />
            </Button>
            
            <button
              onClick={onJoinAsTalent}
              className="w-full sm:w-auto inline-flex items-center justify-center h-13 px-7 text-base font-extrabold border border-white/20 hover:border-[#FF6500] hover:bg-white/5 rounded-xl transition-all cursor-pointer text-center"
            >
              Daftar Jadi Talent
            </button>
          </div>

        </div>
      </Container>
    </section>
  );
}
