import { useEffect, useMemo, useState } from 'react';
import { useNavigation } from './hooks/useNavigation';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Modal } from './components/shared/Modal';
import { AuthForm } from './components/forms/AuthForm';
import { Button } from './components/shared/Button';
import { Talent } from './types';
import { clearUserSession, getCurrentSessionUser, touchUserSession, updateStoredUser } from './lib/authSession';

// Pages
import { Home } from './pages/Home';
import { LayananList } from './pages/LayananList';
import { LayananDetail } from './pages/LayananDetail';
import { TalentList } from './pages/TalentList';
import { TalentDetail } from './pages/TalentDetail';
import { JadiTalent } from './pages/JadiTalent';
import { CaraKerja } from './pages/CaraKerja';
import { Keamanan } from './pages/Keamanan';
import { Tentang } from './pages/Tentang';
import { Bantuan } from './pages/Bantuan';
import { Kontak } from './pages/Kontak';
import { KebijakanPrivasi } from './pages/KebijakanPrivasi';
import { SyaratKetentuan } from './pages/SyaratKetentuan';
import { ProfilTalent } from './pages/ProfilTalent';
import { PesananTrackingPage } from './pages/PesananTrackingPage';

export default function App() {
  const { currentRoute, navigate } = useNavigation();
  const [selectedLocation, setSelectedLocation] = useState('Kota Tasikmalaya');
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | null>(null);
  
  const [currentUser, setCurrentUser] = useState<Talent | null>(() => {
    return getCurrentSessionUser();
  });

  const protectedPages = useMemo(
    () => new Set(['profil-talent', 'talent-jasa', 'talent-jasa-buat', 'talent-jasa-edit', 'talent-jasa-detail', 'admin-review-jasa', 'pesanan-tracking']),
    []
  );

  const isProtectedRoute = protectedPages.has(currentRoute.page) || currentRoute.path.startsWith('/dashboard/');

  useEffect(() => {
    const user = getCurrentSessionUser();
    setCurrentUser(user);

    if (user && isProtectedRoute) {
      touchUserSession();
    }
  }, [currentRoute.page, currentRoute.path, isProtectedRoute]);

  const handleLogout = () => {
    clearUserSession();
    setCurrentUser(null);
    navigate('/');
  };

  const renderProtectedGate = () => (
    <div className="py-24 sm:py-32">
      <div className="max-w-3xl mx-auto px-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 sm:p-10 shadow-sm text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6500]/20 bg-[#FF6500]/10 px-4 py-2 text-xs font-bold text-[#FF6500]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#18A957]" />
            <span>Zona dashboard dan pelacakan aktif</span>
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black text-[#082B5C] tracking-tight">
              Area ini khusus akun yang sudah masuk
            </h1>
            <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#172033]/70 leading-relaxed">
              Halaman dashboard, pesanan, dan pelacakan dipisahkan dari halaman promosi agar sesi aktif, riwayat pengguna, dan kontrol keamanan tetap lebih rapi.
            </p>
          </div>

          <div className="grid gap-3 text-left sm:grid-cols-3">
            {[
              'Sesi otomatis diperbarui selama pengguna aktif.',
              'Akses dibatasi setelah percobaan login berulang.',
              'Halaman pesanan tidak dibuka tanpa sesi yang valid.',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold text-[#082B5C]">
                {item}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button variant="primary" onClick={() => setAuthModalMode('login')} className="font-bold">
              Masuk ke Dashboard
            </Button>
            <Button variant="outline" onClick={() => setAuthModalMode('register')} className="font-bold">
              Daftar Akun Baru
            </Button>
            <Button variant="ghost" onClick={() => navigate('/layanan')} className="font-bold">
              Kembali ke Layanan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render correct active page based on routing system
  const renderPage = () => {
    if (isProtectedRoute && !currentUser) {
      return renderProtectedGate();
    }

    switch (currentRoute.page) {
      case 'home':
        return <Home navigate={navigate} />;
      case 'layanan-list':
        return <LayananList navigate={navigate} queryParams={currentRoute.queryParams} />;
      case 'layanan-detail':
        return <LayananDetail slug={currentRoute.slug || ''} navigate={navigate} />;
      case 'talent-list':
        return <TalentList navigate={navigate} queryParams={currentRoute.queryParams} />;
      case 'talent-detail':
        return <TalentDetail slug={currentRoute.slug || ''} navigate={navigate} />;
      case 'profil-talent':
        return (
          <ProfilTalent
            currentUser={currentUser}
            onUpdateUser={(updated) => {
              setCurrentUser(updated);
              updateStoredUser(updated);
              // Sync to custom register storage if applicable
              const savedCustom = localStorage.getItem('suruhin_custom_talent');
              if (savedCustom) {
                try {
                  const parsedCustom = JSON.parse(savedCustom);
                  if (parsedCustom.id === updated.id) {
                    localStorage.setItem('suruhin_custom_talent', JSON.stringify(updated));
                  }
                } catch (e) { }
              }
            }}
            navigate={navigate}
          />
        );
      case 'jadi-talent':
        return <JadiTalent />;
      case 'cara-kerja':
        return <CaraKerja navigate={navigate} />;
      case 'keamanan':
        return <Keamanan />;
      case 'tentang':
        return <Tentang />;
      case 'bantuan':
        return <Bantuan />;
      case 'kontak':
        return <Kontak />;
      case 'kebijakan-privasi':
        return <KebijakanPrivasi />;
      case 'syarat-ketentuan':
        return <SyaratKetentuan />;
      case 'pesanan-tracking':
        return <PesananTrackingPage bookingId={currentRoute.slug || ''} navigate={navigate} currentUser={currentUser} />;
      case 'not-found':
      default:
        return (
          <div className="py-32 text-center">
            <h2 className="text-2xl font-black text-[#082B5C] mb-4">Halaman Tidak Ditemukan</h2>
            <p className="text-xs text-gray-400 mb-6">Maaf, tautan yang Anda tuju salah atau halaman telah dipindahkan.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-[#FF6500] hover:bg-[#e05900] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Kembali ke Beranda
            </button>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/20 text-[#172033] font-sans antialiased">
      {/* Universal Navigation Header */}
      <Navbar
        activePath={currentRoute.path}
        onNavigate={navigate}
        selectedLocation={selectedLocation}
        onLocationChange={(loc) => {
          setSelectedLocation(loc);
          // Auto filter talents in listings
          if (currentRoute.page === 'talent-list') {
            navigate(`/talent?location=${encodeURIComponent(loc)}`);
          }
        }}
        onOpenAuth={(mode) => setAuthModalMode(mode)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Screen Content Stage */}
      <main className="flex-grow">
        {renderPage()}
      </main>

      {/* Universal Footer section */}
      <Footer onNavigate={navigate} />

      {/* Authentications modal popup trigger */}
      {authModalMode && (
        <Modal
          isOpen={true}
          onClose={() => setAuthModalMode(null)}
          title={authModalMode === 'login' ? 'Masuk ke Akun Suruhin' : 'Daftar Akun Baru'}
        >
          <AuthForm
            initialMode={authModalMode}
            onSuccess={(user) => {
              setCurrentUser(user);
              setAuthModalMode(null);
              navigate('/profil-talent');
            }}
          />
        </Modal>
      )}
    </div>
  );
}
