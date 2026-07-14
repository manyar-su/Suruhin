import { Search, SlidersHorizontal } from 'lucide-react';

interface ServiceFilterProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  activeStatus: string;
  onStatusChange: (status: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
}

export function ServiceFilter({
  searchQuery,
  onSearchChange,
  activeStatus,
  onStatusChange,
  sortBy,
  onSortByChange
}: ServiceFilterProps) {
  const statuses = [
    { value: 'ALL', label: 'Semua' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'PENDING_REVIEW', label: 'Menunggu Review' },
    { value: 'ACTIVE', label: 'Aktif' },
    { value: 'REJECTED', label: 'Ditolak' },
    { value: 'INACTIVE', label: 'Nonaktif' },
    { value: 'ARCHIVED', label: 'Arsip' }
  ];

  const sorts = [
    { value: 'newest', label: 'Terbaru' },
    { value: 'oldest', label: 'Terlama' },
    { value: 'bookings', label: 'Booking Terbanyak' },
    { value: 'earnings', label: 'Pendapatan Tertinggi' },
    { value: 'rating', label: 'Rating Tertinggi' }
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4 text-left">
      <div className="flex flex-col md:flex-row items-stretch gap-3">
        {/* Search */}
        <div className="flex-grow bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <Search size={16} className="text-[#082B5C] opacity-40 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari nama jasa..."
            className="w-full text-xs text-[#172033] bg-transparent focus:outline-none placeholder-slate-400"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 shrink-0">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Urutkan:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="bg-transparent text-xs font-bold text-[#082B5C] focus:outline-none cursor-pointer"
          >
            {sorts.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-slate-50 pt-3">
        {statuses.map(st => (
          <button
            key={st.value}
            onClick={() => onStatusChange(st.value)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeStatus === st.value
                ? 'bg-[#FF6500] text-white shadow-sm shadow-orange-100'
                : 'bg-slate-50 hover:bg-slate-100 border border-slate-100/50 text-[#082B5C]'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>
    </div>
  );
}
