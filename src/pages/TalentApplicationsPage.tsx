import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BriefcaseBusiness } from 'lucide-react';
import { Container } from '../components/layout/Container';
import { getCurrentSessionUser } from '../lib/authSession';
import { listTalentApplications, subscribeJobRealtime } from '../lib/jobsMarketplace';
import { JobApplication } from '../types';
import { formatCurrency } from '../lib/formatCurrency';

interface TalentApplicationsPageProps {
  navigate: (path: string) => void;
}

export function TalentApplicationsPage({ navigate }: TalentApplicationsPageProps) {
  const talent = useMemo(() => getCurrentSessionUser(), []);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(Boolean(talent));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!talent) return;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        setApplications(await listTalentApplications(talent.id));
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Gagal memuat lamaran talent.');
      } finally {
        setLoading(false);
      }
    };

    void load();
    return subscribeJobRealtime(() => {
      void load();
    });
  }, [talent]);

  if (!talent) {
    return (
      <div className="min-h-screen bg-slate-50/60 py-24">
        <Container>
          <div className="rounded-[32px] border border-slate-100 bg-white p-8 text-center shadow-sm">
            <h1 className="text-3xl font-black text-[#082B5C]">Lamaran Saya</h1>
            <p className="mt-3 text-sm text-[#172033]/70">Talent harus login terlebih dulu untuk melihat histori lamaran.</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 py-24">
      <Container>
        <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FF6500]">Talent Dashboard</p>
          <h1 className="mt-2 text-3xl font-black text-[#082B5C]">Lamaran Saya</h1>
          <p className="mt-2 text-sm text-[#172033]/70">Pantau status penawaran Anda dari pekerjaan yang pernah dilamar.</p>
        </div>

        {error && <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">{error}</div>}

        {loading ? (
          <div className="mt-6 rounded-[32px] border border-slate-100 bg-white p-8 text-center text-sm font-bold text-[#082B5C]">
            Memuat lamaran talent...
          </div>
        ) : applications.length === 0 ? (
          <div className="mt-6 rounded-[32px] border border-dashed border-slate-200 bg-white p-10 text-center">
            <BriefcaseBusiness size={28} className="mx-auto text-[#FF6500]" />
            <h2 className="mt-4 text-xl font-black text-[#082B5C]">Belum ada lamaran terkirim</h2>
            <button
              onClick={() => navigate('/jobs')}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#082B5C] px-5 py-3 text-sm font-black text-white transition hover:bg-[#061e40]"
            >
              <span>Cari Pekerjaan</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {applications.map((application) => (
              <article key={application.id} className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black text-[#082B5C]">{application.talentName}</h2>
                    <p className="mt-1 text-xs font-bold text-[#FF6500]">{formatCurrency(application.offerPrice)} • {application.estimatedDuration}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black text-[#082B5C]">{application.status}</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#172033]/70">{application.message}</p>
                <p className="mt-4 text-xs font-bold text-[#172033]/55">Job ID: {application.jobId}</p>
              </article>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
