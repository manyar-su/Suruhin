import { Container } from '../components/layout/Container';
import { Search, MapPin, CalendarCheck, CheckCircle2, Award, UserPlus, FileSignature, Wallet } from 'lucide-react';
import { Button } from '../components/shared/Button';

interface CaraKerjaProps {
  navigate: (path: string) => void;
}

export function CaraKerja({ navigate }: CaraKerjaProps) {
  const customerSteps = [
    {
      title: 'Pilih Jasa Pendamping',
      desc: 'Jelajahi kategori jasa bantuan lokal (seperti antar jemput, belanja, temenin nonton/olahraga) dan bandingkan detail harga.',
      icon: Search,
    },
    {
      title: 'Tentukan Alamat & Jadwal',
      desc: 'Masukkan titik penjemputan/pertemuan, tanggal, waktu mulai, dan cantumkan catatan instruksi khusus untuk Talent Anda.',
      icon: MapPin,
    },
    {
      title: 'Konfirmasi via WhatsApp',
      desc: 'Detail pemesanan akan otomatis terkompilasi ke dalam link WhatsApp. Hubungi CS/Admin kami untuk finalisasi ketersediaan Talent.',
      icon: CalendarCheck,
    },
    {
      title: 'Selesai & Beri Ulasan',
      desc: 'Talent datang tepat waktu menyelesaikan tugas dengan sopan. Setelah rampung, berikan rating ulasan jujur untuk meningkatkan layanan.',
      icon: CheckCircle2,
    }
  ];

  const talentSteps = [
    {
      title: 'Daftar Kemitraan',
      desc: 'Isi formulir online secara gratis, cantumkan keahlian khusus Anda, serta tentukan hari operasional Anda yang bersedia kerja.',
      icon: UserPlus,
    },
    {
      title: 'Verifikasi & Wawancara',
      desc: 'Unggah dokumen identitas KTP asli untuk pemeriksaan berkas administratif, diikuti sesi wawancara tatap muka langsung.',
      icon: FileSignature,
    },
    {
      title: 'Pelatihan Tata Krama',
      desc: 'Mengikuti sesi pembekalan sopan santun berbahasa, kepatuhan keselamatan lalu lintas, dan standard operasional bantuan.',
      icon: Award,
    },
    {
      title: 'Terima Order & Gajian',
      desc: 'Mulai terima pesanan harian dari masyarakat di wilayah sekitar Anda dan cairkan komisi penghasilan transparan setiap minggunya.',
      icon: Wallet,
    }
  ];

  return (
    <div className="py-24 bg-slate-50/50 min-h-screen">
      <Container>
        {/* Page title */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h1 className="text-3xl sm:text-4xl font-black text-[#082B5C] tracking-tight">
            Bagaimana Cara Kerja Suruhin?
          </h1>
          <p className="text-sm text-[#172033]/70 leading-relaxed">
            Platform marketplace tepercaya yang dirancang sesederhana mungkin untuk menghubungkan masyarakat yang butuh bantuan dengan Talent lokal terlatih.
          </p>
        </div>

        {/* Split Section: Pelanggan vs Talent */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Column Pelanggan */}
          <div className="space-y-8 text-left bg-white p-8 rounded-3xl border border-slate-100 shadow-xs">
            <h2 className="text-lg font-black text-[#082B5C] border-b border-slate-50 pb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6500]" />
              <span>Untuk Pengguna / Pelanggan</span>
            </h2>

            <div className="space-y-6">
              {customerSteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6500] flex items-center justify-center font-bold text-sm shrink-0">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#082B5C] mb-1">
                        {idx + 1}. {step.title}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              variant="primary"
              onClick={() => navigate('/layanan')}
              className="w-full font-bold pt-3.5 pb-3.5"
            >
              Cari Jasa Sekarang
            </Button>
          </div>

          {/* Column Talent */}
          <div className="space-y-8 text-left bg-white p-8 rounded-3xl border border-slate-100 shadow-xs">
            <h2 className="text-lg font-black text-[#082B5C] border-b border-slate-50 pb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span>Untuk Talent / Penyedia Jasa</span>
            </h2>

            <div className="space-y-6">
              {talentSteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#082B5C] mb-1">
                        {idx + 1}. {step.title}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              variant="outline"
              onClick={() => navigate('/jadi-talent')}
              className="w-full font-bold pt-3.5 pb-3.5"
            >
              Gabung Jadi Talent
            </Button>
          </div>

        </div>
      </Container>
    </div>
  );
}
