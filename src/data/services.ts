import { Service } from '../types';

export const services: Service[] = [
  {
    id: 'srv-1',
    slug: 'antar-jemput-sekolah',
    title: 'Antar Jemput Sekolah Anak',
    category: 'antar-jemput',
    categoryName: 'Antar Jemput',
    shortDescription: 'Layanan antar jemput anak sekolah aman, nyaman, dan tepat waktu untuk area Tasikmalaya.',
    description: 'Khawatir anak terlambat atau tidak ada yang mengantar? Layanan Antar Jemput Sekolah dari Suruhin siap membantu. Talent kami telah melewati verifikasi identitas ketat, memiliki SIM aktif, catatan berkendara yang aman, serta armada kendaraan yang terawat dengan baik. Kami berkomitmen memberikan perjalanan terbaik bagi buah hati Anda dari rumah langsung ke gerbang sekolah dan sebaliknya.',
    location: 'Kota Tasikmalaya & sekitarnya',
    price: 25000,
    rating: 4.9,
    reviewCount: 320,
    image: 'antar-sekolah.webp',
    featured: true,
    included: [
      'Penjemputan tepat waktu sesuai jadwal',
      'Pengantaran langsung ke sekolah/rumah',
      'Kendaraan bersih, prima, dan ber-AC (jika mobil)',
      'Update status penjemputan & pelacakan live via WhatsApp',
      'Sudah termasuk BBM dan parkir dasar'
    ],
    excluded: [
      'Biaya tol (jika ada)',
      'Pembelian makanan ringan di jalan',
      'Penungguan di luar batas toleransi (maksimal 15 menit)'
    ],
    faqs: [
      {
        q: 'Bagaimana cara memastikan anak saya aman dengan Talent?',
        a: 'Semua Talent antar-jemput kami telah melalui verifikasi KTP, wawancara langsung, memiliki SIM aktif, SKCK (Surat Keterangan Catatan Kepolisian), serta ulasan rekam berkendara yang dinilai berkala oleh tim operasional Suruhin.'
      },
      {
        q: 'Apakah saya bisa berlangganan bulanan?',
        a: 'Ya, Anda bisa memesan harian atau berdiskusi dengan tim bantuan kami untuk opsi langganan mingguan maupun bulanan dengan harga khusus.'
      }
    ]
  },
  {
    id: 'srv-2',
    slug: 'antar-jemput-kerja',
    title: 'Antar Jemput Kerja Harian',
    category: 'antar-jemput',
    categoryName: 'Antar Jemput',
    shortDescription: 'Pergi dan pulang kerja tanpa pusing macet atau parkir. Talent siap jemput di depan rumah.',
    description: 'Hindari stres akibat macetnya jalanan Tasikmalaya saat jam berangkat atau pulang kantor. Talent Suruhin siap mengantar Anda dengan aman menggunakan sepeda motor atau mobil pribadi. Sangat cocok bagi pekerja kantoran, ASN, atau pelaku usaha yang membutuhkan tumpangan handal setiap harinya.',
    location: 'Kota & Kab. Tasikmalaya',
    price: 30000,
    rating: 4.8,
    reviewCount: 145,
    image: 'antar-kerja.webp',
    featured: false,
    included: [
      'Talent mengemudi dengan santun dan aman',
      'Kendaraan siap pakai & bersih',
      'Helm berstandar SNI bersih untuk penumpang (jika motor)',
      'BBM tercover sesuai jarak pesanan'
    ],
    excluded: [
      'Biaya parkir kantor harian',
      'Biaya tol antar wilayah kabupaten'
    ]
  },
  {
    id: 'srv-3',
    slug: 'temenin-nonton',
    title: 'Teman Nonton Bioskop & Event',
    category: 'temenin',
    categoryName: 'Temen-in',
    shortDescription: 'Ingin nonton film terbaru tapi tidak ada teman? Cari teman nonton asyik di sini.',
    description: 'Menonton film seru di bioskop (seperti Cinema XXI Tasikmalaya) atau menghadiri konser festival seni terasa kurang lengkap tanpa ada teman berbagi tawa, tangis, atau diskusi seru. Layanan ini menghubungkan Anda dengan Talent ramah, sopan, dan memiliki minat film/seni yang sefrekuensi. Hanya berlaku untuk aktivitas legal, sopan, dan aman.',
    location: 'Mall Tasikmalaya (Asia Plaza, dll)',
    price: 35000,
    rating: 4.9,
    reviewCount: 185,
    image: 'temenin-nonton.webp',
    featured: true,
    included: [
      'Teman mengobrol & diskusi film/acara',
      'Menemani dari awal masuk studio hingga film berakhir',
      'Sopan, santun, menjaga privasi dan batasan kenyamanan',
      'Talent berpakaian rapi dan wangi'
    ],
    excluded: [
      'Tiket bioskop Talent (harus dibelikan oleh Pengguna)',
      'Makanan, minuman, dan camilan Talent',
      'Biaya transportasi Talent di luar area Tasikmalaya'
    ],
    faqs: [
      {
        q: 'Apakah layanan ini aman dan resmi?',
        a: 'Sangat aman! Seluruh aktivitas berteman dilakukan di area publik (bioskop mall). Talent kami dilarang keras melakukan tindakan yang tidak senonoh atau melanggar hukum. Kami mengutamakan kesopanan dan batas profesional.'
      }
    ]
  },
  {
    id: 'srv-4',
    slug: 'temenin-makan-ngopi',
    title: 'Teman Kuliner, Makan & Ngopi',
    category: 'temenin',
    categoryName: 'Temen-in',
    shortDescription: 'Eksplorasi kafe hits atau kuliner legendaris Tasikmalaya bersama teman ngobrol yang seru.',
    description: 'Bosan makan sendiri atau ingin mencoba coffee shop baru di sekitar Tasikmalaya tapi tidak punya teman? Cari Talent Suruhin untuk menemani Anda bersantap kuliner khas seperti Bakso Laksana, Nasi To, atau sekadar nongkrong ngopi santai sambil bertukar pikiran. Talent kami ramah, komunikatif, dan siap menjadi pendengar yang baik.',
    location: 'Kafe & Resto di Tasikmalaya',
    price: 30000,
    rating: 4.7,
    reviewCount: 96,
    image: 'temenin-makan.webp',
    featured: false,
    included: [
      'Teman bersantap dan berdiskusi interaktif',
      'Rekomendasi kuliner lokal Tasikmalaya terpopuler',
      'Sopan, menghargai privasi dan etika makan bersama'
    ],
    excluded: [
      'Biaya makanan & minuman Talent (ditanggung Pengguna)',
      'Uang tips tambahan'
    ]
  },
  {
    id: 'srv-5',
    slug: 'temenin-hiking',
    title: 'Teman Hiking Gunung & Alam',
    category: 'temenin',
    categoryName: 'Temen-in',
    shortDescription: 'Eksplorasi Gunung Galunggung atau perbukitan Tasikmalaya dengan teman yang berpengalaman.',
    description: 'Ingin mendaki Gunung Galunggung, bersantai ke Kawah, atau treking ke Curug-curug indah di Tasikmalaya tetapi ragu berjalan sendirian? Layanan Teman Hiking menghadirkan Talent yang memiliki ketahanan fisik prima, memahami rute alam Tasikmalaya, dan siap mengawal perjalanan Anda sehingga lebih aman, terarah, dan menyenangkan.',
    location: 'Gunung Galunggung, Curug, & Area Outdoor',
    price: 75000,
    rating: 4.9,
    reviewCount: 142,
    image: 'temenin-hiking.webp',
    featured: true,
    included: [
      'Pendampingan pendakian sepanjang rute yang disepakati',
      'Navigasi jalur aman dan tip treking dasar',
      'Talent membawa peralatan keselamatan standar & P3K',
      'Bantuan dokumentasi foto/video di spot terbaik'
    ],
    excluded: [
      'Tiket masuk kawasan wisata/retribusi alam (Pengguna & Talent)',
      'Peralatan camping pribadi (sewa tenda, carrier, dll)',
      'Logistik/makanan selama aktivitas luar ruangan'
    ],
    faqs: [
      {
        q: 'Apakah Talent merupakan pemandu profesional?',
        a: 'Talent kami adalah penggiat alam bebas lokal yang berpengalaman di jalur pendakian Tasikmalaya, namun bukan pemandu bersertifikat internasional. Mereka bertindak sebagai teman perjalanan yang mengerti jalur dan tips keselamatan.'
      }
    ]
  },
  {
    id: 'srv-6',
    slug: 'temenin-camping',
    title: 'Teman Camping & Outdoor Camp',
    category: 'temenin',
    categoryName: 'Temen-in',
    shortDescription: 'Camping asyik tanpa ribet sendirian. Pasang tenda, bikin api unggun, seru bareng.',
    description: 'Ingin mencoba sensasi berkemah di Karaha Bodas, Pineus Forest, atau perbukitan asri Tasikmalaya? Sewa teman camping untuk membantu Anda memasang tenda, menyiapkan api unggun, menyeduh kopi malam, dan berbagi cerita di bawah bintang-bintang secara aman dan menyenangkan. Sangat cocok untuk pemula yang ingin camping pertama kali.',
    location: 'Bumi Perkemahan Tasikmalaya',
    price: 90000,
    rating: 4.8,
    reviewCount: 68,
    image: 'temenin-camping.webp',
    featured: false,
    included: [
      'Bantuan pemasangan dan pembongkaran tenda',
      'Teman berjaga malam dan menyiapkan api unggun/kompor portable',
      'Menemani mengobrol santai dan game ringan camping'
    ],
    excluded: [
      'Tenda dan perlengkapan tidur (bisa dikoordinasikan untuk sewa)',
      'Bahan makanan/logistik camping',
      'Retribusi lahan perkemahan'
    ]
  },
  {
    id: 'srv-7',
    slug: 'teman-olahraga',
    title: 'Teman Olahraga (Sparring & Jogging)',
    category: 'olahraga-hobi',
    categoryName: 'Olahraga & Hobi',
    shortDescription: 'Cari sparring partner badminton, tenis, futsal, atau teman lari pagi/jogging santai.',
    description: 'Sulit berolahraga karena tidak ada lawan main atau teman lari pagi? Layanan Teman Olahraga mencocokkan Anda dengan Talent aktif yang siap menjadi sparring partner badminton di GOR lokal, jogging pagi di Dadaha, bersepeda santai, atau bermain tenis meja. Olahraga jadi lebih konsisten dan penuh motivasi.',
    location: 'GOR Dadaha, Lapangan, & Fasilitas Olahraga',
    price: 35000,
    rating: 4.8,
    reviewCount: 122,
    image: 'teman-olahraga.webp',
    featured: true,
    included: [
      'Sparring partner badminton, futsal, tenis, atau lari',
      'Talent memiliki tingkat keahlian olahraga sesuai deskripsi profil',
      'Penyemangat latihan fisik harian'
    ],
    excluded: [
      'Biaya sewa lapangan GOR (ditanggung Pengguna)',
      'Sewa shuttlecock, bola, atau raket untuk Talent (jika tidak punya sendiri)'
    ]
  },
  {
    id: 'srv-8',
    slug: 'teman-bermain-game',
    title: 'Teman Mabar Game (eSports & Boardgame)',
    category: 'olahraga-hobi',
    categoryName: 'Olahraga & Hobi',
    shortDescription: 'Main bareng (mabar) Mobile Legends, PUBG, Valorant, atau Boardgame santai.',
    description: 'Bosan dapet tim publik "beban" saat ranked match? Layanan ini mencocokkan Anda dengan Talent gamer berpengalaman untuk mabar game favorit seperti Mobile Legends, PUBG Mobile, Valorant, atau game konsol/boardgame lokal. Talent kami suportif, komunikatif, tidak toxic, dan siap push rank bareng.',
    location: 'Online atau Kafe Game Tasikmalaya',
    price: 20000,
    rating: 4.9,
    reviewCount: 210,
    image: 'teman-game.webp',
    featured: false,
    included: [
      'Mabar game pilihan berdurasi sesuai pesanan',
      'Talent menggunakan akun berspesifikasi setara / siap menyesuaikan',
      'Komunikasi voice chat yang ramah dan taktis (no toxic)'
    ],
    excluded: [
      'Biaya billing warnet / internet café (jika bertemu langsung)',
      'Top up diamond/item game Talent'
    ]
  },
  {
    id: 'srv-9',
    slug: 'titip-belanja-harian',
    title: 'Jasa Titip & Belanja Harian',
    category: 'titip-belanja',
    categoryName: 'Titip & Belanja',
    shortDescription: 'Titip belanja sayur di pasar, bahan pokok di supermarket, atau obat di apotek.',
    description: 'Tidak sempat keluar rumah, sedang sakit, atau malas mengantre di pasar tradisional? Suruhin saja! Talent kami siap pergi ke pasar Cikurubuk, Asia Plaza, swalayan terdekat, atau apotek pilihan Anda untuk membelikan bahan masakan, kebutuhan rumah tangga, atau obat-obatan. Semua dibeli dengan nota transparan dan dikirim langsung ke rumah Anda.',
    location: 'Pasar, Swalayan & Apotek terdekat',
    price: 20000,
    rating: 4.9,
    reviewCount: 210,
    image: 'titip-belanja.webp',
    featured: true,
    included: [
      'Talent pergi ke lokasi toko/pasar terpilih',
      'Memilih bahan pangan/barang berkualitas terbaik',
      'Pengantaran kilat ke alamat rumah Anda',
      'Nota belanja diserahkan langsung & difoto via chat'
    ],
    excluded: [
      'Uang belanja barang (harus ditransfer atau ditalangi di awal)',
      'Biaya parkir toko di luar batas normal'
    ]
  },
  {
    id: 'srv-10',
    slug: 'titip-antre',
    title: 'Jasa Titip Antre Layanan Publik',
    category: 'titip-belanja',
    categoryName: 'Titip & Belanja',
    shortDescription: 'Hemat waktu berharga Anda. Biarkan Talent kami mengantre tiket, nomor urut, atau kupon.',
    description: 'Mengantre dokumen dinas, tiket konser, pendaftaran faskes, atau pembelian kuliner viral memakan waktu berjam-jam? Serahkan pada Talent Suruhin. Talent kami siap menggantikan posisi berdiri/duduk Anda di antrean sampai nomor Anda hampir tiba, lalu Anda tinggal datang untuk proses verifikasi akhir.',
    location: 'Kantor Layanan, Loket Tiket, & Toko',
    price: 30000,
    rating: 4.7,
    reviewCount: 74,
    image: 'titip-antre.webp',
    featured: false,
    included: [
      'Talent datang pagi-pagi ke lokasi antrean',
      'Menjaga nomor antrean tetap aman',
      'Memberikan kabar perkembangan nomor antrean berkala via WhatsApp'
    ],
    excluded: [
      'Pengurusan tanda tangan dokumen yang bersifat rahasia negara / wajib sidik jari pribadi dari awal'
    ]
  },
  {
    id: 'srv-11',
    slug: 'antar-barang-lokal',
    title: 'Antar Barang & Dokumen Kilat',
    category: 'antar-barang',
    categoryName: 'Antar Barang',
    shortDescription: 'Kirim paket, dokumen penting, atau makanan lokal instan langsung sampai dalam 1 jam.',
    description: 'Perlu mengirim dokumen mendesak ke kantor rekan kerja, mengirim hadiah ulang tahun untuk sahabat, atau mengantarkan titipan makanan hangat buatan rumah ke keluarga lain di Tasikmalaya? Talent kami siap menjemput barang di titik Anda dan mengantarkannya secara kilat, aman, tanpa transit berhari-hari.',
    location: 'Seluruh Area Tasikmalaya',
    price: 15000,
    rating: 4.9,
    reviewCount: 415,
    image: 'antar-barang.webp',
    featured: true,
    included: [
      'Penjemputan paket langsung ke pintu Anda (door-to-door)',
      'Pengiriman langsung ke penerima dalam hitungan jam',
      'Jaminan keamanan barang tidak rusak di perjalanan'
    ],
    excluded: [
      'Asuransi barang mewah (bernilai di atas Rp2.000.000, mohon koordinasi khusus)',
      'Packing kayu/tambahan dari Talent'
    ]
  },
  {
    id: 'srv-12',
    slug: 'pendamping-lansia',
    title: 'Pendamping Lansia (Teman Ngobrol & Kontrol)',
    category: 'rumah-tangga',
    categoryName: 'Rumah Tangga',
    shortDescription: 'Menemani kakek/nenek berobat ke faskes, jalan santai sore, atau teman ngobrol di rumah.',
    description: 'Sedang sibuk bekerja tetapi ingin orang tua atau kakek-nenek Anda tetap ada yang mendampingi dengan penuh kesabaran? Talent pendamping lansia kami siap menemani aktivitas harian ringan seperti kontrol kesehatan bulanan ke rumah sakit/puskesmas, menemani jalan santai di taman rumah, minum obat tepat waktu, atau sekadar menjadi teman ngobrol yang ramah.',
    location: 'Rumah Tinggal & Faskes Tasikmalaya',
    price: 50000,
    rating: 4.9,
    reviewCount: 88,
    image: 'pendamping-lansia.webp',
    featured: true,
    included: [
      'Menemani jalan kaki ringan, membaca, atau beraktivitas harian',
      'Mengantar dan mendampingi ke klinik / RS untuk kontrol medis',
      'Mengingatkan jadwal minum obat dan istirahat',
      'Sikap yang sopan, penyabar, ramah, dan penuh empati'
    ],
    excluded: [
      'Tindakan medis profesional (seperti pasang infus, kateter, dll – Talent bukan suster medis berlisensi)',
      'Membelikan obat resep dokter di luar anggaran yang dititipkan'
    ]
  },
  {
    id: 'srv-13',
    slug: 'bersih-bersih-rumah-kos',
    title: 'Jasa Bersih-Bersih Rumah & Kosan',
    category: 'rumah-tangga',
    categoryName: 'Rumah Tangga',
    shortDescription: 'Bantu sapu, pel, bersihkan kamar mandi, cuci piring, hingga rapi-rapi kamar kos.',
    description: 'Hunian berdebu membuat kurang nyaman tetapi Anda terlalu lelah setelah seharian kuliah atau bekerja? Talent kebersihan Suruhin siap membersihkan area tinggal Anda secara menyeluruh. Sangat cocok bagi mahasiswa kosan di area UNSIL atau keluarga muda di perumahan Tasikmalaya yang menginginkan kebersihan praktis.',
    location: 'Rumah, Apartemen, & Kos Tasikmalaya',
    price: 40000,
    rating: 4.8,
    reviewCount: 156,
    image: 'bersih-rumah.webp',
    featured: false,
    included: [
      'Menyapu, mengepel lantai seluruh ruangan utama',
      'Membersihkan dan menyikat kamar mandi',
      'Merapikan tempat tidur & mengelap kaca jendela dasar',
      'Mencuci piring kotor harian'
    ],
    excluded: [
      'Pembersihan noda semen/konstruksi berat paska renovasi',
      'Cuci setrika baju dalam jumlah besar (bisa dipesan terpisah)'
    ]
  },
  {
    id: 'srv-14',
    slug: 'pindahan-kosan-lokal',
    title: 'Bantuan Pindahan Kosan & Rumah',
    category: 'rumah-tangga',
    categoryName: 'Rumah Tangga',
    shortDescription: 'Layanan angkut barang, packing kardus, dan sewa motor/mobil angkut pindahan.',
    description: 'Pindahan kosan atau kontrakan baru terasa sangat melelahkan jika dilakukan sendirian. Talent bertenaga prima siap membantu Anda mulai dari merapikan barang (packing), mengangkat kasur/lemari ke atas kendaraan angkut, mengantarkan barang sampai lokasi baru, dan menatanya kembali di kamar baru.',
    location: 'Area Tasikmalaya & sekitarnya',
    price: 85000,
    rating: 4.7,
    reviewCount: 52,
    image: 'pindahan-kos.webp',
    featured: false,
    included: [
      'Bantuan fisik mengangkat & menata barang berat',
      'Talent sopan dan gesit dalam menyusun barang agar aman',
      'Durasi pengerjaan hingga selesai (maksimal 4 jam per sesi)'
    ],
    excluded: [
      'Sewa mobil pickup/box (kecuali ada paket bundling khusus)',
      'Kardus, bubble wrap, dan lakban packing (disediakan Pengguna)'
    ]
  },
  {
    id: 'srv-15',
    slug: 'foto-video-dokumentasi',
    title: 'Jasa Foto & Video Dokumentasi Lokal',
    category: 'digital',
    categoryName: 'Digital & Lainnya',
    shortDescription: 'Dokumentasikan momen lamaran, ulang tahun, wisuda UNSIL, atau konten produk kafe.',
    description: 'Butuh fotografer atau videografer lokal dengan harga terjangkau untuk mengabadikan momen wisuda, pertunangan, ulang tahun anak, atau membuat video cinematic promosi menu kafe Anda di Tasikmalaya? Talent kreatif Suruhin siap merekam momen terbaik Anda dengan kamera profesional atau smartphone berspesifikasi tinggi.',
    location: 'Tasikmalaya Kota',
    price: 95000,
    rating: 4.9,
    reviewCount: 110,
    image: 'jasa-digital.webp',
    featured: true,
    included: [
      'Talent fotografer/videografer berpengalaman',
      'Peralatan kamera/smartphone mumpuni + stabilizer',
      'Penyerahan semua file asli (Google Drive)',
      'Editing dasar untuk foto/video pilihan (maksimal 10 foto/1 video)'
    ],
    excluded: [
      'Cetak foto fisik & bingkai pigura',
      'Sewa studio foto eksternal'
    ]
  },
  {
    id: 'srv-16',
    slug: 'jasa-desain-website',
    title: 'Jasa Desain Grafis & Pembuatan Website',
    category: 'digital',
    categoryName: 'Digital & Lainnya',
    shortDescription: 'Bantu buat logo UMKM, feed Instagram, banner cetak, atau website profil bisnis.',
    description: 'Kembangkan bisnis UMKM Tasikmalaya Anda ke level digital. Talent desainer dan developer kami siap membantu merancang logo profesional, materi konten promosi media sosial, desain menu kafe, hingga pembuatan website company profile / toko online landing page sederhana yang responsif dan cepat.',
    location: 'Online / Pertemuan Tasikmalaya',
    price: 120000,
    rating: 4.8,
    reviewCount: 84,
    image: 'jasa-website.webp',
    featured: false,
    included: [
      'Konsultasi kebutuhan desain/fitur website',
      'Desain modern, orisinal, dan responsif',
      'Revisi minor maksimal 3 kali',
      'Penyerahan file master (Figma/PSD/Source Code)'
    ],
    excluded: [
      'Biaya pembelian domain & hosting tahunan (bisa dipandu pembeliannya)'
    ]
  }
];
