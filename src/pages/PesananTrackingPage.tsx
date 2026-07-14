import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ArrowLeft, MapPin, CheckCircle, ShieldAlert, Navigation, 
  HelpCircle, Star, Phone, MessageSquare, AlertTriangle, KeyRound, 
  Hourglass, Users, Info, Settings, ShieldCheck, Zap, X 
} from 'lucide-react';
import { 
  getBookings, saveBookings, addStatusHistory, getStatusHistory, 
  getMeetingVerification, saveMeetingVerification, createIncident, 
  addNotification, getSystemConfig, saveClientBalance, getClientBalance 
} from '../data/mockExtensionData';
import { Booking, BookingStatus, MeetingType, TrackingMode } from '../types';
import { formatCurrency } from '../lib/formatCurrency';

// Tracking Components
import { LiveTrackingMap } from '../components/tracking/LiveTrackingMap';
import { TrackingStatusCard } from '../components/tracking/TrackingStatusCard';
import { ArrivalEstimate } from '../components/tracking/ArrivalEstimate';
import { LocationPermissionModal } from '../components/tracking/LocationPermissionModal';
import { LocationAccuracyWarning } from '../components/tracking/LocationAccuracyWarning';
import { TrackingTimeline } from '../components/tracking/TrackingTimeline';
import { ArrivalConfirmation } from '../components/tracking/ArrivalConfirmation';
import { MeetingPinVerification } from '../components/tracking/MeetingPinVerification';
import { ServiceTimer } from '../components/tracking/ServiceTimer';
import { EmergencyButton } from '../components/tracking/EmergencyButton';
import { LostConnectionNotice } from '../components/tracking/LostConnectionNotice';
import { TrackingPrivacyNotice } from '../components/tracking/TrackingPrivacyNotice';

interface PesananTrackingPageProps {
  bookingId: string;
  subPage?: string; // 'detail' | 'tracking' | 'verifikasi' | 'selesai'
  navigate: (path: string) => void;
}

export function PesananTrackingPage({ bookingId, subPage = 'detail', navigate }: PesananTrackingPageProps) {
  // Load current booking from simulated DB
  const [bookings, setBookings] = useState<Booking[]>(() => getBookings());
  const booking = useMemo(() => {
    return bookings.find(b => b.id === bookingId) || bookings[0];
  }, [bookings, bookingId]);

  // Current active simulation role: 'customer' or 'talent' to allow testing the two-way workflows
  const [activeRole, setActiveRole] = useState<'customer' | 'talent'>('customer');

  // GPS Accuracy & Signal Fallback simulations
  const [gpsAccuracy, setGpsAccuracy] = useState(15); // in meters
  const [gpsStatus, setGpsStatus] = useState<'connected' | 'searching' | 'error'>('connected');
  const [lostSync, setLostSync] = useState(false);

  // Simulated GPS position of the talent
  const meetingLat = booking?.meetingLatitude ?? -7.3305;
  const meetingLon = booking?.meetingLongitude ?? 108.2206;
  const startLat = meetingLat - 0.015; // start about 1.8km away
  const startLon = meetingLon - 0.012;

  const [talentLat, setTalentLat] = useState(startLat);
  const [talentLon, setTalentLon] = useState(startLon);
  const [travelProgress, setTravelProgress] = useState(0); // 0 to 100%

  // Simulated Chat Box Modal state
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: 'customer' | 'talent'; text: string; time: string }[]>([
    { sender: 'talent', text: 'Halo kak, saya sedang menyiapkan perlengkapan untuk pesanan Kakak.', time: '08:05' }
  ]);
  const [newMsg, setNewMsg] = useState('');

  // Location Permissions States
  const [showPermissions, setShowPermissions] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState<'always' | 'once' | 'deny' | null>(null);

  // Success feedbacks
  const [successToast, setSuccessToast] = useState('');

  // PIN code verification for meeting start
  const verification = useMemo(() => {
    if (!booking) return null;
    return getMeetingVerification(booking.id);
  }, [booking]);

  // Calculate distance & ETA based on current coordinates
  const calculateSimulatedDistance = () => {
    // Distance in KM
    const R = 6371;
    const dLat = (meetingLat - talentLat) * (Math.PI / 180);
    const dLon = (meetingLon - talentLon) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(talentLat * (Math.PI / 180)) *
        Math.cos(meetingLat * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const distanceKm = useMemo(() => {
    return calculateSimulatedDistance();
  }, [talentLat, talentLon, meetingLat, meetingLon]);

  const etaMinutes = useMemo(() => {
    // Assumes average speed is 30km/h
    return Math.max(1, Math.ceil((distanceKm / 30) * 60));
  }, [distanceKm]);

  // Simulated continuous GPS travel loop
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (booking?.status === 'TALENT_ON_THE_WAY') {
      interval = setInterval(() => {
        setTravelProgress(prev => {
          const next = prev + 4; // increment 4% progress every 3 seconds
          if (next >= 100) {
            clearInterval(interval!);
            
            // Auto transition to TALENT_ARRIVED or let user click Saya Sudah Tiba
            updateStatus('TALENT_ARRIVED', 'Talent Rizky Pratama telah sampai di lokasi pertemuan.');
            return 100;
          }
          
          // Move GPS coordinates linearly closer to meeting point
          const ratio = next / 100;
          const currentLat = startLat + (meetingLat - startLat) * ratio;
          const currentLon = startLon + (meetingLon - startLon) * ratio;
          setTalentLat(currentLat);
          setTalentLon(currentLon);

          // If close enough (say 300 meters, or ratio > 85%), trigger TALENT_NEARBY status
          if (next >= 85 && booking.status !== 'TALENT_NEARBY') {
            updateStatus('TALENT_NEARBY', 'Rizky Pratama sudah mendekati lokasi Anda (jarak < 300m).');
          }

          return next;
        });
      }, 3000);
    } else if (booking?.status === 'TALENT_ARRIVED') {
      // Keep talent lock at meeting point
      setTalentLat(meetingLat);
      setTalentLon(meetingLon);
      setTravelProgress(100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [booking?.status]);

  // Update Status state & add status history
  const updateStatus = (newStatus: BookingStatus, notesText?: string) => {
    if (!booking) return;

    const previousStatus = booking.status;
    const list = getBookings();
    const idx = list.findIndex(b => b.id === booking.id);
    
    if (idx > -1) {
      list[idx].status = newStatus;
      
      // Update timestamps based on transition milestones
      if (newStatus === 'TALENT_ON_THE_WAY') {
        list[idx].talentStartedJourneyAt = new Date().toISOString();
        addNotification(
          'Talent Mulai Perjalanan',
          `Rizky Pratama sedang dalam perjalanan menuju lokasi Anda. Estimasi tiba: ${etaMinutes} menit.`,
          'info'
        );
      } else if (newStatus === 'TALENT_ARRIVED') {
        list[idx].talentArrivedAt = new Date().toISOString();
        addNotification(
          'Talent Sudah Tiba!',
          'Talent sudah sampai di titik pertemuan. Silakan temui talent dan verifikasi menggunakan PIN.',
          'approved'
        );
      } else if (newStatus === 'SERVICE_ACTIVE') {
        list[idx].actualStartTime = new Date().toISOString();
        list[idx].actualDurationMinutes = booking.duration * 60;
        addNotification(
          'Layanan Dimulai!',
          'Pertemuan terverifikasi sukses. Selamat beraktivitas, timer layanan kini aktif.',
          'completed'
        );
      } else if (newStatus === 'COMPLETED') {
        list[idx].actualEndTime = new Date().toISOString();
        addNotification(
          'Layanan Selesai Sempurna',
          'Dana escrow telah dilepaskan ke saldo talent. Terima kasih atas pesanan Anda!',
          'completed'
        );
      }

      saveBookings(list);
      setBookings(list);

      // Add audit history log
      addStatusHistory(booking.id, previousStatus, newStatus, activeRole, talentLat, talentLon, notesText);

      setSuccessToast(`Status pesanan diperbarui menjadi: ${newStatus.replace(/_/g, ' ')}`);
      setTimeout(() => setSuccessToast(''), 3000);
    }
  };

  // Chat message send handler
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    const timestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [...prev, { sender: activeRole, text: newMsg.trim(), time: timestamp }]);
    setNewMsg('');

    // Simulate quick auto response from the other party after 2 seconds
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        { 
          sender: activeRole === 'customer' ? 'talent' : 'customer', 
          text: activeRole === 'customer' ? 'Baik kak, saya monitor posisi lewat peta terus ya.' : 'Oke siap mas, hati-hati di jalan ya!', 
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) 
        }
      ]);
    }, 2000);
  };

  // SOS Incident handler
  const handleRaiseSOS = (type: string, description: string) => {
    createIncident(booking.id, activeRole, type, description, talentLat, talentLon);
    addNotification(
      '⚠️ ALERT DARURAT SOS AKTIF',
      `Laporan SOS diajukan oleh ${activeRole} terkait: ${type}. Pengawasan aktif dimulai.`,
      'time_alert'
    );
  };

  // PIN Verification handler
  const handlePINVerification = async (enteredPin: string): Promise<boolean> => {
    if (verification && verification.pinRaw === enteredPin) {
      // Successful match
      updateStatus('SERVICE_ACTIVE', 'Pertemuan berhasil terverifikasi via input PIN keamanan 6-digit.');
      return true;
    }
    return false;
  };

  return (
    <div className="py-24 bg-slate-50/50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        
        {/* SUCCESS TOAST FLOATING BANNER */}
        {successToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#082B5C] border border-blue-900/10 text-white px-5 py-3 rounded-2xl shadow-xl z-50 text-xs font-black flex items-center gap-2 animate-bounce">
            <CheckCircle size={16} className="text-emerald-400" />
            <span>{successToast}</span>
          </div>
        )}

        {/* ROLE SIMULATION TUNER DRAWER */}
        <div className="bg-[#082B5C] text-white p-4 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg border border-slate-700/10">
          <div className="flex items-center gap-2.5 text-left">
            <div className="p-2 bg-orange-500 rounded-xl">
              <Zap size={18} className="text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-orange-400">
                Alur Kerja & Simulator Peran Dua Arah
              </h3>
              <p className="text-[10px] text-slate-300 font-semibold mt-0.5">
                Gunakan panel di samping untuk beralih antara melihat sebagai Pelanggan atau Mitra Talent untuk menguji seluruh alur tracking.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 p-1 rounded-xl">
            <button
              onClick={() => {
                setActiveRole('customer');
                setPermissionsGranted(null);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeRole === 'customer' 
                  ? 'bg-[#FF6500] text-white shadow-md' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              👩‍💼 Pelanggan (User)
            </button>
            <button
              onClick={() => {
                setActiveRole('talent');
                setPermissionsGranted(null);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeRole === 'talent' 
                  ? 'bg-orange-500 text-white shadow-md' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              🛵 Mitra Talent (Rizky)
            </button>
          </div>
        </div>

        {/* BACK LINK AND TITLE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
          <button
            onClick={() => navigate('/profil-talent')}
            className="inline-flex items-center gap-1.5 text-xs font-black text-[#082B5C] hover:text-[#FF6500] cursor-pointer group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Kembali ke Dashboard Utama</span>
          </button>
          
          <div className="text-right sm:text-left">
            <span className="text-[10px] font-black text-gray-400 font-mono block">
              KODE PESANAN: {booking.id}
            </span>
          </div>
        </div>

        {/* MAIN LAYOUT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT AREA: PETA & STATUS TRACKING (8 COLS) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* GPS Fallback warning triggers */}
            {lostSync && (
              <LostConnectionNotice lostSinceMinutes={4} onRetry={() => setLostSync(false)} />
            )}

            {gpsAccuracy > 50 && (
              <LocationAccuracyWarning accuracyMeters={gpsAccuracy} onRecalibrate={() => setGpsAccuracy(15)} />
            )}

            {/* LIVE INTERACTIVE MAP VISUALIZER */}
            <div className="relative">
              <LiveTrackingMap
                booking={booking}
                role={activeRole}
                talentLoc={{ latitude: talentLat, longitude: talentLon }}
                gpsStatus={gpsStatus}
              />
            </div>

            {/* STATUS AND INFO CONTROL CARDS FOR THE ROLES */}
            {activeRole === 'customer' ? (
              /* ================== CUSTOMER VIEW ================== */
              <div className="space-y-6">
                
                {/* 1. Estimate ETA blocks */}
                {(booking.status === 'TALENT_ON_THE_WAY' || booking.status === 'TALENT_NEARBY') && (
                  <ArrivalEstimate
                    distanceKm={distanceKm}
                    etaMinutes={etaMinutes}
                    meetingPlaceName={booking.meetingPlaceName || booking.location}
                  />
                )}

                {/* 2. Main Tracking status details */}
                <TrackingStatusCard
                  booking={booking}
                  distanceKm={distanceKm}
                  etaMinutes={etaMinutes}
                  onOpenChat={() => setShowChatModal(true)}
                  onCallMasked={() => alert('Menghubungkan telepon aman lewat nomor samaran platform (+62-21-9008882)...')}
                  onOpenHelp={() => alert('Membuka Pusat Layanan Bantuan Darurat Suruhin.')}
                />

                {/* 3. PIN Verification for customer (shows pin to read to talent) */}
                {booking.status === 'TALENT_ARRIVED' && (
                  <MeetingPinVerification
                    pinCode={verification?.pinRaw || '482913'}
                    role="customer"
                    onVerify={handlePINVerification}
                  />
                )}

                {/* 4. Active Service Timers */}
                {booking.status === 'SERVICE_ACTIVE' && (
                  <ServiceTimer
                    booking={booking}
                    role="customer"
                    onExtendRequest={(mins) => {
                      alert(`Permintaan perpanjangan tambahan ${mins} menit dikirimkan ke Talent.`);
                      updateStatus('EXTENSION_REQUESTED', `Pelanggan mengajukan tambahan waktu ${mins} menit.`);
                    }}
                  />
                )}

                {/* WAITING FOR PAYMENT ACTION FORM */}
                {booking.status === 'WAITING_PAYMENT' && (
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md text-left space-y-4">
                    <h4 className="text-sm font-black text-[#082B5C] uppercase tracking-wider border-l-3 border-[#FF6500] pl-2">
                      Selesaikan Pembayaran Escrow
                    </h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Lakukan pembayaran sebesar <span className="font-extrabold text-[#FF6500]">{formatCurrency(booking.total)}</span> untuk melepaskan penahanan pesanan dan mengizinkan Talent memulai perjalanannya.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => updateStatus('PAID', 'Pelanggan melunasi pembayaran escrow via QRIS.')}
                        className="py-3 bg-[#FF6500] hover:bg-[#e05900] text-white font-extrabold text-xs rounded-xl cursor-pointer shadow-md shadow-orange-500/10 active:scale-95 transition-all text-center"
                      >
                        Bayar via QRIS / Dompet
                      </button>
                      <button
                        onClick={() => updateStatus('CANCELLED', 'Pelanggan membatalkan pesanan sebelum pembayaran.')}
                        className="py-3 hover:bg-slate-50 text-gray-500 font-bold text-xs rounded-xl cursor-pointer text-center"
                      >
                        Batalkan Pesanan
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ================== MITRA TALENT VIEW ================== */
              <div className="space-y-6">
                
                {/* 1. If Booking is PAID, Talent must Accept */}
                {booking.status === 'PAID' && (
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md text-left space-y-4">
                    <h4 className="text-sm font-black text-[#082B5C] uppercase tracking-wider border-l-3 border-[#FF6500] pl-2">
                      Pesanan Baru Masuk!
                    </h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Siti Aminah telah membayar pesanan. Silakan konfirmasi untuk bersiap-siap melakukan perjalanan.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setShowPermissions(true);
                          updateStatus('TALENT_ACCEPTED', 'Tal Rizky menyetujui pesanan.');
                        }}
                        className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl cursor-pointer shadow-md transition-all text-center"
                      >
                        Terima & Konfirmasi
                      </button>
                      <button
                        onClick={() => updateStatus('CANCELLED', 'Talent menolak karena sedang berhalangan.')}
                        className="py-3 hover:bg-red-50 text-red-500 font-bold text-xs rounded-xl cursor-pointer text-center"
                      >
                        Tolak Pesanan
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. After accepting, talent preparing and starts journey */}
                {(booking.status === 'TALENT_ACCEPTED' || booking.status === 'TALENT_PREPARING') && (
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md text-left space-y-4">
                    <h4 className="text-sm font-black text-[#082B5C] uppercase tracking-wider border-l-3 border-[#FF6500] pl-2">
                      Siap Berangkat?
                    </h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Sebelum menekan tombol di bawah, pastikan Anda menggunakan pakaian sopan, helm cadangan lengkap, dan baterai HP memadai.
                    </p>
                    <button
                      onClick={() => {
                        updateStatus('TALENT_ON_THE_WAY', 'Talent memulai rute perjalanan.');
                      }}
                      className="w-full py-3.5 bg-[#FF6500] hover:bg-[#e05900] text-white font-extrabold text-xs rounded-xl cursor-pointer shadow-md active:scale-95 transition-all text-center uppercase tracking-wider"
                    >
                      🛵 Mulai Perjalanan (Mulai Tracking)
                    </button>
                  </div>
                )}

                {/* 3. On-The-Way Stats card for Talent */}
                {(booking.status === 'TALENT_ON_THE_WAY' || booking.status === 'TALENT_NEARBY') && (
                  <div className="space-y-4">
                    {/* Standalone Arrival Confirmation Action with radius checker */}
                    <ArrivalConfirmation
                      distanceMeters={distanceKm * 1000}
                      onConfirmArrival={(notes) => {
                        updateStatus('TALENT_ARRIVED', notes || 'Talent Rizky telah sampai di lokasi pertemuan.');
                      }}
                    />

                    {/* GPS control options for simulation */}
                    <div className="p-4 bg-slate-100/50 rounded-2xl border border-slate-200/50 text-left space-y-2">
                      <h5 className="text-[10px] font-black text-[#082B5C] uppercase tracking-widest">
                        ⚙️ Kontrol Simulator GPS Talent
                      </h5>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            // Instantly move talent close to meeting point
                            setTalentLat(meetingLat - 0.0005);
                            setTalentLon(meetingLon - 0.0004);
                            updateStatus('TALENT_NEARBY', 'Rizky Pratama sudah mendekati lokasi Anda (jarak < 300m).');
                          }}
                          className="bg-white hover:bg-slate-50 border border-slate-200 py-1.5 text-[10px] font-bold rounded-lg text-gray-600 cursor-pointer"
                        >
                          Simulasikan Mendekat (300m)
                        </button>
                        <button
                          onClick={() => setLostSync(!lostSync)}
                          className="bg-white hover:bg-slate-50 border border-slate-200 py-1.5 text-[10px] font-bold rounded-lg text-gray-600 cursor-pointer"
                        >
                          {lostSync ? 'Hubungkan Kembali' : 'Gondol / Putus GPS'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. PIN input prompt for Talent (must enter PIN from customer) */}
                {booking.status === 'TALENT_ARRIVED' && (
                  <MeetingPinVerification
                    pinCode={verification?.pinRaw || ''}
                    role="talent"
                    onVerify={handlePINVerification}
                  />
                )}

                {/* 5. Active Service Timers */}
                {booking.status === 'SERVICE_ACTIVE' && (
                  <ServiceTimer
                    booking={booking}
                    role="talent"
                    onCompleteService={() => {
                      updateStatus('SERVICE_COMPLETED_BY_TALENT', 'Talent menyelesaikan durasi layanan pendampingan.');
                    }}
                  />
                )}

                {/* SERVICE COMPLETED BY TALENT -> WAITING CUSTOMER APPROVAL */}
                {booking.status === 'SERVICE_COMPLETED_BY_TALENT' && (
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md text-left space-y-4">
                    <h4 className="text-sm font-black text-[#082B5C] uppercase tracking-wider border-l-3 border-emerald-500/20 pl-2">
                      Layanan Telah Anda Selesaikan
                    </h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Sistem sedang menunggu konfirmasi penyelesaian dari pihak pelanggan. Setelah disetujui, dana akan segera dicairkan ke saldo Anda.
                    </p>
                    <button
                      onClick={() => updateStatus('COMPLETED', 'Layanan selesai secara resmi via simulator.')}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl cursor-pointer text-center"
                    >
                      Bypass & Selesaikan Pesanan (Simulate Customer Accept)
                    </button>
                  </div>
                )}

              </div>
            )}

            {/* EMERGENCY SOS SAFETY INJECTIONS BUTTON */}
            <div className="pt-2">
              <EmergencyButton bookingId={booking.id} onRaiseIncident={handleRaiseSOS} />
            </div>

          </div>

          {/* RIGHT AREA: DETAILS, PRIVACY & TIMELINES (4 COLS) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 1. Meeting point card address details */}
            <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm text-left space-y-3.5">
              <h4 className="text-xs font-black text-[#082B5C] uppercase tracking-widest border-l-3 border-[#FF6500] pl-2">
                Info Titik Temu Pertemuan
              </h4>
              
              <div className="space-y-3 text-xs text-[#172033]/85 font-medium leading-relaxed">
                <div>
                  <span className="text-[9px] font-extrabold text-gray-400 block uppercase">Alamat Pertemuan</span>
                  <p className="font-extrabold text-[#082B5C] mt-0.5">{booking.meetingPlaceName || 'Alun-Alun Kota Tasikmalaya'}</p>
                  <p className="text-gray-500 text-[11px] mt-0.5">{booking.meetingAddress || booking.location}</p>
                </div>

                <div>
                  <span className="text-[9px] font-extrabold text-gray-400 block uppercase">Patokan / Catatan Lokasi</span>
                  <p className="text-[#FF6500] font-bold mt-0.5">{booking.meetingNotes || 'Saya mengenakan jaket hitam dan celana denim biru'}</p>
                </div>

                <div className="flex justify-between items-center border-t border-slate-50 pt-3 text-[10px] text-gray-400">
                  <span>Tipe Pertemuan:</span>
                  <span className="font-extrabold text-[#082B5C]">
                    {booking.meetingType ? booking.meetingType.replace(/_/g, ' ') : 'CUSTOMER LOCATION'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Interactive Booking Timeline steps */}
            <TrackingTimeline currentStatus={booking.status} />

            {/* 3. Safety privacy instructions notice */}
            <TrackingPrivacyNotice />

          </div>

        </div>

      </div>

      {/* DETAILED REAL-TIME SIMULATED CHAT POPUP DRAWER */}
      {showChatModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-xl flex flex-col h-[500px] overflow-hidden border border-slate-100 animate-scale-up">
            {/* Header */}
            <div className="bg-[#082B5C] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-500 text-white font-black text-xs flex items-center justify-center">
                  RP
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-black">Rizky Pratama (Talent)</h4>
                  <span className="text-[9px] text-emerald-400 font-semibold block">Online • Membawa motor Honda Beat</span>
                </div>
              </div>
              <button
                onClick={() => setShowChatModal(false)}
                className="p-1.5 hover:bg-white/10 rounded-full text-slate-300 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Message streams */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 custom-scrollbar">
              <div className="text-center">
                <span className="text-[9px] bg-slate-200 text-gray-600 px-2 py-0.5 rounded-full font-bold uppercase">
                  Log Chat Terenkripsi Aman Suruhin
                </span>
              </div>
              
              {chatMessages.map((msg, idx) => {
                const isMe = msg.sender === activeRole;
                return (
                  <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-xs text-left ${
                      isMe 
                        ? 'bg-[#FF6500] text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 border border-slate-100 rounded-tl-none shadow-sm'
                    }`}>
                      <p className="font-medium leading-relaxed">{msg.text}</p>
                      <span className={`text-[8px] mt-1 block text-right ${isMe ? 'text-orange-200' : 'text-gray-400'}`}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2">
              <input
                type="text"
                required
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder="Ketik pesan pesan..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#FF6500]"
              />
              <button
                type="submit"
                className="bg-[#FF6500] hover:bg-[#e05900] text-white px-4 py-2 text-xs font-black rounded-xl cursor-pointer transition-all"
              >
                Kirim
              </button>
            </form>
          </div>
        </div>
      )}

      {/* LOCATION PERMISSION PROMPT DIALOGS */}
      <LocationPermissionModal
        isOpen={showPermissions}
        onClose={() => setShowPermissions(false)}
        role={activeRole}
        onGrant={(type) => {
          setPermissionsGranted(type);
          setShowPermissions(false);
          if (type === 'always' || type === 'once') {
            setGpsStatus('connected');
          } else {
            setGpsStatus('error');
          }
        }}
      />
    </div>
  );
}
