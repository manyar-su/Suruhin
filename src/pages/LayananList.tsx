import { useState, useMemo, useEffect } from 'react';
import { getCombinedServices } from '../data/mockExtensionData';
import { categories } from '../data/categories';
import { ServiceCard } from '../components/service/ServiceCard';
import { Container } from '../components/layout/Container';
import { EmptyState } from '../components/shared/EmptyState';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';

interface LayananListProps {
  navigate: (path: string) => void;
  queryParams: Record<string, string>;
}

export function LayananList({ navigate, queryParams }: LayananListProps) {
  // Read initial values from URL params
  const initialCategory = queryParams.category || 'all';
  const initialSearch = queryParams.search || '';

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  // Sync state if query parameters change externally
  useEffect(() => {
    setActiveCategory(queryParams.category || 'all');
  }, [queryParams.category]);

  useEffect(() => {
    setSearchQuery(queryParams.search || '');
  }, [queryParams.search]);

  // Handle Category Click
  const handleCategoryChange = (slug: string) => {
    setActiveCategory(slug);
    // Update URL query without full refresh
    const query = new URLSearchParams();
    if (slug !== 'all') query.set('category', slug);
    if (searchQuery) query.set('search', searchQuery);
    
    const queryString = query.toString();
    navigate(`/layanan${queryString ? `?${queryString}` : ''}`);
  };

  // Handle Live Search Input
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    const query = new URLSearchParams();
    if (activeCategory !== 'all') query.set('category', activeCategory);
    if (val) query.set('search', val);
    
    const queryString = query.toString();
    navigate(`/layanan${queryString ? `?${queryString}` : ''}`);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveCategory('all');
    navigate('/layanan');
  };

  const combinedServices = useMemo(() => getCombinedServices(), []);

  // Memoized Filtered List
  const filteredServices = useMemo(() => {
    return combinedServices.filter((srv) => {
      // Category filter match
      const categoryMatch = activeCategory === 'all' || srv.category === activeCategory;
      
      // Keyword search match
      const searchMatch =
        !searchQuery.trim() ||
        srv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.categoryName.toLowerCase().includes(searchQuery.toLowerCase());

      return categoryMatch && searchMatch;
    });
  }, [combinedServices, activeCategory, searchQuery]);

  return (
    <div className="py-24 bg-slate-50/50 min-h-screen">
      <Container>
        {/* Header Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-[#FF6500] text-xs font-bold">
            <Sparkles size={14} className="fill-[#FF6500]/10" />
            <span>Katalog Jasa Harian Tasikmalaya</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#082B5C] tracking-tight">
            Cari & Pesan Jasa Sesuai Kebutuhan Anda
          </h1>
          <p className="text-sm sm:text-base text-[#172033]/70 leading-relaxed max-w-2xl mx-auto">
            Temukan bantuan tepercaya di sekitar Anda. Cukup cari layanan, tentukan jadwal dan biarkan Talent pilihan menyelesaikan segala urusan harian Anda.
          </p>
        </div>

        {/* Search and Filters Segment */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm mb-10 space-y-6">
          <div className="flex flex-col md:flex-row items-stretch gap-4">
            {/* Search Input */}
            <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 flex items-center gap-3">
              <Search size={20} className="text-[#082B5C] opacity-40 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Mau cari bantuan apa hari ini? (contoh: antar jemput, bersih rumah...)"
                className="w-full text-sm text-[#172033] bg-transparent focus:outline-none placeholder-slate-400"
              />
            </div>
            
            {/* Filter Pill Header for layout */}
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 shrink-0 self-center md:self-auto px-1">
              <SlidersHorizontal size={14} className="text-[#FF6500]" />
              <span>{filteredServices.length} Jasa Tersedia</span>
            </div>
          </div>

          {/* Categories Pills Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-4.5 py-2.5 rounded-xl text-xs font-extrabold border transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                activeCategory === 'all'
                  ? 'bg-[#FF6500] border-[#FF6500] text-white shadow-md shadow-orange-100'
                  : 'bg-white border-slate-100 text-[#082B5C] hover:bg-slate-50'
              }`}
            >
              Semua Jasa
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-4.5 py-2.5 rounded-xl text-xs font-extrabold border transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  activeCategory === cat.slug
                    ? 'bg-[#FF6500] border-[#FF6500] text-white shadow-md shadow-orange-100'
                    : 'bg-white border-slate-100 text-[#082B5C] hover:bg-slate-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Service Grid Display */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onViewDetail={(slug) => navigate(`/layanan/${slug}`)}
              />
            ))}
          </div>
        ) : (
          <div className="max-w-md mx-auto py-12">
            <EmptyState
              title="Layanan Tidak Ditemukan"
              description="Maaf, kami tidak dapat menemukan jasa yang sesuai dengan kata kunci atau filter pencarian Anda. Silakan coba atur ulang filter Anda."
              actionText="Ulangi Pencarian"
              onAction={handleResetFilters}
            />
          </div>
        )}
      </Container>
    </div>
  );
}
