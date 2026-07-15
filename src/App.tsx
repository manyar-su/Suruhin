import { useEffect, useMemo, useState } from 'react';
import { useNavigation } from './hooks/useNavigation';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Modal } from './components/shared/Modal';
import { AuthForm } from './components/forms/AuthForm';
import { Button } from './components/shared/Button';
import { Talent } from './types';
import { clearUserSession, getCurrentSessionUser, touchUserSession, updateStoredUser, upsertCustomTalent } from './lib/authSession';

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
import { RegisterPage } from './pages/RegisterPage';
import { MvpDashboard } from './pages/MvpDashboard';
import { JobsMarketplacePage } from './pages/JobsMarketplacePage';
import { JobDetailPage } from './pages/JobDetailPage';
import { CustomerJobsPage } from './pages/CustomerJobsPage';
import { CustomerJobCreatePage } from './pages/CustomerJobCreatePage';
import { CustomerJobDetailPage } from './pages/CustomerJobDetailPage';
import { TalentApplicationsPage } from './pages/TalentApplicationsPage';

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

  const mvpOpenPages = new Set([
    'dashboard-customer',
    'dashboard-talent',
    'dashboard-admin',
    'dashboard-customer-jobs',
    'dashboard-customer-jobs-create',
    'dashboard-customer-jobs-detail',
    'dashboard-talent-jobs',
    'dashboard-talent-applications',
  ]);
  const isProtectedRoute = (protectedPages.has(currentRoute.page) || currentRoute.path.startsWith('/dashboard/')) && !mvpOpenPages.has(currentRoute.page);

  useEffect(() => {
    const user = getCurrentSessionUser();
    setCurrentUser(user);

    if (user && isProtectedRoute) {
      touchUserSession();
    }
  }, [currentRoute.page, currentRoute.path, isProtectedRoute]);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    let animationFrame = 0;
    const handleScroll = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        document.documentElement.style.setProperty('--parallax-soft', `${scrollY * -0.035}px`);
        document.documentElement.style.setProperty('--parallax-deep', `${scrollY * -0.075}px`);
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const selector = [
      'main section',
      'main h1',
      'main h2',
      'main h3',
      'main p',
      'main form',
      'main [class*="rounded-3xl"]',
      'main [class*="rounded-["]',
      'main .grid > *',
    ].join(',');

    const timer = window.setTimeout(() => {
      const elements = Array.from(document.querySelectorAll<HTMLElement>(selector))
        .filter((element) => !element.closest('[data-no-reveal]') && element.offsetParent !== null)
        .slice(0, 180);

      elements.forEach((element, index) => {
        element.classList.remove('is-visible');
        element.classList.add('scroll-reveal');
        element.style.setProperty('--reveal-delay', `${Math.min(index % 12, 11) * 45}ms`);
      });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -8% 0px' }
      );

      elements.forEach((element) => observer.observe(element));

      window.setTimeout(() => observer.disconnect(), 12000);
    }, 80);

    return () => window.clearTimeout(timer);
  }, [currentRoute.path]);

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
      case 'jobs-list':
        return <JobsMarketplacePage navigate={navigate} />;
      case 'job-detail':
        return <JobDetailPage slug={currentRoute.slug || ''} navigate={navigate} />;
      case 'talent-detail':
        return <TalentDetail slug={currentRoute.slug || ''} navigate={navigate} />;
      case 'register':
        return <RegisterPage navigate={navigate} />;
      case 'register-customer':
        return <RegisterPage mode="customer" navigate={navigate} />;
      case 'register-talent':
        return <RegisterPage mode="talent" navigate={navigate} />;
      case 'dashboard-customer':
        return <MvpDashboard role="customer" />;
      case 'dashboard-customer-jobs':
        return <CustomerJobsPage navigate={navigate} />;
      case 'dashboard-customer-jobs-create':
        return <CustomerJobCreatePage navigate={navigate} />;
      case 'dashboard-customer-jobs-detail':
        return <CustomerJobDetailPage id={currentRoute.slug || ''} navigate={navigate} />;
      case 'dashboard-talent':
        return <MvpDashboard role="talent" />;
      case 'dashboard-talent-jobs':
        return <JobsMarketplacePage navigate={navigate} />;
      case 'dashboard-talent-applications':
        return <TalentApplicationsPage navigate={navigate} />;
      case 'dashboard-admin':
        return <MvpDashboard role="admin" />;
      case 'profil-talent':
        return (
          <ProfilTalent
            currentUser={currentUser}
            onUpdateUser={(updated) => {
              setCurrentUser(updated);
              updateStoredUser(updated);
              upsertCustomTalent(updated);
            }}
            onDeleteAccount={() => {
              clearUserSession();
              setCurrentUser(null);
              navigate('/');
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
    <div className="app-shell relative isolate flex flex-col min-h-screen overflow-x-hidden bg-slate-50/20 text-[#172033] font-sans antialiased">
      <div className="site-parallax-bg" aria-hidden="true">
        <span className="site-parallax-orb site-parallax-orb-a" />
        <span className="site-parallax-orb site-parallax-orb-b" />
        <span className="site-parallax-thread" />
      </div>

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
      <main className="relative z-10 flex-grow">
        {renderPage()}
      </main>

      {/* Universal Footer section */}
      <div className="relative z-10">
        <Footer onNavigate={navigate} />
      </div>

      {/* Authentications modal popup trigger */}
      {authModalMode && (
        <Modal
          isOpen={true}
          onClose={() => setAuthModalMode(null)}
          title={authModalMode === 'login' ? 'Masuk ke Akun Suruhin' : 'Daftar Akun Baru'}
        >
          <AuthForm
            initialMode={authModalMode}
            onSelectRegistrationRole={(role) => {
              setAuthModalMode(null);
              navigate(role === 'customer' ? '/register/customer' : '/register/talent');
            }}
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
