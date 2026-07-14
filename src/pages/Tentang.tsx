import { Container } from '../components/layout/Container';
import { Target, Users, Landmark, Flame } from 'lucide-react';

export function Tentang() {
  const values = [
    {
      title: 'Pemberdayaan Pemuda',
      desc: 'Membuka peluang kerja harian yang fleksibel dan aman bagi mahasiswa, pemuda, dan pekerja lepas di Tasikmalaya untuk mendapatkan penghasilan tambahan.',
      icon: Flame,
    },
    {
      title: 'Kesopanan Sunda',
      desc: 'Mengedepankan nilai tata krama, beberapa kearifan lokal (Someah, Handap Asor, tur Parigel) dalam setiap aspek komunikasi penjemputan dan bantuan.',
      icon: Users,
    },
    {
      title: 'Keamanan Mutlak',
      desc: 'Menjamin ekosistem aman terkendali dengan verifikasi KTP, catatan kriminal (SKCK), wawancara tatap muka langsung, dan asuransi pesanan.',
      icon: Landmark,
    },
    {
      title: 'Solusi Harian Praktis',
      desc: 'Membantu urusan rumah tangga, pengantaran anak sekolah, titipan belanjaan, hingga teman olahraga agar hidup warga Tasikmalaya lebih seimbang.',
      icon: Target,
    }
  ];

  return (
    <div className="py-24 bg-slate-50/50 min-h-screen">
      <Container>
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h1 className="text-3xl sm:text-4xl font-black text-[#082B5C] tracking-tight">
            Mengenal Suruhin Lebih Dekat
          </h1>
          <p className="text-sm text-[#172033]/70 leading-relaxed">
            Menghubungkan masyarakat dengan talent lokal terbaik di Tasikmalaya dan sekitarnya guna menyelesaikan berbagai kebutuhan harian dengan ramah, aman, dan efisien.
          </p>
        </div>

        {/* Corporate Story */}
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-100 shadow-xs max-w-4xl mx-auto text-left space-y-6 mb-16">
          <h2 className="text-xl font-black text-[#082B5C]">Kisah Berdirinya Suruhin</h2>
          <div className="space-y-4 text-xs sm:text-sm text-gray-500 leading-relaxed">
            <p>
              Suruhin didirikan di Kota Tasikmalaya oleh sekelompok pemuda lokal yang melihat tingginya kebutuhan warga perkotaan akan asisten terpercaya untuk menyelesaikan urusan harian kecil — mulai dari mengantar anak sekolah saat orang tua sibuk bekerja, mendampingi lansia ke puskesmas, menitip belanjaan di pasar tradisional, hingga teman ngopi atau olahraga di akhir pekan.
            </p>
            <p>
              Di sisi lain, banyak mahasiswa aktif (seperti di Universitas Siliwangi) dan pemuda kreatif Tasikmalaya yang memiliki waktu luang serta keahlian mumpuni namun kesulitan menemukan penghasilan tambahan yang fleksibel, halal, dan aman.
            </p>
            <p>
              Dengan mengusung slogan <strong>“Apa aja? Suruhin aja.”</strong>, Suruhin hadir sebagai jembatan yang mempersatukan kedua kebutuhan tersebut ke dalam satu ekosistem terintegrasi yang menjunjung tinggi nilai kejujuran, kesopanan khas Sunda (someah), dan keamanan hukum berlapis.
            </p>
          </div>
        </div>

        {/* Core values grid */}
        <div className="max-w-4xl mx-auto space-y-8 text-left">
          <h2 className="text-lg font-black text-[#082B5C] border-l-3 border-[#FF6500] pl-2 uppercase tracking-wider mb-6">
            Nilai-Nilai Utama Kami
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 flex items-start gap-4">
                  <div className="p-3 bg-orange-50 text-[#FF6500] rounded-xl shrink-0">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-[#082B5C] uppercase tracking-wider mb-1.5">{val.title}</h3>
                    <p className="text-[11px] text-gray-500 leading-relaxed">{val.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto mt-16 bg-[#082B5C] text-white p-8 rounded-3xl text-center border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#FF6500]/5 blur-2xl pointer-events-none" />
          {[
            { label: 'Kota Jangkauan', num: '6+' },
            { label: 'Talent Terverifikasi', num: '250+' },
            { label: 'Pemesanan Selesai', num: '15.000+' },
            { label: 'Tingkat Kepuasan', num: '4.9/5' }
          ].map((stat, index) => (
            <div key={index}>
              <div className="text-2xl sm:text-3xl font-black text-[#FF6500] mb-1">{stat.num}</div>
              <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

      </Container>
    </div>
  );
}
