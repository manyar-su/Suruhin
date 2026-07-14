import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function UnsavedChangesModal({ isOpen, onClose, onConfirm }: UnsavedChangesModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 15 }}
            transition={{ type: 'spring', duration: 0.38, bounce: 0.15 }}
            className="relative bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl border border-slate-50 z-10"
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
              <AlertTriangle size={26} />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-black text-[#082B5C]">Perubahan Belum Disimpan</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Anda memiliki perubahan yang belum disimpan. Jika Anda meninggalkan halaman ini sekarang, perubahan tersebut akan hilang.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-slate-100 hover:bg-slate-50 text-gray-500 rounded-xl py-3 text-xs font-black transition-all cursor-pointer"
              >
                Tetap di Sini
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-3 text-xs font-black transition-all cursor-pointer shadow-md shadow-amber-100"
              >
                Tinggalkan Halaman
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
