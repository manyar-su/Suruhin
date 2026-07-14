import { 
  Booking, ServiceExtension, Tip, AuditLog, SystemConfig, 
  BookingStatusHistory, BookingStatus, LiveLocation, LocationRole, MeetingVerification,
  TalentService, TalentServiceStatus, TalentServiceRevision, TalentServiceImage, TalentServiceSchedule, PricingType
} from '../types';

const CONFIG_KEY = 'suruhin_system_config';
const BOOKINGS_KEY = 'suruhin_bookings_list';
const EXTENSIONS_KEY = 'suruhin_extensions_list';
const TIPS_KEY = 'suruhin_tips_list';
const AUDIT_LOGS_KEY = 'suruhin_audit_logs';
const NOTIFICATIONS_KEY = 'suruhin_notifications_list';
const USER_BALANCE_KEY = 'suruhin_user_balance_cash'; // Client's virtual wallet balance

// 1. System Config Default
const DEFAULT_CONFIG: SystemConfig = {
  hourlyOvertimeRate: 40000,
  toleranceFreeMinutes: 10,
  tolerance30MinLimit: 30,
  tolerance60MinLimit: 60,
};

export function getSystemConfig(): SystemConfig {
  const saved = localStorage.getItem(CONFIG_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  return DEFAULT_CONFIG;
}

export function saveSystemConfig(config: SystemConfig) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

// 2. Client Balance Default
export function getClientBalance(): number {
  const saved = localStorage.getItem(USER_BALANCE_KEY);
  if (saved !== null) {
    return Number(saved);
  }
  // Default wallet balance of customer is Rp 150.000 for simulation
  localStorage.setItem(USER_BALANCE_KEY, '150000');
  return 150000;
}

export function saveClientBalance(balance: number) {
  localStorage.setItem(USER_BALANCE_KEY, balance.toString());
}

// 3. Calculation Engine
export function calculateOvertimeFee(overtimeMinutes: number, config: SystemConfig, customPrice?: number): number {
  if (overtimeMinutes <= 0) return 0;
  
  // Use custom price if agreed upon, otherwise automatic rate
  const rate = customPrice !== undefined ? customPrice : config.hourlyOvertimeRate;

  // 0-10 menit: Gratis
  if (overtimeMinutes <= config.toleranceFreeMinutes) {
    return 0;
  }
  // 11-30 menit: Hitung 30 menit (setengah tarif normal)
  if (overtimeMinutes <= config.tolerance30MinLimit) {
    return Math.round(rate / 2);
  }
  // 31-60 menit: Hitung 1 jam (tarif normal)
  if (overtimeMinutes <= config.tolerance60MinLimit) {
    return rate;
  }
  // Di atas 60 menit: Kelipatan per jam
  const hours = Math.ceil(overtimeMinutes / 60);
  return hours * rate;
}

// 4. Bookings Mock & Store
export function getBookings(talentId?: string): Booking[] {
  const saved = localStorage.getItem(BOOKINGS_KEY);
  let bookings: Booking[] = [];
  if (saved) {
    try {
      bookings = JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }

  // Initialize if empty
  if (bookings.length === 0) {
    const todayStr = new Date().toISOString().split('T')[0];
    bookings = [
      {
        id: 'BKG-901',
        serviceId: 'antar-jemput',
        talentId: talentId || 'talent-1',
        date: todayStr,
        time: '12:00',
        duration: 2, // 2 Jam
        location: 'Kec. Tawang, Kota Tasikmalaya (SDN 1 Tasikmalaya)',
        notes: 'Antar anak dari rumah ke sekolah, pastikan anak memakai helm cadangan.',
        customerName: 'Siti Aminah',
        customerPhone: '08122334455',
        price: 80000,
        platformFee: 5000,
        total: 85000,
        status: 'confirmed',
        bookedStartTime: `${todayStr}T12:00:00`,
        bookedEndTime: `${todayStr}T14:00:00`,
        actualStartTime: `${todayStr}T12:00:00`,
        actualEndTime: `${todayStr}T14:00:00`,
        bookedDurationMinutes: 120,
        actualDurationMinutes: 120,
        overtimeMinutes: 0
      },
      {
        id: 'BKG-902',
        serviceId: 'temenin-lansia',
        talentId: talentId || 'talent-1',
        date: todayStr,
        time: '08:00',
        duration: 3,
        location: 'Kec. Cihideung, Kota Tasikmalaya',
        notes: 'Temani bapak ke puskesmas untuk kontrol rutin mingguan.',
        customerName: 'Yanto Heriyanto',
        customerPhone: '08529988776',
        price: 120000,
        platformFee: 5000,
        total: 125000,
        status: 'confirmed',
        bookedStartTime: `${todayStr}T08:00:00`,
        bookedEndTime: `${todayStr}T11:00:00`,
        actualStartTime: `${todayStr}T08:00:00`,
        actualEndTime: `${todayStr}T11:00:00`,
        bookedDurationMinutes: 180,
        actualDurationMinutes: 180,
        overtimeMinutes: 0
      }
    ];
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  }
  return bookings;
}

export function saveBookings(bookings: Booking[]) {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

// 5. Extensions Store
export function getExtensions(): ServiceExtension[] {
  const saved = localStorage.getItem(EXTENSIONS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  
  // Default mock history
  const todayStr = new Date().toISOString().split('T')[0];
  const defaults: ServiceExtension[] = [
    {
      id: 'EXT-001',
      bookingId: 'BKG-902',
      requestedBy: 'talent',
      requestedMinutes: 45,
      requestedPrice: 30000,
      approvedPrice: 30000,
      paymentType: 'balance',
      status: 'completed',
      reason: 'Aktivitas belum selesai, antrean obat di apotek Puskesmas sangat padat',
      createdAt: `${todayStr}T10:45:00`,
      approvedAt: `${todayStr}T10:48:00`,
      completedAt: `${todayStr}T11:45:00`
    }
  ];
  localStorage.setItem(EXTENSIONS_KEY, JSON.stringify(defaults));
  return defaults;
}

export function saveExtensions(extensions: ServiceExtension[]) {
  localStorage.setItem(EXTENSIONS_KEY, JSON.stringify(extensions));
}

// 6. Tips Store
export function getTips(): Tip[] {
  const saved = localStorage.getItem(TIPS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  const todayStr = new Date().toISOString().split('T')[0];
  const defaults: Tip[] = [
    {
      id: 'TIP-001',
      bookingId: 'BKG-902',
      talentId: 'talent-1',
      customerId: 'customer-1',
      amount: 15000,
      message: 'Sangat ramah dan sabar menemani bapak kontrol. Terima kasih banyak!',
      createdAt: `${todayStr}T11:50:00`
    }
  ];
  localStorage.setItem(TIPS_KEY, JSON.stringify(defaults));
  return defaults;
}

export function saveTips(tips: Tip[]) {
  localStorage.setItem(TIPS_KEY, JSON.stringify(tips));
}

// 7. Audit Logs
export function getAuditLogs(): AuditLog[] {
  const saved = localStorage.getItem(AUDIT_LOGS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  const todayStr = new Date().toISOString().split('T')[0];
  const defaults: AuditLog[] = [
    {
      id: 'LOG-001',
      bookingId: 'BKG-902',
      action: 'EXTENSION_APPROVED',
      performedBy: 'customer',
      details: 'Pengguna menyetujui perpanjangan 45 menit dengan biaya tambahan Rp 30.000',
      timestamp: `${todayStr}T10:48:00`
    }
  ];
  localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(defaults));
  return defaults;
}

export function addAuditLog(bookingId: string, action: string, performedBy: 'talent' | 'customer' | 'admin' | 'system', details: string) {
  const logs = getAuditLogs();
  const newLog: AuditLog = {
    id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
    bookingId,
    action,
    performedBy,
    details,
    timestamp: new Date().toISOString()
  };
  logs.unshift(newLog);
  localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(logs));
}

// 8. Notifications Mock Store
export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'time_alert' | 'request' | 'approved' | 'paid' | 'tip' | 'completed' | 'info';
  createdAt: string;
  read: boolean;
}

export function getNotifications(): NotificationItem[] {
  const saved = localStorage.getItem(NOTIFICATIONS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  const defaults: NotificationItem[] = [
    {
      id: 'NOT-001',
      title: 'Selamat datang di Suruhin!',
      message: 'Sistem perpanjangan otomatis dan tips talent kini aktif sepenuhnya.',
      type: 'info',
      createdAt: new Date().toISOString(),
      read: false
    }
  ];
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(defaults));
  return defaults;
}

export function addNotification(title: string, message: string, type: NotificationItem['type']) {
  const notifs = getNotifications();
  const newNotif: NotificationItem = {
    id: `NOT-${Math.floor(1000 + Math.random() * 9000)}`,
    title,
    message,
    type,
    createdAt: new Date().toISOString(),
    read: false
  };
  notifs.unshift(newNotif);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
  
  // Custom event to trigger live UI update of notification badge
  window.dispatchEvent(new Event('suruhin_notifications_updated'));
}

export function saveNotifications(notifications: NotificationItem[]) {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

// 9. Tracking & Safety Simulation Storage Keys
const STATUS_HISTORY_KEY = 'suruhin_booking_status_history';
const LIVE_LOCATION_KEY = 'suruhin_live_locations';
const VERIFICATIONS_KEY = 'suruhin_meeting_verifications';
const INCIDENTS_KEY = 'suruhin_incidents_list';

// Booking Status History helpers
export function getStatusHistory(bookingId?: string): BookingStatusHistory[] {
  const saved = localStorage.getItem(STATUS_HISTORY_KEY);
  let history: BookingStatusHistory[] = [];
  if (saved) {
    try {
      history = JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  if (bookingId) {
    return history.filter(h => h.bookingId === bookingId);
  }
  return history;
}

export function addStatusHistory(
  bookingId: string,
  previousStatus: BookingStatus | null,
  newStatus: BookingStatus,
  changedById: string,
  latitude?: number,
  longitude?: number,
  notes?: string
): BookingStatusHistory {
  const history = getStatusHistory();
  const newLog: BookingStatusHistory = {
    id: `HIS-${Math.floor(1000 + Math.random() * 9000)}`,
    bookingId,
    previousStatus,
    newStatus,
    changedById,
    latitude,
    longitude,
    notes,
    createdAt: new Date().toISOString(),
  };
  history.unshift(newLog);
  localStorage.setItem(STATUS_HISTORY_KEY, JSON.stringify(history));
  return newLog;
}

// Live Location helpers
export function getLiveLocations(bookingId?: string): LiveLocation[] {
  const saved = localStorage.getItem(LIVE_LOCATION_KEY);
  let locations: LiveLocation[] = [];
  if (saved) {
    try {
      locations = JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  if (bookingId) {
    return locations.filter(l => l.bookingId === bookingId);
  }
  return locations;
}

export function updateLiveLocation(
  bookingId: string,
  userId: string,
  role: LocationRole,
  latitude: number,
  longitude: number,
  accuracy: number = 10,
  heading: number = 0,
  speed: number = 0
): LiveLocation {
  const locations = getLiveLocations();
  const existingIdx = locations.findIndex(l => l.bookingId === bookingId && l.userId === userId);
  
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000).toISOString(); // expires in 10 minutes

  const newLoc: LiveLocation = {
    id: `LOC-${Math.floor(1000 + Math.random() * 9000)}`,
    bookingId,
    userId,
    role,
    latitude,
    longitude,
    accuracy,
    heading,
    speed,
    recordedAt: now.toISOString(),
    expiresAt,
  };

  if (existingIdx > -1) {
    locations[existingIdx] = newLoc;
  } else {
    locations.push(newLoc);
  }

  localStorage.setItem(LIVE_LOCATION_KEY, JSON.stringify(locations));
  
  // Dispatch dynamic location update event for UI map listeners
  window.dispatchEvent(new CustomEvent('suruhin_location_updated', { detail: { bookingId, userId, role, latitude, longitude } }));
  
  return newLoc;
}

// Meeting Verification helpers
export function getMeetingVerification(bookingId: string): MeetingVerification | null {
  const saved = localStorage.getItem(VERIFICATIONS_KEY);
  let verifications: MeetingVerification[] = [];
  if (saved) {
    try {
      verifications = JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  const found = verifications.find(v => v.bookingId === bookingId);
  if (found) return found;

  // Generate a random PIN for simulation and seed it
  const pin = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit PIN
  const newVerif: MeetingVerification = {
    id: `VRF-${Math.floor(1000 + Math.random() * 9000)}`,
    bookingId,
    method: 'PIN',
    pinRaw: pin,
    pinHash: pin, // simple hash for mockup, stores raw PIN
    failedAttempts: 0,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };
  
  verifications.push(newVerif);
  localStorage.setItem(VERIFICATIONS_KEY, JSON.stringify(verifications));
  return newVerif;
}

export function saveMeetingVerification(verification: MeetingVerification) {
  const saved = localStorage.getItem(VERIFICATIONS_KEY);
  let verifications: MeetingVerification[] = [];
  if (saved) {
    try {
      verifications = JSON.parse(saved);
    } catch (e) { }
  }
  const idx = verifications.findIndex(v => v.bookingId === verification.bookingId);
  if (idx > -1) {
    verifications[idx] = verification;
  } else {
    verifications.push(verification);
  }
  localStorage.setItem(VERIFICATIONS_KEY, JSON.stringify(verifications));
}

// Emergency / Safety Incident helpers
export interface SafetyIncident {
  id: string;
  bookingId: string;
  reportedBy: string;
  incidentType: string;
  description: string;
  latitude?: number;
  longitude?: number;
  status: 'PENDING' | 'RESOLVED';
  createdAt: string;
  resolvedAt?: string;
}

export function getIncidents(): SafetyIncident[] {
  const saved = localStorage.getItem(INCIDENTS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  return [];
}

export function createIncident(
  bookingId: string,
  reportedBy: string,
  incidentType: string,
  description: string,
  latitude?: number,
  longitude?: number
): SafetyIncident {
  const incidents = getIncidents();
  const newIncident: SafetyIncident = {
    id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
    bookingId,
    reportedBy,
    incidentType,
    description,
    latitude,
    longitude,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };
  incidents.unshift(newIncident);
  localStorage.setItem(INCIDENTS_KEY, JSON.stringify(incidents));
  return newIncident;
}

export function resolveIncident(incidentId: string): SafetyIncident | null {
  const incidents = getIncidents();
  const idx = incidents.findIndex(i => i.id === incidentId);
  if (idx > -1) {
    incidents[idx].status = 'RESOLVED';
    incidents[idx].resolvedAt = new Date().toISOString();
    localStorage.setItem(INCIDENTS_KEY, JSON.stringify(incidents));
    return incidents[idx];
  }
  return null;
}

const CUSTOM_SERVICES_KEY = 'suruhin_custom_services';
const REVISIONS_KEY = 'suruhin_service_revisions';

export function getCustomServices(): TalentService[] {
  const saved = localStorage.getItem(CUSTOM_SERVICES_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }

  // Seed default custom services
  const defaultCustomServices: TalentService[] = [
    {
      id: 'ts-1',
      talentId: 't-1', // Rizky Pratama
      categoryId: 'temenin',
      categoryName: 'Temenin',
      title: 'Temenin Hiking di Gunung Galunggung',
      slug: 'temenin-hiking-di-gunung-galunggung',
      shortDescription: 'Teman hiking lokal untuk pendamping perjalanan yang lebih aman dan menyenangkan.',
      description: 'Ingin mendaki kawah Gunung Galunggung tapi ragu berjalan sendirian? Saya siap menemani perjalanan mendaki Anda! Sebagai pecinta alam aktif, saya paham betul jalur tangga kawah, jalur alternatif, hingga spot foto terbaik. Kita bisa mendaki santai sembari bercerita mengenai keindahan alam Tasikmalaya.',
      pricingType: 'HOURLY',
      basePrice: 50000,
      hourlyPrice: 50000,
      minimumDurationMinutes: 120,
      maximumDurationMinutes: 480,
      city: 'Kota Tasikmalaya',
      district: 'Cihideung',
      serviceRadiusKm: 20,
      defaultMeetingAddress: 'Alun-Alun Kota Tasikmalaya',
      trackingMode: 'REQUIRED_DURING_TRAVEL',
      onlineAvailable: false,
      instantBookingAvailable: true,
      negotiable: true,
      includedItems: ['Pendampingan profesional', 'Peta rute aman', 'Sesi foto dokumentasi', 'Air mineral'],
      excludedItems: ['Tiket masuk wisata', 'Biaya parkir motor/mobil', 'Makan dan cemilan'],
      requirements: ['Memakai sepatu olahraga/hiking', 'Kondisi fisik prima', 'Membawa jas hujan plastik'],
      status: TalentServiceStatus.ACTIVE,
      createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
      isDeleted: false,
      images: [
        { id: 'img-ts-1-1', talentServiceId: 'ts-1', url: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=400', altText: 'Hiking Galunggung', sortOrder: 1, isPrimary: true }
      ],
      schedules: [
        { id: 'sch-ts-1-1', talentServiceId: 'ts-1', dayOfWeek: 6, dayName: 'Sabtu', startTime: '06:00', endTime: '18:00', isActive: true },
        { id: 'sch-ts-1-2', talentServiceId: 'ts-1', dayOfWeek: 0, dayName: 'Minggu', startTime: '06:00', endTime: '18:00', isActive: true }
      ],
      bookingsCount: 15,
      totalEarnings: 750000,
      rating: 4.9
    },
    {
      id: 'ts-2',
      talentId: 't-1', // Rizky Pratama
      categoryId: 'olahraga-hobi',
      categoryName: 'Olahraga & Hobi',
      title: 'Temen Olahraga Badminton UNSIL',
      slug: 'temen-olahraga-badminton-unsil',
      shortDescription: 'Sparring partner bulutangkis yang ramah, lincah, dan suportif di lapangan.',
      description: 'Lagi pengen main badminton tapi kurang orang atau butuh lawan tanding yang seimbang? Yuk main bareng saya! Saya biasa bermain di GOR UNSIL atau GOR terdekat lainnya. Siap main single ataupun double, dari tipe santai ceria sampai kompetitif intens.',
      pricingType: 'HOURLY',
      basePrice: 30000,
      hourlyPrice: 30000,
      minimumDurationMinutes: 60,
      maximumDurationMinutes: 180,
      city: 'Kota Tasikmalaya',
      district: 'Tawang',
      serviceRadiusKm: 5,
      defaultMeetingAddress: 'GOR Universitas Siliwangi',
      trackingMode: 'ARRIVAL_ONLY',
      onlineAvailable: false,
      instantBookingAvailable: false,
      negotiable: false,
      includedItems: ['Raket cadangan (jika butuh)', 'Lawan tanding suportif', 'Fisik bugar siap berlari'],
      excludedItems: ['Sewa lapangan GOR', 'Shuttlecock', 'Minuman ion/air dingin'],
      requirements: ['Membawa sepatu olahraga non-marking', 'Menjaga sportivitas'],
      status: TalentServiceStatus.ACTIVE,
      createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      isDeleted: false,
      images: [
        { id: 'img-ts-2-1', talentServiceId: 'ts-2', url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=400', altText: 'Badminton Sparring', sortOrder: 1, isPrimary: true }
      ],
      schedules: [
        { id: 'sch-ts-2-1', talentServiceId: 'ts-2', dayOfWeek: 1, dayName: 'Senin', startTime: '16:00', endTime: '21:00', isActive: true },
        { id: 'sch-ts-2-2', talentServiceId: 'ts-2', dayOfWeek: 3, dayName: 'Rabu', startTime: '16:00', endTime: '21:00', isActive: true }
      ],
      bookingsCount: 8,
      totalEarnings: 240000,
      rating: 4.8
    },
    {
      id: 'ts-3',
      talentId: 't-1',
      categoryId: 'digital',
      categoryName: 'Digital & Lainnya',
      title: 'Jasa Foto & Bantuan Video Kreatif',
      slug: 'jasa-foto-bantuan-video-kreatif',
      shortDescription: 'Bantu dokumentasi foto/video aesthetic untuk konten media sosial Anda.',
      description: 'Butuh orang untuk mengambil foto atau video OOTD, reels kuliner, atau dokumentasi mini-event? Saya siap membantu mengambil rekaman dengan smartphone kamera mumpuni ataupun kamera mirrorless milik Anda. Saya mengerti sudut pandang aesthetic dan siap membantu mengarahkan gaya.',
      pricingType: 'PER_SESSION',
      basePrice: 120000,
      sessionPrice: 120000,
      minimumDurationMinutes: 120,
      city: 'Kota Tasikmalaya',
      district: 'Cihideung',
      trackingMode: 'OPTIONAL_DURING_SERVICE',
      onlineAvailable: false,
      instantBookingAvailable: false,
      negotiable: true,
      status: TalentServiceStatus.DRAFT,
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      isDeleted: false,
      images: [
        { id: 'img-ts-3-1', talentServiceId: 'ts-3', url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=400', altText: 'Fotografi Kreatif', sortOrder: 1, isPrimary: true }
      ],
      schedules: []
    },
    {
      id: 'ts-4',
      talentId: 't-1',
      categoryId: 'temenin',
      categoryName: 'Temenin',
      title: 'Temen Menonton Bioskop XXI Asia Plaza',
      slug: 'temen-menonton-bioskop-xxi-asia-plaza',
      shortDescription: 'Teman nonton bioskop seru yang siap mengobrol dan bertukar pikiran seputar film.',
      description: 'Ingin menonton film horror, action, atau drama di Cinema XXI Asia Plaza tapi tidak ada teman? Saya siap menemani! Bersedia membelikan tiket, mengantre popcorn, dan menjadi partner ngobrol film sesudahnya.',
      pricingType: 'HOURLY',
      basePrice: 35000,
      hourlyPrice: 35000,
      minimumDurationMinutes: 120,
      city: 'Kota Tasikmalaya',
      district: 'Cihideung',
      trackingMode: 'ARRIVAL_ONLY',
      onlineAvailable: false,
      instantBookingAvailable: false,
      negotiable: false,
      status: TalentServiceStatus.PENDING_REVIEW,
      createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      isDeleted: false,
      images: [
        { id: 'img-ts-4-1', talentServiceId: 'ts-4', url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400', altText: 'Movie partner', sortOrder: 1, isPrimary: true }
      ],
      schedules: []
    },
    {
      id: 'ts-5',
      talentId: 't-1',
      categoryId: 'temenin',
      categoryName: 'Temenin',
      title: 'Temen Kuliner Bakso Tasikmalaya',
      slug: 'temen-kuliner-bakso-tasikmalaya',
      shortDescription: 'Eksplorasi bakso Tasik legendaris bersama pemandu kuliner lokal ramah.',
      description: 'Tasikmalaya adalah surganya bakso! Sebagai pecinta kuliner lokal, saya siap mengantar dan merekomendasikan kedai bakso paling mantap di Tasik, seperti Bakso Laksana, Bakso Haji Amat, dll. Dijamin kenyang dan seru!',
      pricingType: 'HOURLY',
      basePrice: 25000,
      hourlyPrice: 25000,
      minimumDurationMinutes: 60,
      city: 'Kota Tasikmalaya',
      district: 'Cihideung',
      trackingMode: 'OPTIONAL_DURING_SERVICE',
      onlineAvailable: false,
      instantBookingAvailable: false,
      negotiable: true,
      status: TalentServiceStatus.REJECTED,
      rejectionReason: 'Deskripsi lengkap terlalu singkat dan foto kurang merepresentasikan layanan dengan jelas.',
      createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
      isDeleted: false,
      images: [
        { id: 'img-ts-5-1', talentServiceId: 'ts-5', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400', altText: 'Bakso Kuliner', sortOrder: 1, isPrimary: true }
      ],
      schedules: []
    }
  ];

  localStorage.setItem(CUSTOM_SERVICES_KEY, JSON.stringify(defaultCustomServices));
  return defaultCustomServices;
}

export function saveCustomServices(servicesList: TalentService[]) {
  localStorage.setItem(CUSTOM_SERVICES_KEY, JSON.stringify(servicesList));
}

export function getTalentServices(talentId: string): TalentService[] {
  return getCustomServices().filter(s => s.talentId === talentId && !s.isDeleted);
}

export function getTalentServiceById(id: string): TalentService | null {
  return getCustomServices().find(s => s.id === id) || null;
}

export function getTalentServiceBySlug(slug: string): TalentService | null {
  return getCustomServices().find(s => s.slug === slug) || null;
}

export function saveTalentService(service: TalentService): void {
  const list = getCustomServices();
  const idx = list.findIndex(s => s.id === service.id);
  if (idx > -1) {
    list[idx] = service;
  } else {
    list.push(service);
  }
  saveCustomServices(list);
}

export function deleteTalentService(id: string): void {
  const list = getCustomServices();
  const idx = list.findIndex(s => s.id === id);
  if (idx > -1) {
    // Check if there are simulated bookings associated
    const serviceBookings = getBookings().filter(b => b.serviceId === id);
    if (serviceBookings.length > 0) {
      // Archive instead of delete
      list[idx].status = TalentServiceStatus.ARCHIVED;
      list[idx].archivedAt = new Date().toISOString();
    } else {
      // Soft delete
      list[idx].isDeleted = true;
      list[idx].deletedAt = new Date().toISOString();
    }
    list[idx].updatedAt = new Date().toISOString();
    saveCustomServices(list);
  }
}

export function duplicateTalentService(id: string): TalentService | null {
  const service = getTalentServiceById(id);
  if (!service) return null;

  const randomId = `ts-${Math.floor(1000 + Math.random() * 9000)}`;
  const duplicate: TalentService = {
    ...service,
    id: randomId,
    title: `${service.title} (Salinan)`,
    slug: `${service.slug}-salinan-${Math.floor(100 + Math.random() * 900)}`,
    status: TalentServiceStatus.DRAFT,
    rejectionReason: undefined,
    moderationNotes: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: undefined,
    reviewedAt: undefined,
    reviewedById: undefined,
    bookingsCount: 0,
    totalEarnings: 0,
    rating: undefined,
    images: service.images.map(img => ({
      ...img,
      id: `img-ts-dup-${Math.floor(10000 + Math.random() * 90000)}`,
      talentServiceId: randomId
    })),
    schedules: service.schedules.map(sch => ({
      ...sch,
      id: `sch-ts-dup-${Math.floor(10000 + Math.random() * 90000)}`,
      talentServiceId: randomId
    }))
  };

  saveTalentService(duplicate);
  return duplicate;
}

export function getRevisions(serviceId?: string): TalentServiceRevision[] {
  const saved = localStorage.getItem(REVISIONS_KEY);
  let revisions: TalentServiceRevision[] = [];
  if (saved) {
    try {
      revisions = JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  if (serviceId) {
    return revisions.filter(r => r.talentServiceId === serviceId);
  }
  return revisions;
}

export function saveRevision(revision: TalentServiceRevision) {
  const revisions = getRevisions();
  const idx = revisions.findIndex(r => r.id === revision.id);
  if (idx > -1) {
    revisions[idx] = revision;
  } else {
    revisions.push(revision);
  }
  localStorage.setItem(REVISIONS_KEY, JSON.stringify(revisions));
}

export function mapTalentServiceToService(ts: TalentService): Service {
  const primaryImg = ts.images?.find(img => img.isPrimary)?.url || (ts.images?.[0]?.url || 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=400');
  return {
    id: ts.id,
    slug: ts.slug,
    title: ts.title,
    category: ts.categoryId,
    categoryName: ts.categoryName || 'Layanan Custom',
    shortDescription: ts.shortDescription,
    description: ts.description,
    location: `${ts.district ? ts.district + ', ' : ''}${ts.city}`,
    price: ts.basePrice,
    rating: ts.rating || 5.0,
    reviewCount: ts.bookingsCount || 0,
    image: primaryImg,
    featured: false,
    included: ts.includedItems || [],
    excluded: ts.excludedItems || [],
    faqs: []
  };
}

// Lazy load static services to avoid circular dependency
import { services as staticServices } from './services';
import { Service } from '../types';

export function getCombinedServices(): Service[] {
  const custom = getCustomServices().filter(s => s.status === TalentServiceStatus.ACTIVE && !s.isDeleted);
  const mappedCustom = custom.map(mapTalentServiceToService);
  return [...staticServices, ...mappedCustom];
}



