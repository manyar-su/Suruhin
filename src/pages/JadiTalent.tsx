import { Container } from '../components/layout/Container';
import { TalentRegistrationForm } from '../components/forms/TalentRegistrationForm';
import { Sparkles, ShieldCheck, Heart, CircleDollarSign } from 'lucide-react';

export function JadiTalent() {
  const stepsList = [
    {
      title: 'Isi Formulir',
      desc: 'Masukkan data diri, nomor WhatsApp aktif, foto KTP, serta pilih jenis jasa bantuan yang ingin Anda tawarkan.',
      icon: Sparkles,
    },
    {
      title: 'Verifikasi & Wawancara',
      desc: 'Tim rekrutmen Suruhin akan meninjau data Anda dan menjadwalkan interview singkat tatap muka di kantor Tasikmalaya.',
      icon: ShieldCheck,
    },
    {
      title: 'Mulai Menghasilkan',
      desc: 'Akun Anda diaktifkan! Terima pesanan dari warga sekitar, bantu mereka dengan ramah, dan dapatkan upah langsung.',
      icon: CircleDollarSign,
    }
  ];

  return (
    <div className="py-24 bg-slate-50/50 min-h-screen">
      <Container>
        {/* Upper Hero */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF6500]/10 border border-[#FF6500]/20 text-[#FF6500] text-xs font-bold">
            <Heart size={14} className="fill-[#FF6500]/10" />
            <span>Peluang Karir Pendamping Jasa Lokal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#082B5C] tracking-tight">
            Ubah Waktu Senggang Jadi Penghasilan
          </h1>
          <p className="text-sm sm:text-base text-[#172033]/70 leading-relaxed max-w-2xl mx-auto">
            Bergabunglah bersama ratusan pemuda-pemudi Tasikmalaya yang aktif membantu warga menyelesaikan urusan harian secara aman, sopan, dan transparan.
          </p>
        </div>

        {/* Benefits Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          {stepsList.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-100 flex items-start gap-4 shadow-xs"
              >
                <div className="p-3 bg-orange-50 text-[#FF6500] rounded-xl shrink-0">
                  <Icon size={18} />
                </div>
                <div className="text-left">
                  <h3 className="text-xs font-extrabold text-[#082B5C] uppercase tracking-wider mb-1">{step.title}</h3>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Integrated registration form wizard */}
        <TalentRegistrationForm />

      </Container>
    </div>
  );
}
