import { Container } from '../components/layout/Container';
import { ShieldCheck } from 'lucide-react';

export function KebijakanPrivasi() {
  return (
    <div className="py-24 bg-slate-50/50 min-h-screen text-left">
      <Container className="max-w-3xl">
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-5">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#082B5C]">Kebijakan Privasi</h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">Terakhir Diperbarui: 13 Juli 2026</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-gray-500 leading-relaxed">
            <p>
              PT Suruhin Bantuan Lokal Nusantara (“Kami”, “Suruhin”) berkomitmen tinggi untuk melindungi privasi data pribadi seluruh Pengguna platform dan Mitra Kemitraan (“Talent”) di wilayah Tasikmalaya dan sekitarnya. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menyimpan, menggunakan, dan melindungi informasi pribadi Anda.
            </p>

            <h3 className="text-sm font-black text-[#082B5C] uppercase tracking-wider pt-2">1. Pengumpulan Informasi</h3>
            <p>
              Kami mengumpulkan beberapa jenis data saat Anda berinteraksi dengan platform kami:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Data Diri Pengguna:</strong> Nama lengkap, nomor WhatsApp aktif, alamat pelaksanaan bantuan, serta catatan instruksi khusus.</li>
              <li><strong>Data Diri Talent:</strong> Nama lengkap, nomor WhatsApp, alamat tempat tinggal, KTP, SIM (bagi kurir/pengantar), Surat Keterangan Catatan Kepolisian (SKCK), serta portofolio keahlian khusus.</li>
              <li><strong>Data Teknis:</strong> Informasi perangkat pencarian, preferensi halaman penjemputan, data geografis, serta log pelaporan.</li>
            </ul>

            <h3 className="text-sm font-black text-[#082B5C] uppercase tracking-wider pt-2">2. Penggunaan Informasi Pribadi</h3>
            <p>
              Data yang dikumpulkan digunakan murni demi kesuksesan transaksi jasa:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Memproses pemesanan jasa harian dan menghubungkan Anda dengan Talent terverifikasi.</li>
              <li>Kompilasi pemesanan kilat dan koordinasi admin pusat langsung ke WhatsApp Official Suruhin.</li>
              <li>Penyelidikan keluhan pengguna, tanggap darurat platform, serta pemeliharaan kepatuhan hukum atas asusila terlarang.</li>
              <li>Verifikasi administratif keaslian KTP oleh divisi rekrutmen kami sebelum Talent diaktifkan.</li>
            </ul>

            <h3 className="text-sm font-black text-[#082B5C] uppercase tracking-wider pt-2">3. Perlindungan & Penyimpanan Data</h3>
            <p>
              Seluruh dokumen sensitif Anda (seperti scan KTP atau alamat detail pelaksanaan tugas) disimpan di server kami yang terenkripsi dan aman. Kami berkomitmen untuk **tidak pernah menyewakan, memperjualbelikan, atau mendistribusikan** data pribadi Anda ke pihak periklanan pihak ketiga mana pun di luar ekosistem operasional PT Suruhin Bantuan Lokal Nusantara.
            </p>

            <h3 className="text-sm font-black text-[#082B5C] uppercase tracking-wider pt-2">4. Pembagian Data Hukum</h3>
            <p>
              Data pribadi Anda dapat kami serahkan secara terbuka kepada aparat penegak hukum (seperti Kepolisian Resor Kota Tasikmalaya) apabila terjadi tindakan pidana pelanggaran hukum, asusila terlarang, penipuan, pencurian, kekerasan, atau pelanggaran norma susila berat yang membahayakan nyawa atau kenyamanan pihak Pengguna atau Mitra Talent.
            </p>

            <p className="text-[11px] text-gray-400 pt-4 border-t border-slate-50">
              Jika Anda memiliki pertanyaan mengenai penggunaan data pribadi Anda, silakan hubungi tim legal perlindungan data kami melalui email di legal@suruhin.com.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
