import { Container } from '../components/layout/Container';
import { ShieldAlert } from 'lucide-react';

export function SyaratKetentuan() {
  return (
    <div className="py-24 bg-slate-50/50 min-h-screen text-left">
      <Container className="max-w-3xl">
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-5">
            <div className="p-3 bg-orange-50 text-[#FF6500] rounded-2xl">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#082B5C]">Syarat & Ketentuan</h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">Terakhir Diperbarui: 13 Juli 2026</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-gray-500 leading-relaxed">
            <p>
              Selamat datang di Suruhin. Harap membaca Syarat & Ketentuan ini secara seksama sebelum memesan jasa harian atau mendaftar kemitraan sebagai Talent di platform kami. Dengan menggunakan layanan kami, Anda dianggap menyetujui seluruh ketentuan di bawah ini.
            </p>

            <h3 className="text-sm font-black text-[#082B5C] uppercase tracking-wider pt-2">1. Ketentuan Pengguna Jasa</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Pengguna jasa wajib memberikan informasi nama lengkap, nomor WhatsApp aktif, serta alamat lokasi pelaksanaan tugas harian secara benar dan akurat.</li>
              <li>Pengguna dilarang keras meminta Talent untuk melakukan aktivitas ilegal, membahayakan keselamatan lalu lintas, atau asusila seksual di luar norma kepatutan hukum.</li>
              <li>Segala bentuk komunikasi, penjadwalan, atau negosiasi ulang disarankan dilaporkan ke pihak Admin Official Suruhin demi kenyamanan proteksi keamanan bersama.</li>
            </ul>

            <h3 className="text-sm font-black text-[#082B5C] uppercase tracking-wider pt-2">2. Ketentuan Kemitraan Mitra (Talent)</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Setiap Talent bertindak sebagai mitra kemitraan independen, bukan karyawan langsung PT Suruhin Bantuan Lokal Nusantara.</li>
              <li>Talent wajib melampirkan berkas asli KTP, SIM (bila relevan), dan SKCK kepolisian saat proses verifikasi rekrutmen.</li>
              <li>Talent wajib mengenakan kemeja/pakaian rapi, berperilaku sopan santun (someah), dan menjunjung tinggi norma moralitas lokal selama melayani pelanggan.</li>
            </ul>

            <h3 className="text-sm font-black text-[#082B5C] uppercase tracking-wider pt-2">3. Batasan Mutlak Norma Susila (Deklarasi Hukum)</h3>
            <p className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs text-[#E5484D] font-semibold leading-relaxed">
              PENTING & MENGIKAT: Suruhin adalah platform jasa tolong-menolong harian yang sehat. Kami melarang keras segala jenis layanan penawaran kencan berbayar, pacar sewaan, prostitusi terselubung, atau segala tindakan seksual yang bertentangan dengan UU Pornografi dan UU TPKS. Melanggar kesepakatan ini akan berakibat pada pemblokiran permanen, penahanan pembayaran komisi, serta pelaporan hukum pidana bekerjasama dengan Polres Tasikmalaya.
            </p>

            <h3 className="text-sm font-black text-[#082B5C] uppercase tracking-wider pt-2">4. Sistem Pembayaran & Pembatalan</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Harga sewa tertera di platform adalah harga transparan mulai dari per-jam atau per-sesi.</li>
              <li>Pembatalan pesanan yang dilakukan kurang dari 1 jam sebelum jadwal pelaksanaan dapat dikenakan biaya administrasi kompensasi perjalanan bagi Talent yang bersangkutan.</li>
            </ul>

            <p className="text-[11px] text-gray-400 pt-4 border-t border-slate-50">
              Syarat & ketentuan ini diatur dan ditafsirkan sesuai dengan hukum Republik Indonesia. Dengan menyetujui ketentuan ini, Anda siap menjaga kenyamanan bersama di wilayah Priangan Timur.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
