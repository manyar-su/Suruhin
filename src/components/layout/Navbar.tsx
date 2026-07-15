import { useState, useEffect } from 'react';
import { MapPin, Menu, X, ChevronDown, LogIn, UserPlus, User } from 'lucide-react';
import { useScrollPosition } from '../../hooks/useScrollPosition';
import { locations } from '../../data/locations';
import { Container } from './Container';
import { Button } from '../shared/Button';
import { getStaticAssetPath, getTalentAvatarPath } from '../../lib/assetPaths';

export function SuruhinLogo({ variant = 'dark', className = 'h-8' }: { variant?: 'dark' | 'light', className?: string }) {
  const logoColor = variant === 'dark' ? '#082B5C' : '#FFFFFF';

  return (
    <div className={`flex items-center gap-2.5 ${className} select-none`}>
      <img
        src={getStaticAssetPath('logo/logo.png')}
        alt="Suruhin"
        className="h-11 w-auto shrink-0 object-contain"
      />
      <span className="sr-only" style={{ color: logoColor }}>
        Suruhin
      </span>
    </div>
  );
}

import { Talent } from '../../types';

interface NavbarProps {
  activePath: string;
  onNavigate: (path: string) => void;
  selectedLocation: string;
  onLocationChange: (loc: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  currentUser?: Talent | null;
  onLogout?: () => void;
}

export function Navbar({
  activePath,
  onNavigate,
  selectedLocation,
  onLocationChange,
  onOpenAuth,
  currentUser,
  onLogout,
}: NavbarProps) {
  const scrollY = useScrollPosition();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);

  // Close menus on resize or navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsLocationDropdownOpen(false);
  }, [activePath]);

  const isScrolled = scrollY > 10;

  // Active link check
  const isActive = (path: string) => {
    if (path === '/' && activePath === '/') return true;
    if (path !== '/' && activePath.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Layanan', path: '/layanan' },
    { name: 'Cara Kerja', path: '/cara-kerja' },
    { name: 'Jadi Talent', path: '/jadi-talent' },
    { name: 'Keamanan', path: '/keamanan' },
    { name: 'Bantuan', path: '/bantuan' },
    ...(currentUser ? [{ name: 'Dashboard', path: '/profil-talent' }] : []),
  ];

  return (
    <>
      <header
        id="navbar-suruhin"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/94 backdrop-blur-xl shadow-[0_18px_45px_rgba(8,43,92,0.08)] border-b border-white/70 py-3'
            : 'bg-transparent py-6'
        }`}
      >
        <Container>
          <div className={`flex items-center justify-between rounded-full transition-all duration-300 ${
            isScrolled ? 'px-0' : 'border border-white/70 bg-white/80 px-5 py-3 shadow-[0_16px_40px_rgba(8,43,92,0.06)] backdrop-blur'
          }`}>
            {/* Logo */}
            <div className="cursor-pointer" onClick={() => onNavigate('/')}>
              <SuruhinLogo variant="dark" />
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <div key={link.path} className="relative group">
                  <button
                    onClick={() => onNavigate(link.path)}
                    className={`text-[15px] font-bold transition-colors duration-200 cursor-pointer ${
                      isActive(link.path)
                        ? 'text-[#FF6500]'
                        : 'text-[#172033] hover:text-[#FF6500]'
                    }`}
                  >
                    {link.name}
                  </button>
                  {/* Underline Indicator */}
                  <span
                    className={`absolute -bottom-1 left-0 right-0 h-0.5 bg-[#FF6500] transition-transform duration-300 origin-left ${
                      isActive(link.path) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </div>
              ))}
            </nav>

            {/* Right actions */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Location Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#082B5C]/6 bg-[#fbfcff] px-4 py-3 text-sm font-bold text-[#082B5C] transition-all hover:bg-gray-100 cursor-pointer"
                >
                  <MapPin size={16} className="text-[#FF6500]" />
                  <span>{selectedLocation}</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isLocationDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isLocationDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2.5 z-50">
                    <div className="px-4 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Pilih Wilayah Jasa
                    </div>
                    {locations.map((loc) => (
                      <button
                        key={loc.id}
                        onClick={() => {
                          onLocationChange(loc.name);
                          setIsLocationDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer flex items-center justify-between ${
                          selectedLocation === loc.name
                            ? 'bg-orange-50 font-bold text-[#FF6500]'
                            : 'text-[#172033] hover:bg-[#F5F7FA]'
                        }`}
                      >
                        <span>{loc.name}</span>
                        {selectedLocation === loc.name && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6500]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Auth Buttons */}
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onNavigate('/profil-talent')}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-black rounded-xl transition-all border cursor-pointer ${
                      activePath === '/profil-talent'
                        ? 'bg-[#082B5C] text-white border-[#082B5C]'
                        : 'bg-[#F5F7FA] border-slate-100 text-[#082B5C] hover:bg-gray-100'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-md overflow-hidden border border-[#082B5C]/10 bg-slate-100 shrink-0">
                      <img
                        src={getTalentAvatarPath(currentUser.avatar, currentUser.name)}
                        alt={currentUser.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=082B5C&color=fff`;
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="max-w-[90px] truncate text-left">{currentUser.name.split(' ')[0]}</span>
                  </button>
                  <button
                    onClick={onLogout}
                    className="text-xs font-bold text-red-500 hover:text-red-700 px-2 py-1 transition-colors cursor-pointer"
                  >
                    Keluar
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => onOpenAuth('login')}
                    className="px-4 py-2 text-sm font-bold text-[#082B5C] transition-colors hover:text-[#FF6500] cursor-pointer"
                  >
                    Masuk
                  </button>
                  <Button onClick={() => onOpenAuth('register')} variant="primary" size="sm" className="rounded-full px-5 font-black">
                    Login / Daftar
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Actions and Hamburger */}
            <div className="flex lg:hidden items-center gap-2">
              {/* Location Badge */}
              <button
                onClick={() => {
                  // Toggle mobile menu and scroll to locations or open location choice
                  setIsMobileMenuOpen(true);
                  setIsLocationDropdownOpen(true);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-[#082B5C] bg-[#F5F7FA] rounded-lg border border-gray-100"
              >
                <MapPin size={12} className="text-[#FF6500]" />
                <span className="truncate max-w-[80px]">{selectedLocation}</span>
              </button>

              {/* Hamburger Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-[#082B5C] hover:bg-[#F5F7FA] rounded-xl transition-colors cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </Container>
      </header>

      {/* Mobile Drawer (Slide from right) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-100 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#082B5C]/45 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative ml-auto w-[82%] max-w-[290px] h-full bg-white shadow-2xl border-l border-gray-100 flex flex-col transform transition-transform duration-300 z-50">
            {/* Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 custom-scrollbar">
              {/* Header */}
              <div className="flex items-center justify-between pb-1.5 border-b border-gray-50">
                <SuruhinLogo variant="dark" className="scale-85 origin-left" />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 hover:bg-[#F5F7FA] text-gray-400 rounded-lg cursor-pointer transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Mobile Location Selector */}
              <div className="p-2.5 bg-[#F5F7FA] rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <MapPin size={10} className="text-[#FF6500] shrink-0" /> Wilayah
                  </span>
                  <span className="text-[10px] font-black text-[#082B5C] bg-[#082B5C]/5 px-1.5 py-0.5 rounded truncate max-w-[100px]">{selectedLocation}</span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {locations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => {
                        onLocationChange(loc.name);
                        setIsLocationDropdownOpen(false);
                      }}
                      title={loc.name}
                      className={`px-1.5 py-1 text-[10px] rounded-lg text-center font-bold transition-all cursor-pointer truncate block w-full ${
                        selectedLocation === loc.name
                          ? 'bg-[#082B5C] text-white shadow-xs'
                          : 'bg-white border border-slate-100 text-[#172033] hover:bg-gray-50'
                      }`}
                    >
                      {loc.name.replace('Tasikmalaya', 'Tasik')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Menu Links */}
              <nav className="flex flex-col gap-0.5">
                {navLinks.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => {
                      onNavigate(link.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isActive(link.path)
                        ? 'bg-orange-50 text-[#FF6500] border-l-2 border-[#FF6500] pl-2 rounded-l-none'
                        : 'text-[#172033] hover:bg-[#F5F7FA]'
                    }`}
                  >
                    <span className="truncate block flex-1 text-left">{link.name}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Mobile Footer Auth Buttons - Always visible and pinned to bottom */}
            <div className="border-t border-gray-100 p-3 bg-slate-50/80 flex flex-col gap-1.5 shrink-0">
              {currentUser ? (
                <>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onNavigate('/profil-talent');
                    }}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-[#082B5C] text-white text-[11px] font-black rounded-lg bg-[#082B5C] hover:bg-[#061e40] transition-all cursor-pointer shadow-xs truncate"
                  >
                    <User size={12} className="shrink-0" />
                    <span className="truncate">Profil ({currentUser.name.split(' ')[0]})</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onLogout?.();
                    }}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-red-200 text-red-500 text-[11px] font-black rounded-lg bg-red-50 hover:bg-red-100 transition-all cursor-pointer truncate"
                  >
                    <span className="truncate">Keluar Sesi</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAuth('login');
                    }}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-[#082B5C]/20 text-[#082B5C] text-[11px] font-black rounded-lg bg-white hover:bg-[#F5F7FA] transition-all cursor-pointer shadow-2xs truncate"
                  >
                    <LogIn size={12} className="shrink-0" />
                    <span className="truncate">Masuk Akun</span>
                  </button>
                  <Button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAuth('register');
                    }}
                    variant="primary"
                    fullWidth
                    size="sm"
                    className="py-2 text-[11px] font-black truncate flex items-center justify-center"
                  >
                    <UserPlus size={12} className="mr-1 shrink-0" />
                    <span className="truncate">Daftar Sekarang</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
