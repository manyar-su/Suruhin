import { services } from '../../data/services';
import { ServiceCard } from '../service/ServiceCard';
import { getStaticAssetPath } from '../../lib/assetPaths';

interface PopularServicesProps {
  onViewService: (slug: string) => void;
  onViewAllServices: () => void;
}

export function PopularServices({ onViewService, onViewAllServices }: PopularServicesProps) {
  const popularList = services.filter((service) => service.featured).slice(0, 4);
  const displayList = popularList.length >= 4 ? popularList : services.slice(0, 4);

  return (
    <section className="bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fbff_100%)] py-14 md:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ff9f12]">Layanan Populer</p>
            <h2 className="mt-2 text-2xl font-black leading-tight tracking-tight text-[#081a44] sm:text-[2.15rem]">
              Paling sering dipesan minggu ini
            </h2>
          </div>
          <button
            onClick={onViewAllServices}
            className="hidden text-sm font-black text-[#ff7b00] transition hover:text-[#f15d00] md:inline-flex cursor-pointer"
          >
            Lihat semua
          </button>
        </div>

        <div className="mb-6 hidden overflow-hidden rounded-[2rem] border border-white/85 bg-white shadow-[0_24px_60px_rgba(8,43,92,0.08)] sm:mb-8 md:block">
          <img
            src={getStaticAssetPath('ui/services-reference.webp')}
            alt="Rekomendasi layanan Suruhin"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            className="h-full max-h-[21rem] w-full object-cover object-top"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {displayList.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onViewDetail={onViewService}
              variant="featured"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
