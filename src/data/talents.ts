import { Talent } from '../types';

export const talents: Talent[] = [
  {
    id: 't-1',
    slug: 'sari-lestari',
    name: 'Sari Lestari',
    gender: 'Wanita',
    age: 27,
    location: 'Tawang, Kota Tasikmalaya',
    latitude: -7.3274,
    longitude: 108.2207,
    bio: 'Pendamping harian yang sabar, komunikatif, dan terbiasa menemani lansia maupun aktivitas keluarga. Sari berpengalaman membantu kontrol obat, menemani belanja, serta mendampingi aktivitas santai dengan suasana yang sopan dan tenang.',
    avatar: 'assets/talents/talent-sari-lestari.jpg',
    services: ['pendamping-lansia', 'titip-belanja-harian', 'temenin-nonton', 'temenin-makan-ngopi'],
    skills: ['Pendampingan Lansia', 'Belanja Harian', 'Komunikasi Hangat', 'Manajemen Obat Dasar'],
    languages: ['Bahasa Indonesia', 'Sunda (Halus)'],
    joinedYear: 2024,
    rating: 4.9,
    reviewCount: 118,
    completedOrders: 186,
    verified: true,
    available: true,
    schedule: [
      { day: 'Senin', time: '07:00 - 16:00', available: true },
      { day: 'Selasa', time: '07:00 - 16:00', available: true },
      { day: 'Rabu', time: '07:00 - 16:00', available: true },
      { day: 'Kamis', time: '07:00 - 16:00', available: true },
      { day: 'Jumat', time: '07:00 - 15:00', available: true },
      { day: 'Sabtu', time: '08:00 - 14:00', available: true },
      { day: 'Minggu', time: 'Libur', available: false }
    ]
  },
  {
    id: 't-2',
    slug: 'nadia-putri-ramadhani',
    name: 'Nadia Putri Ramadhani',
    gender: 'Wanita',
    age: 24,
    location: 'Cihideung, Kota Tasikmalaya',
    latitude: -7.3446,
    longitude: 108.2192,
    bio: 'Nadia aktif membantu kebutuhan rumah tangga ringan, titip belanja, dan pendamping aktivitas harian untuk customer wanita maupun keluarga. Karakternya rapi, cekatan, dan nyaman diajak berkomunikasi untuk kebutuhan yang membutuhkan ketelitian.',
    avatar: 'assets/talents/talent-nadia-putri.jpg',
    services: ['bersih-bersih-rumah-kos', 'titip-belanja-harian', 'teman-olahraga', 'temenin-makan-ngopi'],
    skills: ['Deep Cleaning Ringan', 'Belanja Cermat', 'Jogging Companion', 'Rapih & Teliti'],
    languages: ['Bahasa Indonesia', 'Sunda', 'English (Basic)'],
    joinedYear: 2025,
    rating: 4.8,
    reviewCount: 76,
    completedOrders: 109,
    verified: true,
    available: true,
    schedule: [
      { day: 'Senin', time: '08:00 - 17:00', available: true },
      { day: 'Selasa', time: '08:00 - 17:00', available: true },
      { day: 'Rabu', time: '08:00 - 17:00', available: true },
      { day: 'Kamis', time: '08:00 - 17:00', available: true },
      { day: 'Jumat', time: '08:00 - 15:00', available: true },
      { day: 'Sabtu', time: '08:00 - 13:00', available: true },
      { day: 'Minggu', time: 'Libur', available: false }
    ]
  }
];
