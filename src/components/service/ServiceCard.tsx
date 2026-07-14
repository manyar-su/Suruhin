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
      <div className="group flex h-full flex-col overflow-hidden rounded-[1.9rem] border border-white/85 bg-white shadow-[0_20px_55px_rgba(8,43,92,0.08)] transition hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(8,43,92,0.14)]">
        <div className="relative aspect-[4/4.8] overflow-hidden bg-slate-100">
          <FallbackImage
            src={getServiceImagePath(service.image)}
            alt={service.title}
            type="service"
            categorySlug={service.category}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#091a3f] via-[#091a3f]/8 to-transparent" />

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/88 text-gray-500 shadow-lg backdrop-blur transition hover:text-[#E5484D] cursor-pointer"
            aria-label={isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
          >
            <Heart
              size={17}
              className={isFavorite ? 'fill-[#E5484D] stroke-[#E5484D]' : 'stroke-gray-600'}
            />
          </button>

          <span className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1 text-[11px] font-black text-[#081a44] shadow-sm">
            {service.categoryName}
          </span>

          <div className="absolute inset-x-0 bottom-0 z-10 p-5 text-white">
            <h3
              onClick={() => onViewDetail(service.slug)}
              className="text-[1.75rem] font-black leading-[1.05] tracking-[-0.03em] cursor-pointer"
            >
              {service.title}
            </h3>
            <p className="mt-2 max-w-[22rem] text-sm leading-relaxed text-white/84">
              {service.shortDescription}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-sm font-black text-[#081a44]">
              <Star size={14} className="fill-[#ff9d12] stroke-[#ff9d12]" />
              <span>{service.rating.toFixed(1)}</span>
              <span className="font-semibold text-slate-400">({service.reviewCount})</span>
            </div>
            <div className="text-sm font-black text-[#081a44]">
              Mulai <span className="text-[#ff7b00]">{formatCurrency(service.price)}</span>
            </div>
          </div>

          <button
            onClick={() => onViewDetail(service.slug)}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#fff4e7] px-4 text-sm font-black text-[#081a44] transition hover:bg-[#ffe1bf] cursor-pointer"
          >
            Detail
          </button>
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
