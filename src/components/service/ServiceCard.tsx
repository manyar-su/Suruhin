import { Heart, MapPin, ChevronRight, Star } from 'lucide-react';
import { useState } from 'react';
import { Service } from '../../types';
import { formatCurrency } from '../../lib/formatCurrency';
import { getServiceImagePath } from '../../lib/assetPaths';
import { FallbackImage } from '../shared/FallbackImage';

interface ServiceCardProps {
  service: Service;
  onViewDetail: (slug: string) => void;
  key?: string | number;
}

export function ServiceCard({ service, onViewDetail }: ServiceCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

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
