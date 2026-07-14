import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface SaveServiceConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  actionType: 'draft' | 'publish';
}

export function SaveServiceConfirmation({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  actionType
}: SaveServiceConfirmationProps) {
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
            <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center ${
              actionType === 'publish' ? 'bg-orange-50 text-[#FF6500]' : 'bg-slate-50 text-slate-500'
            }`}>
              {actionType === 'publish' ? <CheckCircle size={26} /> : <AlertCircle size={26} />}
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-black text-[#082B5C]">
                {actionType === 'publish' ? 'Kirim untuk Direview?' : 'Simpan sebagai Draft?'}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                {actionType === 'publish'
                  ? 'Layanan akan diserahkan kepada tim Admin Suruhin untuk diverifikasi terlebih dahulu sebelum diterbitkan secara publik.'
                  : 'Perubahan Anda akan disimpan sebagai draf. Anda dapat mengedit dan menerbitkannya kapan saja.'}
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="flex-1 border border-slate-100 hover:bg-slate-50 text-gray-500 rounded-xl py-3 text-xs font-black transition-all cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onConfirm}
                className={`flex-1 text-white rounded-xl py-3 text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-orange-100 ${
                  actionType === 'publish' ? 'bg-[#FF6500] hover:bg-[#e05900]' : 'bg-slate-700 hover:bg-slate-800'
                }`}
              >
                {isSubmitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <span>{actionType === 'publish' ? 'Kirim Review' : 'Simpan Draft'}</span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
