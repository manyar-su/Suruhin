import { Search, UserCheck, CalendarDays, CheckCircle2 } from 'lucide-react';
import { SectionHeader } from '../shared/SectionHeader';

export function HowItWorks() {
  const steps = [
    {
      num: '1',
      title: 'Cari Layanan',
      desc: 'Pilih jenis bantuan yang Anda butuhkan dari katalog harian terlengkap kami.',
      icon: Search,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      num: '2',
      title: 'Pilih Talent',
      desc: 'Bandingkan kualifikasi, gender, ulasan, rating, dan pilih mitra yang paling cocok.',
      icon: UserCheck,
      color: 'bg-orange-50 text-[#FF6500]',
    },
    {
      num: '3',
      title: 'Atur Jadwal & Lokasi',
      desc: 'Tentukan tanggal, jam penjemputan atau pertemuan, serta detail alamat Anda.',
      icon: CalendarDays,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      num: '4',
      title: 'Talent Datang & Bantu',
      desc: 'Talent datang tepat waktu, urusan selesai, dan pembayaran diteruskan dengan aman.',
      icon: CheckCircle2,
      color: 'bg-green-50 text-green-600',
    },
  ];

  return (
    <section className="py-16 bg-[#F5F7FA]/40 border-y border-slate-50 relative overflow-hidden">
      {/* Abstract lines inside background */}
      <div className="absolute top-1/2 left-0 right-0 h-0.5 border-t border-dashed border-slate-200 -translate-y-1/2 hidden lg:block -z-10" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <SectionHeader
          tagline="Proses Mudah"
          title="Bagaimana Suruhin Membantu Anda?"
          description="Selesaikan urusan harian dalam 4 langkah praktis dari gawai Anda. Efisien dan bebas ribet!"
          align="center"
        />

        {/* Steps Timeline Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="group bg-white p-8 rounded-3xl border border-slate-100 hover:border-[#FF6500]/15 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center relative"
                style={{ borderRadius: '20px' }} // Specified: "Border radius card 20px"
              >
                {/* Step Numbering Badge */}
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#FF6500] text-white flex items-center justify-center text-xs font-black shadow-md border-2 border-white select-none">
                  {step.num}
                </span>

                {/* Icon Circle */}
                <div className={`p-4 rounded-2xl ${step.color} shadow-inner group-hover:scale-110 transition-transform duration-300 mb-5`}>
                  <Icon size={24} className="stroke-2" />
                </div>

                {/* Details */}
                <h3 className="text-base font-extrabold text-[#082B5C] mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-[#172033]/60 leading-relaxed">
                  {step.desc}
                </p>

                {/* Decorative Connector for desktop */}
                {idx < 3 && (
                  <div className="hidden lg:block absolute -right-6 top-1/2 -translate-y-1/2 text-gray-300 z-10 font-bold text-xl pointer-events-none">
                    →
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
