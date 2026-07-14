import { Trash2, Archive, Loader2 } from 'lucide-react';

interface DeleteServiceConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  hasBookings: boolean;
}

export function DeleteServiceConfirmation({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  hasBookings
}: DeleteServiceConfirmationProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl border border-slate-50 animate-in fade-in zoom-in-95 duration-200">
        <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center ${
          hasBookings ? 'bg-purple-50 text-purple-500' : 'bg-red-50 text-red-500'
        }`}>
          {hasBookings ? <Archive size={26} /> : <Trash2 size={26} />}
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-black text-[#082B5C]">
            {hasBookings ? 'Arsipkan Layanan Jasa?' : 'Hapus Layanan Jasa?'}
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            {hasBookings
              ? 'Layanan ini sudah memiliki transaksi atau booking sebelumnya. Sesuai ketentuan, sistem akan Mengarsipkan layanan ini agar riwayat pesanan pelanggan tetap terjaga, namun tidak akan bisa dipesan kembali.'
              : 'Apakah Anda yakin ingin menghapus layanan ini secara permanen dari daftar jasa Anda?'}
          </p>
        </div>

        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="flex-1 border border-slate-100 hover:bg-slate-50 text-gray-500 rounded-xl py-3 text-xs font-black transition-all cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className={`flex-1 text-white rounded-xl py-3 text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 ${
              hasBookings
                ? 'bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-100'
                : 'bg-red-500 hover:bg-red-600 shadow-md shadow-red-100'
            }`}
          >
            {isDeleting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <span>{hasBookings ? 'Arsipkan Jasa' : 'Hapus Jasa'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
