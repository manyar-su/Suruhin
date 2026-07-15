import { useState, useMemo, useEffect } from 'react';
import { categories } from '../data/categories';
import { ServiceCard } from '../components/service/ServiceCard';
import { Container } from '../components/layout/Container';
import { EmptyState } from '../components/shared/EmptyState';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useServiceCatalog } from '../hooks/useServiceCatalog';

interface LayananListProps {
  navigate: (path: string) => void;
  queryParams: Record<string, string>;
}

export function LayananList({ navigate, queryParams }: LayananListProps) {
  const initialCategory = queryParams.category || 'all';
  const initialSearch = queryParams.search || '';
  const initialLocation = queryParams.location || 'all';
  const initialPriceBand = queryParams.price || 'all';
  const initialSort = queryParams.sort || 'recommended';

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [selectedPriceBand, setSelectedPriceBand] = useState(initialPriceBand);
  const [sortBy, setSortBy] = useState(initialSort);

  const combinedServices = useServiceCatalog();
  const locationOptions = useMemo(
    () => ['all', ...Array.from(new Set(combinedServices.map((service) => service.location))).sort((a: string, b: string) => a.localeCompare(b))],
    [combinedServices]
  );

  const updateRoute = (overrides: Partial<Record<'category' | 'search' | 'location' | 'price' | 'sort', string>>) => {
    const nextState = {
      category: overrides.category ?? activeCategory,
      search: overrides.search ?? searchQuery,
      location: overrides.location ?? selectedLocation,
      price: overrides.price ?? selectedPriceBand,
      sort: overrides.sort ?? sortBy,
    };

    const query = new URLSearchParams();
    if (nextState.category !== 'all') query.set('category', nextState.category);
    if (nextState.search.trim()) query.set('search', nextState.search.trim());
    if (nextState.location !== 'all') query.set('location', nextState.location);
    if (nextState.price !== 'all') query.set('price', nextState.price);
    if (nextState.sort !== 'recommended') query.set('sort', nextState.sort);

    const queryString = query.toString();
    navigate(`/layanan${queryString ? `?${queryString}` : ''}`);
  };

  useEffect(() => {
    setActiveCategory(queryParams.category || 'all');
  }, [queryParams.category]);

  useEffect(() => {
    setSearchQuery(queryParams.search || '');
  }, [queryParams.search]);

  useEffect(() => {
    setSelectedLocation(queryParams.location || 'all');
  }, [queryParams.location]);

  useEffect(() => {
    setSelectedPriceBand(queryParams.price || 'all');
  }, [queryParams.price]);

  useEffect(() => {
    setSortBy(queryParams.sort || 'recommended');
  }, [queryParams.sort]);

  const handleCategoryChange = (slug: string) => {
    setActiveCategory(slug);
    updateRoute({ category: slug });
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    updateRoute({ search: val });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveCategory('all');
    setSelectedLocation('all');
    setSelectedPriceBand('all');
    setSortBy('recommended');
    navigate('/layanan');
  };

  const filteredServices = useMemo(() => {
    const filtered = combinedServices.filter((srv) => {
      const categoryMatch = activeCategory === 'all' || srv.category === activeCategory;
      const searchMatch =
        !searchQuery.trim() ||
        srv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.location.toLowerCase().includes(searchQuery.toLowerCase());
      const locationMatch = selectedLocation === 'all' || srv.location === selectedLocation;
      const priceMatch =
        selectedPriceBand === 'all' ||
        (selectedPriceBand === 'budget' && srv.price < 30000) ||
        (selectedPriceBand === 'mid' && srv.price >= 30000 && srv.price <= 70000) ||
        (selectedPriceBand === 'premium' && srv.price > 70000);

      return categoryMatch && searchMatch && locationMatch && priceMatch;
    });

    const sorted = [...filtered];
    if (sortBy === 'price-low') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      sorted.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    } else {
      sorted.sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating || b.reviewCount - a.reviewCount);
    }

    return sorted;
  }, [combinedServices, activeCategory, searchQuery, selectedLocation, selectedPriceBand, sortBy]);

  return (
    <div className="py-24 bg-slate-50/50 min-h-screen">
      <Container>
        {/* Header Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-[#FF6500] text-xs font-bold">
            <span>Katalog Jasa Harian Tasikmalaya</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#082B5C] tracking-tight">
            Cari & Pesan Jasa Sesuai Kebutuhan Anda
          </h1>
          <p className="text-sm sm:text-base text-[#172033]/70 leading-relaxed max-w-2xl mx-auto">
            Temukan bantuan tepercaya di sekitar Anda. Cukup cari layanan, tentukan jadwal dan biarkan Talent pilihan menyelesaikan segala urusan harian Anda.
          </p>
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[28px] border border-slate-100 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FF6500]">Flow pengguna</p>
            <h2 className="mt-2 text-lg font-black text-[#082B5C]">Mulai dari katalog publik, lanjut ke dashboard saat sudah siap memesan</h2>
            <p className="mt-2 text-sm text-[#172033]/70 leading-relaxed">
              Halaman ini difokuskan untuk eksplorasi jasa. Detail sesi, tracking, dan pengelolaan order dipisahkan ke area akun agar pengalaman publik tetap ringan.
            </p>
          </div>
          <div className="rounded-[28px] border border-[#082B5C]/10 bg-[#082B5C] px-5 py-4 text-white shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FFB36A]">Trust signal</p>
            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-lg font-black text-[#FF6500]">4.9</div>
                <div className="text-[10px] uppercase tracking-wider text-white/70">Rating</div>
              </div>
              <div>
                <div className="text-lg font-black text-[#FF6500]">{filteredServices.length}</div>
                <div className="text-[10px] uppercase tracking-wider text-white/70">Tersaring</div>
              </div>
              <div>
                <div className="text-lg font-black text-[#FF6500]">Escrow</div>
                <div className="text-[10px] uppercase tracking-wider text-white/70">Aktif</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm mb-10 space-y-6">
          <div className="flex flex-col md:flex-row items-stretch gap-4">
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
            
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 shrink-0 self-center md:self-auto px-1">
              <SlidersHorizontal size={14} className="text-[#FF6500]" />
              <span>{filteredServices.length} Jasa Tersedia</span>
            </div>
          </div>

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

          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <span>Wilayah layanan</span>
              <select
                value={selectedLocation}
                onChange={(e) => {
                  setSelectedLocation(e.target.value);
                  updateRoute({ location: e.target.value });
                }}
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold normal-case text-[#082B5C] focus:outline-none"
              >
                <option value="all">Semua area</option>
                {locationOptions.filter((item) => item !== 'all').map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <span>Rentang harga</span>
              <select
                value={selectedPriceBand}
                onChange={(e) => {
                  setSelectedPriceBand(e.target.value);
                  updateRoute({ price: e.target.value });
                }}
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold normal-case text-[#082B5C] focus:outline-none"
              >
                <option value="all">Semua harga</option>
                <option value="budget">Di bawah Rp30.000</option>
                <option value="mid">Rp30.000 - Rp70.000</option>
                <option value="premium">Di atas Rp70.000</option>
              </select>
            </label>

            <label className="space-y-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <span>Urutkan</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  updateRoute({ sort: e.target.value });
                }}
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold normal-case text-[#082B5C] focus:outline-none"
              >
                <option value="recommended">Rekomendasi Suruhin</option>
                <option value="rating">Rating tertinggi</option>
                <option value="price-low">Harga termurah</option>
                <option value="price-high">Harga tertinggi</option>
              </select>
            </label>
          </div>
        </div>

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
