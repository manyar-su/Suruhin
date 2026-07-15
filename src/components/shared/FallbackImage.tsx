import { useState } from 'react';
import { LucideIcon, Car, Users, ShoppingBag, Package, Dribbble, BookOpen, Home, Laptop, User, Star } from 'lucide-react';

interface FallbackImageProps {
  src?: string;
  alt: string;
  type?: 'service' | 'talent' | 'category' | 'testimonial' | 'banner';
  categorySlug?: string;
  className?: string;
  gender?: 'Pria' | 'Wanita';
  loading?: 'eager' | 'lazy';
  decoding?: 'sync' | 'async' | 'auto';
  fetchPriority?: 'high' | 'low' | 'auto';
}

export function FallbackImage({
  src,
  alt,
  type = 'service',
  categorySlug = 'general',
  className = '',
  gender = 'Pria',
  loading = 'lazy',
  decoding = 'async',
  fetchPriority = 'auto',
}: FallbackImageProps) {
  const [hasError, setHasError] = useState(false);

  if (src && !hasError) {
    return (
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        onError={() => setHasError(true)}
        className={className}
      />
    );
  }

  // Map icons to categories
  const categoryIcons: Record<string, LucideIcon> = {
    'antar-jemput': Car,
    'temenin': Users,
    'titip-belanja': ShoppingBag,
    'antar-barang': Package,
    'olahraga-hobi': Dribbble,
    'belajar-kerja': BookOpen,
    'rumah-tangga': Home,
    'digital': Laptop,
  };

  // Select Icon
  let IconComponent = User;
  if (type === 'category' || type === 'service') {
    IconComponent = categoryIcons[categorySlug] || Users;
  } else if (type === 'talent') {
    IconComponent = User;
  } else if (type === 'testimonial') {
    IconComponent = User;
  } else {
    IconComponent = Package;
  }

  // Gradients based on categories/genders
  let gradientClass = 'from-[#082B5C] to-[#124d9c]'; // default navy
  let badgeText = '';

  if (type === 'service') {
    if (categorySlug === 'antar-jemput') {
      gradientClass = 'from-[#082B5C] via-[#0d3f82] to-[#FF6500]/10';
      badgeText = 'Transportasi';
    } else if (categorySlug === 'temenin') {
      gradientClass = 'from-[#FF6500] via-[#e05900] to-[#082B5C]/20';
      badgeText = 'Teman Aktivitas';
    } else if (categorySlug === 'titip-belanja') {
      gradientClass = 'from-green-700 via-green-600 to-emerald-800';
      badgeText = 'Jastip';
    } else if (categorySlug === 'antar-barang') {
      gradientClass = 'from-purple-700 via-indigo-600 to-purple-900';
      badgeText = 'Logistik';
    } else if (categorySlug === 'olahraga-hobi') {
      gradientClass = 'from-emerald-600 via-teal-500 to-teal-700';
      badgeText = 'Sports & Hobbies';
    } else if (categorySlug === 'rumah-tangga') {
      gradientClass = 'from-amber-600 via-yellow-600 to-amber-700';
      badgeText = 'Cleaning';
    } else {
      gradientClass = 'from-cyan-700 via-sky-600 to-blue-800';
      badgeText = 'Digital';
    }
  } else if (type === 'talent') {
    gradientClass = gender === 'Pria' 
      ? 'from-[#082B5C] to-[#17488c]' 
      : 'from-[#FF6500] to-orange-400';
  } else if (type === 'testimonial') {
    gradientClass = 'from-[#F5F7FA] to-slate-200';
  } else if (type === 'banner') {
    gradientClass = 'from-[#082B5C] via-[#0d3f82] to-[#FF6500]';
  }

  return (
    <div className={`relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br ${gradientClass} ${className} select-none`}>
      {/* Decorative vector grid pattern */}
      <div className="absolute inset-0 opacity-10 mix-blend-overlay">
        <svg width="100%" height="100%">
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Radial overlay glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15),transparent_70%)]" />

      {type === 'talent' ? (
        <div className="flex flex-col items-center justify-center p-4 text-center z-1">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center mb-2.5 shadow-lg">
            <IconComponent className="text-white w-8 h-8" />
          </div>
          <span className="text-xs font-bold tracking-wide text-white uppercase opacity-90">
            {gender} • Talent
          </span>
          <span className="text-sm font-semibold text-white truncate max-w-[150px] mt-0.5">
            {alt}
          </span>
          <div className="flex items-center gap-1 mt-1 bg-white/15 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20">
            <Star size={10} className="fill-[#FF6500] stroke-[#FF6500]" />
            <span className="text-[10px] font-bold text-white">PRO</span>
          </div>
        </div>
      ) : type === 'testimonial' ? (
        <div className="flex items-center justify-center w-full h-full z-1">
          <div className="w-12 h-12 rounded-full bg-[#082B5C]/10 border border-[#082B5C]/20 flex items-center justify-center shadow-inner">
            <User className="text-[#082B5C] w-6 h-6" />
          </div>
        </div>
      ) : type === 'category' ? (
        <div className="flex flex-col items-center justify-center p-3 text-center z-1">
          <IconComponent className="w-7 h-7 mb-1" />
        </div>
      ) : type === 'banner' ? (
        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12 z-1 text-left text-white max-w-lg">
          <span className="text-xs font-bold text-[#FF6500] uppercase tracking-widest mb-1.5">Suruhin Partner</span>
          <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
            {alt}
          </h3>
          <p className="text-xs md:text-sm text-white/80 line-clamp-2">
            Ayo bergabung menjadi bagian dari 5.000+ Talent aktif kami di Tasikmalaya dan dapatkan penghasilan tambahan sekarang juga!
          </p>
        </div>
      ) : (
        // Service type
        <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-between p-5 z-1 text-white">
          <div className="flex justify-between items-start">
            {badgeText && (
              <span className="bg-white/15 backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white">
                {badgeText}
              </span>
            )}
            <div className="p-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
              <IconComponent className="text-white w-4.5 h-4.5" />
            </div>
          </div>
          <div className="bg-gradient-to-t from-black/60 via-black/25 to-transparent absolute inset-0 -z-1" />
          <div className="mt-auto">
            <p className="text-[10px] font-bold text-[#FF6500] uppercase tracking-wider mb-0.5">Layanan Suruhin</p>
            <h4 className="text-sm md:text-base font-extrabold leading-tight tracking-tight line-clamp-2">
              {alt}
            </h4>
          </div>
        </div>
      )}
    </div>
  );
}
