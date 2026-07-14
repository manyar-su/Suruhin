import * as LucideIcons from 'lucide-react';
import { categories } from '../../data/categories';
import { SectionHeader } from '../shared/SectionHeader';

interface CategorySectionProps {
  onSelectCategory: (categorySlug: string) => void;
}

export function CategorySection({ onSelectCategory }: CategorySectionProps) {
  return (
    <section className="py-16 bg-white border-y border-slate-50 relative">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeader
          tagline="Kategori Layanan"
          title="Butuh Bantuan Apa Hari Ini?"
          description="Pilih berbagai kategori layanan harian yang dirancang khusus untuk mempermudah hidup Anda di wilayah Tasikmalaya."
          align="center"
        />

        {/* Categories Grid / Horizontal Scroll on Mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => {
            // Dynamically resolve Lucide icon from string name
            const IconComponent = (LucideIcons as any)[cat.iconName] || LucideIcons.Users;

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className={`group ${cat.bgColor} hover:bg-orange-500/10 border border-slate-100 hover:border-orange-500/15 p-6 rounded-3xl transition-all duration-300 cursor-pointer flex flex-col items-center sm:items-start text-center sm:text-left h-full shadow-xs hover:shadow-lg`}
                style={{ borderRadius: '20px' }} // Specified: "Border radius card 20px"
              >
                {/* Icon box */}
                <div className={`p-4 rounded-2xl bg-white text-current ${cat.textColor} shadow-sm group-hover:scale-110 transition-transform duration-300 mb-4 shrink-0`}>
                  <IconComponent size={24} className="stroke-2" />
                </div>

                {/* Info */}
                <h3 className="text-base font-extrabold text-[#082B5C] group-hover:text-[#FF6500] mb-2 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-[#172033]/60 leading-relaxed line-clamp-2 max-w-[70ch]">
                  {cat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
