import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Clock3, MapPin, MessageSquare, Send, Wallet } from 'lucide-react';
import { Container } from '../components/layout/Container';
import { getTalentAvatarPath } from '../lib/assetPaths';
import {
  addJobComment,
  getJobDetailBySlug,
  getJobsViewerContext,
  submitJobApplication,
  subscribeJobRealtime,
  updateJobApplicationStatus,
} from '../lib/jobsMarketplace';
import { JobApplication, JobComment, JobPost } from '../types';
import { formatCurrency } from '../lib/formatCurrency';

interface JobDetailPageProps {
  slug: string;
  navigate: (path: string) => void;
}

export function JobDetailPage({ slug, navigate }: JobDetailPageProps) {
  const [job, setJob] = useState<JobPost | null>(null);
  const [comments, setComments] = useState<JobComment[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentMessage, setCommentMessage] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('4 jam');
  const [applicationMessage, setApplicationMessage] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);
  const viewer = useMemo(() => getJobsViewerContext(), []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const detail = await getJobDetailBySlug(slug);
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
  }, [slug]);

  const currentTalentApplication = useMemo(
    () => applications.find((application) => application.talentId === viewer.currentTalent?.id),
    [applications, viewer.currentTalent?.id]
  );

  const handleSendComment = async (event: FormEvent) => {
    event.preventDefault();
    if (!job) return;

    const actor = viewer.currentTalent
      ? {
          userId: viewer.currentTalent.id,
          actorRole: 'talent' as const,
          actorName: viewer.currentTalent.name,
        }
      : viewer.currentCustomer
      ? {
          userId: viewer.currentCustomer.id,
          actorRole: 'customer' as const,
          actorName: viewer.currentCustomer.fullName,
        }
      : null;

    if (!actor) {
      window.alert('Masuk sebagai talent atau daftar customer terlebih dulu untuk ikut diskusi.');
      return;
    }

    try {
      setIsSubmittingComment(true);
      await addJobComment({
        jobId: job.id,
        userId: actor.userId,
        actorRole: actor.actorRole,
        actorName: actor.actorName,
        message: commentMessage,
      });
      setCommentMessage('');
    } catch (reason) {
      window.alert(reason instanceof Error ? reason.message : 'Gagal mengirim diskusi.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleApply = async (event: FormEvent) => {
    event.preventDefault();
    if (!job || !viewer.currentTalent) {
      window.alert('Talent harus login terlebih dulu untuk mengajukan penawaran.');
      return;
    }

    try {
      setIsSubmittingApplication(true);
      await submitJobApplication({
        jobId: job.id,
        talentId: viewer.currentTalent.id,
        talentName: viewer.currentTalent.name,
        talentAvatar: viewer.currentTalent.avatar,
        offerPrice: Number(offerPrice || 0),
        estimatedDuration,
        message: applicationMessage,
      });
      setOfferPrice('');
      setEstimatedDuration('4 jam');
      setApplicationMessage('');
      window.alert('Penawaran berhasil dikirim. Customer akan melihat lamaran Anda.');
    } catch (reason) {
      window.alert(reason instanceof Error ? reason.message : 'Gagal mengirim penawaran.');
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  const handleWithdraw = async () => {
    if (!currentTalentApplication) return;
    try {
      await updateJobApplicationStatus(currentTalentApplication.id, 'WITHDRAWN');
      window.alert('Lamaran berhasil ditarik.');
    } catch (reason) {
      window.alert(reason instanceof Error ? reason.message : 'Gagal menarik lamaran.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-24">
      <Container>
        <button
          onClick={() => navigate('/jobs')}
          className="mb-5 inline-flex items-center gap-2 text-sm font-black text-[#082B5C] transition hover:text-[#FF6500]"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke daftar pekerjaan</span>
        </button>

        {loading ? (
          <div className="rounded-[32px] border border-slate-100 bg-white p-8 text-center text-sm font-bold text-[#082B5C]">
            Memuat detail pekerjaan...
          </div>
        ) : error || !job ? (
          <div className="rounded-[32px] border border-red-100 bg-white p-8 text-center text-sm font-bold text-red-600">
            {error || 'Pekerjaan tidak ditemukan.'}
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <section className="space-y-6">
              <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#FF6500]">{job.categoryName}</p>
                    <h1 className="mt-2 text-3xl font-black tracking-tight text-[#082B5C]">{job.title}</h1>
                    <p className="mt-2 text-sm text-[#172033]/70">Diposting oleh {job.customerName}</p>
                  </div>
                  <span className="rounded-full bg-[#082B5C]/6 px-4 py-2 text-xs font-black text-[#082B5C]">
                    {job.status}
                  </span>
                </div>

                <p className="mt-5 text-sm leading-relaxed text-[#172033]/75">{job.description}</p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#FF6500]">
                      <Wallet size={13} />
                      <span>Budget</span>
                    </div>
                    <p className="mt-2 text-lg font-black text-[#082B5C]">{formatCurrency(job.budget)}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#FF6500]">
                      <MapPin size={13} />
                      <span>Lokasi</span>
                    </div>
                    <p className="mt-2 text-sm font-bold text-[#082B5C]">{job.location}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#FF6500]">
                      <Clock3 size={13} />
                      <span>Deadline</span>
                    </div>
                    <p className="mt-2 text-sm font-bold text-[#082B5C]">
                      {job.deadline ? new Date(job.deadline).toLocaleDateString('id-ID') : 'Fleksibel'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center gap-2">
                  <MessageSquare size={18} className="text-[#FF6500]" />
                  <h2 className="text-xl font-black text-[#082B5C]">Diskusi Pekerjaan</h2>
                </div>

                <div className="mt-5 space-y-3">
                  {comments.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-[#172033]/60">
                      Belum ada diskusi. Talent bisa bertanya detail pekerjaan di sini.
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="rounded-2xl border border-slate-100 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-black text-[#082B5C]">{comment.actorName}</p>
                          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#172033]/45">
                            {comment.actorRole}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-[#172033]/75">{comment.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleSendComment} className="mt-5 space-y-3">
                  <textarea
                    rows={3}
                    value={commentMessage}
                    onChange={(event) => setCommentMessage(event.target.value)}
                    placeholder="Tulis pertanyaan atau klarifikasi pekerjaan..."
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500]"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingComment}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#082B5C] px-5 py-3 text-sm font-black text-white transition hover:bg-[#061e40] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Send size={15} />
                    <span>{isSubmittingComment ? 'Mengirim...' : 'Kirim Diskusi'}</span>
                  </button>
                </form>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-black text-[#082B5C]">Ajukan Penawaran</h2>
                {!viewer.currentTalent ? (
                  <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm font-bold text-amber-700">
                    Talent harus login terlebih dulu untuk mengajukan penawaran pada pekerjaan ini.
                  </div>
                ) : currentTalentApplication && currentTalentApplication.status !== 'WITHDRAWN' ? (
                  <div className="mt-4 space-y-4">
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
                      Anda sudah mengirim penawaran dengan status <strong>{currentTalentApplication.status}</strong>.
                    </div>
                    <button
                      onClick={handleWithdraw}
                      className="rounded-2xl border border-red-200 px-4 py-3 text-sm font-black text-red-600 transition hover:bg-red-50"
                    >
                      Tarik Lamaran
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="mt-4 space-y-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-black uppercase text-gray-500">Penawaran Harga</label>
                      <input
                        type="number"
                        min={0}
                        value={offerPrice}
                        onChange={(event) => setOfferPrice(event.target.value)}
                        className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500]"
                        placeholder="150000"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-black uppercase text-gray-500">Estimasi Durasi</label>
                      <input
                        value={estimatedDuration}
                        onChange={(event) => setEstimatedDuration(event.target.value)}
                        className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500]"
                        placeholder="4 jam"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-black uppercase text-gray-500">Pesan Penawaran</label>
                      <textarea
                        rows={4}
                        value={applicationMessage}
                        onChange={(event) => setApplicationMessage(event.target.value)}
                        className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#FF6500]"
                        placeholder="Jelaskan kesiapan, pengalaman, dan skema kerja Anda."
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingApplication}
                      className="w-full rounded-2xl bg-[#FF6500] px-5 py-3 text-sm font-black text-white transition hover:bg-[#e05900] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmittingApplication ? 'Mengirim Penawaran...' : 'Ajukan Penawaran'}
                    </button>
                  </form>
                )}
              </div>

              <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-black text-[#082B5C]">Penawaran Masuk</h2>
                <div className="mt-4 space-y-3">
                  {applications.length === 0 ? (
                    <p className="rounded-2xl bg-slate-50 p-4 text-sm text-[#172033]/60">Belum ada talent yang mengajukan penawaran.</p>
                  ) : (
                    applications.map((application) => (
                      <div key={application.id} className="rounded-2xl border border-slate-100 p-4">
                        <div className="flex items-start gap-3">
                          <img
                            src={getTalentAvatarPath(application.talentAvatar || undefined, application.talentName)}
                            alt={application.talentName}
                            className="h-11 w-11 rounded-2xl object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <p className="truncate text-sm font-black text-[#082B5C]">{application.talentName}</p>
                              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#172033]/45">{application.status}</span>
                            </div>
                            <p className="mt-1 text-xs font-bold text-[#FF6500]">{formatCurrency(application.offerPrice)} • {application.estimatedDuration}</p>
                            <p className="mt-2 text-sm leading-relaxed text-[#172033]/70">{application.message}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </aside>
          </div>
        )}
      </Container>
    </div>
  );
}
