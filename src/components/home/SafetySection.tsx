import { ShieldAlert, Verified, Star, MapPin, PhoneCall, HelpCircle, FileWarning, EyeOff } from 'lucide-react';
import { SectionHeader } from '../shared/SectionHeader';
import { Button } from '../shared/Button';

interface SafetySectionProps {
  onLearnMore: () => void;
}

export function SafetySection({ onLearnMore }: SafetySectionProps) {
  const safeguards = [
    {
      title: 'Verifikasi Identitas Talent',
      desc: 'Wajib mengunggah KTP asli, pemeriksaan SIM, SKCK kepolisian, serta sesi interview kualifikasi tatap muka.',
      icon: Verified,
      color: 'text-blue-600',
    },
    {
      title: 'Ulasan & Rating Transparan',
      desc: 'Ulasan murni dari konsumen nyata tanpa sensor untuk menjaga akuntabilitas kualitas kerja setiap Talent.',
      icon: Star,
      color: 'text-[#FF6500]',
    },
    {
      title: 'Lokasi & Jadwal Tercatat',
      desc: 'Seluruh lokasi koordinat pemesanan terarsip resmi di server pusat kami demi kenyamanan dan perlindungan ganda.',
      icon: MapPin,
      color: 'text-indigo-600',
    },
    {
      title: 'Tombol Darurat WhatsApp',
      desc: 'Pintasan tanggap darurat yang terhubung instan ke Tim Reaksi Cepat operasional Suruhin jika ada kendala di lapangan.',
      icon: PhoneCall,
      color: 'text-emerald-600',
    },
    {
      title: 'Dukungan Pelanggan 24/7',
      desc: 'Layanan admin pendukung sedia membantu koordinasi, pengaduan, dan kendala penjemputan sepanjang hari.',
      icon: HelpCircle,
      color: 'text-pink-600',
    },
    {
      title: 'Sistem Pelaporan Pengguna',
      desc: 'Kemudahan memblokir atau melaporkan pelanggaran sopan santun untuk menjaga ekosistem tetap bersih.',
      icon: FileWarning,
      color: 'text-purple-600',
    },
    {
      title: 'Perlindungan Data Pribadi',
      desc: 'Nomor telepon pribadi atau dokumen KTP Anda aman di enkripsi, tidak akan disalahgunakan atau dijual ke pihak ketiga.',
      icon: EyeOff,
      color: 'text-cyan-600',
    },
  ];

  return (
    <section className="py-16 bg-white relative">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <SectionHeader
          tagline="Sistem Keamanan"
          title="Keamanan & Kenyamanan Anda Adalah Prioritas Utama Kami"
          description="Suruhin dirancang dari awal dengan komitmen perlindungan ketat, demi mewujudkan marketplace bantuan lokal yang sehat dan bebas dari kekhawatiran."
          align="center"
        />

        {/* Safeguards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
          {safeguards.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#F5F7FA]/40 p-6 rounded-3xl border border-slate-50 hover:bg-white hover:border-[#FF6500]/15 hover:shadow-xl transition-all duration-300 flex items-start gap-4"
                style={{ borderRadius: '20px' }} // Specified: "Border radius card 20px"
              >
                <div className={`p-3 rounded-2xl bg-white shadow-sm ${item.color} shrink-0`}>
                  <Icon size={20} className="stroke-2" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-black text-[#082B5C] mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#172033]/60 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Safety Disclaimer Banner */}
        <div className="bg-[#082B5C] text-white p-8 rounded-3xl relative overflow-hidden border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#FF6500]/10 blur-2xl pointer-events-none" />
          
          <div className="flex gap-4 items-start text-left max-w-2xl">
            <div className="p-3 bg-[#FF6500] rounded-2xl text-white mt-1 shrink-0">
              <ShieldAlert size={24} className="animate-pulse" />
            </div>
            <div>
              <h4 className="text-lg font-extrabold mb-1">Deklarasi Batasan Norma Susila</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                PENTING: Seluruh layanan pendampingan harian (“temenin”) murni ditujukan untuk aktivitas legal, santun, aman, dan bermanfaat secara sosial. Kami **melarang keras** segala bentuk eksploitasi, kencan romantis, tindak kekerasan, perjudian, penyalahgunaan zat terlarang, atau layanan sensual. Melanggar hal ini akan diproses hukum pidana langsung bekerjasama dengan Kepolisian Kota Tasikmalaya.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={onLearnMore}
            className="font-bold shrink-0 shadow-lg shadow-orange-500/20"
          >
            Pelajari Sistem Keamanan
          </Button>
        </div>
      </div>
    </section>
  );
}
