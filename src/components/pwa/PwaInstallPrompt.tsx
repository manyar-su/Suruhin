import { Download, Smartphone, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISS_KEY = 'suruhin_pwa_prompt_dismissed';

export function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (standalone) return;

    setIsDismissed(localStorage.getItem(DISMISS_KEY) === 'true');

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstallEvent(null);
      localStorage.removeItem(DISMISS_KEY);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  if (!installEvent || isDismissed) {
    return null;
  }

  return (
    <div className="fixed inset-x-3 bottom-[calc(5.9rem+env(safe-area-inset-bottom))] z-50 mx-auto max-w-md rounded-[1.5rem] border border-[#082B5C]/8 bg-white/96 p-3 shadow-[0_18px_48px_rgba(8,43,92,0.14)] backdrop-blur-xl lg:left-auto lg:right-6 lg:mx-0 lg:max-w-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#082B5C] text-[#FFB36A]">
          <Smartphone size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-[#082B5C]">Install Suruhin</p>
          <p className="mt-1 text-xs leading-relaxed text-[#172033]/70">
            Pasang ke layar utama agar terasa seperti aplikasi dan lebih cepat dibuka.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={async () => {
                await installEvent.prompt();
                const choice = await installEvent.userChoice;
                if (choice.outcome === 'accepted') {
                  setInstallEvent(null);
                }
              }}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#FF6500] px-3 text-xs font-black text-white"
            >
              <Download size={14} />
              Install
            </button>
            <button
              onClick={() => {
                localStorage.setItem(DISMISS_KEY, 'true');
                setIsDismissed(true);
              }}
              className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 px-3 text-xs font-black text-[#082B5C]"
            >
              Nanti
            </button>
          </div>
        </div>
        <button
          onClick={() => {
            localStorage.setItem(DISMISS_KEY, 'true');
            setIsDismissed(true);
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400"
          aria-label="Tutup prompt install"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
