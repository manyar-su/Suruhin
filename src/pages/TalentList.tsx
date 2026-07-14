import { useState, useMemo, useEffect } from 'react';
import { talents } from '../data/talents';
import { locations } from '../data/locations';
import { TalentCard } from '../components/talent/TalentCard';
import { Container } from '../components/layout/Container';
import { EmptyState } from '../components/shared/EmptyState';
import { Search, Sparkles, Filter, CheckCircle2 } from 'lucide-react';

interface TalentListProps {
  navigate: (path: string) => void;
  queryParams: Record<string, string>;
}

export function TalentList({ navigate, queryParams }: TalentListProps) {
  const initialGender = queryParams.gender || 'all';
  const initialLocation = queryParams.location || 'all';
  const initialSearch = queryParams.search || '';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedGender, setSelectedGender] = useState(initialGender);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Sync params if URL changes externally
  useEffect(() => {
    setSelectedGender(queryParams.gender || 'all');
  }, [queryParams.gender]);

  useEffect(() => {
    setSelectedLocation(queryParams.location || 'all');
  }, [queryParams.location]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGender('all');
    setSelectedLocation('all');
    setOnlyAvailable(false);
    navigate('/talent');
  };

  // Filter and Search logic
  const filteredTalents = useMemo(() => {
    return talents.filter((t) => {
      // Gender filter
      const genderMatch = selectedGender === 'all' || t.gender.toLowerCase() === selectedGender.toLowerCase();

      // Location filter
      const locationMatch = selectedLocation === 'all' || t.location === selectedLocation;

      // Availability filter
      const availabilityMatch = !onlyAvailable || t.available;

      // Name / Skill keyword filter
      const searchMatch =
        !searchQuery.trim() ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.skills.some((sk) => sk.toLowerCase().includes(searchQuery.toLowerCase())) ||
        t.location.toLowerCase().includes(searchQuery.toLowerCase());

      return genderMatch && locationMatch && availabilityMatch && searchMatch;
    });
  }, [searchQuery, selectedGender, selectedLocation, onlyAvailable]);

  return (
    <div className="py-24 bg-slate-50/50 min-h-screen">
      <Container>
        {/* Header Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50/90 border border-blue-200 text-blue-600 text-xs font-bold">
            <Sparkles size={14} className="fill-blue-100" />
            <span>Kemitraan Mandiri Profesional</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#082B5C] tracking-tight">
            Kenali Talent Pilihan Anda
          </h1>
          <p className="text-sm sm:text-base text-[#172033]/70 leading-relaxed max-w-2xl mx-auto">
            Semua Talent kemitraan Suruhin telah melalui seleksi wawancara ketat, verifikasi dokumen KTP kepolisian, dan dibekali pelatihan tata krama kesopanan.
          </p>
        </div>

        {/* Filters Panel Box */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm mb-10 space-y-5">
          {/* Main search and toggle */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Search Input */}
            <div className="md:col-span-8 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 flex items-center gap-3">
              <Search size={20} className="text-[#082B5C] opacity-40 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari talent berdasarkan nama atau keahlian khusus... (contoh: asep, berkendara, laptop)"
                className="w-full text-sm text-[#172033] bg-transparent focus:outline-none placeholder-slate-400"
              />
            </div>

            {/* Checkbox Available */}
            <div className="md:col-span-4 flex items-center justify-end">
              <label className="inline-flex items-center gap-2.5 cursor-pointer text-xs font-extrabold text-[#082B5C] select-none">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="w-4.5 h-4.5 rounded-sm accent-[#FF6500] cursor-pointer"
                />
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#18A957] animate-pulse" />
                  Hanya Tampilkan yang Tersedia Sekarang
                </span>
              </label>
            </div>
          </div>

          {/* Gender and Location filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-slate-50 pt-5">
            <div className="flex flex-wrap items-center gap-4.5">
              
              {/* Gender selector */}
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-[#FF6500]" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Gender:</span>
                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                  {['all', 'pria', 'wanita'].map((gen) => (
                    <button
                      key={gen}
                      onClick={() => setSelectedGender(gen)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                        selectedGender === gen
                          ? 'bg-[#082B5C] text-white shadow-xs'
                          : 'text-[#082B5C] hover:bg-slate-100'
                      }`}
                    >
                      {gen === 'all' ? 'Semua' : gen}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Select box */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Wilayah:</span>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 text-xs font-bold text-[#082B5C] focus:outline-none"
                >
                  <option value="all">Semua Wilayah</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Total Results */}
            <p className="text-xs font-bold text-gray-400 self-end">
              Menampilkan <span className="text-[#FF6500]">{filteredTalents.length}</span> Talent aktif
            </p>
          </div>
        </div>

        {/* Dynamic Talents Grid Display */}
        {filteredTalents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
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
