import { CloudCheck, CloudLightning, Loader2, Save } from 'lucide-react';

interface AutosaveIndicatorProps {
  state: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt?: Date;
}

export function AutosaveIndicator({ state, lastSavedAt }: AutosaveIndicatorProps) {
  const formatTime = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500">
      {state === 'saving' && (
        <>
          <Loader2 size={12} className="animate-spin text-[#FF6500]" />
          <span>Menyimpan draft...</span>
        </>
      )}
      {state === 'saved' && (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Draft tersimpan otomatis {lastSavedAt ? `pukul ${formatTime(lastSavedAt)}` : ''}</span>
        </>
      )}
      {state === 'error' && (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <span>Gagal menyimpan draft</span>
        </>
      )}
      {state === 'idle' && lastSavedAt && (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <span>Terakhir disimpan pukul {formatTime(lastSavedAt)}</span>
        </>
      )}
    </div>
  );
}
