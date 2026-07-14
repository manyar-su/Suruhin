export interface LocationItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  isPopular: boolean;
}

export const locations: LocationItem[] = [
  {
    id: 'loc-1',
    name: 'Kota Tasikmalaya',
    slug: 'kota-tasikmalaya',
    description: 'Pusat layanan harian terlengkap, mencakup Cihideung, Tawang, Cipedes, Indihiang, Kawalu, dan sekitarnya.',
    isPopular: true
  },
  {
    id: 'loc-2',
    name: 'Kabupaten Tasikmalaya',
    slug: 'kabupaten-tasikmalaya',
    description: 'Layanan harian, pertanian, wisata, dan pengantaran mencakup Singaparna, Ciawi, Karangnunggal, dll.',
    isPopular: true
  },
  {
    id: 'loc-3',
    name: 'Ciamis',
    slug: 'ciamis',
    description: 'Menjangkau wilayah Ciamis kota, Sindangkasih, Kawali, hingga perbatasan Tasikmalaya.',
    isPopular: false
  },
  {
    id: 'loc-4',
    name: 'Banjar',
    slug: 'banjar',
    description: 'Pelayanan mencakup Kota Banjar, Pataruman, Purwaharja, Langensari, dan sekitarnya.',
    isPopular: false
  },
  {
    id: 'loc-5',
    name: 'Garut',
    slug: 'garut',
    description: 'Layanan pendamping pendakian gunung, hobi, wisata kawah, dan pengantaran barang lokal.',
    isPopular: false
  },
  {
    id: 'loc-6',
    name: 'Bandung',
    slug: 'bandung',
    description: 'Layanan penghubung antar-kota (Tasikmalaya-Bandung), titip barang khusus, dan jasa digital.',
    isPopular: false
  }
];
