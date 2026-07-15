import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, MessageSquare, Wallet } from 'lucide-react';
import { Container } from '../components/layout/Container';
import { getCurrentCustomerProfile } from '../lib/customerProfile';
import { acceptJobApplication, getJobDetailById, subscribeJobRealtime } from '../lib/jobsMarketplace';
import { JobApplication, JobComment, JobPost } from '../types';
import { formatCurrency } from '../lib/formatCurrency';

interface CustomerJobDetailPageProps {
  id: string;
  navigate: (path: string) => void;
}

export function CustomerJobDetailPage({ id, navigate }: CustomerJobDetailPageProps) {
  const customer = useMemo(() => getCurrentCustomerProfile(), []);
  const [job, setJob] = useState<JobPost | null>(null);
  const [comments, setComments] = useState<JobComment[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acceptingId, setAcceptingId] = useState('');

  useEffect(() => {
    if (!customer) return;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const detail = await getJobDetailById(id);
        setJob(detail.job);
        setComments(detail.comments);
        setApplications(detail.applications);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Gagal memuat detail pekerjaan.');
      } finally {
        setLoading(false);
      }
    };

    void load();
    return subscribeJobRealtime(() => {
      void load();
    });
  }, [customer, id]);

  if (!customer) {
    return (
      <div className="min-h-screen bg-slate-50/60 py-24">
        <Container>
          <div className="rounded-[32px] border border-slate-100 bg-white p-8 text-center shadow-sm">
            <h1 className="text-3xl font-black text-[#082B5C]">Kelola Pekerjaan Customer</h1>
            <p className="mt-3 text-sm text-[#172033]/70">Profil customer aktif tidak ditemukan di browser ini.</p>
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

  const handleAccept = async (applicationId: string) => {
    if (!job) return;
    try {
      setAcceptingId(applicationId);
      const accepted = await acceptJobApplication(job.id, applicationId);
      window.alert(`Talent direkrut. Booking ${accepted.orderId} dan chat awal sudah dibuat.`);
    } catch (reason) {
      window.alert(reason instanceof Error ? reason.message : 'Gagal merekrut talent.');
    } finally {
      setAcceptingId('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-24">
      <Container>
        <button
          onClick={() => navigate('/dashboard/customer/jobs')}
          className="mb-5 inline-flex items-center gap-2 text-sm font-black text-[#082B5C] transition hover:text-[#FF6500]"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke pekerjaan saya</span>
        </button>

        {loading ? (
          <div className="rounded-[32px] border border-slate-100 bg-white p-8 text-center text-sm font-bold text-[#082B5C]">
            Memuat data pelamar...
          </div>
        ) : error || !job ? (
          <div className="rounded-[32px] border border-red-100 bg-white p-8 text-center text-sm font-bold text-red-600">
            {error || 'Pekerjaan tidak ditemukan.'}
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <section className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FF6500]">{job.categoryName}</p>
              <h1 className="mt-2 text-3xl font-black text-[#082B5C]">{job.title}</h1>
              <p className="mt-3 text-sm leading-relaxed text-[#172033]/70">{job.description}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold text-[#082B5C]">
                <span className="rounded-full bg-slate-100 px-3 py-2">{job.status}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-2 text-emerald-700">
                  <Wallet size={14} />
                  {formatCurrency(job.budget)}
                </span>
              </div>

              <div className="mt-6">
                <div className="mb-3 flex items-center gap-2">
                  <MessageSquare size={18} className="text-[#FF6500]" />
                  <h2 className="text-xl font-black text-[#082B5C]">Diskusi Masuk</h2>
                </div>
                <div className="space-y-3">
                  {comments.length === 0 ? (
                    <p className="rounded-2xl bg-slate-50 p-4 text-sm text-[#172033]/60">Belum ada diskusi di posting ini.</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="rounded-2xl border border-slate-100 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-black text-[#082B5C]">{comment.actorName}</p>
                          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#172033]/45">{comment.actorRole}</span>
                        </div>
                        <p className="mt-2 text-sm text-[#172033]/70">{comment.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black text-[#082B5C]">Daftar Pelamar</h2>
              <div className="mt-5 space-y-4">
                {applications.length === 0 ? (
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm text-[#172033]/60">Belum ada talent yang mengajukan penawaran.</p>
                ) : (
                  applications.map((application) => (
                    <article key={application.id} className="rounded-[26px] border border-slate-100 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-black text-[#082B5C]">{application.talentName}</h3>
                          <p className="mt-1 text-sm font-bold text-[#FF6500]">{formatCurrency(application.offerPrice)} • {application.estimatedDuration}</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black text-[#082B5C]">{application.status}</span>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-[#172033]/70">{application.message}</p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          onClick={() => handleAccept(application.id)}
                          disabled={acceptingId === application.id || job.status === 'RECRUITED'}
                          className="inline-flex items-center gap-2 rounded-2xl bg-[#082B5C] px-4 py-3 text-sm font-black text-white transition hover:bg-[#061e40] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <CheckCircle2 size={16} />
                          <span>{acceptingId === application.id ? 'Merekrut...' : 'Pilih Talent'}</span>
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </Container>
    </div>
  );
}
