import React, { useState } from 'react';
import { Mail, Phone, MapPin, Instagram, Youtube, Send, Check } from 'lucide-react';
import { Container } from './Container';
import { SuruhinLogo } from './Navbar';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim() && newsletterEmail.includes('@')) {
      setNewsletterSubmitted(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSubmitted(false), 5000);
    }
  };

  const columns = [
    {
      title: 'Suruhin',
      links: [
        { name: 'Tentang Kami', path: '/tentang' },
        { name: 'Cara Kerja', path: '/cara-kerja' },
        { name: 'Sistem Keamanan', path: '/keamanan' },
        { name: 'Pusat Bantuan', path: '/bantuan' }
      ]
    },
    {
      title: 'Kategori Layanan',
      links: [
        { name: 'Antar Jemput', path: '/layanan?category=antar-jemput' },
        { name: 'Temenin Aktivitas', path: '/layanan?category=temenin' },
        { name: 'Titip & Belanja', path: '/layanan?category=titip-belanja' },
        { name: 'Olahraga & Hobi', path: '/layanan?category=olahraga-hobi' },
        { name: 'Rumah Tangga', path: '/layanan?category=rumah-tangga' },
        { name: 'Jasa Digital', path: '/layanan?category=digital' }
      ]
    },
    {
      title: 'Bantuan & Legal',
      links: [
        { name: 'Pusat Bantuan', path: '/bantuan' },
        { name: 'Kebijakan Privasi', path: '/kebijakan-privasi' },
        { name: 'Syarat & Ketentuan', path: '/syarat-ketentuan' },
        { name: 'Hubungi Kami', path: '/kontak' }
      ]
    }
  ];

  return (
    <footer className="bg-[#082B5C] text-white pt-16 pb-8 border-t border-white/5 relative overflow-hidden shrink-0">
      {/* Abstract background vector shapes */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-orange-500/10 blur-3xl -z-0 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#FF6500]/10 blur-3xl -z-0 pointer-events-none" />

      <Container className="relative z-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-6 border-b border-white/10 pb-12 mb-10">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <div className="cursor-pointer mb-5 inline-block" onClick={() => onNavigate('/')}>
              <SuruhinLogo variant="light" />
            </div>
            <p className="text-sm text-gray-300 leading-relaxed max-w-sm mb-6">
              Platform marketplace jasa lokal tepercaya pertama di Tasikmalaya. Menghubungkan Anda dengan ribuan Talent terlatih untuk menyelesaikan berbagai urusan harian dengan cepat, aman, dan penuh kesopanan.
            </p>
            <p className="text-xs font-bold text-[#FF6500] uppercase tracking-wider mb-2">Slogan Kami:</p>
            <p className="text-lg font-black italic tracking-wide text-white">
              “Apa aja? Suruhin aja.”
            </p>
          </div>

          {/* Nav Links columns */}
          {columns.map((col, idx) => (
            <div key={idx}>
              <h4 className="text-base font-extrabold text-white mb-5 tracking-wide border-l-3 border-[#FF6500] pl-2.5">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <button
                      onClick={() => onNavigate(link.path)}
                      className="text-sm text-gray-300 hover:text-[#FF6500] transition-colors duration-200 cursor-pointer text-left"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter & Contact Column */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start border-b border-white/10 pb-12 mb-8">
          {/* Newsletter */}
          <div className="lg:col-span-2">
            <h4 className="text-base font-extrabold text-white mb-3">
              Berlangganan Info & Promo Suruhin
            </h4>
            <p className="text-sm text-gray-300 mb-4 max-w-md">
              Dapatkan berita terbaru, voucher diskon layanan harian, dan pembaruan fitur eksklusif dari kami.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex max-w-md relative">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Masukkan email Anda"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6500] focus:border-transparent transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 bg-[#FF6500] hover:bg-[#e05900] text-white px-4 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Kirim"
              >
                {newsletterSubmitted ? <Check size={18} /> : <Send size={18} />}
              </button>
            </form>
            {newsletterSubmitted && (
              <p className="text-xs text-[#18A957] font-semibold mt-2">
                Terima kasih! Anda berhasil berlangganan newsletter Suruhin.
              </p>
            )}
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-base font-extrabold text-white mb-4">Hubungi Kami</h4>
            <div className="space-y-3.5 text-sm text-gray-300">
              <a
                href="https://wa.me/6282298511930"
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-2.5 hover:text-[#FF6500] transition-colors"
              >
                <Phone size={18} className="text-[#FF6500] shrink-0 mt-0.5" />
                <span>082298511930 (WhatsApp Bantuan)</span>
              </a>
              <a
                href="mailto:support@suruhin.com"
                className="flex items-start gap-2.5 hover:text-[#FF6500] transition-colors"
              >
                <Mail size={18} className="text-[#FF6500] shrink-0 mt-0.5" />
                <span>support@suruhin.com</span>
              </a>
              <div className="flex items-start gap-2.5">
                <MapPin size={18} className="text-[#FF6500] shrink-0 mt-0.5" />
                <span>Jl. Siliwangi No. 12, Kota Tasikmalaya, Jawa Barat, 46115</span>
              </div>
              <div className="flex gap-4 pt-2">
                <a
                  href="https://instagram.com/suruhin"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-white/5 hover:bg-[#FF6500] text-white rounded-xl transition-all"
                  aria-label="Instagram"
                >
                  <Instagram size={18} />
                </a>
                <a
                  href="https://youtube.com/suruhin"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-white/5 hover:bg-[#FF6500] text-white rounded-xl transition-all"
                  aria-label="YouTube"
                >
                  <Youtube size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright and disclaimer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} PT Suruhin Bantuan Lokal Nusantara. Hak Cipta Dilindungi.</p>
          <div className="flex gap-4">
            <button onClick={() => onNavigate('/kebijakan-privasi')} className="hover:text-white transition-colors cursor-pointer">Kebijakan Privasi</button>
            <span>•</span>
            <button onClick={() => onNavigate('/syarat-ketentuan')} className="hover:text-white transition-colors cursor-pointer">Syarat & Ketentuan</button>
          </div>
        </div>
        <p className="text-[10px] text-gray-500 text-center md:text-left mt-4 border-t border-white/5 pt-4 leading-relaxed">
          Disclaimer: Suruhin adalah platform marketplace jasa yang memfasilitasi hubungan kemitraan independen antara Pengguna dan Talent lokal. Semua aktivitas jasa wajib mematuhi aturan legal, kesopanan, menjaga norma susila, dan melarang segala tindakan ilegal atau seksual terlarang.
        </p>
      </Container>
    </footer>
  );
}
