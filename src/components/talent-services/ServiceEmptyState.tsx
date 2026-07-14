import { Briefcase, Plus } from 'lucide-react';

interface ServiceEmptyStateProps {
  onCreateNew: () => void;
}

export function ServiceEmptyState({ onCreateNew }: ServiceEmptyStateProps) {
  return (
    <div className="py-20 text-center max-w-sm mx-auto px-4">
      <div className="w-16 h-16 bg-orange-50 text-[#FF6500] rounded-full flex items-center justify-center mx-auto mb-5">
        <Briefcase size={28} />
      </div>
      <h3 className="text-base font-black text-[#082B5C] mb-2">Belum ada jasa yang dibuat</h3>
      <p className="text-xs text-gray-400 mb-6 leading-relaxed">
        Buat jasa pertamamu dan mulai menerima pesanan dari pengguna Suruhin di wilayah Tasikmalaya.
      </p>
      <button
        onClick={onCreateNew}
        className="w-full bg-[#FF6500] hover:bg-[#e05900] text-white px-5 py-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-orange-100 active:scale-95"
      >
        <Plus size={16} />
        <span>Buat Jasa Pertama</span>
      </button>
    </div>
  );
}
