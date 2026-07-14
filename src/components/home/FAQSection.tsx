import { useState } from 'react';
import { faqs } from '../../data/faq';
import { SectionHeader } from '../shared/SectionHeader';
import { Plus, Minus, HelpCircle } from 'lucide-react';

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 bg-[#F5F7FA]/35 border-y border-slate-50">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <SectionHeader
          tagline="Tanya Jawab"
          title="Pertanyaan yang Sering Diajukan"
          description="Temukan jawaban cepat mengenai cara kerja, verifikasi, jaminan keamanan, dan sistem pembayaran Suruhin."
          align="center"
        />

        {/* FAQ Accordion List */}
        <div className="mt-8 space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.id}
                className={`bg-white rounded-2xl border border-slate-100 hover:border-orange-500/10 shadow-xs transition-all duration-300 overflow-hidden ${
                  isOpen ? 'ring-1 ring-[#FF6500]/10 border-[#FF6500]/15' : ''
                }`}
              >
                {/* Header button click target */}
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-extrabold text-[#082B5C] flex items-center gap-2.5">
                    <HelpCircle size={18} className="text-[#FF6500] shrink-0" />
                    <span>{faq.question}</span>
                  </span>
                  
                  <span className={`p-1 bg-[#F5F7FA] rounded-lg text-[#082B5C] transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 bg-orange-50 text-[#FF6500]' : ''}`}>
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                  </span>
                </button>

                {/* Answer Content Panel with smooth expand */}
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-[300px] border-t border-slate-50 opacity-100 p-6 bg-slate-50/30' : 'max-h-0 opacity-0 pointer-events-none'
                  } overflow-hidden text-left`}
                >
                  <p className="text-xs sm:text-sm text-[#172033]/70 leading-relaxed max-w-2xl">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
