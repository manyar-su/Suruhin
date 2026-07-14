import { Search } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title = 'Tidak ditemukan hasil',
  description = 'Maaf, kami tidak dapat menemukan apa yang Anda cari. Coba ubah kata kunci atau filter pencarian Anda.',
  actionText,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-gray-200 rounded-3xl bg-white max-w-lg mx-auto ${className}`}>
      <div className="p-4 bg-orange-50 rounded-full text-[#FF6500] mb-5">
        <Search size={32} />
      </div>
      <h3 className="text-xl font-bold text-[#082B5C] mb-2">{title}</h3>
      <p className="text-sm text-[#172033]/60 mb-6 leading-relaxed max-w-sm">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction} size="sm">
          {actionText}
        </Button>
      )}
    </div>
  );
}
