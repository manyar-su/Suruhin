import { Container } from '../components/layout/Container';
import { ContactForm } from '../components/forms/ContactForm';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Kontak() {
  return (
    <div className="py-24 bg-slate-50/50 min-h-screen">
      <Container>
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-[#FF6500] text-xs font-bold">
            <span>Kontak & Hubungi Kami</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#082B5C] tracking-tight">
            Hubungi Tim Suruhin
          </h1>
          <p className="text-sm text-[#172033]/70 leading-relaxed">
            Apakah Anda memiliki pertanyaan kemitraan usaha, pengajuan kerja sama sponsorship, atau keluhan operasional? Hubungi kami langsung.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-4xl mx-auto">
          {/* Left: Contact Info cards */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="bg-[#082B5C] text-white p-6 rounded-3xl border border-white/5 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#FF6500]/15 blur-2xl pointer-events-none" />
              <h3 className="text-sm font-extrabold text-[#FF6500] uppercase tracking-wider">Kantor Operasional</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Kantor pusat operasional Suruhin beralamat di pusat Kota Tasikmalaya. Terbuka bagi Talent yang ingin konsultasi pendaftaran.
              </p>
              
              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-start gap-2.5">
                  <MapPin size={16} className="text-[#FF6500] shrink-0 mt-0.5" />
                  <span>Jl. Siliwangi No. 12, Kota Tasikmalaya, Jawa Barat, 46115</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone size={14} className="text-[#FF6500] shrink-0" />
                  <span>+62 852-2300-0111</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail size={14} className="text-[#FF6500] shrink-0" />
                  <span>support@suruhin.com</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Embed ContactForm */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </Container>
    </div>
  );
}
