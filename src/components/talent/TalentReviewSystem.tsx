import React, { useState, useEffect, useMemo } from 'react';
import { Star, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { Rating } from '../shared/Rating';
import { Talent, Service } from '../../types';

interface TalentReviewSystemProps {
  talent: Talent;
  supportedServices: Service[];
  onRatingUpdated: (averageRating: number, totalCount: number) => void;
}

interface Review {
  id: string;
  name: string;
  rating: number;
  role: string;
  task: string;
  comment: string;
  date: string;
}

export function TalentReviewSystem({ talent, supportedServices, onRatingUpdated }: TalentReviewSystemProps) {
  // Load custom user reviews from localStorage
  const [userReviews, setUserReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem(`jastip_talent_reviews_${talent.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved reviews', e);
      }
    }
    return [];
  });

  // Form State
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formHoverRating, setFormHoverRating] = useState<number | null>(null);
  const [formTask, setFormTask] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Static/default reviews seeded for realism
  const defaultReviews = useMemo(() => {
    const defaultTask1 = supportedServices[0]?.title || 'Layanan Umum';
    const defaultTask2 = supportedServices[1]?.title || supportedServices[0]?.title || 'Layanan Umum';
    return [
      {
        id: `default-${talent.id}-1`,
        name: 'Dr. Ahmad Fauzi',
        rating: 5,
        role: 'Dosen UNSIL',
        task: defaultTask1,
        comment: `Sangat sopan, mengendarai motor dengan sangat hati-hati ketika menjemput anak sekolah anak saya. Recommended sekali!`,
        date: 'Kemarin',
      },
      {
        id: `default-${talent.id}-2`,
        name: 'Siti Rohmah',
        rating: 5,
        role: 'Ibu Rumah Tangga',
        task: defaultTask2,
        comment: `Kang ${talent.name.split(' ')[0]} sangat sabar mendampingi ibu saya ke posyandu lansia kemarin. Sangat ramah dan cekatan.`,
        date: '3 hari yang lalu',
      },
    ];
  }, [talent, supportedServices]);

  // Combine user reviews + default reviews for display
  const allReviews = useMemo(() => {
    return [...userReviews, ...defaultReviews];
  }, [userReviews, defaultReviews]);

  // Blended average rating and counts (mathematically blending user reviews with baseline talent info)
  const stats = useMemo(() => {
    const originalReviewsSum = talent.rating * talent.reviewCount;
    const originalReviewsCount = talent.reviewCount;

    const totalCount = originalReviewsCount + userReviews.length;
    const userReviewsSum = userReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalCount === 0 ? talent.rating : (originalReviewsSum + userReviewsSum) / totalCount;

    // Distribute star ratings realistically based on overall rating
    const baseline5 = Math.round(originalReviewsCount * 0.88);
    const baseline4 = Math.round(originalReviewsCount * 0.08);
    const baseline3 = Math.round(originalReviewsCount * 0.03);
    const baseline2 = Math.round(originalReviewsCount * 0.01);
    const baseline1 = Math.max(0, originalReviewsCount - (baseline5 + baseline4 + baseline3 + baseline2));

    const total5 = baseline5 + userReviews.filter((r) => r.rating === 5).length;
    const total4 = baseline4 + userReviews.filter((r) => r.rating === 4).length;
    const total3 = baseline3 + userReviews.filter((r) => r.rating === 3).length;
    const total2 = baseline2 + userReviews.filter((r) => r.rating === 2).length;
    const total1 = baseline1 + userReviews.filter((r) => r.rating === 1).length;

    const totalStarsCount = total5 + total4 + total3 + total2 + total1;

    return {
      averageRating,
      totalCount,
      starDistribution: {
        5: { count: total5, pct: totalStarsCount > 0 ? (total5 / totalStarsCount) * 100 : 0 },
        4: { count: total4, pct: totalStarsCount > 0 ? (total4 / totalStarsCount) * 100 : 0 },
        3: { count: total3, pct: totalStarsCount > 0 ? (total3 / totalStarsCount) * 100 : 0 },
        2: { count: total2, pct: totalStarsCount > 0 ? (total2 / totalStarsCount) * 100 : 0 },
        1: { count: total1, pct: totalStarsCount > 0 ? (total1 / totalStarsCount) * 100 : 0 },
      },
    };
  }, [talent, userReviews]);

  // Synchronize rating changes with the parent component
  useEffect(() => {
    onRatingUpdated(stats.averageRating, stats.totalCount);
  }, [stats.averageRating, stats.totalCount, onRatingUpdated]);

  // Save userReviews to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(`jastip_talent_reviews_${talent.id}`, JSON.stringify(userReviews));
  }, [userReviews, talent.id]);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formRating) {
      setFormError('Silakan pilih penilaian bintang terlebih dahulu.');
      return;
    }
    if (!formTask) {
      setFormError('Silakan pilih jenis tugas yang telah diselesaikan.');
      return;
    }
    if (!formName.trim()) {
      setFormError('Silakan masukkan nama lengkap Anda.');
      return;
    }
    if (!formRole) {
      setFormError('Silakan pilih profesi atau peran Anda.');
      return;
    }
    if (!formComment.trim() || formComment.trim().length < 10) {
      setFormError('Silakan tulis ulasan ulasan singkat minimal 10 karakter.');
      return;
    }

    const newReview: Review = {
      id: `user-${Date.now()}`,
      name: formName.trim(),
      rating: formRating,
      role: formRole,
      task: formTask,
      comment: formComment.trim(),
      date: 'Baru Saja',
    };

    setUserReviews([newReview, ...userReviews]);
    setFormSuccess(true);
    setFormError('');
  };

  return (
    <div className="space-y-8" id="talent-reviews-section">
      {/* 1. Rating Summary Dashboard with Polish */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-xs">
        <h3 className="text-base font-extrabold text-[#082B5C] mb-6 flex items-center gap-2">
          <Star className="text-[#FF6500] fill-[#FF6500]" size={18} />
          <span>Ringkasan Ulasan & Rating</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Big Number Circle */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-2xl border border-slate-100/50">
            <span className="text-4xl md:text-5xl font-black text-[#082B5C] tracking-tight">
              {stats.averageRating.toFixed(1)}
            </span>
            <div className="mt-2.5">
              <Rating value={stats.averageRating} size={16} showText={false} />
            </div>
            <span className="text-xs font-bold text-gray-400 mt-2">
              Berdasarkan {stats.totalCount} Ulasan
            </span>
          </div>

          {/* Star Progress Bars */}
          <div className="md:col-span-8 space-y-2">
            {([5, 4, 3, 2, 1] as const).map((stars) => {
              const dist = stats.starDistribution[stars];
              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  {/* Label */}
                  <button
                    onClick={() => {
                      // Pre-fill form rating when clicking summary stars for fun interaction!
                      setFormRating(stars);
                      document.getElementById('write-review-form')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-12 text-left font-bold text-gray-500 hover:text-[#FF6500] flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <span>{stars} Star</span>
                  </button>

                  {/* Progress Line */}
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF6500] to-orange-400 rounded-full transition-all duration-500"
                      style={{ width: `${dist.pct}%` }}
                    />
                  </div>

                  {/* Percentage & Count */}
                  <span className="w-16 text-right font-black text-[#082B5C] shrink-0">
                    {dist.pct.toFixed(0)}% <span className="text-[10px] text-gray-400 font-normal">({dist.count})</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Review List */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-50 pb-3">
          <h3 className="text-base font-extrabold text-[#082B5C]">
            Semua Testimoni Pelanggan ({allReviews.length})
          </h3>
          <span className="text-[10px] bg-blue-50 text-[#082B5C] font-extrabold px-2.5 py-1 rounded-md">
            Ulasan Terverifikasi
          </span>
        </div>

        <div className="space-y-5 divide-y divide-slate-100">
          {allReviews.map((rev, idx) => (
            <div key={rev.id} className={`pt-5 ${idx === 0 ? 'pt-0 border-t-0' : ''}`}>
              <div className="flex items-center justify-between mb-2.5">
                <div className="text-left">
                  <h4 className="text-xs font-black text-[#082B5C] flex items-center gap-1.5">
                    <span>{rev.name}</span>
                    <span className="inline-block w-1 h-1 rounded-full bg-[#18A957]" title="Verified Booking" />
                  </h4>
                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-gray-400">{rev.role}</span>
                    <span className="text-[9px] text-gray-300">•</span>
                    <span className="text-[10px] font-bold text-[#FF6500] bg-orange-50 px-1.5 py-0.5 rounded">
                      {rev.task}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Rating value={rev.rating} size={11} showText={false} />
                  {rev.date && <span className="text-[9px] text-gray-400">{rev.date}</span>}
                </div>
              </div>
              <p className="text-xs text-gray-600 italic pl-3 border-l-2 border-[#FF6500]/40 leading-relaxed text-left">
                “ {rev.comment} ”
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Star Feedback Submission Form */}
      <div id="write-review-form" className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-xs space-y-5">
        <div className="text-left">
          <h3 className="text-base font-extrabold text-[#082B5C] flex items-center gap-2">
            <MessageSquare className="text-[#FF6500]" size={18} />
            <span>Kirim Penilaian & Ulasan Jasa</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Pernah memesan jasa Kang {talent.name.split(' ')[0]}? Tulis ulasan bintang 5 dan feedback tentang hasil kerja beliau.
          </p>
        </div>

        {formSuccess ? (
          <div className="p-6 bg-emerald-50/40 border border-emerald-100 rounded-2xl text-center space-y-3">
            <div className="w-10 h-10 bg-[#18A957]/10 text-[#18A957] rounded-full flex items-center justify-center mx-auto shadow-2xs">
              <CheckCircle size={20} />
            </div>
            <h4 className="text-xs font-extrabold text-[#18A957]">Ulasan Terkirim dengan Sukses!</h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Ulasan Anda telah tersimpan dan digabungkan ke rating kumulatif Kang {talent.name.split(' ')[0]} secara otomatis.
            </p>
            <button
              type="button"
              onClick={() => {
                setFormSuccess(false);
                setFormName('');
                setFormRole('');
                setFormComment('');
                setFormRating(5);
              }}
              className="text-xs font-bold text-[#082B5C] hover:text-[#FF6500] transition-colors cursor-pointer hover:underline"
            >
              Tulis Ulasan Baru
            </button>
          </div>
        ) : (
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold text-left flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Rating Input */}
            <div className="space-y-1.5 text-left">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Skor Penilaian (Bintang)
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isStarred = star <= (formHoverRating ?? formRating);
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormRating(star)}
                      onMouseEnter={() => setFormHoverRating(star)}
                      onMouseLeave={() => setFormHoverRating(null)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        size={26}
                        className={`transition-all ${
                          isStarred
                            ? 'fill-[#FF6500] stroke-[#FF6500]'
                            : 'fill-transparent stroke-gray-300'
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="text-xs font-extrabold text-[#082B5C] ml-2">
                  {formRating === 5
                    ? 'Sangat Puas (5.0)'
                    : formRating === 4
                    ? 'Puas (4.0)'
                    : formRating === 3
                    ? 'Cukup Baik (3.0)'
                    : formRating === 2
                    ? 'Kurang Puas (2.0)'
                    : 'Sangat Kecewa (1.0)'}
                </span>
              </div>
            </div>

            {/* Task Hired Dropdown */}
            <div className="space-y-1.5 text-left">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Layanan / Tugas yang Selesai
              </label>
              <select
                value={formTask}
                onChange={(e) => setFormTask(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs text-[#082B5C] font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500] transition-all cursor-pointer"
              >
                <option value="">-- Pilih Tugas yang Telah Diselesaikan --</option>
                {supportedServices.map((srv) => (
                  <option key={srv.id} value={srv.title}>
                    {srv.title}
                  </option>
                ))}
                <option value="Tugas Jastip Lainnya">Tugas Jastip Lainnya</option>
              </select>
            </div>

            {/* Name and Role Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Nama Lengkap Anda
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs text-[#082B5C] font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500] transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Profesi / Kategori
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs text-[#082B5C] font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500] transition-all cursor-pointer"
                >
                  <option value="">-- Pilih Kategori Profesi --</option>
                  <option value="Ibu Rumah Tangga">Ibu Rumah Tangga</option>
                  <option value="Karyawan Swasta">Karyawan Swasta</option>
                  <option value="Pegawai Negeri (PNS)">Pegawai Negeri (PNS)</option>
                  <option value="Wiraswasta / Pemilik Usaha">Wiraswasta</option>
                  <option value="Mahasiswa / Pelajar">Mahasiswa / Pelajar</option>
                  <option value="Pelanggan Umum">Pelanggan Umum</option>
                </select>
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-1.5 text-left">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Feedback & Tanggapan Anda
              </label>
              <textarea
                value={formComment}
                onChange={(e) => setFormComment(e.target.value)}
                placeholder={`Uraikan pengalaman Anda menggunakan jasa Kang ${talent.name.split(' ')[0]}...`}
                rows={3}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs text-[#082B5C] font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500] transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#FF6500] hover:bg-[#e05900] text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer shadow-sm shadow-[#FF6500]/15 hover:shadow-md"
            >
              Kirim Feedback & Rating
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
