import { ArrowRight, CalendarDays, CheckCircle2, Search, UserCheck } from 'lucide-react';

const steps = [
  {
    num: '1',
    title: 'Pilih Layanan',
    desc: 'Cari bantuan yang kamu butuhkan dengan mudah.',
    icon: Search,
  },
  {
    num: '2',
    title: 'Pilih Talent',
    desc: 'Pilih talent terpercaya sesuai kebutuhan kamu.',
    icon: UserCheck,
  },
  {
    num: '3',
    title: 'Atur Jadwal',
    desc: 'Tentukan lokasi, waktu, dan detail pertemuan.',
    icon: CalendarDays,
  },
  {
    num: '4',
    title: 'Berhasil!',
    desc: 'Layanan selesai, kamu pun puas dan tenang.',
    icon: CheckCircle2,
  },
];

const stats = [
  { value: '10.000+', label: 'Pengguna Terdaftar' },
  { value: '5.000+', label: 'Talent Aktif' },
  { value: '25.000+', label: 'Pesanan Selesai' },
  { value: '4.9', label: 'Rating Kepuasan' },
];

export function HowItWorks() {
  return (
    <section className="bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fbff_100%)] py-14 md:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ff9f12]">Cara Kerja</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-[#081a44] sm:text-[2.2rem]">
            Cukup beberapa langkah untuk mulai dibantu
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.num}
                className="relative rounded-[1.9rem] border border-slate-100 bg-white p-6 shadow-[0_20px_55px_rgba(8,43,92,0.06)]"
              >
                <span className="mb-6 flex h-11 w-11 items-center justify-center rounded-full bg-[#ff7b00] text-sm font-black text-white">
                  {step.num}
                </span>

                <div className="flex items-start gap-4">
                  <span className="flex h-18 w-18 shrink-0 items-center justify-center rounded-[1.45rem] bg-[#fff6eb] text-[#081a44]">
                    <Icon size={30} />
                  </span>
                  <div className="pt-1">
                    <h3 className="text-xl font-black text-[#081a44]">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#172033]/72">{step.desc}</p>
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <span className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-slate-300 lg:block">
                    <ArrowRight size={28} />
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid gap-4 rounded-[2rem] bg-[#0b204c] px-6 py-6 text-white shadow-[0_26px_70px_rgba(8,43,92,0.2)] md:grid-cols-4 md:px-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`text-center md:text-left ${index < stats.length - 1 ? 'md:border-r md:border-white/12 md:pr-6' : ''}`}
            >
              <div className="text-3xl font-black tracking-tight">{stat.value}</div>
              <div className="mt-1 text-sm font-semibold text-white/72">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
