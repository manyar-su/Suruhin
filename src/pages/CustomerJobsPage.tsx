import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BriefcaseBusiness, PlusCircle } from 'lucide-react';
import { Container } from '../components/layout/Container';
import { getCurrentCustomerProfile } from '../lib/customerProfile';
import { listCustomerJobs, subscribeJobRealtime } from '../lib/jobsMarketplace';
import { JobPost } from '../types';
import { formatCurrency } from '../lib/formatCurrency';

interface CustomerJobsPageProps {
  navigate: (path: string) => void;
}

export function CustomerJobsPage({ navigate }: CustomerJobsPageProps) {
  const customer = useMemo(() => getCurrentCustomerProfile(), []);
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(Boolean(customer));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!customer) return;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        setJobs(await listCustomerJobs(customer.id));
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Gagal memuat pekerjaan customer.');
      } finally {
        setLoading(false);
      }
    };

    void load();
    return subscribeJobRealtime(() => {
      void load();
    });
  }, [customer]);

  if (!customer) {
    return (
      <div className="min-h-screen bg-slate-50/60 py-24">
        <Container>
          <div className="rounded-[32px] border border-slate-100 bg-white p-8 text-center shadow-sm">
            <h1 className="text-3xl font-black text-[#082B5C]">Dashboard Customer Jobs</h1>
            <p className="mt-3 text-sm text-[#172033]/70">
              Daftar customer terlebih dulu agar sistem tahu kepemilikan posting pekerjaan Anda.
            </p>
            <button
              onClick={() => navigate('/register/customer')}
              className="mt-6 rounded-2xl bg-[#082B5C] px-5 py-3 text-sm font-black text-white transition hover:bg-[#061e40]"
            >
              Daftar Customer
            </button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 py-24">
      <Container>
        <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FF6500]">Customer Dashboard</p>
              <h1 className="mt-2 text-3xl font-black text-[#082B5C]">Pekerjaan Saya</h1>
              <p className="mt-2 text-sm text-[#172033]/70">Kelola lowongan, lihat diskusi, dan pilih talent terbaik untuk direkrut.</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/customer/jobs/create')}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FF6500] px-5 py-3 text-sm font-black text-white transition hover:bg-[#e05900]"
            >
              <PlusCircle size={16} />
              <span>Buat Pekerjaan</span>
            </button>
          </div>
        </div>

        {error && <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">{error}</div>}

        {loading ? (
          <div className="mt-6 rounded-[32px] border border-slate-100 bg-white p-8 text-center text-sm font-bold text-[#082B5C]">
            Memuat pekerjaan customer...
          </div>
        ) : jobs.length === 0 ? (
          <div className="mt-6 rounded-[32px] border border-dashed border-slate-200 bg-white p-10 text-center">
            <BriefcaseBusiness size={28} className="mx-auto text-[#FF6500]" />
            <h2 className="mt-4 text-xl font-black text-[#082B5C]">Belum ada posting pekerjaan</h2>
            <p className="mt-2 text-sm text-[#172033]/65">Mulai dari satu lowongan. Talent akan melihat, berdiskusi, lalu mengajukan penawaran.</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {jobs.map((job) => (
              <article key={job.id} className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FF6500]">{job.categoryName}</p>
                    <h2 className="mt-2 text-xl font-black text-[#082B5C]">{job.title}</h2>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black text-[#082B5C]">{job.status}</span>
                </div>
                <p className="mt-3 line-clamp-3 text-sm text-[#172033]/70">{job.description}</p>
                <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                  <span className="font-black text-[#082B5C]">{formatCurrency(job.budget)}</span>
                  <span className="text-xs font-bold text-[#172033]/55">{job.applicationCount} penawaran</span>
                </div>
                <button
                  onClick={() => navigate(`/dashboard/customer/jobs/${job.id}`)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#082B5C]/10 px-4 py-2 text-xs font-black text-[#082B5C] transition hover:text-[#FF6500]"
                >
                  Kelola Pelamar
                  <ArrowRight size={14} />
                </button>
              </article>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
