import { Container } from '../components/layout/Container';
import { ShieldCheck, ShieldAlert, CheckCircle2, MapPin, Star, Phone, PhoneCall, HeartHandshake } from 'lucide-react';
import { Button } from '../components/shared/Button';

export function Keamanan() {
  const securityPillars = [
    {
      title: 'Verifikasi KTP & SKCK Kepolisian',
      desc: 'Setiap calon Talent wajib mengunggah KTP asli, SIM yang valid (bagi layanan transportasi), dan SKCK (Surat Keterangan Catatan Kepolisian) guna memastikan riwayat bersih dari segala rekam tindak pidana.',
      icon: ShieldCheck,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Interview Fisik & Pembekalan Etika',
      desc: 'Kami tidak sekadar meloloskan pendaftaran online. Seluruh calon Talent wajib menghadiri interviu tatap muka langsung di kantor kami, serta mengikuti bimbingan perilaku santun (Tata Krama Sunda), disiplin lalu lintas, dan standard penanganan darurat.',
      icon: HeartHandshake,
      color: 'bg-orange-50 text-[#FF6500]',
    },
    {
      title: 'Koordinat & Jadwal Tercatat',
      desc: 'Demi menghindari hal-hal yang tidak diinginkan, seluruh pesanan harian (waktu, tanggal, alamat pertemuan, dan nomor telepon) terdokumentasi permanen di database pusat kami dan dilindungi asuransi platform.',
      icon: MapPin,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: 'Ulasan Transparan Tanpa Sensor',
      desc: 'Konsumen dapat memberikan ulasan apa adanya setelah jasa selesai. Talent yang mendapatkan ulasan buruk atau perilaku menyimpang akan langsung dinonaktifkan sementara untuk pemeriksaan komprehensif.',
      icon: Star,
      color: 'bg-yellow-50 text-yellow-600',
    },
    {
      title: 'Layanan Tanggap Darurat 24 Jam',
      desc: 'Tersedia tombol pintasan darurat langsung ke admin pengawas pusat operasional jika terjadi kendala tak terduga, ketidaknyamanan rute jalan, atau tindakan tidak menyenangkan di lapangan.',
      icon: PhoneCall,
      color: 'bg-red-50 text-[#E5484D]',
    }
  ];

  return (
    <div className="py-24 bg-slate-50/50 min-h-screen">
      <Container>
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-[#E5484D] text-xs font-bold">
            <ShieldCheck size={14} className="fill-red-500/10" />
            <span>Pusat Perlindungan & Transparansi</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#082B5C] tracking-tight">
            Komitmen Keamanan & Kepercayaan
          </h1>
          <p className="text-sm text-[#172033]/70 leading-relaxed">
            Keamanan Anda adalah pondasi paling dasar di Suruhin. Kami merancang sistem perlindungan ganda berlapis guna memberikan kenyamanan maksimal bagi pengguna harian.
          </p>
        </div>

        {/* pillars grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 text-left max-w-4xl mx-auto">
          {securityPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xs flex gap-5"
                style={{ borderRadius: '20px' }} // Specified: "Border radius card 20px"
              >
                <div className={`p-3.5 rounded-2xl ${pillar.color} shadow-inner shrink-0 h-12 w-12 flex items-center justify-center`}>
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#082B5C] mb-2">{pillar.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{pillar.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legal Declaration */}
        <div className="bg-[#082B5C] text-white p-8 md:p-12 rounded-3xl relative overflow-hidden border border-white/5 max-w-4xl mx-auto text-left space-y-6">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#FF6500]/10 blur-3xl pointer-events-none" />
          
          <div className="flex gap-4 items-start border-b border-white/10 pb-6">
            <div className="p-3 bg-[#FF6500] rounded-2xl text-white mt-1 shrink-0">
              <ShieldAlert size={26} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold mb-1.5">Kebijakan Batasan Norma Susila</h2>
              <p className="text-xs text-gray-300 leading-relaxed">
                Kami berkomitmen menciptakan ruang kemitraan harian yang sehat dan berkah. Oleh karena itu, seluruh variasi jasa pendampingan (seperti temenin nonton, temenin makan, hiking, atau olahraga) adalah <strong>murni merupakan interaksi hobi/sosial formal dan legal</strong>. Kami melarang keras segala bentuk:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-200 pl-3">
            {[
              'Segala bentuk tindakan asusila & seksual',
              'Kencan romantis / pacar sewaan',
              'Penyalahgunaan narkoba & minuman keras',
              'Perjudian, penipuan, atau perkelahian',
              'Pelecehan verbal maupun fisik',
              'Kunjungan ke lokasi-lokasi prostitusi / ilegal'
            ].map((rule, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#E5484D] shrink-0" />
                <span className="font-semibold">{rule}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-white/10 text-xs text-gray-300 space-y-4">
            <p>
              Setiap bentuk pelanggaran kesepakatan norma susila di atas — baik yang diajukan oleh Pengguna ataupun diajukan oleh Talent — akan ditindak langsung secara tegas berupa <strong>penghapusan akun permanen</strong> dan <strong>pelaporan kepolisian setempat dengan bukti identitas lengkap (KTP)</strong> yang tersimpan di sistem kami.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-[#FF6500]" />
                <span className="font-bold">WhatsApp Hotline Darurat: +62 852-2300-0111</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6500]">Tim Operasional Siaga 24 Jam</span>
            </div>
          </div>
        </div>

      </Container>
    </div>
  );
}
