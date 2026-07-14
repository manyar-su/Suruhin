import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Clock, 
  ThumbsUp, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  ChevronRight, 
  Smartphone, 
  ShieldAlert,
  Send,
  Zap,
  UserCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  getSystemConfig, 
  getBookings, 
  saveBookings, 
  getExtensions, 
  saveExtensions, 
  getTips, 
  addAuditLog, 
  addNotification 
} from '../../data/mockExtensionData';
import { Booking, ServiceExtension, Talent, Tip } from '../../types';

interface TalentExtensionDashboardProps {
  currentUser: Talent;
  balance: number;
  setBalance: (updater: number | ((prev: number) => number)) => void;
}

export function TalentExtensionDashboard({ currentUser, balance, setBalance }: TalentExtensionDashboardProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [extensions, setExtensions] = useState<ServiceExtension[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  
  // Extension form state (Talent initiating)
  const [minutesToRequest, setMinutesToRequest] = useState(30);
  const [priceType, setPriceType] = useState<'auto' | 'custom'>('auto');
  const [customPrice, setCustomPrice] = useState(20000);
  const [requestReason, setRequestReason] = useState('Kesepakatan bersama');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const systemConfig = getSystemConfig();

  const loadData = () => {
    const allBookings = getBookings(currentUser.id);
    setBookings(allBookings);
    
    // Find first active/confirmed or extension-related booking to simulate live action
    const live = allBookings.find(b => 
      b.status === 'confirmed' || 
      b.status === 'REQUESTED_EXTENSION' || 
      b.status === 'WAITING_CUSTOMER_APPROVAL' || 
      b.status === 'WAITING_PAYMENT' || 
      b.status === 'EXTENSION_ACTIVE' || 
      b.status === 'EXTENSION_DISPUTED'
    );
    setActiveBooking(live || null);

    // Filter extensions and tips for this talent
    const allExts = getExtensions();
    // Filter matching extensions for our bookings
    const bookingIds = allBookings.map(b => b.id);
    const myExts = allExts.filter(ext => bookingIds.includes(ext.bookingId));
    setExtensions(myExts);

    const allTips = getTips();
    const myTips = allTips.filter(t => t.talentId === currentUser.id);
    setTips(myTips);
  };

  useEffect(() => {
    loadData();

    // Listen to custom notification updates
    const handleSync = () => loadData();
    window.addEventListener('suruhin_notifications_updated', handleSync);
    return () => window.removeEventListener('suruhin_notifications_updated', handleSync);
  }, [currentUser.id]);

  // Calculations for dashboard metrics
  const approvedExtensions = extensions.filter(e => e.status === 'approved' || e.status === 'completed');
  const totalTips = tips.reduce((sum, t) => sum + t.amount, 0);
  const totalOvertimeEarned = approvedExtensions.reduce((sum, e) => sum + (e.approvedPrice || e.requestedPrice), 0);
  const totalOvertimeMinutes = approvedExtensions.reduce((sum, e) => sum + e.requestedMinutes, 0);

  // Hardcoded or computed dynamic ranges for requested statistics
  const pendapatanHariIni = 145000 + totalOvertimeEarned + totalTips; // Base today + live tips/overtime
  const pendapatanMingguIni = 680000 + totalOvertimeEarned + totalTips;
  const pendapatanBulanIni = 2450000 + totalOvertimeEarned + totalTips;

  // Handler: Propose extension
  const handleProposeExtension = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBooking) return;

    setErrorMsg('');
    setSuccessMsg('');

    const suggestedPrice = priceType === 'auto' 
      ? (minutesToRequest === 30 ? systemConfig.hourlyOvertimeRate / 2 : systemConfig.hourlyOvertimeRate * (minutesToRequest / 60))
      : customPrice;

    const allExts = getExtensions();
    const newExt: ServiceExtension = {
      id: `EXT-${Math.floor(100 + Math.random() * 900)}`,
      bookingId: activeBooking.id,
      requestedBy: 'talent',
      requestedMinutes: minutesToRequest,
      requestedPrice: suggestedPrice,
      approvedPrice: suggestedPrice,
      paymentType: '',
      status: 'pending',
      reason: requestReason,
      createdAt: new Date().toISOString()
    };

    allExts.unshift(newExt);
    saveExtensions(allExts);

    // Update booking status
    const allBookings = getBookings();
    const targetBkg = allBookings.find(b => b.id === activeBooking.id);
    if (targetBkg) {
      targetBkg.status = 'WAITING_CUSTOMER_APPROVAL';
      saveBookings(allBookings);
    }

    addAuditLog(activeBooking.id, 'EXTENSION_PROPOSED_BY_TALENT', 'talent', `Talent mengajukan perpanjangan ${minutesToRequest} menit dengan biaya Rp ${suggestedPrice}. Alasan: ${requestReason}`);
    addNotification('Permintaan Perpanjangan', `Talent mengajukan perpanjangan ${minutesToRequest} menit (Rp ${suggestedPrice.toLocaleString('id-ID')}). Harap tinjau di Dashboard Pengguna.`, 'request');

    setSuccessMsg('Pengajuan perpanjangan berhasil dikirimkan ke pelanggan!');
    loadData();
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Handler: Approve customer's extension request
  const handleApproveCustomerRequest = (extId: string) => {
    const allExts = getExtensions();
    const targetExt = allExts.find(e => e.id === extId);
    if (!targetExt) return;

    targetExt.status = 'approved';
    targetExt.approvedAt = new Date().toISOString();
    
    // Change booking to WAITING_PAYMENT or EXTENSION_ACTIVE directly depending on payment
    const allBookings = getBookings();
    const bkg = allBookings.find(b => b.id === targetExt.bookingId);
    if (bkg) {
      // If customer balance is enough, auto-approve and make active, otherwise wait payment
      bkg.status = 'WAITING_PAYMENT';
    }

    saveExtensions(allExts);
    saveBookings(allBookings);

    addAuditLog(targetExt.bookingId, 'EXTENSION_APPROVED_BY_TALENT', 'talent', `Talent menyetujui pengajuan perpanjangan dari pelanggan untuk perpanjangan ID ${targetExt.id}`);
    addNotification('Perpanjangan Disetujui', `Talent menyetujui permintaan perpanjangan ${targetExt.requestedMinutes} menit. Menunggu pelunasan pembayaran tambahan.`, 'approved');
    
    loadData();
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  // Find incoming pending extensions initiated by Customer
  const pendingCustomerRequests = extensions.filter(e => e.status === 'pending' && e.requestedBy === 'customer');

  return (
    <div className="space-y-8 text-left">
      
      {/* 12. Dashboard Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs">
          <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Pendapatan Hari Ini</span>
          <span className="text-sm font-black text-[#082B5C] flex items-center gap-0.5">
            <DollarSign size={14} className="text-[#FF6500]" />
            {formatIDR(pendapatanHariIni)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs">
          <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Pendapatan Minggu Ini</span>
          <span className="text-sm font-black text-[#082B5C] flex items-center gap-0.5">
            <DollarSign size={14} className="text-[#FF6500]" />
            {formatIDR(pendapatanMingguIni)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs">
          <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Pendapatan Bulan Ini</span>
          <span className="text-sm font-black text-[#082B5C] flex items-center gap-0.5">
            <DollarSign size={14} className="text-[#FF6500]" />
            {formatIDR(pendapatanBulanIni)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs">
          <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Total Tips Masuk</span>
          <span className="text-sm font-black text-[#18A957] flex items-center gap-0.5">
            <ThumbsUp size={13} />
            {formatIDR(totalTips)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs col-span-2 md:col-span-1">
          <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Tambahan Waktu</span>
          <span className="text-sm font-black text-[#FF6500] flex items-center gap-0.5">
            <Clock size={13} />
            {totalOvertimeMinutes} Menit
          </span>
        </div>

      </div>

      {/* Grid: Live Action & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Live Active Booking controls */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-[#082B5C] uppercase tracking-wider flex items-center gap-2">
              <Zap size={16} className="text-[#FF6500]" /> Kontrol Waktu Layanan Berlangsung
            </h3>
            <p className="text-[11px] text-gray-400 -mt-2">Berikan proteksi waktu kerja Anda. Ajukan perpanjangan durasi jika jam layanan dirasa melebihi pesanan awal.</p>

            {activeBooking ? (
              <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-4 text-left">
                
                {/* GPS REAL-TIME TRACKING NAVIGATION BUTTON */}
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black bg-[#FF6500] text-white px-2 py-0.5 rounded-md uppercase tracking-wide">FITUR BARU</span>
                    <h4 className="text-xs font-black text-[#082B5C] mt-1">Lacak Perjalanan & Verifikasi PIN</h4>
                    <p className="text-[10px] text-gray-500">Mulai rute perjalanan, bagikan GPS Anda, dan masukan PIN pertemuan dari pelanggan.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      window.history.pushState(null, '', `/pesanan/${activeBooking.id}`);
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#FF6500] hover:bg-[#e05900] text-white text-xs font-extrabold rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition-all active:scale-95 shrink-0"
                  >
                    <span>Mulai Navigasi & Peta</span>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-[#082B5C]">#{activeBooking.id} - {activeBooking.customerName}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Jam Pesanan: {activeBooking.time} WIB ({activeBooking.duration} Jam)</p>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                    {
                      confirmed: 'bg-emerald-50 border-emerald-100 text-emerald-600',
                      REQUESTED_EXTENSION: 'bg-amber-50 border-amber-100 text-amber-600 animate-pulse',
                      WAITING_CUSTOMER_APPROVAL: 'bg-orange-50 border-orange-100 text-orange-500',
                      WAITING_PAYMENT: 'bg-blue-50 border-blue-100 text-blue-600',
                      EXTENSION_ACTIVE: 'bg-emerald-100 border-emerald-200 text-emerald-700 font-extrabold',
                      EXTENSION_DISPUTED: 'bg-purple-100 border-purple-200 text-purple-700'
                    }[activeBooking.status] || 'bg-slate-100 text-slate-500'
                  }`}>
                    {activeBooking.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Incoming Pending Requests from Customer */}
                {pendingCustomerRequests.length > 0 && (
                  <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl space-y-3">
                    <h5 className="text-xs font-bold text-[#FF6500] flex items-center gap-1.5 animate-pulse">
                      <UserCheck size={14} /> Pelanggan Mengajukan Perpanjangan!
                    </h5>
                    {pendingCustomerRequests.map(req => (
                      <div key={req.id} className="text-xs text-gray-600 space-y-2">
                        <p>Durasi: <b>{req.requestedMinutes} menit</b> dengan penawaran upah tambahan <b>{formatIDR(req.requestedPrice)}</b>.</p>
                        {req.reason && <p className="text-[11px] italic">"Alasan: {req.reason}"</p>}
                        <button
                          onClick={() => handleApproveCustomerRequest(req.id)}
                          className="px-4 py-1.5 bg-[#FF6500] hover:bg-[#e05900] text-white text-[10px] font-extrabold rounded-lg transition-colors cursor-pointer"
                        >
                          Setujui Perpanjangan
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Form to submit extension request (Only if not already requested or waiting) */}
                {activeBooking.status === 'confirmed' && (
                  <form onSubmit={handleProposeExtension} className="pt-2 border-t border-slate-100 space-y-3 text-xs">
                    <h5 className="font-bold text-[#082B5C] uppercase tracking-wider text-[10px]">Ajukan Tambahan Waktu Baru</h5>

                    {successMsg && (
                      <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl font-bold">
                        ✓ {successMsg}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Durasi Tambahan</label>
                        <select 
                          value={minutesToRequest}
                          onChange={(e) => setMinutesToRequest(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-[#082B5C] focus:outline-none"
                        >
                          <option value="30">30 Menit</option>
                          <option value="60">1 Jam</option>
                          <option value="120">2 Jam</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Tipe Biaya Upah</label>
                        <select 
                          value={priceType}
                          onChange={(e) => setPriceType(e.target.value as 'auto' | 'custom')}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-[#082B5C] focus:outline-none"
                        >
                          <option value="auto">Tarif Otomatis</option>
                          <option value="custom">Kesepakatan Kustom</option>
                        </select>
                      </div>
                    </div>

                    {priceType === 'custom' && (
                      <div>
                        <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Nominal Upah Kustom (Rp)</label>
                        <input
                          type="number"
                          value={customPrice}
                          onChange={(e) => setCustomPrice(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-[#082B5C]"
                          min="1000"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Alasan Penambahan</label>
                      <select 
                        value={requestReason}
                        onChange={(e) => setRequestReason(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-[#082B5C] focus:outline-none"
                      >
                        <option value="Kesepakatan bersama">Kesepakatan bersama di lapangan</option>
                        <option value="Aktivitas belum selesai">Aktivitas utama belum selesai</option>
                        <option value="Macet">Macet luar biasa di perjalanan</option>
                        <option value="Perjalanan lebih lama">Rute perjalanan bertambah jauh</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#082B5C] hover:bg-[#061d3f] text-white font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                    >
                      <Send size={12} />
                      Ajukan Tambahan ke Pelanggan
                    </button>
                  </form>
                )}

                {activeBooking.status === 'WAITING_CUSTOMER_APPROVAL' && (
                  <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-xl flex items-center gap-2 text-xs text-[#FF6500] font-semibold">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>Menunggu persetujuan dua arah dari pihak Pelanggan...</span>
                  </div>
                )}

                {activeBooking.status === 'WAITING_PAYMENT' && (
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2 text-xs text-blue-600 font-semibold">
                    <Smartphone size={16} className="shrink-0" />
                    <span>Perpanjangan disetujui! Menunggu konfirmasi pelunasan pembayaran pelanggan.</span>
                  </div>
                )}

                {activeBooking.status === 'EXTENSION_ACTIVE' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 space-y-2">
                    <div className="flex items-center gap-2 font-extrabold">
                      <CheckCircle size={16} className="shrink-0 text-emerald-600" />
                      <span>🟢 Perpanjangan Waktu Aktif Saat Ini!</span>
                    </div>
                    <p className="leading-relaxed">Tarif tambahan dijamin terproteksi dan akan otomatis ditransfer ke saldo dompet Anda setelah masa booking dirampungkan.</p>
                  </div>
                )}

                {activeBooking.status === 'EXTENSION_DISPUTED' && (
                  <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl text-xs text-purple-700 space-y-2">
                    <div className="flex items-center gap-2 font-extrabold">
                      <ShieldAlert size={16} className="shrink-0 text-purple-600" />
                      <span>Sengketa Tambahan Waktu (Held)</span>
                    </div>
                    <p className="leading-relaxed">Terjadi perbedaan kesepakatan waktu lapangan. Tambahan biaya ditahan sementara oleh sistem demi objektivitas hingga admin meninjau kasus ini.</p>
                  </div>
                )}

              </div>
            ) : (
              <p className="text-xs text-gray-400 py-6 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-100">
                Tidak ada pesanan aktif saat ini yang sedang berjalan.
              </p>
            )}
          </div>

          {/* Service Extensions List */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-[#082B5C] uppercase tracking-wider border-b border-slate-50 pb-3 flex items-center gap-1.5">
              <Clock size={16} className="text-[#FF6500]" /> Riwayat Perpanjangan Layanan
            </h3>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {extensions.map((ext) => (
                <div key={ext.id} className="p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100 flex justify-between gap-3 text-left">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-black text-[#082B5C]">{ext.id}</span>
                    <p className="text-[10px] text-gray-400">Booking: #{ext.bookingId} • Tambah {ext.requestedMinutes} Menit</p>
                    {ext.reason && <p className="text-[10px] text-gray-500 italic">"Alasan: {ext.reason}"</p>}
                  </div>
                  <div className="text-right flex flex-col items-end justify-between shrink-0">
                    <span className="text-[10px] font-black text-[#FF6500]">{formatIDR(ext.approvedPrice || ext.requestedPrice)}</span>
                    <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded border bg-white text-slate-400">
                      {ext.status}
                    </span>
                  </div>
                </div>
              ))}

              {extensions.length === 0 && (
                <p className="text-center py-10 text-xs text-gray-400">Belum ada riwayat perpanjangan terekam.</p>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Tips History */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-[#082B5C] uppercase tracking-wider border-b border-slate-50 pb-3 flex items-center gap-1.5">
            <ThumbsUp size={16} className="text-[#FF6500]" /> Riwayat Tips Masuk
          </h3>

          <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
            {tips.map((tip) => (
              <div key={tip.id} className="p-3.5 bg-emerald-50/20 rounded-2xl border border-emerald-100/40 flex justify-between gap-3 items-start text-left">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-[#082B5C]">{formatIDR(tip.amount)}</span>
                  </div>
                  <p className="text-[9px] text-gray-400">Booking: #{tip.bookingId} • {tip.createdAt.split('T')[0]}</p>
                  {tip.message && (
                    <p className="text-[10px] text-gray-500 italic">"{tip.message}"</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-black uppercase">Tips Received</span>
                </div>
              </div>
            ))}

            {tips.length === 0 && (
              <p className="text-center py-10 text-xs text-gray-400">Belum menerima pemberian tips dari pelanggan.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
