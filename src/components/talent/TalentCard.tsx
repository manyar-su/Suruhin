import { ShieldCheck, MapPin, Star, Sparkles } from 'lucide-react';
import { Talent } from '../../types';
import { FallbackImage } from '../shared/FallbackImage';

interface TalentCardProps {
  talent: Talent;
  onViewProfile: (slug: string) => void;
  key?: string | number;
}

export function TalentCard({ talent, onViewProfile }: TalentCardProps) {
  return (
    <div
      className="group bg-white rounded-3xl border border-slate-100 hover:border-orange-500/10 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden"
      style={{ borderRadius: '20px' }} // Specified: "Border radius card 20px"
    >
      {/* Photo header */}
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <FallbackImage
          src={talent.avatar.startsWith('http') || talent.avatar.startsWith('data:') ? talent.avatar : `/avatars/${talent.avatar}`}
          alt={talent.name}
          type="talent"
          gender={talent.gender}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Availability Badge overlay */}
        <span
          className={`absolute top-4.5 left-4.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 backdrop-blur-md ${
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
          {talent.available ? 'Tersedia Sekarang' : 'Sedang Sibuk'}
        </span>

        {/* Verified Badge overlay */}
        {talent.verified && (
          <span className="absolute top-4.5 right-4.5 bg-blue-50/90 backdrop-blur-xs border border-blue-200 p-1.5 rounded-xl text-blue-600 flex items-center justify-center shadow-md">
            <ShieldCheck size={16} className="fill-blue-100" />
          </span>
        )}
      </div>

      {/* Profile Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating and orders */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-0.5 text-xs font-bold text-[#172033]">
              <Star size={12} className="fill-[#FF6500] stroke-[#FF6500]" />
              <span>{talent.rating.toFixed(1)}</span>
              <span className="text-gray-400 font-normal">({talent.reviewCount} ulasan)</span>
            </div>
            <span className="text-[10px] font-bold text-[#082B5C] bg-[#082B5C]/5 px-2.5 py-0.5 rounded-full">
              {talent.completedOrders}+ Pesanan
            </span>
          </div>

          {/* Name & verification text */}
          <h3
            onClick={() => onViewProfile(talent.slug)}
            className="text-base font-extrabold text-[#082B5C] hover:text-[#FF6500] transition-colors leading-tight mb-1 flex items-center gap-1.5 cursor-pointer"
          >
            <span>{talent.name}</span>
          </h3>

          {/* Gender & Age */}
          <p className="text-xs font-semibold text-gray-400 mb-2">
            {talent.gender} • {talent.age} Tahun
          </p>

          {/* Location */}
          <p className="text-xs text-[#172033]/70 flex items-center gap-1 mb-3.5">
            <MapPin size={12} className="text-[#FF6500] shrink-0" />
            <span className="truncate">{talent.location}</span>
          </p>

          {/* Key Skills */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {talent.skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="text-[10px] font-bold text-[#082B5C]/80 bg-[#F5F7FA] px-2 py-0.5 rounded-md flex items-center gap-0.5 border border-slate-100"
              >
                <Sparkles size={8} className="text-[#FF6500]" />
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onViewProfile(talent.slug)}
          className="w-full bg-[#082B5C] hover:bg-[#FF6500] text-white font-bold text-xs py-3 rounded-xl transition-all duration-200 cursor-pointer text-center"
        >
          Lihat Profil Lengkap
        </button>
      </div>
    </div>
  );
}
