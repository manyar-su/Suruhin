import * as LucideIcons from 'lucide-react';
import { categories } from '../../data/categories';

interface CategorySectionProps {
  onSelectCategory: (categorySlug: string) => void;
  onViewAll?: () => void;
}

export function CategorySection({ onSelectCategory, onViewAll }: CategorySectionProps) {
  return (
    <section className="bg-white py-12 md:py-14">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ff9f12]">Kategori Layanan</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#081a44] sm:text-[2.15rem]">
              Pilih bantuan sesuai kebutuhan harianmu
            </h2>
          </div>
          <button
            onClick={() => onViewAll?.()}
            className="hidden text-sm font-black text-[#ff7b00] transition hover:text-[#f15d00] md:inline-flex cursor-pointer"
          >
            Lihat semua layanan
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {categories.map((cat) => {
            const IconComponent = (LucideIcons as any)[cat.iconName] || LucideIcons.Users;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className="group rounded-[1.65rem] border border-slate-100 bg-white p-4 text-left shadow-[0_18px_40px_rgba(8,43,92,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(8,43,92,0.12)] cursor-pointer"
              >
                <span
                  className={`mb-4 flex h-16 w-16 items-center justify-center rounded-[1.25rem] ${cat.bgColor} ${cat.textColor} transition group-hover:scale-105`}
                >
                  <IconComponent size={30} className="stroke-[1.8]" />
                </span>
                <h3 className="text-base font-black leading-snug text-[#081a44]">{cat.name}</h3>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
