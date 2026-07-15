import { ServiceCategory, ServiceSubCategory } from '../types';

const CATEGORIES_KEY = 'suruhin_categories';
const SUBCATEGORIES_KEY = 'suruhin_subcategories';

export const CATEGORY_COLORS: Record<string, string> = {
  'antar-jemput': '#3B82F6', // Blue
  'temenin': '#F97316', // Orange
  'titip-belanja': '#10B981', // Emerald
  'rumah-tangga': '#F59E0B', // Amber
  'digital-teknologi': '#06B6D4', // Cyan
  'pendidikan': '#6366F1', // Indigo
  'bisnis-profesional': '#8B5CF6', // Purple
  'olahraga-hobi': '#10B981', // Green
  'wisata-traveling': '#EF4444', // Red
  'event-acara': '#EC4899', // Pink
  'kreatif-media': '#14B8A6', // Teal
  'hewan-peliharaan': '#F43F5E', // Rose
  'lansia-keluarga': '#84CC16', // Lime
  'pengiriman-logistik': '#4B5563', // Gray
};

export const CATEGORY_ICONS: Record<string, string> = {
  'antar-jemput': 'Car',
  'temenin': 'Users',
  'titip-belanja': 'ShoppingBag',
  'rumah-tangga': 'Home',
  'digital-teknologi': 'Laptop',
  'pendidikan': 'BookOpen',
  'bisnis-profesional': 'Briefcase',
  'olahraga-hobi': 'Dribbble',
  'wisata-traveling': 'MapPin',
  'event-acara': 'PartyPopper',
  'kreatif-media': 'Camera',
  'hewan-peliharaan': 'Heart',
  'lansia-keluarga': 'Smile',
  'pengiriman-logistik': 'Truck',
};

// Seeding function to populate categories if not found
export function getServiceCategories(): ServiceCategory[] {
  const saved = localStorage.getItem(CATEGORIES_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse categories', e);
    }
  }

  // Seed default categories
  const seedCategories: ServiceCategory[] = [
    {
      id: 'cat-1',
      name: 'Antar & Jemput',
      slug: 'antar-jemput',
      icon: 'Car',
      description: 'Layanan antar jemput anak sekolah, karyawan, bandara, atau lansia dengan aman.',
      color: 'bg-blue-50 text-blue-600',
      sortOrder: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cat-2',
      name: 'Pendamping (Temenin)',
      slug: 'temenin',
      icon: 'Users',
      description: 'Cari teman makan, nonton bioskop, mendaki gunung, sparring olahraga, atau ngobrol santai.',
      color: 'bg-orange-50 text-orange-600',
      sortOrder: 2,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cat-3',
      name: 'Titip & Belanja',
      slug: 'titip-belanja',
      icon: 'ShoppingBag',
      description: 'Titip belanja kebutuhan pasar harian, antre obat, beli oleh-oleh, atau tiket.',
      color: 'bg-emerald-50 text-emerald-600',
      sortOrder: 3,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cat-4',
      name: 'Rumah Tangga',
      slug: 'rumah-tangga',
      icon: 'Home',
      description: 'Pembersih kosan/rumah, bantuan pindahan, cuci motor/mobil, hingga rapi-rapi kebun.',
      color: 'bg-amber-50 text-amber-600',
      sortOrder: 4,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cat-5',
      name: 'Digital & Teknologi',
      slug: 'digital-teknologi',
      icon: 'Laptop',
      description: 'Pembuatan website, edit video Reels/TikTok, desain grafis, input data, atau konsultasi AI.',
      color: 'bg-cyan-50 text-cyan-600',
      sortOrder: 5,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cat-6',
      name: 'Pendidikan',
      slug: 'pendidikan',
      icon: 'BookOpen',
      description: 'Guru les privat, mentor tugas/coding, bimbingan belajar, atau mentor skripsi mahasiswa.',
      color: 'bg-indigo-50 text-indigo-600',
      sortOrder: 6,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cat-7',
      name: 'Bisnis & Profesional',
      slug: 'bisnis-profesional',
      icon: 'Briefcase',
      description: 'Konsultan UMKM, fotografer mini event, asisten administrasi, atau event organizer lokal.',
      color: 'bg-purple-50 text-purple-600',
      sortOrder: 7,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cat-8',
      name: 'Olahraga & Hobi',
      slug: 'olahraga-hobi',
      icon: 'Dribbble',
      description: 'Sparring partner bulutangkis, futsal, teman jogging, personal trainer gym, atau teman memancing.',
      color: 'bg-teal-50 text-teal-600',
      sortOrder: 8,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cat-9',
      name: 'Wisata & Traveling',
      slug: 'wisata-traveling',
      icon: 'MapPin',
      description: 'Pemandu wisata lokal Tasikmalaya, teman eksplorasi kuliner, hingga teman menjelajah alam.',
      color: 'bg-rose-50 text-rose-600',
      sortOrder: 9,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cat-10',
      name: 'Event & Acara',
      slug: 'event-acara',
      icon: 'PartyPopper',
      description: 'Pendamping menghadiri wisuda, pameran, kondangan pernikahan, konser musik, atau seminar.',
      color: 'bg-pink-50 text-pink-600',
      sortOrder: 10,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cat-11',
      name: 'Kreatif & Media',
      slug: 'kreatif-media',
      icon: 'Camera',
      description: 'Pengambilan foto produk UMKM, pembuatan konten video, voice over, atau live stream assistant.',
      color: 'bg-fuchsia-50 text-fuchsia-600',
      sortOrder: 11,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cat-12',
      name: 'Hewan Peliharaan',
      slug: 'hewan-peliharaan',
      icon: 'Heart',
      description: 'Jasa pet sitting (menjaga hewan), mengajak anjing jalan-jalan, atau antar jemput grooming pet.',
      color: 'bg-red-50 text-red-500',
      sortOrder: 12,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cat-13',
      name: 'Lansia & Keluarga',
      slug: 'lansia-keluarga',
      icon: 'Smile',
      description: 'Asisten pendamping lansia berobat ke RS, mengobrol di taman, atau pendampingan belajar anak.',
      color: 'bg-lime-50 text-lime-600',
      sortOrder: 13,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cat-14',
      name: 'Pengiriman & Logistik',
      slug: 'pengiriman-logistik',
      icon: 'Truck',
      description: 'Pengiriman motor, kurir kilat dokumen, jasa angkut barang, atau bantuan pindah kos.',
      color: 'bg-slate-100 text-slate-600',
      sortOrder: 14,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(seedCategories));
  return seedCategories;
}

export function getServiceSubCategories(categoryId?: string): ServiceSubCategory[] {
  const saved = localStorage.getItem(SUBCATEGORIES_KEY);
  let subcategories: ServiceSubCategory[] = [];

  if (saved) {
    try {
      subcategories = JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse subcategories', e);
    }
  }

  if (subcategories.length === 0) {
    // Seed default subcategories
    const seedSubcategories: ServiceSubCategory[] = [
      // Category 1: Antar & Jemput (cat-1)
      { id: 'sub-1-1', categoryId: 'cat-1', name: 'Antar Sekolah', slug: 'antar-sekolah', icon: 'School', description: 'Antar anak ke sekolah dengan aman.', sortOrder: 1, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-1-2', categoryId: 'cat-1', name: 'Antar Kerja', slug: 'antar-kerja', icon: 'Briefcase', description: 'Antar jemput ke tempat kerja.', sortOrder: 2, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-1-3', categoryId: 'cat-1', name: 'Antar Barang', slug: 'antar-barang', icon: 'Package', description: 'Layanan antar jemput barang.', sortOrder: 3, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-1-4', categoryId: 'cat-1', name: 'Antar Makanan', slug: 'antar-makanan', icon: 'Utensils', description: 'Antar pesanan makanan.', sortOrder: 4, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-1-5', categoryId: 'cat-1', name: 'Antar Dokumen', slug: 'antar-dokumen', icon: 'FileText', description: 'Kirim dokumen penting kilat.', sortOrder: 5, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-1-6', categoryId: 'cat-1', name: 'Antar Lansia', slug: 'antar-lansia', icon: 'Heart', description: 'Antar lansia dengan penuh kesabaran.', sortOrder: 6, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-1-7', categoryId: 'cat-1', name: 'Antar Bandara', slug: 'antar-bandara', icon: 'PlaneTakeoff', description: 'Antar ke Bandara terdekat.', sortOrder: 7, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-1-8', categoryId: 'cat-1', name: 'Jemput Bandara', slug: 'jemput-bandara', icon: 'PlaneLanding', description: 'Jemput dari Bandara terdekat.', sortOrder: 8, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-1-9', categoryId: 'cat-1', name: 'Antar Rumah Sakit', slug: 'antar-rs', icon: 'Activity', description: 'Antar jemput pasien ke rumah sakit.', sortOrder: 9, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-1-10', categoryId: 'cat-1', name: 'Antar Hewan Peliharaan', slug: 'antar-hewan', icon: 'Dog', description: 'Antar jemput anjing/kucing kesayangan.', sortOrder: 10, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

      // Category 2: Temenin (cat-2)
      { id: 'sub-2-1', categoryId: 'cat-2', name: 'Teman Ngopi', slug: 'teman-ngopi', icon: 'Coffee', description: 'Teman nongkrong di cafe.', sortOrder: 1, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-2-2', categoryId: 'cat-2', name: 'Teman Makan', slug: 'teman-makan', icon: 'Pizza', description: 'Teman mengeksplor kuliner lezat.', sortOrder: 2, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-2-3', categoryId: 'cat-2', name: 'Teman Nonton', slug: 'teman-nonton', icon: 'Film', description: 'Teman nonton bioskop seru.', sortOrder: 3, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-2-4', categoryId: 'cat-2', name: 'Teman Hiking', slug: 'teman-hiking', icon: 'Trees', description: 'Teman mendaki kawah atau puncak gunung.', sortOrder: 4, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-2-5', categoryId: 'cat-2', name: 'Teman Camping', slug: 'teman-camping', icon: 'Tent', description: 'Teman berkemah menikmati api unggun.', sortOrder: 5, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-2-6', categoryId: 'cat-2', name: 'Teman Touring', slug: 'teman-touring', icon: 'Bike', description: 'Teman perjalanan berkendara jauh.', sortOrder: 6, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-2-7', categoryId: 'cat-2', name: 'Teman Gym', slug: 'teman-gym', icon: 'Dumbbell', description: 'Teman gym biar makin semangat latihan.', sortOrder: 7, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-2-8', categoryId: 'cat-2', name: 'Teman Olahraga', slug: 'teman-olahraga', icon: 'Dribbble', description: 'Rekan sparring serbaguna.', sortOrder: 8, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-2-9', categoryId: 'cat-2', name: 'Teman Jogging', slug: 'teman-jogging', icon: 'Footprints', description: 'Rekan lari di Dadaha atau Alun-alun.', sortOrder: 9, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-2-10', categoryId: 'cat-2', name: 'Teman Bersepeda', slug: 'teman-bersepeda', icon: 'Bike', description: 'Gowes bareng keliling kota.', sortOrder: 10, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-2-11', categoryId: 'cat-2', name: 'Teman Gaming', slug: 'teman-gaming', icon: 'Gamepad2', description: 'Teman push rank game online.', sortOrder: 11, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-2-12', categoryId: 'cat-2', name: 'Teman Belajar', slug: 'teman-belajar', icon: 'Book', description: 'Rekan diskusi/belajar bareng di perpus.', sortOrder: 12, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-2-13', categoryId: 'cat-2', name: 'Teman Curhat', slug: 'teman-curhat', icon: 'HeartHandshake', description: 'Pendengar yang setia dan netral.', sortOrder: 13, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-2-14', categoryId: 'cat-2', name: 'Teman Belanja', slug: 'teman-belanja', icon: 'ShoppingBag', description: 'Teman belanja fashion atau grocery.', sortOrder: 14, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-2-15', categoryId: 'cat-2', name: 'Teman Wisata', slug: 'teman-wisata', icon: 'Compass', description: 'Teman menjelajah kota Tasikmalaya.', sortOrder: 15, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-2-16', categoryId: 'cat-2', name: 'Teman Foto', slug: 'teman-foto', icon: 'Camera', description: 'Partner hunting foto aesthetic.', sortOrder: 16, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-2-17', categoryId: 'cat-2', name: 'Teman Karaoke', slug: 'teman-karaoke', icon: 'Music', description: 'Teman bernyanyi melepas penat.', sortOrder: 17, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-2-18', categoryId: 'cat-2', name: 'Teman Konser', slug: 'teman-konser', icon: 'Mic', description: 'Partner seru-seruan di konser musik.', sortOrder: 18, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-2-19', categoryId: 'cat-2', name: 'Teman Seminar', slug: 'teman-seminar', icon: 'FileSpreadsheet', description: 'Menghadiri seminar bersama.', sortOrder: 19, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-2-20', categoryId: 'cat-2', name: 'Teman Event', slug: 'teman-event', icon: 'PartyPopper', description: 'Teman berpartisipasi di festival.', sortOrder: 20, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-2-21', categoryId: 'cat-2', name: 'Teman Networking', icon: 'Shuffle', slug: 'teman-network', description: 'Teman mencari relasi profesional.', sortOrder: 21, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-2-22', categoryId: 'cat-2', name: 'Teman Buka Puasa', icon: 'Users', slug: 'teman-bukber', description: 'Teman bukber saat Ramadhan.', sortOrder: 22, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-2-23', categoryId: 'cat-2', name: 'Teman Nongkrong', slug: 'teman-nongkrong', icon: 'MessagesSquare', description: 'Kawan mengobrol santai malam hari.', sortOrder: 23, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

      // Category 3: Titip & Belanja (cat-3)
      { id: 'sub-3-1', categoryId: 'cat-3', name: 'Titip Belanja Harian', slug: 'titip-groceries', icon: 'Store', description: 'Belanja sayur/sembako di pasar.', sortOrder: 1, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-3-2', categoryId: 'cat-3', name: 'Titip Obat', slug: 'titip-obat', icon: 'Hospital', description: 'Belikan obat di apotek terdekat.', sortOrder: 2, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-3-3', categoryId: 'cat-3', name: 'Titip Oleh-Oleh', slug: 'titip-oleh-oleh', icon: 'Gift', description: 'Beli makanan khas Tasik.', sortOrder: 3, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-3-4', categoryId: 'cat-3', name: 'Titip Makanan', slug: 'titip-makan', icon: 'UtensilsCrossed', description: 'Antre beli jajanan viral.', sortOrder: 4, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-3-5', categoryId: 'cat-3', name: 'Titip Minuman', slug: 'titip-minum', icon: 'GlassWater', description: 'Belikan kopi/boba favorit.', sortOrder: 5, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-3-6', categoryId: 'cat-3', name: 'Titip Barang Marketplace', slug: 'titip-marketplace', icon: 'ShoppingBag', description: 'Ambil COD atau barang sisa.', sortOrder: 6, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-3-7', categoryId: 'cat-3', name: 'Titip Antre', slug: 'titip-antre', icon: 'Clock', description: 'Mewakili Anda dalam barisan antrean.', sortOrder: 7, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

      // Category 4: Rumah Tangga (cat-4)
      { id: 'sub-4-1', categoryId: 'cat-4', name: 'Bersih Rumah', slug: 'bersih-rumah', icon: 'Home', description: 'Sapu, pel, cuci piring, beres-beres.', sortOrder: 1, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-4-2', categoryId: 'cat-4', name: 'Cuci Kendaraan', slug: 'cuci-kendaraan', icon: 'Droplets', description: 'Cuci motor atau mobil di rumah Anda.', sortOrder: 2, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-4-3', categoryId: 'cat-4', name: 'Potong Rumput', slug: 'potong-rumput', icon: 'Scissors', description: 'Rapikan rumput liar pekarangan.', sortOrder: 3, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-4-4', categoryId: 'cat-4', name: 'Rapikan Gudang', slug: 'rapikan-gudang', icon: 'BoxSelect', description: 'Kemas dan rapikan barang lama.', sortOrder: 4, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-4-5', categoryId: 'cat-4', name: 'Pindahan Kos', slug: 'pindahan-kos', icon: 'Truck', description: 'Bantu angkat barang pindahan.', sortOrder: 5, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-4-6', categoryId: 'cat-4', name: 'Bongkar Pasang Furnitur', slug: 'bongkar-pasang', icon: 'Wrench', description: 'Pasang meja, lemari knockdown dll.', sortOrder: 6, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-4-7', categoryId: 'cat-4', name: 'Perawatan Rumah', slug: 'perawatan-rumah', icon: 'Hammer', description: 'Ganti lampu, cat ulang dinding ringan.', sortOrder: 7, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

      // Category 5: Digital & Teknologi (cat-5)
      { id: 'sub-5-1', categoryId: 'cat-5', name: 'Jasa Website', slug: 'jasa-website', icon: 'Globe', description: 'Buat landing page atau web toko.', sortOrder: 1, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-5-2', categoryId: 'cat-5', name: 'Jasa UI UX', slug: 'jasa-uiux', icon: 'PenTool', description: 'Desain layout web & mobile app.', sortOrder: 2, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-5-3', categoryId: 'cat-5', name: 'Jasa Desain', slug: 'jasa-desain', icon: 'Palette', description: 'Desain poster, feed IG, atau banner.', sortOrder: 3, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-5-4', categoryId: 'cat-5', name: 'Jasa AI', slug: 'jasa-ai', icon: 'Cpu', description: 'Integrasi chatbot atau prompt AI.', sortOrder: 4, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-5-5', categoryId: 'cat-5', name: 'Edit Video', slug: 'edit-video', icon: 'Video', description: 'Edit Reels, TikTok, atau Youtube.', sortOrder: 5, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-5-6', categoryId: 'cat-5', name: 'Editing Foto', slug: 'edit-foto', icon: 'Image', description: 'Retouch wajah atau manipulasi warna.', sortOrder: 6, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-5-7', categoryId: 'cat-5', name: 'Instalasi Software', slug: 'install-software', icon: 'HardDrive', description: 'Bantu instal ulang OS atau app.', sortOrder: 7, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-5-8', categoryId: 'cat-5', name: 'Mentor AI', slug: 'mentor-ai', icon: 'GraduationCap', description: 'Bimbingan menggunakan generative AI.', sortOrder: 8, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-5-9', categoryId: 'cat-5', name: 'Konsultasi Digital', slug: 'konsul-digital', icon: 'HelpCircle', description: 'Konsultasi branding & sosmed.', sortOrder: 9, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-5-10', categoryId: 'cat-5', name: 'Data Entry', slug: 'data-entry', icon: 'Keyboard', description: 'Input data Excel atau database.', sortOrder: 10, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

      // Category 6: Pendidikan (cat-6)
      { id: 'sub-6-1', categoryId: 'cat-6', name: 'Teman Belajar', slug: 'teman-belajar-pend', icon: 'Users', description: 'Belajar bareng mengulang modul.', sortOrder: 1, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-6-2', categoryId: 'cat-6', name: 'Les Privat', slug: 'les-privat', icon: 'BookOpen', description: 'Les privat SD, SMP, SMA.', sortOrder: 2, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-6-3', categoryId: 'cat-6', name: 'Mentor Skripsi', slug: 'mentor-skripsi', icon: 'GraduationCap', description: 'Bantuan olah data & ide skripsi.', sortOrder: 3, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-6-4', categoryId: 'cat-6', name: 'Mentor Coding', slug: 'mentor-coding', icon: 'Code', description: 'Belajar React, Node, Python.', sortOrder: 4, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-6-5', categoryId: 'cat-6', name: 'Mentor Bahasa Inggris', slug: 'mentor-inggris', icon: 'Languages', description: 'Tutor speaking / persipan TOEFL.', sortOrder: 5, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-6-6', categoryId: 'cat-6', name: 'Mentor Matematika', slug: 'mentor-matematika', icon: 'Percent', description: 'Bimbingan berhitung & logika.', sortOrder: 6, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-6-7', categoryId: 'cat-6', name: 'Mentor Komputer', slug: 'mentor-komputer', icon: 'Laptop', description: 'Belajar Ms Office / dasar Windows.', sortOrder: 7, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

      // Category 7: Bisnis & Profesional (cat-7)
      { id: 'sub-7-1', categoryId: 'cat-7', name: 'Konsultan UMKM', slug: 'konsul-umkm', icon: 'Compass', description: 'Bantu pembukuan & strategi bisnis.', sortOrder: 1, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-7-2', categoryId: 'cat-7', name: 'Fotografer', slug: 'fotografer', icon: 'Camera', description: 'Jasa foto wisuda / event kecil.', sortOrder: 2, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-7-3', categoryId: 'cat-7', name: 'Videografer', slug: 'videografer', icon: 'Video', description: 'Jasa dokumentasi video aesthetic.', sortOrder: 3, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-7-4', categoryId: 'cat-7', name: 'MC', slug: 'mc', icon: 'Mic', description: 'Pemandu acara formal maupun santai.', sortOrder: 4, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-7-5', categoryId: 'cat-7', name: 'Penerjemah', slug: 'penerjemah', icon: 'Languages', description: 'Terjemahan dokumen resmi / lisan.', sortOrder: 5, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-7-6', categoryId: 'cat-7', name: 'Asisten Pribadi', slug: 'asisten-pribadi', icon: 'Calendar', description: 'Bantu manajemen jadwal & admin harian.', sortOrder: 6, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-7-7', categoryId: 'cat-7', name: 'Event Organizer', slug: 'eo-lokal', icon: 'PartyPopper', description: 'Bantu konsep mini party / gathering.', sortOrder: 7, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

      // Category 8: Olahraga & Hobi (cat-8)
      { id: 'sub-8-1', categoryId: 'cat-8', name: 'Personal Trainer', slug: 'personal-trainer', icon: 'Heart', description: 'Pelatih kebugaran gym / workout.', sortOrder: 1, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-8-2', categoryId: 'cat-8', name: 'Teman Gym', slug: 'teman-gym-hobi', icon: 'Dumbbell', description: 'Partner latihan beban.', sortOrder: 2, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-8-3', categoryId: 'cat-8', name: 'Badminton', slug: 'badminton-hobi', icon: 'Dribbble', description: 'Sparring partner bulutangkis.', sortOrder: 3, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-8-4', categoryId: 'cat-8', name: 'Futsal', slug: 'futsal-hobi', icon: 'Activity', description: 'Sparring / pemain tambahan futsal.', sortOrder: 4, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-8-5', categoryId: 'cat-8', name: 'Basket', slug: 'basket-hobi', icon: 'Activity', description: 'Sparring / latihan bareng basket.', sortOrder: 5, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-8-6', categoryId: 'cat-8', name: 'Renang', slug: 'renang-hobi', icon: 'Droplet', description: 'Teman latihan renang.', sortOrder: 6, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-8-7', categoryId: 'cat-8', name: 'Sepeda', slug: 'sepeda-hobi', icon: 'Bike', description: 'Teman gowes jarak jauh.', sortOrder: 7, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-8-8', categoryId: 'cat-8', name: 'Hiking', slug: 'hiking-hobi', icon: 'Trees', description: 'Teman mendaki kawah Galunggung.', sortOrder: 8, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-8-9', categoryId: 'cat-8', name: 'Camping', slug: 'camping-hobi', icon: 'Tent', description: 'Partner berkemah di alam.', sortOrder: 9, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-8-10', categoryId: 'cat-8', name: 'Mancing', slug: 'mancing-hobi', icon: 'Anchor', description: 'Teman memancing di kolam / laut.', sortOrder: 10, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

      // Category 9: Wisata & Traveling (cat-9)
      { id: 'sub-9-1', categoryId: 'cat-9', name: 'Guide Wisata', slug: 'guide-wisata', icon: 'Compass', description: 'Tour guide lokal berpengalaman.', sortOrder: 1, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-9-2', categoryId: 'cat-9', name: 'Pendamping Traveling', slug: 'pendamping-traveling', icon: 'Map', description: 'Teman jalan selama liburan.', sortOrder: 2, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-9-3', categoryId: 'cat-9', name: 'Tour Lokal', slug: 'tour-lokal', icon: 'MapPin', description: 'Keliling spot hidden gem di Tasik.', sortOrder: 3, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-9-4', categoryId: 'cat-9', name: 'Pendamping Gunung', slug: 'pendamping-gunung', icon: 'Mountain', description: 'Pemandu jalur mendaki aman.', sortOrder: 4, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-9-5', categoryId: 'cat-9', name: 'Wisata Kuliner', slug: 'wisata-kuliner', icon: 'Utensils', description: 'Pemandu kulineran bakso Tasik dll.', sortOrder: 5, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-9-6', categoryId: 'cat-9', name: 'City Tour', slug: 'city-tour', icon: 'Navigation', description: 'Eksplorasi tengah kota sejarah & budaya.', sortOrder: 6, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

      // Category 10: Event & Acara (cat-10)
      { id: 'sub-10-1', categoryId: 'cat-10', name: 'Pendamping Pernikahan', slug: 'pendamping-pernikahan', icon: 'Heart', description: 'Teman kondangan pernikahan.', sortOrder: 1, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-10-2', categoryId: 'cat-10', name: 'Pendamping Seminar', slug: 'pendamping-seminar', icon: 'FileText', description: 'Teman menghadiri seminar/bazar.', sortOrder: 2, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-10-3', categoryId: 'cat-10', name: 'Pendamping Wisuda', slug: 'pendamping-wisuda', icon: 'GraduationCap', description: 'Mendampingi wisuda & foto bersama.', sortOrder: 3, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-10-4', categoryId: 'cat-10', name: 'Pendamping Konser', slug: 'pendamping-konser', icon: 'Music', description: 'Rekan antre & nonton konser musik.', sortOrder: 4, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-10-5', categoryId: 'cat-10', name: 'Pendamping Gathering', slug: 'pendamping-gathering', icon: 'Users', description: 'Menghadiri reuni / gathering kantor.', sortOrder: 5, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-10-6', categoryId: 'cat-10', name: 'Pendamping Pameran', slug: 'pendamping-pameran', icon: 'Eye', description: 'Teman melihat pameran seni / expo.', sortOrder: 6, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

      // Category 11: Kreatif & Media (cat-11)
      { id: 'sub-11-1', categoryId: 'cat-11', name: 'Foto Produk', slug: 'foto-produk', icon: 'Camera', description: 'Foto produk katalog aesthetic.', sortOrder: 1, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-11-2', categoryId: 'cat-11', name: 'Foto Couple', slug: 'foto-couple', icon: 'Camera', description: 'Foto prewedding / couple outdoor.', sortOrder: 2, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-11-3', categoryId: 'cat-11', name: 'Foto Wisuda', slug: 'foto-wisuda-kreatif', icon: 'Camera', description: 'Sesi foto outdoor pasca wisuda.', sortOrder: 3, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-11-4', categoryId: 'cat-11', name: 'Konten TikTok', slug: 'konten-tiktok', icon: 'Video', description: 'Bikin video kreatif / talent video.', sortOrder: 4, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-11-5', categoryId: 'cat-11', name: 'Live Streaming', slug: 'live-streaming', icon: 'Tv', description: 'Asisten / moderator host live shopping.', sortOrder: 5, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-11-6', categoryId: 'cat-11', name: 'Voice Over', slug: 'voice-over', icon: 'Mic', description: 'Isi suara iklan / explainer video.', sortOrder: 6, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

      // Category 12: Hewan Peliharaan (cat-12)
      { id: 'sub-12-1', categoryId: 'cat-12', name: 'Antar Grooming', slug: 'pet-grooming', icon: 'Droplets', description: 'Antar hewan kesayangan mandi.', sortOrder: 1, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-12-2', categoryId: 'cat-12', name: 'Pet Sitting', slug: 'pet-sitting', icon: 'Heart', description: 'Menjaga hewan di rumah saat keluar.', sortOrder: 2, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-12-3', categoryId: 'cat-12', name: 'Dog Walking', slug: 'dog-walking', icon: 'Footprints', description: 'Mengajak anjing berjalan-jalan sore.', sortOrder: 3, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-12-4', categoryId: 'cat-12', name: 'Teman Jalan Hewan', slug: 'teman-jalan-pet', icon: 'Dog', description: 'Bermain dan menemani hewan bosan.', sortOrder: 4, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-12-5', categoryId: 'cat-12', name: 'Antar Dokter Hewan', slug: 'pet-doctor', icon: 'Activity', description: 'Bantu antar periksa ke vet.', sortOrder: 5, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

      // Category 13: Lansia & Keluarga (cat-13)
      { id: 'sub-13-1', categoryId: 'cat-13', name: 'Pendamping Lansia', slug: 'pendamping-lansia-kel', icon: 'Heart', description: 'Teman berbincang dan menemani kakek/nenek.', sortOrder: 1, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-13-2', categoryId: 'cat-13', name: 'Pendamping Rumah Sakit', slug: 'pendamping-rs', icon: 'Activity', description: 'Temani lansia antre obat dan kontrol medis.', sortOrder: 2, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-13-3', categoryId: 'cat-13', name: 'Teman Jalan Lansia', slug: 'teman-jalan-lansia', icon: 'Smile', description: 'Ajak lansia jalan santai hirup udara segar.', sortOrder: 3, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-13-4', categoryId: 'cat-13', name: 'Pendamping Anak', slug: 'pendamping-anak', icon: 'Smile', description: 'Membantu anak-anak bermain / belajar.', sortOrder: 4, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

      // Category 14: Pengiriman & Logistik (cat-14)
      { id: 'sub-14-1', categoryId: 'cat-14', name: 'Kurir Instan', slug: 'kurir-instan', icon: 'Zap', description: 'Kirim kilat dalam kota.', sortOrder: 1, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-14-2', categoryId: 'cat-14', name: 'Pengiriman Motor', slug: 'kirim-motor', icon: 'Bike', description: 'Jasa kirim / kendarai motor antar lokasi.', sortOrder: 2, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-14-3', categoryId: 'cat-14', name: 'Pickup Barang', slug: 'pickup-barang', icon: 'Truck', description: 'Layanan pickup barang berat.', sortOrder: 3, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-14-4', categoryId: 'cat-14', name: 'Jasa Angkut', slug: 'jasa-angkut', icon: 'Move', description: 'Bantu angkat pindahan lemari/kulkas.', sortOrder: 4, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'sub-14-5', categoryId: 'cat-14', name: 'Pindahan', slug: 'pindahan-logistik-sub', icon: 'Truck', description: 'Jasa angkut lengkap pindah rumah / ruko.', sortOrder: 5, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];

    localStorage.setItem(SUBCATEGORIES_KEY, JSON.stringify(seedSubcategories));
    subcategories = seedSubcategories;
  }

  if (categoryId) {
    return subcategories.filter(s => s.categoryId === categoryId);
  }
  return subcategories;
}

export function saveServiceCategories(list: ServiceCategory[]) {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(list));
}

export function saveServiceSubCategories(list: ServiceSubCategory[]) {
  localStorage.setItem(SUBCATEGORIES_KEY, JSON.stringify(list));
}

export function addServiceCategory(category: Omit<ServiceCategory, 'id' | 'createdAt' | 'updatedAt'>): ServiceCategory {
  const list = getServiceCategories();
  const newCat: ServiceCategory = {
    ...category,
    id: `cat-${Math.floor(100 + Math.random() * 900)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  list.push(newCat);
  saveServiceCategories(list);
  return newCat;
}

export function updateServiceCategory(category: ServiceCategory): void {
  const list = getServiceCategories();
  const idx = list.findIndex(c => c.id === category.id);
  if (idx > -1) {
    list[idx] = {
      ...category,
      updatedAt: new Date().toISOString()
    };
    saveServiceCategories(list);
  }
}

export function deleteServiceCategory(id: string): void {
  const list = getServiceCategories();
  const idx = list.findIndex(c => c.id === id);
  if (idx > -1) {
    // Soft delete / flag inactive
    list[idx].isActive = false;
    list[idx].updatedAt = new Date().toISOString();
    saveServiceCategories(list);
  }
}

export function addServiceSubCategory(sub: Omit<ServiceSubCategory, 'id' | 'createdAt' | 'updatedAt'>): ServiceSubCategory {
  const list = getServiceSubCategories();
  const newSub: ServiceSubCategory = {
    ...sub,
    id: `sub-${Math.floor(100 + Math.random() * 900)}-${Math.floor(10 + Math.random() * 90)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  list.push(newSub);
  saveServiceSubCategories(list);
  return newSub;
}

export function updateServiceSubCategory(sub: ServiceSubCategory): void {
  const list = getServiceSubCategories();
  const idx = list.findIndex(s => s.id === sub.id);
  if (idx > -1) {
    list[idx] = {
      ...sub,
      updatedAt: new Date().toISOString()
    };
    saveServiceSubCategories(list);
  }
}

export function deleteServiceSubCategory(id: string): void {
  const list = getServiceSubCategories();
  const idx = list.findIndex(s => s.id === id);
  if (idx > -1) {
    // Soft delete / flag inactive
    list[idx].isActive = false;
    list[idx].updatedAt = new Date().toISOString();
    saveServiceSubCategories(list);
  }
}
