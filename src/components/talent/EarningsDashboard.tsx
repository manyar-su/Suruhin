import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Award, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Search, 
  Filter, 
  ArrowUpRight, 
  Download, 
  Info, 
  CreditCard, 
  ArrowRight,
  ChevronRight,
  Loader2,
  Check
} from 'lucide-react';
import { Talent } from '../../types';

interface OrderItem {
  id: string;
  clientName: string;
  serviceTitle: string;
  categoryName: string;
  date: string;
  amount: number;
  status: 'cair' | 'pending';
  payoutMethod?: string;
  location: string;
}

interface EarningsDashboardProps {
  currentUser: Talent;
  balance: number;
  setBalance: (updater: number | ((prev: number) => number)) => void;
  transactions: any[];
  setTransactions: (updater: any[] | ((prev: any[]) => any[])) => void;
}

export function EarningsDashboard({ 
  currentUser, 
  balance, 
  setBalance, 
  transactions, 
  setTransactions 
}: EarningsDashboardProps) {

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'semua' | 'cair' | 'pending'>('semua');
  const [selectedMonth, setSelectedMonth] = useState<string>('Semua Bulan');
  
  // Withdrawal Form States
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('BCA');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [withdrawName, setWithdrawName] = useState('');
  const [withdrawStep, setWithdrawStep] = useState<1 | 2 | 3>(1);
  const [withdrawError, setWithdrawError] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Dynamic completed orders history state (initialized from localStorage or defaults)
  const [completedOrders, setCompletedOrders] = useState<OrderItem[]>(() => {
    const saved = localStorage.getItem(`suruhin_completed_orders_${currentUser.id}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      { id: 'JOB-701', clientName: 'Dr. Ahmad Fauzi', serviceTitle: 'Antar Jemput Sekolah Anak', categoryName: 'Antar Jemput', date: '14 Juli 2026', amount: 25000, status: 'pending', location: 'SDN 1 Tasikmalaya' },
      { id: 'JOB-702', clientName: 'Siti Rohmah', serviceTitle: 'Teman Lansia Ke Posyandu', categoryName: 'Temenin', date: '13 Juli 2026', amount: 40000, status: 'cair', payoutMethod: 'BCA', location: 'Posyandu Lansia Mawar' },
      { id: 'JOB-703', clientName: 'Budi Santoso', serviceTitle: 'Teman Hiking Gunung Galunggung', categoryName: 'Temenin', date: '12 Juli 2026', amount: 75000, status: 'cair', payoutMethod: 'GoPay', location: 'Gunung Galunggung' },
      { id: 'JOB-704', clientName: 'H. Jajang', serviceTitle: 'Jasa Bersih Kos UNSIL', categoryName: 'Rumah Tangga', date: '10 Juli 2026', amount: 50000, status: 'cair', payoutMethod: 'BCA', location: 'Kos Kahuripan UNSIL' },
      { id: 'JOB-705', clientName: 'Neng Lilis', serviceTitle: 'Titip Antre RSUD dr. Soekardjo', categoryName: 'Titip & Belanja', date: '08 Juli 2026', amount: 35000, status: 'pending', location: 'RSUD dr. Soekardjo' },
      { id: 'JOB-706', clientName: 'Andri Wijaya', serviceTitle: 'Antar Jemput Kerja Harian', categoryName: 'Antar Jemput', date: '05 Juli 2026', amount: 30000, status: 'cair', payoutMethod: 'OVO', location: 'Asia Plaza Mall' }
    ];
  });

  // Save completed orders to local storage when changed
  React.useEffect(() => {
    localStorage.setItem(`suruhin_completed_orders_${currentUser.id}`, JSON.stringify(completedOrders));
  }, [completedOrders, currentUser.id]);

  // Calculations
  const totalCompletedCount = completedOrders.length;
  
  // Balance calculation
  const pendingBalance = completedOrders
    .filter(o => o.status === 'pending')
    .reduce((sum, o) => sum + o.amount, 0);

  const totalEarningsAllTime = balance + pendingBalance + 1250000; // Mock cumulative historically

  // Chart data
  const monthlyData = [
    { month: 'Feb', earnings: 320000, orders: 8 },
    { month: 'Mar', earnings: 450000, orders: 11 },
    { month: 'Apr', earnings: 510000, orders: 13 },
    { month: 'Mei', earnings: 680000, orders: 17 },
    { month: 'Jun', earnings: 820000, orders: 20 },
    { month: 'Jul', earnings: 960000, orders: 24 }
  ];

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  // Handle new withdrawal
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

    setWithdrawStep(2);
    setTimeout(() => {
      // Deduct balance
      setBalance(prev => prev - amountNum);
      
      // Add withdrawal to transaction list
      const newTx = {
        id: `TX-${Math.floor(100 + Math.random() * 900)}`,
        date: 'Baru Saja',
        type: 'withdrawal' as const,
        description: `Pencairan saldo ke ${withdrawMethod}`,
        amount: amountNum,
        status: 'success' as const
      };
      setTransactions((prev: any[]) => [newTx, ...prev]);
      setWithdrawStep(3);
    }, 2000);
  };

  // Filtered orders
  const filteredOrders = completedOrders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.serviceTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'semua' ? true : order.status === statusFilter;

    const matchesMonth = 
      selectedMonth === 'Semua Bulan' ? true : order.date.includes(selectedMonth);

    return matchesSearch && matchesStatus && matchesMonth;
  });

  // Action: Simulated cash out / cairkan single pending order
  const handleCairkanSingleOrder = (orderId: string, amount: number) => {
    // Switch status from pending to cair
    setCompletedOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, status: 'cair', payoutMethod: 'Dompet Suruhin' };
      }
      return o;
    }));

    // Add to balance
    setBalance(prev => prev + amount);

    // Add transaction record
    const newTx = {
      id: `TX-${Math.floor(100 + Math.random() * 900)}`,
      date: 'Baru Saja',
      type: 'payout' as const,
      description: `Pencairan otomatis ${completedOrders.find(o => o.id === orderId)?.serviceTitle}`,
      amount: amount,
      status: 'success' as const
    };
    setTransactions((prev: any[]) => [newTx, ...prev]);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* 1. TOP METRICS BLOCK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Metric 1: Accumulated total */}
        <div className="bg-[#082B5C] p-5 rounded-2xl text-white space-y-1.5 shadow-md relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-10 pointer-events-none transition-transform group-hover:scale-110 duration-500">
            <TrendingUp size={120} />
          </div>
          <div className="flex justify-between items-center opacity-85">
            <span className="text-[10px] font-black uppercase tracking-widest">Total Akumulasi Pendapatan</span>
            <TrendingUp size={15} className="text-[#FF6500]" />
          </div>
          <p className="text-2xl font-black">{formatIDR(totalEarningsAllTime)}</p>
          <div className="flex items-center gap-1 text-[10px] text-blue-200">
            <Award size={11} />
            <span>Kinerja rating aktif: ★ {currentUser.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Metric 2: Disbursed / Cair */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-1.5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center text-gray-400">
              <span className="text-[10px] font-black uppercase tracking-widest">Saldo Siap Cair</span>
              <CheckCircle2 size={15} className="text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-[#082B5C] mt-1">{formatIDR(balance)}</p>
            <span className="block text-[9px] text-gray-400">Telah terverifikasi & siap dipindahkan ke rekening.</span>
          </div>
          
          <button
            onClick={() => {
              setWithdrawStep(1);
              setWithdrawAmount(balance.toString());
              setShowWithdrawModal(true);
            }}
            disabled={balance < 50000}
            className={`w-full mt-3.5 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              balance >= 50000 
                ? 'bg-[#FF6500] hover:bg-[#e05900] text-white shadow-sm shadow-[#FF6500]/10'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CreditCard size={13} />
            Cairkan Ke Rekening
          </button>
        </div>

        {/* Metric 3: Pending / Dalam Proses */}
        <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100/30 space-y-1.5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center text-orange-600">
              <span className="text-[10px] font-black uppercase tracking-widest">Saldo Pending / Ditahan</span>
              <div className="group relative">
                <Info size={14} className="text-orange-500 cursor-pointer" />
                <div className="absolute right-0 bottom-full mb-2 w-52 p-3 bg-slate-900 text-white text-[10px] rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none leading-relaxed z-50 font-normal">
                  Saldo yang pending adalah upah pekerjaan yang baru selesai namun masih dalam proses kliring/verifikasi jaminan keselamatan selama 24 jam.
                </div>
              </div>
            </div>
            <p className="text-2xl font-black text-[#FF6500] mt-1">{formatIDR(pendingBalance)}</p>
            <span className="block text-[9px] text-orange-500/80">Menunggu konfirmasi keamanan penugasan.</span>
          </div>

          <div className="bg-orange-50 rounded-lg p-1.5 border border-orange-100/40 text-[9px] text-orange-600 text-center mt-2 font-bold">
            Klik "Cairkan Segera" di tabel pesanan untuk proses cepat
          </div>
        </div>

      </div>

      {/* 2. CHART SECTION */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-black text-[#082B5C] uppercase tracking-widest">Grafik Pendapatan Bulanan (2026)</h3>
            <p className="text-[11px] text-gray-400">Total akumulasi upah bersih yang diperoleh setiap bulannya</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md border border-emerald-100/30">
              <TrendingUp size={11} /> +14.2% dari kuartal lalu
            </span>
          </div>
        </div>

        {/* Custom Visual interactive bar chart */}
        <div className="w-full bg-slate-50/50 rounded-2xl border border-slate-100/50 p-4 relative">
          
          {/* Y-axis labels */}
          <div className="absolute left-3 inset-y-10 flex flex-col justify-between text-[9px] text-gray-400 font-bold pointer-events-none">
            <span>Rp 1.0M</span>
            <span>Rp 750k</span>
            <span>Rp 500k</span>
            <span>Rp 250k</span>
            <span>0</span>
          </div>

          <div className="h-44 pl-12 flex items-end justify-between relative pt-6">
            {/* Grid Lines */}
            <div className="absolute left-10 right-0 top-0 border-t border-dashed border-gray-100" />
            <div className="absolute left-10 right-0 top-1/4 border-t border-dashed border-gray-100" />
            <div className="absolute left-10 right-0 top-2/4 border-t border-dashed border-gray-100" />
            <div className="absolute left-10 right-0 top-3/4 border-t border-dashed border-gray-100" />
            
            {/* Bars container */}
            {monthlyData.map((item, idx) => {
              // Calc height percentage
              const maxEarnings = 1000000;
              const heightPercent = `${Math.min(100, (item.earnings / maxEarnings) * 100)}%`;
              
              return (
                <div key={idx} className="flex-1 flex flex-col items-center group relative z-10">
                  {/* Tooltip on Hover */}
                  <div className="absolute bottom-full mb-1.5 bg-[#082B5C] text-white text-[9px] font-bold px-2 py-1 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                    <div className="text-center">
                      <span className="block font-black text-orange-400">{formatIDR(item.earnings)}</span>
                      <span className="text-[8px] text-blue-200">{item.orders} Order Selesai</span>
                    </div>
                  </div>

                  {/* Active Month Bar */}
                  <div className="w-7 sm:w-12 bg-slate-100 group-hover:bg-slate-200/50 rounded-t-lg transition-all duration-300 h-full flex items-end">
                    <div
                      style={{ height: heightPercent }}
                      className="w-full bg-gradient-to-t from-[#082B5C] to-[#FF6500] group-hover:from-[#0a3570] group-hover:to-[#ff751a] rounded-t-lg shadow-xs cursor-pointer transition-all duration-300"
                    />
                  </div>
                  <span className="text-[9px] text-[#082B5C] font-black mt-2">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. DETAILED COMPLETED ORDERS HISTORY */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 md:p-6 shadow-xs space-y-4">
        
        {/* Header and Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-black text-[#082B5C] uppercase tracking-widest">Riwayat Pesanan Selesai ({filteredOrders.length})</h3>
            <p className="text-[11px] text-gray-400">Semua riwayat penyelesaian tugas harian yang telah dikerjakan</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                // Download simulated receipt CSV
                alert('Mengunduh Laporan Keuangan Anda dalam format .CSV (Simulasi)...');
              }}
              className="px-3 py-1.5 border border-slate-100 rounded-lg text-[10px] font-bold text-[#082B5C] hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Download size={11} /> Ekspor CSV
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari ID, nama pelanggan, layanan..."
              className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-4 py-2 text-xs text-[#082B5C] font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF6500]"
            />
          </div>

          {/* Month select */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-[#082B5C] font-semibold focus:outline-none cursor-pointer"
          >
            <option value="Semua Bulan">Semua Periode</option>
            <option value="Juli">Juli 2026</option>
            <option value="Juni">Juni 2026</option>
            <option value="Mei">Mei 2026</option>
          </select>

          {/* Status select buttons */}
          <div className="bg-slate-100/80 p-0.5 rounded-xl grid grid-cols-3 text-center text-[10px] font-black text-gray-500">
            <button
              onClick={() => setStatusFilter('semua')}
              className={`py-1 rounded-lg cursor-pointer ${statusFilter === 'semua' ? 'bg-[#082B5C] text-white' : 'hover:text-[#082B5C]'}`}
            >
              Semua
            </button>
            <button
              onClick={() => setStatusFilter('cair')}
              className={`py-1 rounded-lg cursor-pointer ${statusFilter === 'cair' ? 'bg-emerald-600 text-white' : 'hover:text-emerald-600'}`}
            >
              Cair
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`py-1 rounded-lg cursor-pointer ${statusFilter === 'pending' ? 'bg-orange-500 text-white' : 'hover:text-orange-500'}`}
            >
              Pending
            </button>
          </div>
        </div>

        {/* List of Orders */}
        <div className="space-y-3.5 pt-2">
          {filteredOrders.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50 space-y-2">
              <p className="text-xs text-gray-400 font-medium">Tidak ada data pesanan yang cocok dengan kriteria pencarian Anda.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('semua');
                  setSelectedMonth('Semua Bulan');
                }}
                className="text-xs font-bold text-[#FF6500] hover:underline cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div 
                key={order.id} 
                className={`p-4 rounded-2xl border transition-all ${
                  order.status === 'cair' 
                    ? 'bg-white border-slate-100 hover:border-slate-200 shadow-3xs' 
                    : 'bg-orange-50/20 border-orange-100/40 hover:bg-orange-50/30'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  
                  {/* Left Side: Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-[#082B5C]">{order.id}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-[10px] text-gray-400 font-bold">{order.date}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-[10px] font-black text-[#FF6500] bg-orange-50 px-2 py-0.5 rounded-md">
                        {order.categoryName}
                      </span>
                    </div>

                    <h4 className="font-black text-gray-800 text-sm">{order.serviceTitle}</h4>

                    <div className="flex flex-wrap items-center gap-x-3 text-[10px] text-gray-400 font-semibold">
                      <span>Pelanggan: <strong className="text-[#082B5C]">{order.clientName}</strong></span>
                      <span>•</span>
                      <span>Lokasi: <span className="text-gray-600">{order.location}</span></span>
                    </div>
                  </div>

                  {/* Right Side: Amount & Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 border-t sm:border-t-0 border-dashed border-gray-100 pt-2.5 sm:pt-0">
                    
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block font-bold">Upah Bersih</span>
                      <span className="font-black text-[#082B5C] text-sm">{formatIDR(order.amount)}</span>
                    </div>

                    {/* Status badge & Instant Claim button */}
                    <div className="flex items-center gap-2">
                      {order.status === 'cair' ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-100/30 px-2 py-1 rounded-full uppercase">
                          <CheckCircle2 size={10} /> Cair ke {order.payoutMethod || 'BCA'}
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 text-[9px] font-extrabold bg-orange-50 text-orange-600 border border-orange-100/30 px-2 py-1 rounded-full uppercase">
                            <Clock size={10} /> Pending
                          </span>
                          
                          <button
                            onClick={() => handleCairkanSingleOrder(order.id, order.amount)}
                            title="Verifikasi mandiri instan untuk langsung mencairkan saldo ini"
                            className="bg-[#18A957] hover:bg-[#158e49] text-white font-bold text-[9px] px-2 py-1 rounded-md cursor-pointer shadow-3xs flex items-center gap-0.5 transition-all"
                          >
                            Cairkan Segera
                          </button>
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* 4. MODAL WITHDRAWAL FORM */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full p-6 shadow-2xl relative space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-50 text-[#FF6500] rounded-xl">
                  <CreditCard size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#082B5C] uppercase tracking-widest">Pencairan Saldo</h3>
                  <p className="text-[10px] text-gray-400">Tarik saldo aman harian Anda</p>
                </div>
              </div>
              <button 
                onClick={() => setShowWithdrawModal(false)}
                className="p-1 hover:bg-slate-50 rounded-lg text-gray-400 font-extrabold text-xs transition-colors cursor-pointer"
              >
                Tutup [X]
              </button>
            </div>

            {withdrawStep === 1 && (
              <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
                {withdrawError && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center gap-1.5 text-left">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{withdrawError}</span>
                  </div>
                )}

                {/* Info balance */}
                <div className="bg-[#082B5C]/5 p-3.5 rounded-xl border border-[#082B5C]/10 flex items-center justify-between text-xs">
                  <div>
                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Saldo Tersedia</span>
                    <span className="font-black text-[#082B5C] text-sm">{formatIDR(balance)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] bg-[#18A957]/15 text-[#18A957] font-extrabold px-2 py-1 rounded">✓ Bebas Biaya</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Metode Transfer</label>
                  <select
                    value={withdrawMethod}
                    onChange={(e) => setWithdrawMethod(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 text-xs text-[#082B5C] font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="BCA">Bank BCA</option>
                    <option value="Mandiri">Bank Mandiri</option>
                    <option value="BRI">Bank BRI</option>
                    <option value="GoPay">GoPay (E-Wallet)</option>
                    <option value="OVO">OVO (E-Wallet)</option>
                    <option value="Dana">DANA (E-Wallet)</option>
                  </select>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Nomor Rekening / No. HP</label>
                  <input
                    type="text"
                    required
                    value={withdrawAccount}
                    onChange={(e) => setWithdrawAccount(e.target.value)}
                    placeholder="Masukkan nomor rekening lengkap"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 text-xs text-[#082B5C] font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF6500]"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Pemilik Rekening</label>
                  <input
                    type="text"
                    required
                    value={withdrawName}
                    onChange={(e) => setWithdrawName(e.target.value)}
                    placeholder="Nama sesuai identitas bank"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 text-xs text-[#082B5C] font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF6500]"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Jumlah Penarikan (Rp)</label>
                  <div className="relative flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 text-xs">
                    <span className="font-bold text-gray-400 mr-1.5">Rp</span>
                    <input
                      type="number"
                      required
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="Batas minimal Rp 50.000"
                      className="w-full bg-transparent text-[#082B5C] font-black focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-0.5">
                    <span>Min: Rp 50.000</span>
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(balance.toString())}
                      className="text-[#FF6500] font-black hover:underline cursor-pointer"
                    >
                      Tarik Semua Saldo
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#FF6500] hover:bg-[#e05900] text-white font-extrabold rounded-xl text-xs transition-colors cursor-pointer shadow-md shadow-[#FF6500]/10 flex items-center justify-center gap-1.5"
                >
                  Konfirmasi Tarik Dana
                </button>
              </form>
            )}

            {withdrawStep === 2 && (
              <div className="py-12 text-center space-y-4">
                <Loader2 size={36} className="text-[#FF6500] animate-spin mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-[#082B5C]">Menghubungkan Sesi Pembayaran...</h4>
                  <p className="text-[10px] text-gray-400 max-w-[200px] mx-auto leading-relaxed">
                    Mengenkripsi koneksi aman ke server {withdrawMethod} untuk mentransfer dana Anda.
                  </p>
                </div>
              </div>
            )}

            {withdrawStep === 3 && (
              <div className="py-2 space-y-5">
                <div className="w-12 h-12 bg-emerald-50 text-[#18A957] rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 size={24} />
                </div>

                <div className="text-center space-y-1">
                  <h4 className="text-sm font-black text-[#18A957]">Pencairan Berhasil Diproses!</h4>
                  <p className="text-[10px] text-gray-400">Upah hasil jerih payah Anda berhasil dikirimkan.</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 text-xs space-y-2.5 text-left">
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Penerima</span>
                    <span className="font-bold text-[#082B5C]">{withdrawName}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Tujuan</span>
                    <span className="font-semibold text-[#082B5C]">{withdrawMethod} - {withdrawAccount}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500 border-t border-dashed border-gray-200 pt-2">
                    <span>Jumlah Cair</span>
                    <span className="font-black text-[#18A957]">{formatIDR(Number(withdrawAmount))}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setWithdrawStep(1);
                    setWithdrawAmount('');
                    setWithdrawAccount('');
                    setWithdrawName('');
                    setShowWithdrawModal(false);
                  }}
                  className="w-full py-2.5 bg-[#082B5C] hover:bg-[#061e40] text-white text-xs font-black rounded-xl transition-all cursor-pointer"
                >
                  Selesai & Tutup Sesi
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
