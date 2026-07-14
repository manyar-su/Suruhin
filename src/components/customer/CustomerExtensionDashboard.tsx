import React, { useState, useEffect, useRef } from 'react';
import { 
  DollarSign, 
  Clock, 
  ThumbsUp, 
  CheckCircle, 
  AlertCircle, 
  CreditCard,
  QrCode,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  ChevronDown,
  Navigation,
  ExternalLink,
  Lock,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  getSystemConfig, 
  getBookings, 
  saveBookings, 
  getExtensions, 
  saveExtensions, 
  getTips, 
  saveTips, 
  getClientBalance, 
  saveClientBalance, 
  addAuditLog, 
  addNotification 
} from '../../data/mockExtensionData';
import { Booking, ServiceExtension, Tip } from '../../types';

export function CustomerExtensionDashboard() {
  const [balance, setBalance] = useState(getClientBalance());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [extensions, setExtensions] = useState<ServiceExtension[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);
  
  // Live Active Booking
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);

  // Time tracking simulation
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Extension Drawer/Form State
  const [showExtendMenu, setShowExtendMenu] = useState(false);
  const [extendMinutes, setExtendMinutes] = useState(30);
  const [isCustomMinutes, setIsCustomMinutes] = useState(false);
  const [customMinutesVal, setCustomMinutesVal] = useState('45');
  const [negotiatedPrice, setNegotiatedPrice] = useState('auto');
  const [customPriceVal, setCustomPriceVal] = useState('30000');
  const [extendReason, setExtendReason] = useState('Aktivitas belum selesai');
  const [successToast, setSuccessToast] = useState('');

  // Payment State
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [selectedPaymentExt, setSelectedPaymentExt] = useState<ServiceExtension | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'balance' | 'qris' | 'va' | 'ewallet'>('balance');
  const [additionalTip, setAdditionalTip] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Tips Post-Booking Modal State
  const [showTipModal, setShowTipModal] = useState(false);
  const [tipBookingId, setTipBookingId] = useState('');
  const [tipAmount, setTipAmount] = useState(20000);
  const [isCustomTip, setIsCustomTip] = useState(false);
  const [customTipVal, setCustomTipVal] = useState('');
  const [tipMessage, setTipMessage] = useState('');
  const [tipSuccess, setTipSuccess] = useState(false);

  // Notification Banner
  const [timeWarningBanner, setTimeWarningBanner] = useState(false);

  const systemConfig = getSystemConfig();

  const loadData = () => {
    const allBookings = getBookings();
    setBookings(allBookings);
    
    // Find active booking for customer
    const live = allBookings.find(b => 
      b.status === 'confirmed' || 
      b.status === 'REQUESTED_EXTENSION' || 
      b.status === 'WAITING_CUSTOMER_APPROVAL' || 
      b.status === 'WAITING_PAYMENT' || 
      b.status === 'EXTENSION_ACTIVE' || 
      b.status === 'EXTENSION_DISPUTED'
    );
    setActiveBooking(live || null);

    setExtensions(getExtensions());
    setTips(getTips());
    setBalance(getClientBalance());
  };

  useEffect(() => {
    loadData();

    const handleSync = () => loadData();
    window.addEventListener('suruhin_notifications_updated', handleSync);
    return () => window.removeEventListener('suruhin_notifications_updated', handleSync);
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (activeBooking && activeBooking.status === 'confirmed') {
      if (secondsLeft === null) {
        // Start counting down from e.g. 15 minutes and 5 seconds for simulation
        setSecondsLeft(905); 
      }
      
      timerRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev === null || prev <= 0) {
            clearInterval(timerRef.current!);
            return 0;
          }
          const nextVal = prev - 1;
          
          // Trigger "15 Minutes Left" warning exactly at 15m (900 seconds)
          if (nextVal === 900) {
            setTimeWarningBanner(true);
            addNotification('Waktu Layanan Tersisa 15 Menit', '«Waktu layanan tersisa 15 menit.» Anda dapat mengakhiri layanan atau menambah durasi sekarang.', 'time_alert');
          }
          return nextVal;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setSecondsLeft(null);
      setTimeWarningBanner(false);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeBooking]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Helper Calculations
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const totalExpenditure = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'EXTENSION_COMPLETED')
    .reduce((sum, b) => sum + b.total, 0) + 
    extensions.filter(e => e.status === 'completed' || e.status === 'approved').reduce((sum, e) => sum + e.approvedPrice, 0) +
    tips.reduce((sum, t) => sum + t.amount, 0);

  // SIMULATORS (For easy reviewing of complex rules)
  const simulate15MinRemaining = () => {
    setSecondsLeft(900); // 15:00
    setTimeWarningBanner(true);
    addNotification('Waktu Layanan Tersisa 15 Menit', '«Waktu layanan tersisa 15 menit.» Anda dapat mengakhiri layanan atau menambah durasi sekarang.', 'time_alert');
  };

  const simulateIncomingTalentExtension = () => {
    if (!activeBooking) return;
    
    // Update booking status
    const allBkgs = getBookings();
    const bkg = allBkgs.find(b => b.id === activeBooking.id);
    if (bkg) {
      bkg.status = 'WAITING_CUSTOMER_APPROVAL';
      saveBookings(allBkgs);
    }

    // Create a pending extension proposed by talent
    const allExts = getExtensions();
    const newExt: ServiceExtension = {
      id: `EXT-${Math.floor(100 + Math.random() * 900)}`,
      bookingId: activeBooking.id,
      requestedBy: 'talent',
      requestedMinutes: 45,
      requestedPrice: 30000,
      approvedPrice: 30000,
      paymentType: '',
      status: 'pending',
      reason: 'Aktivitas pengantaran terhambat kemacetan panjang di pusat kota',
      createdAt: new Date().toISOString()
    };
    allExts.unshift(newExt);
    saveExtensions(allExts);

    addAuditLog(activeBooking.id, 'EXTENSION_PROPOSED_BY_TALENT', 'talent', 'Talent mengajukan perpanjangan 45 menit (Rp 30.000). Alasan: Macet.');
    addNotification('Permintaan Perpanjangan', 'Talent mengajukan perpanjangan 45 menit demi keselamatan rute. Silakan beri keputusan.', 'request');
    loadData();
  };

  const simulateCompleteBooking = () => {
    if (!activeBooking) return;
    
    const allBkgs = getBookings();
    const bkg = allBkgs.find(b => b.id === activeBooking.id);
    if (bkg) {
      bkg.status = 'EXTENSION_COMPLETED';
      saveBookings(allBkgs);
    }

    addAuditLog(activeBooking.id, 'BOOKING_COMPLETED', 'system', 'Booking dinyatakan selesai sepenuhnya.');
    addNotification('Layanan Selesai', 'Terima kasih telah menggunakan jasa Suruhin! Berikan apresiasi tips Anda ke Talent.', 'completed');
    
    setTipBookingId(activeBooking.id);
    setShowTipModal(true);
    loadData();
  };

  const simulateDisputedBooking = () => {
    if (!activeBooking) return;

    const allBkgs = getBookings();
    const bkg = allBkgs.find(b => b.id === activeBooking.id);
    if (bkg) {
      bkg.status = 'EXTENSION_DISPUTED';
      saveBookings(allBkgs);
    }

    const allExts = getExtensions();
    const target = allExts.find(e => e.bookingId === activeBooking.id && e.status === 'pending');
    if (target) {
      target.status = 'disputed';
    } else {
      // Create a disputed extension
      const disputedExt: ServiceExtension = {
        id: `EXT-${Math.floor(100 + Math.random() * 900)}`,
        bookingId: activeBooking.id,
        requestedBy: 'talent',
        requestedMinutes: 60,
        requestedPrice: 40000,
        approvedPrice: 40000,
        paymentType: 'balance',
        status: 'disputed',
        reason: 'Sengketa ketidaksesuaian jam pengerjaan di lapangan',
        createdAt: new Date().toISOString()
      };
      allExts.unshift(disputedExt);
    }
    saveExtensions(allExts);

    addAuditLog(activeBooking.id, 'EXTENSION_DISPUTED', 'customer', 'Pelanggan melaporkan sengketa jam pengerjaan. Dana tambahan ditahan sementara (Held).');
    addNotification('Transaksi Ditahan', 'Perpanjangan bersengketa. Dana tambahan berstatus Held di server aman admin.', 'info');
    loadData();
  };

  // Submit Extension Request (Client Initiating)
  const handleRequestExtension = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBooking) return;

    const finalMinutes = isCustomMinutes ? Number(customMinutesVal) : extendMinutes;
    const autoPrice = finalMinutes === 30 ? systemConfig.hourlyOvertimeRate / 2 : systemConfig.hourlyOvertimeRate * (finalMinutes / 60);
    const finalPrice = negotiatedPrice === 'auto' ? autoPrice : Number(customPriceVal);

    // Create extension
    const allExts = getExtensions();
    const newExt: ServiceExtension = {
      id: `EXT-${Math.floor(100 + Math.random() * 900)}`,
      bookingId: activeBooking.id,
      requestedBy: 'customer',
      requestedMinutes: finalMinutes,
      requestedPrice: finalPrice,
      approvedPrice: finalPrice,
      paymentType: '',
      status: 'pending',
      reason: extendReason,
      createdAt: new Date().toISOString()
    };
    allExts.unshift(newExt);
    saveExtensions(allExts);

    // Change booking status
    const allBkgs = getBookings();
    const bkg = allBkgs.find(b => b.id === activeBooking.id);
    if (bkg) {
      bkg.status = 'REQUESTED_EXTENSION';
      saveBookings(allBkgs);
    }

    addAuditLog(activeBooking.id, 'EXTENSION_PROPOSED_BY_CUSTOMER', 'customer', `Pelanggan mengajukan perpanjangan ${finalMinutes} menit dengan biaya Rp ${finalPrice}. Alasan: ${extendReason}`);
    addNotification('Persetujuan Dikirim', `Pengajuan perpanjangan ${finalMinutes} menit berhasil diteruskan ke pihak Talent mitra.`, 'request');

    setSuccessToast('Permintaan perpanjangan berhasil diajukan!');
    setShowExtendMenu(false);
    loadData();
    setTimeout(() => setSuccessToast(''), 4000);
  };

  // Process incoming Talent request
  const handleRespondToTalentRequest = (extId: string, action: 'approve' | 'reject') => {
    const allExts = getExtensions();
    const targetExt = allExts.find(e => e.id === extId);
    if (!targetExt) return;

    if (action === 'reject') {
      targetExt.status = 'cancelled';
      const allBkgs = getBookings();
      const bkg = allBkgs.find(b => b.id === targetExt.bookingId);
      if (bkg) bkg.status = 'confirmed';
      saveBookings(allBkgs);
      saveExtensions(allExts);

      addAuditLog(targetExt.bookingId, 'EXTENSION_REJECTED_BY_CUSTOMER', 'customer', `Pelanggan menolak pengajuan perpanjangan dari talent.`);
      addNotification('Perpanjangan Ditolak', 'Anda menolak permintaan penambahan waktu dari talent.', 'completed');
      loadData();
    } else {
      // Approve -> Open payment sheet to finalize
      setSelectedPaymentExt(targetExt);
      setShowPaymentSheet(true);
    }
  };

  // Process Payment Addition
  const handleProcessPayment = () => {
    if (!selectedPaymentExt || !activeBooking) return;

    const finalOvertimePrice = selectedPaymentExt.requestedPrice;
    const finalTipPrice = additionalTip;
    const totalToPay = finalOvertimePrice + finalTipPrice;

    if (paymentMethod === 'balance') {
      if (balance < totalToPay) {
        alert('Saldo Dompet digital Anda tidak mencukupi. Silakan pilih metode pembayaran lain (QRIS/VA).');
        return;
      }
      // Deduct balance
      const nextBal = balance - totalToPay;
      setBalance(nextBal);
      saveClientBalance(nextBal);
    }

    // Mark extension as approved & paid
    const allExts = getExtensions();
    const ext = allExts.find(e => e.id === selectedPaymentExt.id);
    if (ext) {
      ext.status = 'approved';
      ext.approvedPrice = finalOvertimePrice;
      ext.paymentType = paymentMethod;
      ext.approvedAt = new Date().toISOString();
    }
    saveExtensions(allExts);

    // Update active booking duration & status
    const allBkgs = getBookings();
    const bkg = allBkgs.find(b => b.id === activeBooking.id);
    if (bkg) {
      bkg.status = 'EXTENSION_ACTIVE';
      bkg.overtimeMinutes = (bkg.overtimeMinutes || 0) + selectedPaymentExt.requestedMinutes;
      bkg.actualDurationMinutes = (bkg.bookedDurationMinutes || 120) + bkg.overtimeMinutes;
      saveBookings(allBkgs);
    }

    // Add Tip record if present
    if (finalTipPrice > 0) {
      const allTips = getTips();
      const newTip: Tip = {
        id: `TIP-${Math.floor(100 + Math.random() * 900)}`,
        bookingId: activeBooking.id,
        talentId: activeBooking.talentId,
        customerId: 'customer-1',
        amount: finalTipPrice,
        message: 'Apresiasi tambahan waktu pengerjaan di lapangan.',
        createdAt: new Date().toISOString()
      };
      allTips.unshift(newTip);
      saveTips(allTips);

      // Add to audit logs
      addAuditLog(activeBooking.id, 'TIP_GIVEN', 'customer', `Pelanggan memberikan tip sebesar Rp ${finalTipPrice} kepada Talent.`);
      addNotification('Tips Diterima', `Talent menerima tips sebesar Rp ${finalTipPrice.toLocaleString('id-ID')} dengan penuh rasa syukur.`, 'tip');
    }

    addAuditLog(activeBooking.id, 'EXTENSION_PAID', 'customer', `Pelanggan membayar biaya tambahan Rp ${finalOvertimePrice} menggunakan ${paymentMethod}.`);
    addNotification('Pembayaran Sukses', `Pembayaran biaya tambahan Rp ${finalOvertimePrice.toLocaleString('id-ID')} berhasil diverifikasi otomatis. Status: EXTENSION_ACTIVE.`, 'paid');

    setPaymentSuccess(true);
    setTimeout(() => {
      setPaymentSuccess(false);
      setShowPaymentSheet(false);
      setSelectedPaymentExt(null);
      setAdditionalTip(0);
      loadData();
    }, 2000);
  };

  // Submit Standalone Tip (Post Booking)
  const handleSubmitTip = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = isCustomTip ? Number(customTipVal) : tipAmount;

    if (!finalAmount || isNaN(finalAmount)) {
      alert('Masukkan jumlah tips yang valid.');
      return;
    }

    // Deduct balance
    if (balance < finalAmount) {
      alert('Saldo dompet digital Anda tidak mencukupi untuk memberikan tips.');
      return;
    }
    const nextBal = balance - finalAmount;
    setBalance(nextBal);
    saveClientBalance(nextBal);

    // Save Tip record
    const allTips = getTips();
    const newTip: Tip = {
      id: `TIP-${Math.floor(100 + Math.random() * 900)}`,
      bookingId: tipBookingId,
      talentId: activeBooking?.talentId || 'talent-1',
      customerId: 'customer-1',
      amount: finalAmount,
      message: tipMessage,
      createdAt: new Date().toISOString()
    };
    allTips.unshift(newTip);
    saveTips(allTips);

    // Add to audit & notifications
    addAuditLog(tipBookingId, 'TIP_GIVEN_POST', 'customer', `Pelanggan memberikan tips apresiasi setelah pengerjaan selesai sebesar Rp ${finalAmount}.`);
    addNotification('Tips Diterima', `Apresiasi tips Rp ${finalAmount.toLocaleString('id-ID')} berhasil diserahkan ke Talent. Terima kasih!`, 'tip');

    setTipSuccess(true);
    setTimeout(() => {
      setTipSuccess(false);
      setShowTipModal(false);
      setTipMessage('');
      loadData();
    }, 2500);
  };

  // Find incoming requests from talent
  const pendingTalentRequests = extensions.filter(e => e.status === 'pending' && e.requestedBy === 'talent');

  return (
    <div className="space-y-8 text-left relative">
      
      {/* 13. Dashboard Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-3xs flex items-center justify-between">
          <div>
            <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Total Pengeluaran Anda</span>
            <span className="text-xl font-black text-[#082B5C]">{formatIDR(totalExpenditure)}</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-3xs flex items-center justify-between">
          <div>
            <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Saldo Dompet Suruhin Cash</span>
            <span className="text-xl font-black text-[#18A957]">{formatIDR(balance)}</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <DollarSign size={20} />
          </div>
        </div>

        {/* Live Simulator control center */}
        <div className="bg-orange-50/40 p-4 rounded-3xl border border-orange-100/60 flex flex-col justify-center space-y-2">
          <span className="block text-[9px] text-[#FF6500] font-extrabold uppercase tracking-widest text-center">Simulasi Penguji Fitur</span>
          <div className="grid grid-cols-2 gap-1.5">
            <button 
              onClick={simulate15MinRemaining} 
              className="py-1 px-1.5 bg-white hover:bg-orange-50 text-orange-600 border border-orange-100 rounded-xl text-[9px] font-bold cursor-pointer transition-colors"
            >
              ⏱ Set 15m Sisa
            </button>
            <button 
              onClick={simulateIncomingTalentExtension} 
              className="py-1 px-1.5 bg-white hover:bg-orange-50 text-orange-600 border border-orange-100 rounded-xl text-[9px] font-bold cursor-pointer transition-colors"
            >
              🙋‍♀️ Request Talent
            </button>
            <button 
              onClick={simulateCompleteBooking} 
              className="py-1 px-1.5 bg-white hover:bg-orange-50 text-orange-600 border border-orange-100 rounded-xl text-[9px] font-bold cursor-pointer transition-colors"
            >
              🏁 Selesaikan Jasa
            </button>
            <button 
              onClick={simulateDisputedBooking} 
              className="py-1 px-1.5 bg-white hover:bg-orange-50 text-orange-600 border border-orange-100 rounded-xl text-[9px] font-bold cursor-pointer transition-colors"
            >
              ⚠️ Set Sengketa
            </button>
          </div>
        </div>

      </div>

      {successToast && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-xs font-bold"
        >
          ✓ {successToast}
        </motion.div>
      )}

      {/* 3. Realtime Countdown Toast Alerts */}
      <AnimatePresence>
        {timeWarningBanner && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4.5 bg-orange-500 text-white rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/10 rounded-xl">
                <Clock size={18} className="animate-bounce" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider">Pemberitahuan Proteksi Layanan</h4>
                <p className="text-xs text-orange-50 font-medium mt-0.5">«Waktu layanan tersisa 15 menit.» Harap tentukan kesepakatan akhir di lapangan.</p>
              </div>
            </div>
            
            <div className="flex gap-2 shrink-0">
              <button 
                onClick={simulateCompleteBooking}
                className="px-3.5 py-1.5 bg-white/20 hover:bg-white/30 text-white text-[10px] font-black rounded-lg transition-colors cursor-pointer"
              >
                Akhiri Layanan
              </button>
              <button 
                onClick={() => {
                  setTimeWarningBanner(false);
                  setShowExtendMenu(true);
                }}
                className="px-3.5 py-1.5 bg-white text-orange-600 hover:bg-orange-50 text-[10px] font-black rounded-lg transition-colors cursor-pointer"
              >
                Ubah / Tambah Waktu
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Timeline Tracker */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-5 text-left">
        <h3 className="text-sm font-black text-[#082B5C] uppercase tracking-wider flex items-center gap-2">
          <Navigation size={16} className="text-[#FF6500]" /> Timeline Pelaksanaan Layanan Realtime
        </h3>

        {activeBooking ? (
          <div className="space-y-6">
            
            {/* Realtime Countdown Ticker visual */}
            <div className="bg-[#082B5C] text-white p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Durasi Asli Booking</span>
                <h4 className="text-sm font-black">{activeBooking.duration} Jam Layanan Kontrak</h4>
              </div>

              {secondsLeft !== null && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-orange-500 border-t-transparent animate-spin flex items-center justify-center" />
                  <div className="text-right">
                    <span className="block text-[9px] text-orange-400 font-bold uppercase">Sisa Waktu Lapangan</span>
                    <span className="text-xl font-mono font-black text-white">{formatTime(secondsLeft)}</span>
                  </div>
                </div>
              )}

              {activeBooking.status === 'EXTENSION_ACTIVE' && (
                <div className="bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 animate-pulse">
                  <Sparkles size={14} />
                  <span>🟢 Extension Active (+{activeBooking.overtimeMinutes}m)</span>
                </div>
              )}
            </div>

            {/* GPS REAL-TIME TRACKING CTA BUTTON */}
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black bg-[#FF6500] text-white px-2 py-0.5 rounded-md uppercase tracking-wide">FITUR BARU</span>
                <h4 className="text-xs font-black text-[#082B5C] mt-1">Pelacakan Kedatangan & Lokasi Real-Time</h4>
                <p className="text-[10px] text-gray-500">Pantau pergerakan talent Rizky Pratama menuju Alun-Alun di peta interaktif.</p>
              </div>
              <button
                onClick={() => {
                  window.history.pushState(null, '', `/pesanan/${activeBooking.id}`);
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#FF6500] hover:bg-[#e05900] text-white text-xs font-extrabold rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition-all active:scale-95 shrink-0"
              >
                <Navigation size={13} className="rotate-45" />
                <span>Lacak Real-Time & Verifikasi PIN</span>
              </button>
            </div>

            {/* Step Timeline Indicator visual */}
            <div className="relative pl-6 space-y-6 border-l border-slate-100">
              
              <div className="relative">
                <span className="absolute -left-[30px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white shadow-xs" />
                <h4 className="text-xs font-bold text-[#082B5C]">01. Mulai Kontrak Bantuan ({activeBooking.time} WIB)</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">Mitra tiba di lokasi pengerjaan, memulai hitungan stopwatch resmi.</p>
              </div>

              {pendingTalentRequests.length > 0 && (
                <div className="relative">
                  <span className="absolute -left-[30px] top-0 w-4 h-4 rounded-full bg-orange-500 border-4 border-white shadow-xs animate-ping" />
                  <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl space-y-3">
                    <h5 className="text-xs font-bold text-[#FF6500] flex items-center gap-1">
                      <AlertCircle size={14} /> Pengajuan Perpanjangan Dari Talent!
                    </h5>
                    {pendingTalentRequests.map(req => (
                      <div key={req.id} className="text-xs text-gray-600 space-y-2">
                        <p>Talent mengajukan tambahan <b>{req.requestedMinutes} menit</b> dengan biaya <b>{formatIDR(req.requestedPrice)}</b>.</p>
                        {req.reason && <p className="text-[11px] italic bg-white p-2 rounded border border-slate-100">"Alasan: {req.reason}"</p>}
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleRespondToTalentRequest(req.id, 'approve')}
                            className="px-4.5 py-1.5 bg-[#FF6500] hover:bg-[#e05900] text-white text-[10px] font-extrabold rounded-lg transition-colors cursor-pointer shadow-sm"
                          >
                            Setujui & Bayar
                          </button>
                          <button
                            onClick={() => handleRespondToTalentRequest(req.id, 'reject')}
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#082B5C] text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Tolak
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeBooking.status === 'EXTENSION_ACTIVE' && (
                <div className="relative">
                  <span className="absolute -left-[30px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white shadow-xs" />
                  <h4 className="text-xs font-bold text-emerald-600">02. Penambahan Waktu Resmi Berjalan (+{activeBooking.overtimeMinutes}m)</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Biaya tambahan disetujui, proteksi jam tambahan terdaftar di audit log.</p>
                </div>
              )}

              {activeBooking.status === 'EXTENSION_DISPUTED' && (
                <div className="relative">
                  <span className="absolute -left-[30px] top-0 w-4 h-4 rounded-full bg-purple-500 border-4 border-white shadow-xs" />
                  <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl space-y-1.5">
                    <h5 className="text-xs font-bold text-purple-700 flex items-center gap-1">
                      <AlertTriangle size={14} /> Terdeteksi Masalah / Sengketa Layanan
                    </h5>
                    <p className="text-[11px] text-purple-600 leading-relaxed">Dana transaksi tambahan dialihkan ke status <b>Held</b> sampai mediator admin meninjau riwayat jam aktivitas mitra.</p>
                  </div>
                </div>
              )}

              {/* Action row to request custom extend */}
              {activeBooking.status === 'confirmed' && (
                <div className="pt-2">
                  <button
                    onClick={() => setShowExtendMenu(true)}
                    className="px-5 py-2.5 bg-[#FF6500] hover:bg-[#e05900] text-white text-xs font-extrabold rounded-xl transition-all shadow-md cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Clock size={14} />
                    Ajukan Tambahan Waktu Sekarang
                  </button>
                </div>
              )}

            </div>

          </div>
        ) : (
          <p className="text-xs text-gray-400 py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-100">
            Anda tidak memiliki kontrak layanan bantuan yang sedang berjalan saat ini.
          </p>
        )}
      </div>

      {/* Grid: Extension History & Tips History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 10. Service Extension history list */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-[#082B5C] uppercase tracking-wider border-b border-slate-50 pb-3 flex items-center gap-1.5">
            <Clock size={16} className="text-[#FF6500]" /> Riwayat Penambahan Waktu Layanan
          </h3>

          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
            {extensions.map((ext) => {
              const badgeColors = {
                pending: 'bg-amber-50 border-amber-100 text-amber-600',
                approved: 'bg-blue-50 border-blue-100 text-blue-600',
                completed: 'bg-emerald-50 border-emerald-100 text-emerald-600',
                cancelled: 'bg-red-50 border-red-100 text-red-500',
                disputed: 'bg-purple-50 border-purple-100 text-purple-600',
                held: 'bg-yellow-50 border-yellow-100 text-yellow-700',
                refunded: 'bg-slate-50 border-slate-100 text-slate-400',
              }[ext.status] || 'bg-slate-50 text-slate-500';

              return (
                <div key={ext.id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2 text-left text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-[#082B5C] mr-2">{ext.id}</span>
                      <span className="text-gray-400 text-[10px]">Booking ID: #{ext.bookingId}</span>
                    </div>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${badgeColors}`}>
                      {ext.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-1 border-t border-b border-slate-100/50 text-[11px]">
                    <div>
                      <span className="text-gray-400 block">Menit Tambahan</span>
                      <span className="font-bold text-[#082B5C]">{ext.requestedMinutes} Menit</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Biaya Overtime</span>
                      <span className="font-bold text-[#FF6500]">{formatIDR(ext.approvedPrice || ext.requestedPrice)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Pemohon</span>
                      <span className="font-bold text-blue-600 capitalize">{ext.requestedBy}</span>
                    </div>
                  </div>

                  {ext.reason && (
                    <p className="text-[10px] text-gray-500 italic">
                      "Alasan: {ext.reason}"
                    </p>
                  )}
                </div>
              );
            })}

            {extensions.length === 0 && (
              <p className="text-center py-10 text-xs text-gray-400">Belum ada catatan perpanjangan terdaftar.</p>
            )}
          </div>
        </div>

        {/* Tips History list */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-[#082B5C] uppercase tracking-wider border-b border-slate-50 pb-3 flex items-center gap-1.5">
            <ThumbsUp size={16} className="text-[#FF6500]" /> Riwayat Pemberian Tips Anda
          </h3>

          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
            {tips.map((tip) => (
              <div key={tip.id} className="p-3.5 bg-emerald-50/20 rounded-2xl border border-emerald-100/40 flex justify-between gap-3 items-start text-left text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-[#082B5C]">{formatIDR(tip.amount)}</span>
                    <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-black uppercase">Paid</span>
                  </div>
                  <p className="text-[10px] text-gray-400">Booking: #{tip.bookingId} • {tip.createdAt.split('T')[0]}</p>
                  {tip.message && (
                    <p className="text-[10px] text-gray-500 italic">"{tip.message}"</p>
                  )}
                </div>
                <div>
                  <span className="text-[8px] text-orange-500 font-extrabold bg-orange-50 px-2 py-0.5 rounded-full uppercase flex items-center gap-0.5">
                    ★ Tips Sent
                  </span>
                </div>
              </div>
            ))}

            {tips.length === 0 && (
              <p className="text-center py-10 text-xs text-gray-400">Belum ada pemberian tips apresiasi yang tercatat.</p>
            )}
          </div>
        </div>

      </div>

      {/* 16. MOBILE BOTTOM SHEET MENU FOR EXTENSION (Or modal styled beautifully) */}
      <AnimatePresence>
        {showExtendMenu && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs">
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-lg rounded-t-3xl border-t border-slate-100 p-6 space-y-5 text-left shadow-2xl relative"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto -mt-2 cursor-pointer mb-2" onClick={() => setShowExtendMenu(false)} />
              
              <div className="space-y-1">
                <h3 className="text-base font-black text-[#082B5C]">Ajukan Perpanjangan Layanan</h3>
                <p className="text-xs text-gray-400">Pilih durasi tambahan waktu yang Anda perlukan untuk membantu menyelesaikan urusan lapangan.</p>
              </div>

              <form onSubmit={handleRequestExtension} className="space-y-4 text-xs">
                
                {/* Duration options */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-gray-400 font-bold uppercase">Berapa Lama Tambahan Waktu?</label>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => { setExtendMinutes(30); setIsCustomMinutes(false); }}
                      className={`py-2 rounded-xl border text-center font-bold cursor-pointer transition-all ${extendMinutes === 30 && !isCustomMinutes ? 'border-[#FF6500] bg-orange-50/30 text-[#FF6500]' : 'border-slate-100 bg-slate-50'}`}
                    >
                      30 Menit
                    </button>
                    <button
                      type="button"
                      onClick={() => { setExtendMinutes(60); setIsCustomMinutes(false); }}
                      className={`py-2 rounded-xl border text-center font-bold cursor-pointer transition-all ${extendMinutes === 60 && !isCustomMinutes ? 'border-[#FF6500] bg-orange-50/30 text-[#FF6500]' : 'border-slate-100 bg-slate-50'}`}
                    >
                      1 Jam
                    </button>
                    <button
                      type="button"
                      onClick={() => { setExtendMinutes(120); setIsCustomMinutes(false); }}
                      className={`py-2 rounded-xl border text-center font-bold cursor-pointer transition-all ${extendMinutes === 120 && !isCustomMinutes ? 'border-[#FF6500] bg-orange-50/30 text-[#FF6500]' : 'border-slate-100 bg-slate-50'}`}
                    >
                      2 Jam
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCustomMinutes(true)}
                      className={`py-2 rounded-xl border text-center font-bold cursor-pointer transition-all ${isCustomMinutes ? 'border-[#FF6500] bg-orange-50/30 text-[#FF6500]' : 'border-slate-100 bg-slate-50'}`}
                    >
                      Kustom
                    </button>
                  </div>
                </div>

                {isCustomMinutes && (
                  <div>
                    <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Durasi Kustom (Menit)</label>
                    <input 
                      type="number"
                      required
                      value={customMinutesVal}
                      onChange={(e) => setCustomMinutesVal(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 font-bold text-[#082B5C]"
                      placeholder="Contoh: 45"
                      min="1"
                    />
                  </div>
                )}

                {/* Pricing auto vs custom */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Perhitungan Upah</label>
                    <select
                      value={negotiatedPrice}
                      onChange={(e) => setNegotiatedPrice(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 font-bold text-[#082B5C] focus:outline-none"
                    >
                      <option value="auto">Tarif Otomatis (Rp40k/jam)</option>
                      <option value="custom">Kesepakatan Mandiri</option>
                    </select>
                  </div>

                  {negotiatedPrice === 'custom' && (
                    <div>
                      <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Upah Disepakati (Rp)</label>
                      <input 
                        type="number"
                        required
                        value={customPriceVal}
                        onChange={(e) => setCustomPriceVal(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 font-bold text-[#082B5C]"
                        min="1000"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Alasan Penambahan Waktu</label>
                  <select
                    value={extendReason}
                    onChange={(e) => setExtendReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 font-bold text-[#082B5C] focus:outline-none"
                  >
                    <option value="Aktivitas belum selesai">Aktivitas pengerjaan utama belum tuntas</option>
                    <option value="Macet">Macet luar biasa di rute transportasi</option>
                    <option value="Kesepakatan bersama">Kesepakatan lisan bersama di lapangan</option>
                    <option value="Perjalanan lebih lama">Perjalanan memakan durasi di luar perkiraan</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowExtendMenu(false)}
                    className="flex-1 py-3 bg-slate-100 text-[#082B5C] hover:bg-slate-200 font-bold rounded-xl text-center transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#FF6500] hover:bg-[#e05900] text-white font-extrabold rounded-xl text-center transition-all cursor-pointer"
                  >
                    Kirim Pengajuan
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 9. PAYMENT SHEET & ADDITIONAL TIP */}
      <AnimatePresence>
        {showPaymentSheet && selectedPaymentExt && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs">
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full max-w-lg rounded-t-3xl p-6 space-y-5 text-left shadow-2xl relative text-xs"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto -mt-2 cursor-pointer mb-2" onClick={() => setShowPaymentSheet(false)} />
              
              <div className="space-y-1">
                <h3 className="text-base font-black text-[#082B5C]">Verifikasi Pembayaran Tambahan</h3>
                <p className="text-xs text-gray-400">Selesaikan penambahan waktu ({selectedPaymentExt.requestedMinutes}m) dengan pilihan opsi pembayaran aman.</p>
              </div>

              {paymentSuccess ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 size={36} />
                  </div>
                  <h4 className="text-sm font-black text-[#082B5C]">Pembayaran Berhasil!</h4>
                  <p className="text-xs text-gray-400">Penambahan waktu resmi diaktifkan dan dicatat ke audit log.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Cost breakdown */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex justify-between text-gray-500">
                      <span>Biaya Perpanjangan Waktu:</span>
                      <span className="font-bold text-[#172033]">{formatIDR(selectedPaymentExt.requestedPrice)}</span>
                    </div>
                    
                    {/* Apresiasi tips input */}
                    <div className="flex justify-between items-center text-gray-500 pt-1">
                      <span>Tambahkan Tips Sukarela:</span>
                      <select 
                        value={additionalTip} 
                        onChange={(e) => setAdditionalTip(Number(e.target.value))}
                        className="bg-white border border-slate-200 rounded-lg p-1 text-xs font-bold text-[#082B5C] focus:outline-none"
                      >
                        <option value="0">Rp 0 (Tanpa Tips)</option>
                        <option value="10000">Rp 10.000</option>
                        <option value="20000">Rp 20.000</option>
                        <option value="50000">Rp 50.000</option>
                      </select>
                    </div>

                    <div className="border-t border-gray-200 pt-2.5 mt-1.5 flex justify-between text-xs font-extrabold text-[#082B5C]">
                      <span>Total Transaksi Tambahan:</span>
                      <span className="text-sm font-black text-[#FF6500]">{formatIDR(selectedPaymentExt.requestedPrice + additionalTip)}</span>
                    </div>
                  </div>

                  {/* Payment method selectors */}
                  <div className="space-y-2">
                    <label className="block text-[10px] text-gray-400 font-bold uppercase">Pilih Metode Pembayaran</label>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('balance')}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'balance' ? 'border-[#18A957] bg-emerald-50/20' : 'border-slate-100 bg-slate-50'}`}
                      >
                        <div className="flex items-center gap-2">
                          <CreditCard size={15} className="text-emerald-600" />
                          <div>
                            <span className="font-bold block text-xs">Potong Saldo Dompet Digital ({formatIDR(balance)})</span>
                            <span className="text-[10px] text-gray-400">Instan, tanpa verifikasi ulang</span>
                          </div>
                        </div>
                        {balance < (selectedPaymentExt.requestedPrice + additionalTip) && (
                          <span className="text-[9px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Kurang</span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('qris')}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${paymentMethod === 'qris' ? 'border-[#FF6500] bg-orange-50/20' : 'border-slate-100 bg-slate-50'}`}
                      >
                        <QrCode size={15} className="text-[#FF6500]" />
                        <div>
                          <span className="font-bold block text-xs">QRIS - Gopay, OVO, Dana, LinkAja</span>
                          <span className="text-[10px] text-gray-400">Tampilkan QR Code otomatis</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('va')}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${paymentMethod === 'va' ? 'border-blue-500 bg-blue-50/20' : 'border-slate-100 bg-slate-50'}`}
                      >
                        <Smartphone size={15} className="text-blue-600" />
                        <div>
                          <span className="font-bold block text-xs">Virtual Account (VA) Bank Transfer</span>
                          <span className="text-[10px] text-gray-400">BCA, Mandiri, BRI, BNI</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* QRIS / VA screen simulation */}
                  {paymentMethod !== 'balance' && (
                    <div className="p-4 bg-[#F5F7FA] border border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
                      {paymentMethod === 'qris' ? (
                        <>
                          <div className="w-24 h-24 bg-white border border-slate-200 p-2 rounded-xl flex items-center justify-center">
                            {/* Simple simulated QR */}
                            <div className="w-full h-full bg-slate-800 flex flex-wrap items-center justify-center text-white text-[8px] font-black leading-none">
                              QRIS<br/>PRO<br/>SURUHIN
                            </div>
                          </div>
                          <p className="text-[10px] text-gray-400">Pindai kode QRIS di atas dengan aplikasi dompet digital Anda untuk pelunasan.</p>
                        </>
                      ) : (
                        <>
                          <span className="text-xs font-black text-[#082B5C] bg-white border border-slate-200 px-3 py-1 rounded-lg select-all">
                            9808-0812-2334-455
                          </span>
                          <p className="text-[10px] text-gray-400">Nomor Virtual Account transfer Bank. Otomatis terkonfirmasi setelah dana terkirim.</p>
                        </>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPaymentSheet(false)}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-[#082B5C] font-bold rounded-xl text-center transition-all cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleProcessPayment}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-center transition-all cursor-pointer"
                    >
                      Konfirmasi Bayar
                    </button>
                  </div>

                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 11. TIPS AFTER BOOKING COMPLETES MODAL */}
      <AnimatePresence>
        {showTipModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-3xl p-6 text-left shadow-2xl space-y-4 relative text-xs"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-base font-black text-[#082B5C] flex items-center gap-1.5">
                  <Sparkles size={18} className="text-yellow-500 animate-pulse" /> Berikan Tips Untuk Talent?
                </h3>
                <button onClick={() => setShowTipModal(false)} className="text-gray-400 hover:text-gray-600 font-extrabold">✕</button>
              </div>

              <p className="text-xs text-gray-400">Apresiasi kerja keras mitra pendamping Anda harian. 100% dana tips yang Anda berikan ditransfer langsung ke dompet saldo Talent.</p>

              {tipSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 size={36} />
                  </div>
                  <h4 className="text-sm font-black text-[#082B5C]">Tips Berhasil Dikirim!</h4>
                  <p className="text-xs text-gray-400">Terima kasih atas kepedulian & apresiasi tulus Anda harian.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitTip} className="space-y-4">
                  {/* Preset amounts */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-gray-400 font-bold uppercase">Pilih Nominal Cepat</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[10000, 20000, 50000, 100000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => { setTipAmount(amt); setIsCustomTip(false); }}
                          className={`py-2 rounded-xl border text-center font-bold cursor-pointer transition-all ${tipAmount === amt && !isCustomTip ? 'border-emerald-500 bg-emerald-50/20 text-emerald-600' : 'border-slate-100 bg-slate-50'}`}
                        >
                          {amt >= 100000 ? '100k' : `${amt / 1000}k`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom tip option toggle */}
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="customTip" 
                      checked={isCustomTip} 
                      onChange={(e) => setIsCustomTip(e.target.checked)}
                      className="cursor-pointer"
                    />
                    <label htmlFor="customTip" className="text-xs font-bold text-gray-500 cursor-pointer">Masukkan nominal kustom manual</label>
                  </div>

                  {isCustomTip && (
                    <div>
                      <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Nominal Tips Kustom (Rp)</label>
                      <input 
                        type="number"
                        required
                        value={customTipVal}
                        onChange={(e) => setCustomTipVal(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 font-bold text-[#082B5C]"
                        placeholder="Contoh: 35000"
                        min="1000"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Pesan Apresiasi (Opsional)</label>
                    <textarea 
                      value={tipMessage}
                      onChange={(e) => setTipMessage(e.target.value)}
                      rows={2}
                      placeholder="Tuliskan ulasan apresiasi positif Anda..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 font-bold text-[#082B5C] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-center transition-all cursor-pointer text-xs shadow-md"
                  >
                    Kirim Tips ({isCustomTip ? formatIDR(Number(customTipVal) || 0) : formatIDR(tipAmount)})
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
