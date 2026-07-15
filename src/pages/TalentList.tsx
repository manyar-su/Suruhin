import { useEffect, useMemo, useState } from 'react';
import { Search, Filter, CheckCircle2 } from 'lucide-react';
import { locations } from '../data/locations';
import { TalentCard } from '../components/talent/TalentCard';
import { Container } from '../components/layout/Container';
import { EmptyState } from '../components/shared/EmptyState';
import { useTalentCatalog } from '../hooks/useTalentCatalog';
import { listApprovedAvailableMvpTalents } from '../lib/supabase/mvp';
import { Talent } from '../types';

interface TalentListProps {
  navigate: (path: string) => void;
  queryParams: Record<string, string>;
}

export function TalentList({ navigate, queryParams }: TalentListProps) {
  const talents = useTalentCatalog();
  const [supabaseTalents, setSupabaseTalents] = useState<Talent[]>([]);
  const [supabaseError, setSupabaseError] = useState('');
  const [searchQuery, setSearchQuery] = useState(queryParams.search || '');
  const [selectedGender, setSelectedGender] = useState(queryParams.gender || 'all');
  const [selectedLocation, setSelectedLocation] = useState(queryParams.location || 'all');
  const [onlyAvailable, setOnlyAvailable] = useState(queryParams.available === '1');
  const [onlyVerified, setOnlyVerified] = useState(queryParams.verified === '1');
  const [minRating, setMinRating] = useState(queryParams.rating || 'all');
  const [sortBy, setSortBy] = useState(queryParams.sort || 'recommended');

  const updateRoute = (overrides: Partial<Record<'search' | 'gender' | 'location' | 'available' | 'verified' | 'rating' | 'sort', string>>) => {
    const nextState = {
      search: overrides.search ?? searchQuery,
      gender: overrides.gender ?? selectedGender,
      location: overrides.location ?? selectedLocation,
      available: overrides.available ?? (onlyAvailable ? '1' : '0'),
      verified: overrides.verified ?? (onlyVerified ? '1' : '0'),
      rating: overrides.rating ?? minRating,
      sort: overrides.sort ?? sortBy,
    };

    const query = new URLSearchParams();
    if (nextState.search.trim()) query.set('search', nextState.search.trim());
    if (nextState.gender !== 'all') query.set('gender', nextState.gender);
    if (nextState.location !== 'all') query.set('location', nextState.location);
    if (nextState.available === '1') query.set('available', '1');
    if (nextState.verified === '1') query.set('verified', '1');
    if (nextState.rating !== 'all') query.set('rating', nextState.rating);
    if (nextState.sort !== 'recommended') query.set('sort', nextState.sort);

    const queryString = query.toString();
    navigate(`/talent${queryString ? `?${queryString}` : ''}`);
  };

  useEffect(() => {
    setSearchQuery(queryParams.search || '');
  }, [queryParams.search]);

  useEffect(() => {
    setSelectedGender(queryParams.gender || 'all');
  }, [queryParams.gender]);

  useEffect(() => {
    setSelectedLocation(queryParams.location || 'all');
  }, [queryParams.location]);

  useEffect(() => {
    setOnlyAvailable(queryParams.available === '1');
  }, [queryParams.available]);

  useEffect(() => {
    setOnlyVerified(queryParams.verified === '1');
  }, [queryParams.verified]);

  useEffect(() => {
    setMinRating(queryParams.rating || 'all');
  }, [queryParams.rating]);

  useEffect(() => {
    setSortBy(queryParams.sort || 'recommended');
  }, [queryParams.sort]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGender('all');
    setSelectedLocation('all');
    setOnlyAvailable(false);
    setOnlyVerified(false);
    setMinRating('all');
    setSortBy('recommended');
    navigate('/talent');
  };

  useEffect(() => {
    let cancelled = false;

    async function loadSupabaseTalents() {
      const result = await listApprovedAvailableMvpTalents();
      if (cancelled) return;

      if (result.ok) {
        setSupabaseTalents(result.data);
        setSupabaseError('');
      } else if ('error' in result && !result.error.includes('belum dikonfigurasi')) {
        setSupabaseError(result.error);
      }
    }

    loadSupabaseTalents();

    return () => {
      cancelled = true;
    };
  }, []);

  const searchableTalents = useMemo(() => {
    const localApproved = talents.filter((talent) => talent.verified && talent.available);
    const existingIds = new Set(localApproved.map((talent) => talent.id));
    return [...supabaseTalents.filter((talent) => !existingIds.has(talent.id)), ...localApproved];
  }, [supabaseTalents, talents]);

  const filteredTalents = useMemo(() => {
    const filtered = searchableTalents.filter((talent) => {
      const genderMatch = selectedGender === 'all' || talent.gender.toLowerCase() === selectedGender.toLowerCase();
      const locationMatch = selectedLocation === 'all' || talent.location === selectedLocation;
      const availabilityMatch = !onlyAvailable || talent.available;
      const verifiedMatch = !onlyVerified || talent.verified;
      const ratingMatch = minRating === 'all' || talent.rating >= Number(minRating);
      const searchMatch =
        !searchQuery.trim() ||
        talent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        talent.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
        talent.location.toLowerCase().includes(searchQuery.toLowerCase());

      return genderMatch && locationMatch && availabilityMatch && verifiedMatch && ratingMatch && searchMatch;
    });

    const sorted = [...filtered];
    if (sortBy === 'rating') {
      sorted.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    } else if (sortBy === 'experience') {
      sorted.sort((a, b) => b.completedOrders - a.completedOrders);
    } else if (sortBy === 'newest') {
      sorted.sort((a, b) => b.joinedYear - a.joinedYear);
    } else {
      sorted.sort((a, b) => Number(b.verified) - Number(a.verified) || Number(b.available) - Number(a.available) || b.rating - a.rating);
    }

    return sorted;
  }, [searchQuery, selectedGender, selectedLocation, onlyAvailable, onlyVerified, minRating, sortBy, searchableTalents]);

  return (
    <div className="py-24 bg-slate-50/50 min-h-screen">
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50/90 border border-blue-200 text-blue-600 text-xs font-bold">
            <span>Kemitraan Mandiri Profesional</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#082B5C] tracking-tight">
            Kenali Talent Pilihan Anda
          </h1>
          <p className="text-sm sm:text-base text-[#172033]/70 leading-relaxed max-w-2xl mx-auto">
            Semua Talent kemitraan Suruhin telah melalui seleksi wawancara ketat, verifikasi dokumen KTP kepolisian, dan dibekali pelatihan tata krama kesopanan.
          </p>
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-slate-100 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FF6500]">Talent marketplace</p>
            <h2 className="mt-2 text-lg font-black text-[#082B5C]">Cari talent dengan filter yang lebih presisi sebelum masuk ke flow pemesanan</h2>
            <p className="mt-2 text-sm text-[#172033]/70 leading-relaxed">
              Pencarian sekarang bisa menyaring verifikasi, rating, ketersediaan, dan wilayah supaya pengguna tidak perlu membuka profil satu per satu.
            </p>
          </div>
          <div className="rounded-[28px] border border-[#082B5C]/10 bg-[#082B5C] px-5 py-4 text-white shadow-sm">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-lg font-black text-[#FF6500]">{filteredTalents.length}</div>
                <div className="text-[10px] uppercase tracking-wider text-white/70">Tampil</div>
              </div>
              <div>
                <div className="text-lg font-black text-[#FF6500]">{searchableTalents.filter((talent) => talent.verified).length}</div>
                <div className="text-[10px] uppercase tracking-wider text-white/70">Verified</div>
              </div>
              <div>
                <div className="text-lg font-black text-[#FF6500]">{searchableTalents.filter((talent) => talent.available).length}</div>
                <div className="text-[10px] uppercase tracking-wider text-white/70">Siap kerja</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm mb-10 space-y-5">
          {supabaseError && (
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3 text-xs font-bold text-amber-700">
              Data Supabase belum bisa dimuat: {supabaseError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-8 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 flex items-center gap-3">
              <Search size={20} className="text-[#082B5C] opacity-40 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  updateRoute({ search: e.target.value });
                }}
                placeholder="Cari talent berdasarkan nama atau keahlian khusus... (contoh: asep, berkendara, laptop)"
                className="w-full text-sm text-[#172033] bg-transparent focus:outline-none placeholder-slate-400"
              />
            </div>

            <div className="md:col-span-4 flex items-center justify-end">
              <label className="inline-flex items-center gap-2.5 cursor-pointer text-xs font-extrabold text-[#082B5C] select-none">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => {
                    setOnlyAvailable(e.target.checked);
                    updateRoute({ available: e.target.checked ? '1' : '0' });
                  }}
                  className="w-4.5 h-4.5 rounded-sm accent-[#FF6500] cursor-pointer"
                />
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#18A957] animate-pulse" />
                  Hanya Tampilkan yang Tersedia Sekarang
                </span>
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-50 pt-5">
            <div className="flex flex-wrap items-center gap-4.5">
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-[#FF6500]" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Gender:</span>
                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                  {['all', 'pria', 'wanita'].map((gender) => (
                    <button
                      key={gender}
                      onClick={() => {
                        setSelectedGender(gender);
                        updateRoute({ gender });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                        selectedGender === gender
                          ? 'bg-[#082B5C] text-white shadow-xs'
                          : 'text-[#082B5C] hover:bg-slate-100'
                      }`}
                    >
                      {gender === 'all' ? 'Semua' : gender}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Wilayah:</span>
                <select
                  value={selectedLocation}
                  onChange={(e) => {
                    setSelectedLocation(e.target.value);
                    updateRoute({ location: e.target.value });
                  }}
                  className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 text-xs font-bold text-[#082B5C] focus:outline-none"
                >
                  <option value="all">Semua Wilayah</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.name}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rating:</span>
                <select
                  value={minRating}
                  onChange={(e) => {
                    setMinRating(e.target.value);
                    updateRoute({ rating: e.target.value });
                  }}
                  className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 text-xs font-bold text-[#082B5C] focus:outline-none"
                >
                  <option value="all">Semua</option>
                  <option value="4.5">4.5+</option>
                  <option value="4.8">4.8+</option>
                  <option value="4.9">4.9</option>
                </select>
              </div>

              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-extrabold text-[#082B5C]">
                <input
                  type="checkbox"
                  checked={onlyVerified}
                  onChange={(e) => {
                    setOnlyVerified(e.target.checked);
                    updateRoute({ verified: e.target.checked ? '1' : '0' });
                  }}
                  className="w-4.5 h-4.5 rounded-sm accent-[#082B5C] cursor-pointer"
                />
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={14} className="text-[#18A957]" />
                  Hanya terverifikasi
                </span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="text-xs font-bold text-gray-400">
                Menampilkan <span className="text-[#FF6500]">{filteredTalents.length}</span> Talent aktif
              </p>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  updateRoute({ sort: e.target.value });
                }}
                className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-[#082B5C] focus:outline-none"
              >
                <option value="recommended">Urutkan: Rekomendasi</option>
                <option value="rating">Urutkan: Rating tertinggi</option>
                <option value="experience">Urutkan: Pengalaman terbanyak</option>
                <option value="newest">Urutkan: Paling baru bergabung</option>
              </select>
            </div>
          </div>
        </div>

        {filteredTalents.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-8">
            {filteredTalents.map((talent) => (
              <TalentCard
                key={talent.id}
                talent={talent}
                onViewProfile={(slug) => navigate(`/talent/${slug}`)}
              />
            ))}
          </div>
        ) : (
          <div className="max-w-md mx-auto py-12">
            <EmptyState
              title="Talent Tidak Ditemukan"
              description="Tidak ada profil Talent kemitraan yang sesuai dengan filter pencarian aktif Anda saat ini. Silakan atur ulang kriteria pencarian."
              actionText="Ubah Kriteria Filter"
              onAction={handleResetFilters}
            />
          </div>
        )}
      </Container>
    </div>
  );
}
