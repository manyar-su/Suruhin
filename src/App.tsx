import { useState } from 'react';
import { useNavigation } from './hooks/useNavigation';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Modal } from './components/shared/Modal';
import { AuthForm } from './components/forms/AuthForm';
import { Talent } from './types';

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
  
  // Real-time logged in user state
  const [currentUser, setCurrentUser] = useState<Talent | null>(() => {
    const saved = localStorage.getItem('suruhin_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });

  const handleLogout = () => {
    localStorage.removeItem('suruhin_user');
    setCurrentUser(null);
    navigate('/');
  };

  // Render correct active page based on routing system
  const renderPage = () => {
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
              localStorage.setItem('suruhin_user', JSON.stringify(updated));
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
        return <PesananTrackingPage bookingId={currentRoute.slug || ''} navigate={navigate} />;
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
              // Auto go to profile dashboard upon login
              navigate('/profil-talent');
            }}
          />
        </Modal>
      )}
    </div>
  );
}
