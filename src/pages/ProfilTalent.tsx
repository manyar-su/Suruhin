import React, { useState, useEffect } from 'react';
import { Container } from '../components/layout/Container';
import { Modal } from '../components/shared/Modal';
import { services as allServices } from '../data/services';
import { categories } from '../data/categories';
import { Talent, Service, TalentService, TalentServiceStatus } from '../types';
import { EarningsDashboard } from '../components/talent/EarningsDashboard';
import { TalentExtensionDashboard } from '../components/talent/TalentExtensionDashboard';
import { CustomerExtensionDashboard } from '../components/customer/CustomerExtensionDashboard';
import { AdminExtensionDashboard } from '../components/admin/AdminExtensionDashboard';
import { motion, AnimatePresence } from 'motion/react';
import { getTalentAvatarPath } from '../lib/assetPaths';
import {
  User,
  DollarSign,
  TrendingUp,
  CreditCard,
  Briefcase,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  AlertCircle,
  Smartphone,
  MapPin,
  FileText,
  Clock,
  ArrowRight,
  Shield,
  Loader2,
  Calendar,
  Check,
  Award,
  Upload,
  Bell,
  BellRing,
  MailOpen
} from 'lucide-react';
import {
  CUSTOM_SERVICES_UPDATED_EVENT,
  deleteTalentService,
  getNotifications,
  getTalentServices,
  mapTalentServiceToService,
  saveNotifications,
  saveTalentService,
  NotificationItem,
} from '../data/mockExtensionData';
import { deleteCurrentUserAccountLocally } from '../lib/authSession';
import { deleteMvpAccount, updateMvpTalentAvatar, updateMvpTalentDocument, updateMvpTalentProfile } from '../lib/supabase/mvp';

interface ProfilTalentProps {
  currentUser: Talent | null;
  onUpdateUser: (updated: Talent) => void;
  onDeleteAccount: () => void;
  navigate: (path: string) => void;
}

export function ProfilTalent({ currentUser, onUpdateUser, onDeleteAccount, navigate }: ProfilTalentProps) {
  if (!currentUser) {
    return (
      <div className="py-32 text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 bg-orange-50 text-[#FF6500] rounded-full flex items-center justify-center mx-auto mb-4">
          <User size={28} />
        </div>
        <h2 className="text-xl font-black text-[#082B5C] mb-2">Akses Terbatasi</h2>
        <p className="text-xs text-gray-500 mb-6 leading-relaxed">
          Silakan masuk ke akun atau daftar terlebih dahulu untuk mengakses menu dashboard kemitraan Talent Suruhin Anda.
        </p>
        <button
          onClick={() => {
            // Trigger auth modal from header or reload
            window.location.reload();
          }}
          className="bg-[#FF6500] hover:bg-[#e05900] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          Masuk Sekarang
        </button>
      </div>
    );
  }

  // Active Tab: 'profile' | 'services' | 'earnings' | 'extensions'
  const [activeTab, setActiveTab] = useState<'profile' | 'services' | 'earnings' | 'extensions'>('profile');
  const [dashboardRole, setDashboardRole] = useState<'talent' | 'customer' | 'admin'>('talent');

  // Notifications Drawer State
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const loadNotifs = () => {
    setNotifications(getNotifications());
  };

  useEffect(() => {
    loadNotifs();

    const handleSyncNotifs = () => {
      loadNotifs();
    };
    window.addEventListener('suruhin_notifications_updated', handleSyncNotifs);
    return () => window.removeEventListener('suruhin_notifications_updated', handleSyncNotifs);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
    setNotifications(updated);
  };

  // Load custom prices mapping from localStorage or initialize with default prices from services
  const [customPrices, setCustomPrices] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem(`suruhin_prices_${currentUser.id}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    // Default fallback from global services
    const initial: Record<string, number> = {};
    allServices.forEach(s => {
      initial[s.slug] = s.price;
    });
    return initial;
  });

  // Save custom prices to local storage when changed
  useEffect(() => {
    localStorage.setItem(`suruhin_prices_${currentUser.id}`, JSON.stringify(customPrices));
  }, [customPrices, currentUser.id]);

  // Profile Form States
  const [displayName, setDisplayName] = useState(currentUser.name || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [age, setAge] = useState(currentUser.age || 24);
  const [location, setLocation] = useState(currentUser.location || '');
  const [skillsText, setSkillsText] = useState(currentUser.skills ? currentUser.skills.join(', ') : '');
  const [languagesText, setLanguagesText] = useState(currentUser.languages ? currentUser.languages.join(', ') : '');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteAccountError, setDeleteAccountError] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Manage Services States
  const [selectedServiceToAdd, setSelectedServiceToAdd] = useState('');
  const [newServicePrice, setNewServicePrice] = useState<number>(30000);
  const [servicesError, setServicesError] = useState('');
  const [servicesSuccess, setServicesSuccess] = useState('');

  // New dynamic custom services state
  const [customServices, setCustomServices] = useState<Service[]>(() =>
    getTalentServices(currentUser.id).map(mapTalentServiceToService)
  );

  useEffect(() => {
    const syncCustomServices = () => {
      setCustomServices(getTalentServices(currentUser.id).map(mapTalentServiceToService));
    };

    window.addEventListener(CUSTOM_SERVICES_UPDATED_EVENT, syncCustomServices);
    window.addEventListener('storage', syncCustomServices);

    return () => {
      window.removeEventListener(CUSTOM_SERVICES_UPDATED_EVENT, syncCustomServices);
      window.removeEventListener('storage', syncCustomServices);
    };
  }, [currentUser.id]);

  // Combine static and custom services
  const mergedServices = [...allServices, ...customServices];

  // Custom Service Form States
  const [creationMode, setCreationMode] = useState<'recommend' | 'custom'>('recommend');
  const [customServiceName, setCustomServiceName] = useState('');
  const [customServiceDesc, setCustomServiceDesc] = useState('');
  const [customServiceCategory, setCustomServiceCategory] = useState('');
  const [customServicePrice, setCustomServicePrice] = useState<number>(35000);

  // Verification Documents states (KTP and SKCK)
  const [ktpDoc, setKtpDoc] = useState<string | null>(() => {
    return localStorage.getItem(`suruhin_ktp_${currentUser.id}`) || null;
  });
  const [skckDoc, setSkckDoc] = useState<string | null>(() => {
    return localStorage.getItem(`suruhin_skck_${currentUser.id}`) || null;
  });

  // Earnings & Withdrawal States
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem(`suruhin_balance_${currentUser.id}`);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('BCA');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [withdrawName, setWithdrawName] = useState('');
  const [withdrawStep, setWithdrawStep] = useState<1 | 2 | 3>(1);
  const [withdrawError, setWithdrawError] = useState('');

  // Custom withdrawal transaction history
  const [transactions, setTransactions] = useState<Array<{
    id: string;
    date: string;
    type: 'payout' | 'withdrawal';
    description: string;
    amount: number;
    status: 'success' | 'processing';
  }>>(() => {
    const saved = localStorage.getItem(`suruhin_tx_${currentUser.id}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [];
  });

  // Save balance & transactions
  useEffect(() => {
    localStorage.setItem(`suruhin_balance_${currentUser.id}`, balance.toString());
  }, [balance, currentUser.id]);

  useEffect(() => {
    localStorage.setItem(`suruhin_tx_${currentUser.id}`, JSON.stringify(transactions));
  }, [transactions, currentUser.id]);

  const purgeLocalAccountArtifacts = () => {
    const scopedKeys = [
      `suruhin_prices_${currentUser.id}`,
      `suruhin_ktp_${currentUser.id}`,
      `suruhin_skck_${currentUser.id}`,
      `suruhin_balance_${currentUser.id}`,
      `suruhin_tx_${currentUser.id}`,
      `suruhin_completed_orders_${currentUser.id}`,
    ];
    scopedKeys.forEach((key) => localStorage.removeItem(key));

    const customServicesRaw = localStorage.getItem('suruhin_custom_services');
    if (customServicesRaw) {
      try {
        const parsed = JSON.parse(customServicesRaw) as TalentService[];
        const filtered = parsed.filter((service) => service.talentId !== currentUser.id);
        localStorage.setItem('suruhin_custom_services', JSON.stringify(filtered));
        window.dispatchEvent(new Event(CUSTOM_SERVICES_UPDATED_EVENT));
      } catch (error) {
        console.error(error);
      }
    }

    const revisionsRaw = localStorage.getItem('suruhin_service_revisions');
    if (revisionsRaw) {
      try {
        const parsed = JSON.parse(revisionsRaw) as Array<{ submittedById?: string; talentId?: string }>;
        const filtered = parsed.filter((revision) => revision.submittedById !== currentUser.id && revision.talentId !== currentUser.id);
        localStorage.setItem('suruhin_service_revisions', JSON.stringify(filtered));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteAccountError('');

    if (deleteConfirmText.trim().toUpperCase() !== 'HAPUS') {
      setDeleteAccountError('Ketik HAPUS untuk mengonfirmasi penghapusan akun.');
      return;
    }

    setIsDeletingAccount(true);
    const result = await deleteMvpAccount(currentUser.id);
    setIsDeletingAccount(false);

    if ('error' in result) {
      setDeleteAccountError(result.error);
      return;
    }

    purgeLocalAccountArtifacts();
    deleteCurrentUserAccountLocally(currentUser.id);
    setShowDeleteModal(false);
    onDeleteAccount();
  };

  // Handler: Update Profile Details
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(false);
    setProfileError('');

    const updatedUser: Talent = {
      ...currentUser,
      name: displayName.trim() || currentUser.name,
      bio,
      age: Number(age),
      location,
      skills: skillsText.split(',').map(s => s.trim()).filter(Boolean),
      languages: languagesText.split(',').map(s => s.trim()).filter(Boolean)
    };

    const mvpResult = await updateMvpTalentProfile(currentUser.id, {
      fullName: updatedUser.name,
      bio: updatedUser.bio,
      address: updatedUser.location,
      city: updatedUser.location,
    });

    if (mvpResult.ok === false) {
      setProfileError(mvpResult.error);
      setTimeout(() => setProfileError(''), 4000);
    }

    onUpdateUser(updatedUser);
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  // Handler: Add service to profile
  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    setServicesError('');
    setServicesSuccess('');

    if (!selectedServiceToAdd) {
      setServicesError('Silakan pilih salah satu kategori layanan.');
      return;
    }

    if (currentUser.services.includes(selectedServiceToAdd)) {
      setServicesError('Layanan ini sudah aktif di profil Anda.');
      return;
    }

    if (newServicePrice <= 0) {
      setServicesError('Harga layanan harus lebih besar dari Rp 0.');
      return;
    }

    // Update prices map
    setCustomPrices(prev => ({
      ...prev,
      [selectedServiceToAdd]: newServicePrice
    }));

    // Update user's services list
    const updatedServices = [...currentUser.services, selectedServiceToAdd];
    const updatedUser: Talent = {
      ...currentUser,
      services: updatedServices
    };

    onUpdateUser(updatedUser);
    setServicesSuccess('Layanan baru berhasil ditambahkan dan aktif!');
    setSelectedServiceToAdd('');
    setTimeout(() => setServicesSuccess(''), 3000);
  };

  // Handler: Update an existing service's price
  const handleUpdateServicePrice = (slug: string, price: number) => {
    setServicesSuccess('');
    setCustomPrices(prev => ({
      ...prev,
      [slug]: price
    }));
    setServicesSuccess('Tarif upah jasa berhasil diperbarui!');
    setTimeout(() => setServicesSuccess(''), 3000);
  };

  // Handler: Remove a service from profile
  const handleRemoveService = (slug: string) => {
    const customServiceRecord = getTalentServices(currentUser.id).find((service) => service.slug === slug);

    if (!customServiceRecord && currentUser.services.length <= 1) {
      setServicesError('Anda harus menyisakan minimal 1 layanan aktif agar tetap menerima pesanan.');
      setTimeout(() => setServicesError(''), 4000);
      return;
    }

    const updatedServices = currentUser.services.filter(s => s !== slug);
    const updatedUser: Talent = {
      ...currentUser,
      services: updatedServices
    };

    if (customServiceRecord) {
      deleteTalentService(customServiceRecord.id);
      setCustomPrices((prev) => {
        const next = { ...prev };
        delete next[slug];
        return next;
      });
    }

    onUpdateUser(updatedUser);
    setServicesSuccess(customServiceRecord ? 'Jasa custom berhasil dihapus dari katalog Anda.' : 'Layanan berhasil dihapus dari profil Anda.');
    setTimeout(() => setServicesSuccess(''), 3000);
  };

  // Handler: Avatar Upload & Save to Base64 in LocalStorage
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file foto profil maksimal 5MB.');
        return;
      }
      setProfileError('');
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (typeof reader.result !== 'string') return;

        const uploadResult = await updateMvpTalentAvatar(currentUser.id, file);
        if (uploadResult.ok === false) {
          setProfileError(uploadResult.error);
          setTimeout(() => setProfileError(''), 4000);
        }

        const updatedUser: Talent = {
          ...currentUser,
          avatar: uploadResult.ok ? uploadResult.data.path : reader.result
        };
        onUpdateUser(updatedUser);
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler: Create Custom Service under standard category
  const handleCreateCustomService = (e: React.FormEvent) => {
    e.preventDefault();
    setServicesError('');
    setServicesSuccess('');

    if (!customServiceName.trim()) {
      setServicesError('Nama jasa wajib diisi.');
      return;
    }
    if (!customServiceCategory) {
      setServicesError('Silakan pilih salah satu kategori pilihan yang tersedia.');
      return;
    }
    if (customServicePrice <= 0) {
      setServicesError('Tarif upah harus lebih besar dari Rp 0.');
      return;
    }

    const matchedCategory = categories.find(c => c.slug === customServiceCategory);
    const customSlugBase = customServiceName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const customSlug = `${customSlugBase || 'jasa-custom'}-${Date.now()}`;
    const now = new Date().toISOString();
    const locationSegments = (currentUser.location || 'Kota Tasikmalaya').split(',').map((segment) => segment.trim());
    const cityName = locationSegments[locationSegments.length - 1] || 'Kota Tasikmalaya';

    const newSvc: TalentService = {
      id: `ts-custom-${Date.now()}`,
      talentId: currentUser.id,
      categoryId: customServiceCategory,
      categoryName: matchedCategory ? matchedCategory.name : 'Layanan Lainnya',
      title: customServiceName.trim(),
      slug: customSlug,
      shortDescription: customServiceDesc.trim() || 'Layanan bantuan khusus kustom.',
      description: customServiceDesc.trim() || 'Layanan bantuan khusus kustom dari mitra terverifikasi.',
      pricingType: 'FIXED',
      basePrice: customServicePrice,
      minimumDurationMinutes: 60,
      maximumDurationMinutes: 480,
      city: cityName,
      district: locationSegments[0] || undefined,
      serviceRadiusKm: 15,
      defaultMeetingAddress: currentUser.location || 'Kota Tasikmalaya',
      trackingMode: 'REQUIRED_DURING_TRAVEL',
      onlineAvailable: false,
      instantBookingAvailable: true,
      negotiable: true,
      includedItems: ['Pelayanan profesional dan santun', 'Sesuai instruksi dan kesepakatan harian'],
      excludedItems: ['Biaya tambahan operasional di luar kesepakatan'],
      status: TalentServiceStatus.ACTIVE,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      images: [],
      schedules: [],
      bookingsCount: 0,
      totalEarnings: 0,
      rating: 5,
    };

    saveTalentService(newSvc);

    // Save customized price
    setCustomPrices(prev => ({
      ...prev,
      [customSlug]: customServicePrice
    }));

    // Update user's services list with slug
    const updatedServices = [...currentUser.services, customSlug];
    const updatedUser: Talent = {
      ...currentUser,
      services: updatedServices
    };

    onUpdateUser(updatedUser);
    setServicesSuccess(`Jasa kustom "${customServiceName}" berhasil diaktifkan!`);
    
    // Reset fields
    setCustomServiceName('');
    setCustomServiceDesc('');
    setCustomServiceCategory('');
    setCustomServicePrice(35000);
    setCreationMode('recommend');
    setTimeout(() => setServicesSuccess(''), 4000);
  };

  // Handler: Withdrawal execution with mock delay
  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');

    const amountNum = parseInt(withdrawAmount, 10);
    if (!amountNum || isNaN(amountNum)) {
      setWithdrawError('Silakan masukkan jumlah penarikan yang valid.');
      return;
    }
    if (amountNum < 50000) {
      setWithdrawError('Batas minimal penarikan adalah Rp 50.000.');
      return;
    }
    if (amountNum > balance) {
      setWithdrawError('Saldo Anda tidak mencukupi untuk penarikan ini.');
      return;
    }
    if (!withdrawAccount.trim()) {
      setWithdrawError('Nomor rekening/e-wallet wajib diisi.');
      return;
    }
    if (!withdrawName.trim()) {
      setWithdrawError('Nama penerima wajib diisi sesuai identitas bank.');
      return;
    }

    // Go to step 2: processing simulation
    setWithdrawStep(2);
    setTimeout(() => {
      // Complete transfer
      setBalance(prev => prev - amountNum);
      const newTx = {
        id: `TX-${Math.floor(100 + Math.random() * 900)}`,
        date: 'Baru Saja',
        type: 'withdrawal' as const,
        description: `Pencairan saldo ke ${withdrawMethod}`,
        amount: amountNum,
        status: 'success' as const
      };
      setTransactions(prev => [newTx, ...prev]);
      setWithdrawStep(3);
    }, 2000);
  };

  // Formatting utils
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  // Helper: filter all system services to find those that are NOT active for this talent
  const availableServicesToRegister = allServices.filter(
    s => !currentUser.services.includes(s.slug)
  );

  return (
    <div className="py-24 bg-slate-50/50 min-h-screen">
      <Container>
        {/* Role Selector Dashboard Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-100 p-4.5 rounded-3xl mb-8 shadow-3xs text-left">
          <div className="space-y-1">
            <span className="text-[9px] bg-orange-100 text-[#FF6500] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">Alur Kerja Talent</span>
            <span className="text-xs font-black text-[#082B5C] block">Ganti Peran di Sini Untuk Menguji Persetujuan & Pembayaran Dua Arah:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => { setDashboardRole('talent'); setActiveTab('profile'); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                dashboardRole === 'talent'
                  ? 'bg-[#082B5C] text-white shadow-md shadow-[#082B5C]/15'
                  : 'text-[#172033]/60 hover:text-[#082B5C] hover:bg-slate-50 border border-slate-100 bg-white shadow-2xs'
              }`}
            >
              💼 Mitra Talent
            </button>
            <button
              onClick={() => setDashboardRole('customer')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                dashboardRole === 'customer'
                  ? 'bg-[#FF6500] text-white shadow-md shadow-[#FF6500]/15'
                  : 'text-[#172033]/60 hover:text-[#FF6500] hover:bg-slate-50 border border-slate-100 bg-white shadow-2xs'
              }`}
            >
              👤 Pelanggan Pengguna
            </button>
            <button
              onClick={() => setDashboardRole('admin')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                dashboardRole === 'admin'
                  ? 'bg-[#18A957] text-white shadow-md shadow-[#18A957]/15'
                  : 'text-[#172033]/60 hover:text-[#18A957] hover:bg-slate-50 border border-slate-100 bg-white shadow-2xs'
              }`}
            >
              🛡️ System Admin
            </button>
          </div>
        </div>

        {/* Conditional Dashboard Views */}
        {dashboardRole === 'customer' && (
          <CustomerExtensionDashboard />
        )}

        {dashboardRole === 'admin' && (
          <AdminExtensionDashboard />
        )}

        {dashboardRole === 'talent' && (
          <>
            {/* Profile/Dashboard Hero Summary */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6 mb-8 text-left">
          <div className="flex items-center gap-4.5">
            <div className="relative group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#082B5C]/5 border-2 border-[#082B5C]/10 flex items-center justify-center overflow-hidden relative">
                <img
                  src={getTalentAvatarPath(currentUser.avatar, currentUser.name)}
                  alt={currentUser.name}
                  onError={(e) => {
                    // Fallback to initial
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=082B5C&color=fff`;
                  }}
                  className="w-full h-full object-cover transition-opacity group-hover:opacity-80"
                />
                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Upload size={16} className="text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </label>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-[#18A957] text-white p-1 rounded-md shadow-xs flex items-center justify-center pointer-events-none">
                <Check size={12} className="stroke-[3px]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-[#082B5C]">{currentUser.name}</h1>
                <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold bg-[#18A957]/10 text-[#18A957] px-2 py-0.5 rounded-full uppercase">
                  Mitra Verified
                </span>
              </div>
              <p className="text-xs text-gray-400 font-medium">Joined {currentUser.joinedYear} • {currentUser.gender}, {currentUser.age} Tahun</p>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold pt-0.5">
                <MapPin size={12} className="text-[#FF6500]" />
                <span className="truncate">{currentUser.location}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:border-l md:border-slate-100 md:pl-8">
            <div className="text-center bg-[#F5F7FA] px-4 py-2.5 rounded-xl border border-slate-50 min-w-[90px]">
              <span className="block text-[10px] text-gray-400 font-bold uppercase">Rating</span>
              <span className="text-sm font-black text-[#082B5C]">★ {currentUser.rating.toFixed(1)}</span>
            </div>
            <div className="text-center bg-[#F5F7FA] px-4 py-2.5 rounded-xl border border-slate-50 min-w-[90px]">
              <span className="block text-[10px] text-gray-400 font-bold uppercase">Ulasan</span>
              <span className="text-sm font-black text-[#082B5C]">{currentUser.reviewCount}</span>
            </div>
            <div className="text-center bg-orange-50 px-4 py-2.5 rounded-xl border border-orange-100/30 min-w-[90px]">
              <span className="block text-[10px] text-orange-400 font-bold uppercase">Pesanan</span>
              <span className="text-sm font-black text-[#FF6500]">{currentUser.completedOrders} Selesai</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-xs mb-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center justify-center gap-2 py-3 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#082B5C] text-white shadow-md shadow-[#082B5C]/15'
                : 'text-[#172033]/60 hover:text-[#082B5C] hover:bg-slate-50'
            }`}
          >
            <User size={15} />
            <span>Profil</span>
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`flex items-center justify-center gap-2 py-3 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
              activeTab === 'services'
                ? 'bg-[#082B5C] text-white shadow-md shadow-[#082B5C]/15'
                : 'text-[#172033]/60 hover:text-[#082B5C] hover:bg-slate-50'
            }`}
          >
            <Briefcase size={15} />
            <span>Jasa</span>
          </button>
          <button
            onClick={() => setActiveTab('earnings')}
            className={`flex items-center justify-center gap-2 py-3 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
              activeTab === 'earnings'
                ? 'bg-[#082B5C] text-white shadow-md shadow-[#082B5C]/15'
                : 'text-[#172033]/60 hover:text-[#082B5C] hover:bg-slate-50'
            }`}
          >
            <DollarSign size={15} />
            <span>Penghasilan</span>
          </button>
          <button
            onClick={() => setActiveTab('extensions')}
            className={`flex items-center justify-center gap-2 py-3 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
              activeTab === 'extensions'
                ? 'bg-[#082B5C] text-white shadow-md shadow-[#082B5C]/15'
                : 'text-[#172033]/60 hover:text-[#082B5C] hover:bg-slate-50'
            }`}
          >
            <Clock size={15} />
            <span className="text-orange-500 font-black">Overtime & Tips</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="space-y-6">

          {/* TAB 1: KETERANGAN PROFIL (PROFILE DETAILS) */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
              {/* Left Column: Public Card Preview & Verification Documents Stack */}
              <div className="lg:col-span-1 flex flex-col gap-6 self-start">
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-6">
                  <h3 className="text-sm font-extrabold text-[#082B5C] uppercase tracking-wider border-b border-slate-50 pb-3">
                    Preview Profil Publik
                  </h3>
                  
                  <div className="text-center space-y-3">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto border-4 border-slate-50 shadow-sm bg-slate-50 relative group">
                      <img
                        src={getTalentAvatarPath(currentUser.avatar, currentUser.name)}
                        alt={currentUser.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=082B5C&color=fff`;
                        }}
                        className="w-full h-full object-cover transition-opacity group-hover:opacity-80"
                      />
                      <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <Upload size={18} className="text-white animate-pulse" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                        />
                      </label>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[#082B5C]">{currentUser.name}</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">Joined Sejak {currentUser.joinedYear}</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="bg-[#F5F7FA] p-3.5 rounded-xl border border-slate-100">
                      <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Bio Deskripsi</span>
                      <p className="text-gray-600 italic leading-relaxed">
                        “ {currentUser.bio || 'Belum ada deskripsi profil.'} ”
                      </p>
                    </div>

                    <div className="space-y-2">
                      <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Keahlian (Skills)</span>
                      <div className="flex flex-wrap gap-1">
                        {currentUser.skills && currentUser.skills.map((sk, idx) => (
                          <span key={idx} className="bg-orange-50 text-[#FF6500] font-bold text-[10px] px-2.5 py-1 rounded-lg">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Bahasa</span>
                      <div className="flex flex-wrap gap-1">
                        {currentUser.languages && currentUser.languages.map((lng, idx) => (
                          <span key={idx} className="bg-blue-50 text-[#082B5C] font-bold text-[10px] px-2.5 py-1 rounded-lg">
                            {lng}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verification Documents KTP & SKCK */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-extrabold text-[#082B5C] uppercase tracking-wider border-b border-slate-50 pb-3 flex items-center gap-1.5">
                    <Shield size={16} className="text-[#FF6500]" /> Dokumen Verifikasi Keamanan
                  </h3>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Dokumen Anda aman terenkripsi di server rahasia. Digunakan murni demi proteksi keamanan pelanggan harian.
                  </p>
                  
                  {/* KTP Section */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-500">KTP (Kartu Tanda Penduduk)</span>
                      {ktpDoc ? (
                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md uppercase flex items-center gap-0.5">
                          ✓ Sudah Diunggah
                        </span>
                      ) : (
                        <span className="text-[9px] font-black text-amber-500 bg-amber-50 px-2.5 py-0.5 rounded-md uppercase">
                          Belum Diunggah
                        </span>
                      )}
                    </div>
                    
                    <label className="flex items-center justify-center gap-2 border border-dashed border-gray-200 hover:border-[#FF6500]/40 p-3 rounded-xl bg-slate-50/50 cursor-pointer transition-colors text-center text-[11px] font-bold text-[#082B5C]">
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setVerificationError('');
                            const reader = new FileReader();
                            reader.onloadend = async () => {
                              if (typeof reader.result === 'string') {
                                const uploadResult = await updateMvpTalentDocument(currentUser.id, 'ktp', file);
                                if (uploadResult.ok === false) {
                                  setVerificationError(uploadResult.error);
                                  setTimeout(() => setVerificationError(''), 4000);
                                }
                                localStorage.setItem(`suruhin_ktp_${currentUser.id}`, uploadResult.ok ? uploadResult.data.path : reader.result);
                                setKtpDoc(uploadResult.ok ? uploadResult.data.path : reader.result);
                                setVerificationSuccess('Dokumen KTP sudah diunggah dan status verifikasi diperbarui.');
                                setTimeout(() => setVerificationSuccess(''), 3000);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <Upload size={13} className="text-gray-400" />
                      <span>{ktpDoc ? 'Ganti KTP Terunggah' : 'Unggah KTP Asli'}</span>
                    </label>
                  </div>

                  {/* SKCK Section */}
                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-500">SKCK (Catatan Kepolisian)</span>
                      {skckDoc ? (
                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md uppercase flex items-center gap-0.5">
                          ✓ Sudah Diunggah
                        </span>
                      ) : (
                        <span className="text-[9px] font-black text-amber-500 bg-amber-50 px-2.5 py-0.5 rounded-md uppercase">
                          Belum Diunggah
                        </span>
                      )}
                    </div>
                    
                    <label className="flex items-center justify-center gap-2 border border-dashed border-gray-200 hover:border-[#FF6500]/40 p-3 rounded-xl bg-slate-50/50 cursor-pointer transition-colors text-center text-[11px] font-bold text-[#082B5C]">
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setVerificationError('');
                            const reader = new FileReader();
                            reader.onloadend = async () => {
                              if (typeof reader.result === 'string') {
                                const uploadResult = await updateMvpTalentDocument(currentUser.id, 'skck', file);
                                if (uploadResult.ok === false) {
                                  setVerificationError(uploadResult.error);
                                  setTimeout(() => setVerificationError(''), 4000);
                                }
                                localStorage.setItem(`suruhin_skck_${currentUser.id}`, uploadResult.ok ? uploadResult.data.path : reader.result);
                                setSkckDoc(uploadResult.ok ? uploadResult.data.path : reader.result);
                                setVerificationSuccess('Dokumen SKCK sudah diunggah dan status verifikasi diperbarui.');
                                setTimeout(() => setVerificationSuccess(''), 3000);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <Upload size={13} className="text-gray-400" />
                      <span>{skckDoc ? 'Ganti SKCK Terunggah' : 'Unggah SKCK Terkini'}</span>
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Right Column: Edit Profile Form */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-xs">
                <h3 className="text-base font-extrabold text-[#082B5C] mb-1">Perbarui Keterangan Profil</h3>
                <p className="text-xs text-gray-400 mb-6">Sesuaikan biodata, keahlian, dan area jangkauan agar memikat calon pelanggan.</p>

                {profileSuccess && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 text-[#18A957] rounded-xl text-xs font-bold mb-6 flex items-center gap-2">
                    <CheckCircle size={16} />
                    <span>Perubahan profil Anda berhasil disimpan secara aman!</span>
                  </div>
                )}

                {profileError && (
                  <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-bold mb-6 flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>{profileError}</span>
                  </div>
                )}

                {verificationSuccess && (
                  <div className="p-4 bg-blue-50 border border-blue-100 text-[#082B5C] rounded-xl text-xs font-bold mb-6 flex items-center gap-2">
                    <Shield size={16} className="text-[#FF6500]" />
                    <span>{verificationSuccess}</span>
                  </div>
                )}

                {verificationError && (
                  <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-bold mb-6 flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>{verificationError}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Lengkap</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs text-[#082B5C] font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500] transition-all"
                      />
                      <span className="text-[10px] text-gray-400">Nama baru akan otomatis ikut berubah di beranda, kartu talent, dan sesi akun setelah disimpan.</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Umur Anda (Tahun)</label>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs text-[#082B5C] font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500] transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Kecamatan & Alamat Jangkauan</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Contoh: Cihideung, Kota Tasikmalaya"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs text-[#082B5C] font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500] transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Biodata Singkat (Perkenalan Diri)</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      placeholder="Tuliskan pengalaman Anda secara singkat agar calon pelanggan percaya..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs text-[#082B5C] font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500] transition-all resize-none leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Keahlian Utama (Pisahkan dengan Koma)</label>
                    <input
                      type="text"
                      value={skillsText}
                      onChange={(e) => setSkillsText(e.target.value)}
                      placeholder="Contoh: Mengemudi Mobil, Sparring Badminton, Belanja Cermat, Pendampingan Medis"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs text-[#082B5C] font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500] transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Bahasa yang Dikuasai (Pisahkan dengan Koma)</label>
                    <input
                      type="text"
                      value={languagesText}
                      onChange={(e) => setLanguagesText(e.target.value)}
                      placeholder="Contoh: Bahasa Indonesia, Sunda (Halus), Sunda (Loma)"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs text-[#082B5C] font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500] transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6500] hover:bg-[#e05900] text-white font-extrabold rounded-xl text-xs transition-colors cursor-pointer shadow-sm shadow-[#FF6500]/15"
                  >
                    <Save size={14} />
                    Simpan Perubahan Profil
                  </button>

                  <div className="rounded-2xl border border-red-100 bg-red-50/70 p-4 text-left">
                    <p className="text-[10px] font-black uppercase tracking-wider text-red-500">Zona Berbahaya</p>
                    <h4 className="mt-1 text-sm font-extrabold text-[#082B5C]">Hapus akun ini</h4>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#172033]/70">
                      Akun, dokumen profil, dan data sesi lokal akan dihapus. Aksi ini meminta konfirmasi ulang sebelum diproses.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteConfirmText('');
                        setDeleteAccountError('');
                        setShowDeleteModal(true);
                      }}
                      className="mt-3 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-extrabold text-white transition-colors hover:bg-red-700"
                    >
                      <Trash2 size={14} />
                      Hapus Akun
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}


          {/* TAB 2: KELOLA JASA & HARGA (MANAGE SERVICES & PRICES) */}
          {activeTab === 'services' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
              {/* Left Column: Add New Service */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs h-fit space-y-5">
                <div>
                  <h3 className="text-sm font-extrabold text-[#082B5C] uppercase tracking-wider flex items-center gap-1">
                    <Plus size={16} className="text-[#FF6500]" /> Aktifkan Layanan Baru
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                    Mulai menawarkan jasa bantuan harian baru. Pilih dari daftar rekomendasi atau buat jasa kustom sendiri!
                  </p>
                </div>

                {/* Switcher mode */}
                <div className="grid grid-cols-2 bg-slate-100/70 p-1 rounded-xl text-center text-[10px] font-black text-gray-500">
                  <button
                    type="button"
                    onClick={() => setCreationMode('recommend')}
                    className={`py-1.5 rounded-lg cursor-pointer transition-all ${creationMode === 'recommend' ? 'bg-[#082B5C] text-white shadow-xs' : 'hover:text-[#082B5C]'}`}
                  >
                    Rekomendasi Populer
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreationMode('custom')}
                    className={`py-1.5 rounded-lg cursor-pointer transition-all ${creationMode === 'custom' ? 'bg-[#082B5C] text-white shadow-xs' : 'hover:text-[#082B5C]'}`}
                  >
                    Buat Jasa Kustom
                  </button>
                </div>

                {servicesError && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{servicesError}</span>
                  </div>
                )}

                {creationMode === 'recommend' ? (
                  <form onSubmit={handleAddService} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Pilih Layanan Populer</label>
                      <select
                        value={selectedServiceToAdd}
                        onChange={(e) => {
                          setSelectedServiceToAdd(e.target.value);
                          const matched = allServices.find(s => s.slug === e.target.value);
                          if (matched) setNewServicePrice(matched.price);
                        }}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs text-[#082B5C] font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500] transition-all cursor-pointer"
                      >
                        <option value="">-- Pilih Jenis Jasa Bantuan --</option>
                        {availableServicesToRegister.map(s => (
                          <option key={s.id} value={s.slug}>{s.title}</option>
                        ))}
                      </select>
                    </div>

                    {selectedServiceToAdd && (
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Atur Tarif Upah Anda (Rp)
                        </label>
                        <input
                          type="number"
                          value={newServicePrice}
                          onChange={(e) => setNewServicePrice(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs text-[#082B5C] font-semibold focus:outline-none"
                          placeholder="Contoh: 35000"
                          min="1000"
                        />
                        <span className="text-[10px] text-gray-400 block">
                          *Direkomendasikan: {formatCurrency(allServices.find(s => s.slug === selectedServiceToAdd)?.price || 30000)}
                        </span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 bg-[#FF6500] hover:bg-[#e05900] text-white font-extrabold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus size={14} />
                      Aktifkan Jasa Ini
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleCreateCustomService} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Jasa Kustom Anda</label>
                      <input
                        type="text"
                        required
                        value={customServiceName}
                        onChange={(e) => setCustomServiceName(e.target.value)}
                        placeholder="Contoh: Teman Antre Tiket Kereta luring"
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs text-[#082B5C] font-semibold focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Pilih Kategori Jasa</label>
                      <select
                        required
                        value={customServiceCategory}
                        onChange={(e) => setCustomServiceCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs text-[#082B5C] font-semibold focus:outline-none cursor-pointer"
                      >
                        <option value="">-- Pilih Kategori --</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.slug}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Tarif Upah Jasa (Rp)</label>
                      <input
                        type="number"
                        required
                        value={customServicePrice}
                        onChange={(e) => setCustomServicePrice(Number(e.target.value))}
                        placeholder="Contoh: 35000"
                        min="1000"
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs text-[#082B5C] font-semibold focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Deskripsi Singkat Jasa</label>
                      <textarea
                        rows={2}
                        value={customServiceDesc}
                        onChange={(e) => setCustomServiceDesc(e.target.value)}
                        placeholder="Tulis apa saja batasan dan lingkup bantuan Anda..."
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs text-[#082B5C] font-semibold focus:outline-none resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-[#18A957] hover:bg-[#148e49] text-white font-extrabold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus size={14} />
                      Aktifkan Jasa Kustom
                    </button>
                  </form>
                )}
              </div>

              {/* Right Column: Manage Activated Services */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-[#082B5C]">Daftar Jasa Aktif Anda</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Anda menawarkan {currentUser.services.length} layanan bantuan harian saat ini.</p>
                  </div>
                  {servicesSuccess && (
                    <span className="text-xs font-extrabold text-[#18A957] bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">
                      ✓ {servicesSuccess}
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  {currentUser.services.map(slug => {
                    const svc = mergedServices.find(s => s.slug === slug);
                    if (!svc) return null;
                    const price = customPrices[slug] ?? svc.price;

                    return (
                      <div
                        key={slug}
                        className="bg-slate-50/55 p-4 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-slate-50"
                      >
                        <div className="flex items-start gap-3 text-left">
                          <div className="p-2.5 bg-[#082B5C]/5 text-[#082B5C] rounded-xl">
                            <Briefcase size={16} />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-[#082B5C] leading-snug">{svc.title}</h4>
                            <span className="text-[10px] bg-[#082B5C]/5 text-[#082B5C] font-extrabold px-1.5 py-0.5 rounded mt-1 inline-block">
                              {svc.categoryName}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          {/* Price Input Form */}
                          <div className="flex items-center bg-white border border-slate-100 rounded-xl px-2.5 py-1.5 shadow-2xs">
                            <span className="text-[11px] font-bold text-gray-400 mr-1">Rp</span>
                            <input
                              type="number"
                              value={price}
                              onChange={(e) => handleUpdateServicePrice(slug, Number(e.target.value))}
                              className="w-20 bg-transparent text-xs text-[#082B5C] font-black focus:outline-none"
                            />
                          </div>

                          <button
                            onClick={() => handleRemoveService(slug)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                            title="Hapus Jasa"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}


          {/* TAB 3: PENGEHASILAN & KEUANGAN (EARNINGS & INCOME) */}
          {activeTab === 'earnings' && (
            <EarningsDashboard 
              currentUser={currentUser}
              balance={balance}
              setBalance={setBalance}
              transactions={transactions}
              setTransactions={setTransactions}
            />
          )}

          {/* TAB 4: OVERTIME & TIPS SYSTEM */}
          {activeTab === 'extensions' && (
            <TalentExtensionDashboard
              currentUser={currentUser}
              balance={balance}
              setBalance={setBalance}
            />
          )}

        </div>
          </>
        )}
      </Container>

      {/* Floating Notification Bell */}
      <button
        onClick={() => { setShowNotifDrawer(true); handleMarkAllAsRead(); }}
        className="fixed bottom-6 right-6 z-40 p-4 bg-[#FF6500] hover:bg-[#e05900] text-white rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center cursor-pointer group"
        title="Notifikasi Masuk"
      >
        {unreadCount > 0 ? (
          <div className="relative">
            <BellRing size={22} className="animate-wiggle text-white" />
            <span className="absolute -top-2.5 -right-2.5 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-bounce">
              {unreadCount}
            </span>
          </div>
        ) : (
          <Bell size={22} />
        )}
      </button>

      {/* Notif Slide-out Drawer */}
      <AnimatePresence>
        {showNotifDrawer && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
            {/* Tap to close backdrop */}
            <div className="absolute inset-0" onClick={() => setShowNotifDrawer(false)} />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="relative bg-white w-full max-w-sm h-full shadow-2xl p-6 flex flex-col justify-between z-10 text-left border-l border-slate-100"
            >
              <div className="space-y-4 overflow-y-auto h-full pr-1">
                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                  <h3 className="text-sm font-black text-[#082B5C] uppercase tracking-wider flex items-center gap-1.5">
                    <MailOpen size={16} className="text-[#FF6500]" /> Notifikasi & Log Alur Kerja
                  </h3>
                  <button 
                    onClick={() => setShowNotifDrawer(false)}
                    className="text-gray-400 hover:text-gray-600 text-xs font-extrabold"
                  >
                    Tutup ✕
                  </button>
                </div>

                <div className="space-y-3 pt-2">
                  {notifications.map((notif) => {
                    const iconColors = {
                      time_alert: 'bg-orange-50 text-orange-600 border-orange-100',
                      request: 'bg-amber-50 text-amber-600 border-amber-100',
                      approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                      paid: 'bg-blue-50 text-blue-600 border-blue-100',
                      tip: 'bg-yellow-50 text-yellow-600 border-yellow-100',
                      completed: 'bg-[#082B5C]/5 text-[#082B5C] border-[#082B5C]/10',
                      info: 'bg-slate-50 text-slate-500 border-slate-100'
                    }[notif.type] || 'bg-slate-50 text-slate-500';

                    return (
                      <div key={notif.id} className={`p-3.5 rounded-2xl border flex items-start gap-3 text-xs bg-slate-50/20 ${notif.read ? 'border-slate-50' : 'border-[#FF6500]/25 bg-orange-50/5'}`}>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border text-xs font-bold ${iconColors}`}>
                          {
                            {
                              time_alert: '⏱',
                              request: '❓',
                              approved: '✓',
                              paid: '💳',
                              tip: '★',
                              completed: '🏁',
                              info: 'ℹ'
                            }[notif.type] || '•'
                          }
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-[#082B5C] leading-snug">{notif.title}</h4>
                          <p className="text-[11px] text-gray-500 leading-normal">{notif.message}</p>
                          <span className="text-[9px] text-gray-400 block pt-0.5">Baru Saja</span>
                        </div>
                      </div>
                    );
                  })}

                  {notifications.length === 0 && (
                    <p className="text-center py-20 text-xs text-gray-400">Belum ada notifikasi baru.</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50">
                <p className="text-[10px] text-gray-400 text-center font-medium">Verifikasi dua arah & proteksi denda aman aktif.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          if (!isDeletingAccount) {
            setShowDeleteModal(false);
          }
        }}
        title="Konfirmasi Hapus Akun"
        size="sm"
      >
        <div className="space-y-4 text-left">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-[11px] leading-relaxed text-red-700">
            Akun <strong>{currentUser.name}</strong> akan dihapus dari sesi lokal dan kami juga akan mencoba menghapus data MVP di Supabase jika akun ini terdaftar di sana.
          </div>
          <p className="text-xs font-semibold text-[#172033]/75">
            Ketik <span className="rounded bg-slate-100 px-1.5 py-0.5 font-black text-[#082B5C]">HAPUS</span> untuk melanjutkan.
          </p>
          <input
            value={deleteConfirmText}
            onChange={(event) => setDeleteConfirmText(event.target.value)}
            placeholder="Ketik HAPUS"
            className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold uppercase text-[#082B5C] outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
          />
          {deleteAccountError && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-[11px] font-bold text-red-600">
              {deleteAccountError}
            </div>
          )}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeletingAccount}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-[#082B5C] disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => { void handleDeleteAccount(); }}
              disabled={isDeletingAccount}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-extrabold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
            >
              {isDeletingAccount ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Konfirmasi Hapus
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
