import { services } from '../../data/services';
import { SectionHeader } from '../shared/SectionHeader';
import { ServiceCard } from '../service/ServiceCard';
import { Button } from '../shared/Button';

interface PopularServicesProps {
  onViewService: (slug: string) => void;
  onViewAllServices: () => void;
}

export function PopularServices({ onViewService, onViewAllServices }: PopularServicesProps) {
  // Filter popular/featured services or grab the first 8
  const popularList = services.filter(s => s.featured).slice(0, 8);
  // Fallback to first 8 if featured count is low
  const displayList = popularList.length >= 8 ? popularList : services.slice(0, 8);

  return (
    <section className="py-16 bg-[#F5F7FA]/35">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with view all button */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <SectionHeader
            tagline="Layanan Populer"
            title="Paling Banyak Dicari warga"
            description="Layanan terfavorit pilihan masyarakat Tasikmalaya yang siap dipesan kapan saja."
            align="left"
            className="mb-0 sm:mb-0"
          />
          <Button
            variant="outline"
            onClick={onViewAllServices}
            className="mt-4 sm:mt-0 font-bold self-start sm:self-auto shrink-0"
            size="sm"
          >
            Lihat Semua Layanan
          </Button>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {displayList.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onViewDetail={onViewService}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
