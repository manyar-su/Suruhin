import { ArrowRight, BriefcaseBusiness, Search, ShieldCheck } from 'lucide-react';
import { Container } from '../components/layout/Container';
import { CustomerRegistrationForm } from '../components/forms/CustomerRegistrationForm';
import { TalentRegistrationForm } from '../components/forms/TalentRegistrationForm';

interface RegisterPageProps {
  mode?: 'customer' | 'talent';
  navigate: (path: string) => void;
}

export function RegisterPage({ mode, navigate }: RegisterPageProps) {
  if (mode === 'customer') {
    return (
      <div className="min-h-screen bg-slate-50/50 py-24">
        <Container>
          <CustomerRegistrationForm onSuccess={() => navigate('/talent?available=1&verified=1')} />
        </Container>
      </div>
    );
  }

  if (mode === 'talent') {
    return (
      <div className="min-h-screen bg-slate-50/50 py-24">
        <Container>
          <TalentRegistrationForm onSuccess={() => navigate('/dashboard/talent')} />
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff4ec,transparent_35%),linear-gradient(135deg,#ffffff,#f8fafc)] py-24">
      <Container>
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#FF6500]/20 bg-[#FF6500]/10 px-4 py-2 text-xs font-bold text-[#FF6500]">
            <ShieldCheck size={14} />
            <span>MVP pendaftaran Suruhin</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-[#061B3A] md:text-6xl">
            Daftar sebagai Customer atau Talent
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#172033]/70 md:text-base">
            Pilih jalur pendaftaran. Data disimpan di Supabase Database dan dokumen masuk ke bucket private.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <button
              type="button"
              onClick={() => navigate('/register/customer')}
              className="group rounded-[32px] border border-slate-100 bg-white p-8 text-left shadow-xl shadow-slate-200/60 transition hover:-translate-y-1 hover:border-[#FF6500]/30"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF6500] text-white shadow-lg shadow-orange-500/20">
                <Search size={24} />
              </div>
              <h2 className="text-2xl font-black text-[#061B3A]">Daftar sebagai Customer</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#172033]/65">
                Buat profil pemesan, upload KTP, lalu lanjut mencari talent atau jasa di sekitar.
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#FF6500]">
                Cari Teman Sekarang
                <ArrowRight size={16} className="transition group-hover:translate-x-1" />
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/register/talent')}
              className="group rounded-[32px] border border-[#061B3A]/10 bg-[#061B3A] p-8 text-left text-white shadow-xl shadow-slate-300/60 transition hover:-translate-y-1"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-[#FF6500]">
                <BriefcaseBusiness size={24} />
              </div>
              <h2 className="text-2xl font-black">Daftar sebagai Talent</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                Ajukan profil talent, upload KTP/SKCK, tentukan kategori jasa dan tarif per jam.
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#FF6500]">
                Gabung Jadi Talent
                <ArrowRight size={16} className="transition group-hover:translate-x-1" />
              </span>
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
}
