import { useState } from 'react';
import { faqs } from '../data/faq';
import { Container } from '../components/layout/Container';
import { ContactForm } from '../components/forms/ContactForm';
import { HelpCircle, Search, Mail, Phone, MessageSquarePlus, MapPin } from 'lucide-react';
import { generateSupportMessage, generateWhatsAppUrl } from '../lib/whatsapp';

export function Bantuan() {
  const [searchQuery, setSearchQuery] = useState('');
  const supportWhatsAppUrl = generateWhatsAppUrl(generateSupportMessage());

  // Live filter FAQ questions
  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="py-24 bg-slate-50/50 min-h-screen">
      <Container>
        {/* Title Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h1 className="text-3xl sm:text-4xl font-black text-[#082B5C] tracking-tight">
            Pusat Bantuan Suruhin
          </h1>
          <p className="text-sm text-[#172033]/70 leading-relaxed">
            Butuh bantuan terkait pendaftaran, cara memesan, atau ada pengaduan layanan? Tim bantuan kami bersiaga penuh melayani kebutuhan Anda.
          </p>
        </div>

        {/* Dynamic Help Center Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: FAQ Search & Accordion list */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Search FAQ Bar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-[#082B5C] flex items-center gap-1.5">
                <HelpCircle size={16} className="text-[#FF6500]" /> Cari Jawaban Cepat
              </h3>
              <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 flex items-center gap-3">
                <Search size={18} className="text-[#082B5C] opacity-40 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ketik topik pertanyaan... (contoh: KTP, bayar, asusila)"
                  className="w-full text-xs sm:text-sm text-[#172033] bg-transparent focus:outline-none placeholder-slate-400"
                />
              </div>
            </div>

            {/* List of Filtered FAQs */}
            <div className="space-y-4">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => (
                  <div key={faq.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-2.5">
                    <h4 className="text-sm font-black text-[#082B5C] flex items-start gap-2 leading-snug">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF6500] shrink-0 mt-2" />
                      <span>{faq.question}</span>
                    </h4>
                    <p className="text-xs text-[#172033]/70 leading-relaxed pl-3.5 border-l border-slate-100 text-left">
                      {faq.answer}
                    </p>
                  </div>
                ))
              ) : (
                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 text-center text-gray-400 text-xs">
                  Tidak ada FAQ yang cocok dengan pencarian Anda. Silakan isi form di samping untuk bantuan langsung.
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Contact info & ContactForm embed */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Embedded Contact Form */}
            <ContactForm />

            {/* Direct Channels Cards */}
            <div className="bg-[#082B5C] text-white p-6 rounded-3xl border border-white/5 text-left space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#FF6500]/10 blur-2xl pointer-events-none" />
              
              <h3 className="text-sm font-extrabold flex items-center gap-1.5">
                <MessageSquarePlus size={16} className="text-[#FF6500]" /> Hubungi Saluran Resmi
              </h3>
              
              <div className="space-y-3.5 text-xs text-gray-300">
                <a
                  href={supportWhatsAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 hover:text-[#FF6500] transition-colors"
                >
                  <Phone size={14} className="text-[#FF6500]" />
                  <span>WhatsApp Bantuan: 082298511930</span>
                </a>
                
                <a
                  href="mailto:support@suruhin.com"
                  className="flex items-center gap-2.5 hover:text-[#FF6500] transition-colors"
                >
                  <Mail size={14} className="text-[#FF6500]" />
                  <span>Email Dukungan: support@suruhin.com</span>
                </a>

                <div className="flex items-start gap-2.5">
                  <MapPin size={14} className="text-[#FF6500] shrink-0 mt-0.5" />
                  <span>Kantor: Jl. Siliwangi No. 12, Kota Tasikmalaya, Jawa Barat, 46115</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </Container>
    </div>
  );
}
