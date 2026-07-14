import { CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '../shared/Button';
import { getStaticAssetPath } from '../../lib/assetPaths';

interface JoinTalentBannerProps {
  onRegisterAsTalent: () => void;
}

export function JoinTalentBanner({ onRegisterAsTalent }: JoinTalentBannerProps) {
  const benefits = [
    'Daftar gratis',
    'Atur waktu sendiri',
    'Penghasilan transparan',
  ];

  return (
    <section className="bg-white py-14 md:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2.25rem] border border-[#fff2df] bg-[radial-gradient(circle_at_left,_rgba(255,194,86,0.16),_transparent_28%),linear-gradient(135deg,_#fffaf3_0%,_#fff7ee_45%,_#fff_100%)] shadow-[0_22px_60px_rgba(8,43,92,0.08)]">
          <div className="grid items-center gap-8 lg:grid-cols-[0.88fr_1.12fr]">
            <div className="relative h-full overflow-hidden">
              <img
                src={getStaticAssetPath('ui/layout-reference.png')}
                alt="Talent Suruhin"
                className="h-full min-h-[320px] w-full object-cover"
              />
            </div>

            <div className="px-6 pb-8 pt-2 sm:px-8 lg:px-10">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#ff9f12] shadow-sm">
                <Sparkles size={14} />
                Peluang Jadi Talent
              </span>

              <h2 className="mt-5 text-3xl font-black tracking-tight text-[#081a44] sm:text-[2.5rem]">
                Punya waktu luang?
                <br />
                Yuk, jadi Talent Suruhin!
              </h2>

              <p className="mt-4 max-w-xl text-base leading-relaxed text-[#172033]/72">
                Bantu orang lain di sekitar Tasikmalaya sambil membuka penghasilan tambahan
                dari layanan yang memang kamu kuasai.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-center gap-3 rounded-2xl border border-white/85 bg-white/88 px-4 py-3 text-sm font-black text-[#081a44] shadow-sm"
                  >
                    <CheckCircle size={18} className="text-[#ff8b00]" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={onRegisterAsTalent}
                  className="rounded-2xl px-8 font-black shadow-[0_18px_36px_rgba(255,101,0,0.24)]"
                >
                  Daftar Jadi Talent
                </Button>

                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((index) => (
                      <img
                        key={index}
                        src={`https://images.unsplash.com/photo-${index === 1 ? '1494790108377-be9c29b29330' : index === 2 ? '1500648767791-00dcc994a43e' : index === 3 ? '1506794778202-cad84cf45f1d' : '1502685104226-ee32379fefbe'}?auto=format&fit=crop&w=80&h=80`}
                        alt={`Talent aktif ${index}`}
                        referrerPolicy="no-referrer"
                        className="h-10 w-10 rounded-full border-2 border-white object-cover"
                      />
                    ))}
                  </div>
                  <p className="text-sm font-black text-[#081a44]">5.000+ talent aktif</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
