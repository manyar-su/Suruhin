import { useEffect, useState } from 'react';
import { ArrowRight, BriefcaseBusiness, Clock3, MapPin, Wallet } from 'lucide-react';
import { Container } from '../components/layout/Container';
import { listOpenJobs, subscribeJobRealtime } from '../lib/jobsMarketplace';
import { JobPost } from '../types';
import { formatCurrency } from '../lib/formatCurrency';

interface JobsMarketplacePageProps {
  navigate: (path: string) => void;
}

export function JobsMarketplacePage({ navigate }: JobsMarketplacePageProps) {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        setJobs(await listOpenJobs());
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Gagal memuat pekerjaan.');
      } finally {
        setLoading(false);
      }
    };

    void load();
    return subscribeJobRealtime(() => {
      void load();
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/60 py-24">
      <Container>
        <div className="rounded-[36px] border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6500]/20 bg-[#FF6500]/10 px-3 py-1.5 text-xs font-black text-[#FF6500]">
                <BriefcaseBusiness size={14} />
                <span>Cari Pekerjaan</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-[#082B5C] sm:text-4xl">
                Lowongan aktif dari customer Suruhin
              </h1>
              <p className="max-w-3xl text-sm leading-relaxed text-[#172033]/70">
                Area ini terpisah dari Cari Talent. Customer memposting kebutuhan, talent berdiskusi lalu mengajukan penawaran sampai direkrut.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => navigate('/dashboard/customer/jobs/create')}
                className="rounded-2xl bg-[#082B5C] px-5 py-3 text-sm font-black text-white transition hover:bg-[#061e40]"
              >
                Buat Pekerjaan
              </button>
              <button
                onClick={() => navigate('/dashboard/talent/applications')}
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black text-[#082B5C] transition hover:bg-slate-50"
              >
                Lamaran Saya
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-6 rounded-[32px] border border-slate-100 bg-white p-8 text-center text-sm font-bold text-[#082B5C]">
            Memuat lowongan pekerjaan...
          </div>
        ) : jobs.length === 0 ? (
          <div className="mt-6 rounded-[32px] border border-dashed border-slate-200 bg-white p-10 text-center">
            <h2 className="text-xl font-black text-[#082B5C]">Belum ada pekerjaan terbuka</h2>
            <p className="mt-2 text-sm text-[#172033]/65">
              Customer bisa membuat posting baru dari dashboard customer jobs.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {jobs.map((job) => (
              <article key={job.id} className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#FF6500]">{job.categoryName}</p>
                    <h2 className="mt-2 text-xl font-black text-[#082B5C]">{job.title}</h2>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-600">
                    {job.status}
                  </span>
                </div>

                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[#172033]/70">
                  {job.description}
                </p>

                <div className="mt-4 grid gap-2 text-xs font-semibold text-[#082B5C]/85">
                  <div className="flex items-center gap-2">
                    <Wallet size={14} className="text-[#FF6500]" />
                    <span>{formatCurrency(job.budget)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-[#FF6500]" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock3 size={14} className="text-[#FF6500]" />
                    <span>{job.deadline ? `Deadline ${new Date(job.deadline).toLocaleDateString('id-ID')}` : 'Tanpa deadline khusus'}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 text-[11px] font-bold text-[#172033]/60">
                  <span>{job.applicationCount} penawaran • {job.commentCount} diskusi</span>
                  <button
                    onClick={() => navigate(`/jobs/${job.slug}`)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#082B5C]/10 px-4 py-2 text-xs font-black text-[#082B5C] transition hover:border-[#FF6500]/30 hover:text-[#FF6500]"
                  >
                    Lihat Detail
                    <ArrowRight size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
