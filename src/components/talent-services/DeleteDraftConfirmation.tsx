import { Trash2, AlertTriangle } from 'lucide-react';

interface DeleteDraftConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteDraftConfirmation({ isOpen, onClose, onConfirm }: DeleteDraftConfirmationProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl border border-slate-50 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 mx-auto rounded-full bg-red-50 text-red-500 flex items-center justify-center">
          <Trash2 size={26} />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-black text-[#082B5C]">Hapus Draft Pengisian?</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Menghapus draft akan mengosongkan semua isian form ini secara permanen. Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>

        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-slate-100 hover:bg-slate-50 text-gray-500 rounded-xl py-3 text-xs font-black transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-3 text-xs font-black transition-all cursor-pointer shadow-md shadow-red-100"
          >
            Hapus Draft
          </button>
        </div>
      </div>
    </div>
  );
}
