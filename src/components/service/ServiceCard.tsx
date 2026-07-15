import { Heart, MapPin, ChevronRight, Star } from 'lucide-react';
import { useState } from 'react';
import { Service } from '../../types';
import { formatCurrency } from '../../lib/formatCurrency';
import { getServiceImagePath } from '../../lib/assetPaths';
import { FallbackImage } from '../shared/FallbackImage';

interface ServiceCardProps {
  service: Service;
  onViewDetail: (slug: string) => void;
  variant?: 'default' | 'featured';
  key?: string | number;
}

export function ServiceCard({ service, onViewDetail, variant = 'default' }: ServiceCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  if (variant === 'featured') {
    return (
      <div className="group flex h-full flex-col overflow-hidden rounded-[1.15rem] border border-white/85 bg-white shadow-[0_14px_34px_rgba(8,43,92,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(8,43,92,0.14)] sm:rounded-[1.9rem]">
        <div className="relative aspect-[1/1.08] overflow-hidden bg-slate-100 sm:aspect-[4/4.8]">
          <FallbackImage
            src={getServiceImagePath(service.image)}
            alt={service.title}
            type="service"
            categorySlug={service.category}
            className="h-full w-full object-contain bg-slate-50 p-1.5 transition duration-500 group-hover:scale-[1.02] sm:object-cover sm:bg-transparent sm:p-0 sm:group-hover:scale-105"
          />

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/88 text-gray-500 shadow-lg backdrop-blur transition hover:text-[#E5484D] cursor-pointer sm:right-4 sm:top-4 sm:h-10 sm:w-10"
            aria-label={isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
          >
            <Heart
              size={17}
              className={isFavorite ? 'fill-[#E5484D] stroke-[#E5484D]' : 'stroke-gray-600'}
            />
          </button>

          <span className="absolute left-2 top-2 max-w-[calc(100%-3rem)] truncate rounded-full bg-white/92 px-2.5 py-1 text-[9px] font-black text-[#081a44] shadow-sm sm:left-4 sm:top-4 sm:px-3 sm:text-[11px]">
            {service.categoryName}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-3 px-3 py-3 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <h3
              onClick={() => onViewDetail(service.slug)}
              className="line-clamp-2 text-sm font-black leading-tight tracking-[-0.03em] text-[#082B5C] cursor-pointer sm:text-xl"
            >
              {service.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[#172033]/68 sm:mt-2 sm:text-sm">
              {service.shortDescription}
            </p>
          </div>

          <div className="mt-auto flex items-center justify-between gap-2 sm:gap-3">
            <div className="min-w-0 space-y-1 sm:space-y-2">
            <div className="flex items-center gap-1 text-xs font-black text-[#081a44] sm:gap-1.5 sm:text-sm">
              <Star size={12} className="fill-[#ff9d12] stroke-[#ff9d12] sm:hidden" />
              <Star size={14} className="hidden fill-[#ff9d12] stroke-[#ff9d12] sm:block" />
              <span>{service.rating.toFixed(1)}</span>
              <span className="truncate font-semibold text-slate-400">({service.reviewCount})</span>
            </div>
            <div className="text-[11px] font-black leading-tight text-[#081a44] sm:text-sm">
              Mulai <span className="text-[#ff7b00]">{formatCurrency(service.price)}</span>
            </div>
            </div>

            <button
              onClick={() => onViewDetail(service.slug)}
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-xl bg-[#fff4e7] px-3 text-xs font-black text-[#081a44] transition hover:bg-[#ffe1bf] cursor-pointer sm:h-11 sm:rounded-2xl sm:px-4 sm:text-sm"
            >
              Detail
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group bg-white rounded-3xl border border-slate-100 hover:border-orange-500/10 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden"
      style={{ borderRadius: '20px' }} // Specified: "Border radius card 20px"
    >
      {/* Image container */}
      <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
        <FallbackImage
          src={getServiceImagePath(service.image)}
          alt={service.title}
          type="service"
          categorySlug={service.category}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-4.5 right-4.5 p-2 bg-white/90 hover:bg-white text-gray-500 hover:text-[#E5484D] rounded-full shadow-md backdrop-blur-xs transition-colors duration-200 cursor-pointer z-10"
          aria-label={isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
        >
          <Heart
            size={16}
            className={`transition-colors ${
              isFavorite ? 'fill-[#E5484D] stroke-[#E5484D]' : 'stroke-gray-600'
            }`}
          />
        </button>

        {/* Category Badge overlay */}
        <span className="absolute bottom-4.5 left-4.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#082B5C] text-white backdrop-blur-sm shadow-sm z-10">
          {service.categoryName}
        </span>
      </div>

      {/* Details body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location and rating row */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
              <MapPin size={12} className="text-[#FF6500]" />
              <span className="truncate max-w-[120px]">{service.location.replace('Tasikmalaya', 'Tasik')}</span>
            </span>
            <div className="flex items-center gap-0.5 text-xs font-bold text-[#172033]">
              <Star size={12} className="fill-[#FF6500] stroke-[#FF6500]" />
              <span>{service.rating.toFixed(1)}</span>
              <span className="text-gray-400 font-normal">({service.reviewCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3
            onClick={() => onViewDetail(service.slug)}
            className="text-base font-extrabold text-[#082B5C] hover:text-[#FF6500] transition-colors line-clamp-1 mb-2 leading-snug cursor-pointer"
          >
            {service.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-[#172033]/60 line-clamp-2 mb-4 leading-relaxed max-w-[70ch]">
            {service.shortDescription}
          </p>
        </div>

        {/* Pricing and Action row */}
        <div className="border-t border-slate-50 pt-4 mt-auto flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Harga Mulai
            </span>
            <span className="text-base font-black text-[#FF6500]">
              {formatCurrency(service.price)}
            </span>
          </div>

          <button
            onClick={() => onViewDetail(service.slug)}
            className="inline-flex items-center justify-center gap-1 text-xs font-extrabold text-[#082B5C] group-hover:text-[#FF6500] bg-[#F5F7FA] hover:bg-orange-50 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
          >
            <span>Detail</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
