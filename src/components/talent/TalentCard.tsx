import { ShieldCheck, MapPin, Star } from 'lucide-react';
import { Talent } from '../../types';
import { FallbackImage } from '../shared/FallbackImage';
import { getTalentAvatarPath } from '../../lib/assetPaths';

interface TalentCardProps {
  talent: Talent;
  onViewProfile: (slug: string) => void;
  key?: string | number;
}

export function TalentCard({ talent, onViewProfile }: TalentCardProps) {
  return (
    <div className="group bg-white border border-slate-100 hover:border-orange-500/10 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden rounded-[18px] sm:rounded-[20px]">
      {/* Photo header */}
      <button
        type="button"
        onClick={() => onViewProfile(talent.slug)}
        className="relative aspect-square overflow-hidden bg-slate-50 cursor-pointer text-left"
      >
        <FallbackImage
          src={getTalentAvatarPath(talent.avatar, talent.name)}
          alt={talent.name}
          type="talent"
          gender={talent.gender}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Availability Badge overlay */}
        <span
          className={`absolute top-2 left-2 sm:top-4.5 sm:left-4.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[8px] sm:text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1 sm:gap-1.5 backdrop-blur-md ${
            talent.available
              ? 'bg-emerald-50 border border-emerald-500/20 text-[#18A957]'
              : 'bg-gray-50 border border-gray-200 text-gray-500'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              talent.available ? 'bg-[#18A957] animate-pulse' : 'bg-gray-400'
            }`}
          />
          <span className="sm:hidden">{talent.available ? 'Tersedia' : 'Sibuk'}</span>
          <span className="hidden sm:inline">{talent.available ? 'Tersedia Sekarang' : 'Sedang Sibuk'}</span>
        </span>

        {/* Verified Badge overlay */}
        {talent.verified && (
          <span className="absolute top-2 right-2 sm:top-4.5 sm:right-4.5 bg-blue-50/90 backdrop-blur-xs border border-blue-200 p-1 sm:p-1.5 rounded-lg sm:rounded-xl text-blue-600 flex items-center justify-center shadow-md">
            <ShieldCheck size={13} className="fill-blue-100 sm:hidden" />
            <ShieldCheck size={16} className="hidden fill-blue-100 sm:block" />
          </span>
        )}
      </button>

      {/* Profile Details */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating and orders */}
          <div className="flex items-center justify-between gap-1 mb-2 sm:mb-2.5">
            <div className="min-w-0 flex items-center gap-0.5 text-[10px] sm:text-xs font-bold text-[#172033]">
              <Star size={11} className="fill-[#FF6500] stroke-[#FF6500] sm:hidden" />
              <Star size={12} className="hidden fill-[#FF6500] stroke-[#FF6500] sm:block" />
              <span>{talent.rating.toFixed(1)}</span>
              <span className="text-gray-400 font-normal truncate">({talent.reviewCount})</span>
            </div>
            <span className="shrink-0 text-[9px] sm:text-[10px] font-bold text-[#082B5C] bg-[#082B5C]/5 px-1.5 sm:px-2.5 py-0.5 rounded-full">
              {talent.completedOrders}+
            </span>
          </div>

          {/* Name & verification text */}
          <h3
            onClick={() => onViewProfile(talent.slug)}
            className="text-sm sm:text-base font-extrabold text-[#082B5C] hover:text-[#FF6500] transition-colors leading-tight mb-1 flex items-center gap-1.5 cursor-pointer"
          >
            <span className="line-clamp-2">{talent.name}</span>
          </h3>

          {/* Gender & Age */}
          <p className="text-[10px] sm:text-xs font-semibold text-gray-400 mb-1.5 sm:mb-2">
            {talent.gender} • {talent.age} Tahun
          </p>

          {/* Location */}
          <p className="text-[10px] sm:text-xs text-[#172033]/70 flex items-center gap-1 mb-2.5 sm:mb-3.5">
            <MapPin size={11} className="text-[#FF6500] shrink-0 sm:hidden" />
            <MapPin size={12} className="hidden text-[#FF6500] shrink-0 sm:block" />
            <span className="truncate">{talent.location}</span>
          </p>

          {/* Key Skills */}
          <div className="flex flex-wrap gap-1 mb-3 sm:gap-1.5 sm:mb-4">
            {talent.skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className={`text-[9px] sm:text-[10px] font-bold text-[#082B5C]/80 bg-[#F5F7FA] px-1.5 sm:px-2 py-0.5 rounded-md items-center border border-slate-100 max-w-full ${index === 2 ? 'hidden sm:flex' : 'flex'}`}
              >
                <span className="truncate">{skill}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onViewProfile(talent.slug)}
          className="w-full bg-[#082B5C] hover:bg-[#FF6500] text-white font-bold text-[10px] sm:text-xs py-2.5 sm:py-3 rounded-xl transition-all duration-200 cursor-pointer text-center"
        >
          <span className="sm:hidden">Lihat Profil</span>
          <span className="hidden sm:inline">Lihat Profil Lengkap</span>
        </button>
      </div>
    </div>
  );
}
