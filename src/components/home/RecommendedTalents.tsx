import { useState, useMemo } from 'react';
import { SectionHeader } from '../shared/SectionHeader';
import { TalentCard } from '../talent/TalentCard';
import { Filter, Users, User, UserCheck, Star } from 'lucide-react';
import { useTalentCatalog } from '../../hooks/useTalentCatalog';

interface RecommendedTalentsProps {
  onViewTalent: (slug: string) => void;
}

type FilterType = 'all' | 'pria' | 'wanita' | 'available' | 'top-rated';

export function RecommendedTalents({ onViewTalent }: RecommendedTalentsProps) {
  const talents = useTalentCatalog();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Filter and sort logic
  const filteredAndSortedTalents = useMemo(() => {
    let list = [...talents];

    // Apply Filter
    if (activeFilter === 'pria') {
      list = list.filter((t) => t.gender === 'Pria');
    } else if (activeFilter === 'wanita') {
      list = list.filter((t) => t.gender === 'Wanita');
    } else if (activeFilter === 'available') {
      list = list.filter((t) => t.available);
    } else if (activeFilter === 'top-rated') {
      list = list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [activeFilter, talents]);

  const filterPills = [
    { id: 'all', label: 'Semua Talent', icon: Users },
    { id: 'pria', label: 'Pria', icon: User },
    { id: 'wanita', label: 'Wanita', icon: User },
    { id: 'available', label: 'Tersedia Sekarang', icon: UserCheck },
    { id: 'top-rated', label: 'Rating Tertinggi', icon: Star },
  ];

  return (
    <section className="py-16 bg-white relative">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeader
          tagline="Talent Pilihan"
          title="Mitra Suruhin Siap Bantu"
          description="Talent lokal profesional yang telah lolos verifikasi ketat untuk membantu kebutuhan harian Anda secara sopan dan terpercaya."
          align="center"
        />

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-5 border-b border-slate-50">
          <div className="flex items-center gap-2 text-sm font-bold text-[#082B5C]">
            <Filter size={16} className="text-[#FF6500]" />
            <span>Filter Kategori Talent:</span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {filterPills.map((pill) => {
              const Icon = pill.icon;
              return (
                <button
                  key={pill.id}
                  onClick={() => setActiveFilter(pill.id as FilterType)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold rounded-xl transition-all border cursor-pointer ${
                    activeFilter === pill.id
                      ? 'bg-[#FF6500] border-[#FF6500] text-white shadow-md shadow-orange-100'
                      : 'bg-white border-[#082B5C]/10 text-[#082B5C] hover:bg-slate-50'
                  }`}
                >
                  <Icon size={12} />
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Talents Grid */}
        {filteredAndSortedTalents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {filteredAndSortedTalents.map((talent) => (
              <TalentCard
                key={talent.id}
                talent={talent}
                onViewProfile={onViewTalent}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 bg-slate-50 rounded-3xl text-center text-gray-500 max-w-md mx-auto">
            Tidak ada talent yang cocok dengan filter aktif saat ini.
          </div>
        )}
      </div>
    </section>
  );
}
