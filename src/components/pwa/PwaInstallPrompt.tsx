import { Download, X } from 'lucide-react';
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
    <div className="fixed inset-x-3 bottom-[calc(5.9rem+env(safe-area-inset-bottom))] z-50 mx-auto max-w-sm rounded-[1.2rem] border border-[#082B5C]/8 bg-white/96 p-2 shadow-[0_18px_48px_rgba(8,43,92,0.14)] backdrop-blur-xl lg:left-auto lg:right-6 lg:mx-0">
      <div className="flex items-center gap-2">
        <button
          onClick={async () => {
            await installEvent.prompt();
            const choice = await installEvent.userChoice;
            if (choice.outcome === 'accepted') {
              setInstallEvent(null);
            }
          }}
          className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#FF6500] px-3 text-xs font-black text-white"
        >
          <Download size={14} />
          Install sekarang
        </button>
        <button
          onClick={() => {
            localStorage.setItem(DISMISS_KEY, 'true');
            setIsDismissed(true);
          }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-400"
          aria-label="Tutup prompt install"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
