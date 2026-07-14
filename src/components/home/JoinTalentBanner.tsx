import { CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '../shared/Button';
import { getStaticAssetPath } from '../../lib/assetPaths';
import { FallbackImage } from '../shared/FallbackImage';

interface JoinTalentBannerProps {
  onRegisterAsTalent: () => void;
}

export function JoinTalentBanner({ onRegisterAsTalent }: JoinTalentBannerProps) {
  const benefits = [
    'Pendaftaran 100% Gratis Tanpa Biaya',
    'Bebas Mengatur Jam Kerja & Jadwal Sendiri',
    'Penghasilan Transparan Dibayarkan Mingguan',
    'Dukungan Penuh & Pendampingan Keamanan Tim Admin',
    'Dapatkan Akses Ratusan Pelanggan Baru Setiap Hari',
  ];

  return (
    <section className="py-16 bg-white relative">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#082B5C] rounded-3xl overflow-hidden border border-white/5 relative flex flex-col lg:flex-row items-stretch min-h-[420px]">
          {/* Abstract glowing background blobs */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#FF6500]/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

          {/* Left Column - Graphic/Illustration Mockup */}
          <div className="lg:w-5/12 relative min-h-[250px] lg:min-h-auto overflow-hidden bg-gradient-to-br from-[#082B5C] to-slate-900 border-b lg:border-b-0 lg:border-r border-white/5">
            <FallbackImage
              src={getStaticAssetPath('jasa/join-talent-banner.webp')}
              alt="Gabung Jadi Talent Suruhin"
              type="banner"
              className="w-full h-full object-cover min-h-[250px]"
            />
          </div>

          {/* Right Column - Informative text */}
          <div className="lg:w-7/12 p-8 md:p-12 lg:p-14 text-left flex flex-col justify-center relative z-10 text-white">
            <span className="text-xs font-bold text-[#FF6500] uppercase tracking-widest flex items-center gap-1.5 mb-3.5">
              <Sparkles size={14} className="fill-[#FF6500]/10" /> Karir & Penghasilan Tambahan
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 leading-tight">
              Punya Waktu Luang? Yuk, Jadi Talent Suruhin!
            </h2>
            <p className="text-sm text-gray-300 mb-6 leading-relaxed">
              Ubah waktu santai atau keahlian khusus Anda (mengemudi, berolahraga, bersosialisasi, bersih-bersih, desain grafis) menjadi tambahan pundi penghasilan halal secara mandiri dan aman.
            </p>

            {/* Benefits List */}
            <ul className="space-y-3 mb-8">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-2.5 text-xs text-gray-200">
                  <CheckCircle size={16} className="text-[#FF6500] shrink-0" />
                  <span className="font-semibold">{benefit}</span>
                </li>
              ))}
            </ul>

            {/* CTA action button */}
            <div className="self-start">
              <Button
                variant="primary"
                onClick={onRegisterAsTalent}
                size="lg"
                className="font-extrabold shadow-xl shadow-orange-500/10"
              >
                Daftar Jadi Talent Sekarang
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
