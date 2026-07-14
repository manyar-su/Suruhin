import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle, MessageSquare, X } from 'lucide-react';
import {
  addNotification,
  addStatusHistory,
  createIncident,
  getBookings,
  getMeetingVerification,
  saveBookings,
} from '../data/mockExtensionData';
import { Booking, BookingStatus, Talent } from '../types';
import { LiveTrackingMap } from '../components/tracking/LiveTrackingMap';
import { ArrivalEstimate } from '../components/tracking/ArrivalEstimate';
import { LocationPermissionModal } from '../components/tracking/LocationPermissionModal';
import { LocationAccuracyWarning } from '../components/tracking/LocationAccuracyWarning';
import { TrackingTimeline } from '../components/tracking/TrackingTimeline';
import { ArrivalConfirmation } from '../components/tracking/ArrivalConfirmation';
import { MeetingPinVerification } from '../components/tracking/MeetingPinVerification';
import { ServiceTimer } from '../components/tracking/ServiceTimer';
import { EmergencyButton } from '../components/tracking/EmergencyButton';
import { TrackingPrivacyNotice } from '../components/tracking/TrackingPrivacyNotice';
import { useBookingChat } from '../hooks/useBookingChat';
import { formatCurrency } from '../lib/formatCurrency';

interface PesananTrackingPageProps {
  bookingId: string;
  subPage?: string;
  navigate: (path: string) => void;
  currentUser?: Talent | null;
}

export function PesananTrackingPage({
  bookingId,
  subPage = 'detail',
  navigate,
  currentUser,
}: PesananTrackingPageProps) {
  const [bookings, setBookings] = useState<Booking[]>(() => getBookings(currentUser?.id));
  const booking = useMemo(() => bookings.find((item) => item.id === bookingId) || bookings[0], [bookings, bookingId]);
  const [gpsAccuracy, setGpsAccuracy] = useState(15);
  const [gpsStatus, setGpsStatus] = useState<'connected' | 'searching' | 'error'>('connected');
  const [showPermissions, setShowPermissions] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const talentDisplayName = currentUser?.name || 'Rizky Pratama';
  const meetingLat = booking?.meetingLatitude ?? null;
  const meetingLon = booking?.meetingLongitude ?? null;
  const meetingPointReady = meetingLat !== null && meetingLon !== null;
  const startLat = meetingLat !== null ? meetingLat - 0.015 : null;
  const startLon = meetingLon !== null ? meetingLon - 0.012 : null;

  const [talentLat, setTalentLat] = useState<number | null>(startLat);
  const [talentLon, setTalentLon] = useState<number | null>(startLon);
  const [travelProgress, setTravelProgress] = useState(0);

  const verification = useMemo(() => {
    if (!booking) {
      return null;
    }
    return getMeetingVerification(booking.id);
  }, [booking]);

  const bookingChat = useBookingChat({
    bookingId: booking?.id || bookingId,
    senderId: currentUser?.id || booking?.talentId || null,
    senderName: talentDisplayName,
    senderRole: 'talent',
  });

  const distanceKm = useMemo(() => {
    if (meetingLat === null || meetingLon === null || talentLat === null || talentLon === null) {
      return 0;
    }

    const earthRadiusKm = 6371;
    const dLat = (meetingLat - talentLat) * (Math.PI / 180);
    const dLon = (meetingLon - talentLon) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(talentLat * (Math.PI / 180)) *
        Math.cos(meetingLat * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    return earthRadiusKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }, [meetingLat, meetingLon, talentLat, talentLon]);

  const etaMinutes = useMemo(() => Math.max(1, Math.ceil((distanceKm / 30) * 60)), [distanceKm]);

  useEffect(() => {
    if (!meetingPointReady || startLat === null || startLon === null || !booking) {
      return;
    }

    if (booking.status === 'PAID' || booking.status === 'TALENT_ACCEPTED' || booking.status === 'TALENT_PREPARING') {
      setTalentLat(startLat);
      setTalentLon(startLon);
      setTravelProgress(0);
      return;
    }

    if (booking.status === 'TALENT_ARRIVED') {
      setTalentLat(meetingLat);
      setTalentLon(meetingLon);
      setTravelProgress(100);
    }
  }, [booking, meetingLat, meetingLon, meetingPointReady, startLat, startLon]);

  useEffect(() => {
    if (!booking || booking.status !== 'TALENT_ON_THE_WAY' || !meetingPointReady || startLat === null || startLon === null) {
      return;
    }

    const interval = window.setInterval(() => {
      setTravelProgress((previous) => {
        const next = Math.min(previous + 4, 100);
        const ratio = next / 100;

        setTalentLat(startLat + (meetingLat - startLat) * ratio);
        setTalentLon(startLon + (meetingLon - startLon) * ratio);

        if (next >= 85 && booking.status !== 'TALENT_NEARBY') {
          updateStatus('TALENT_NEARBY', `${talentDisplayName} sudah mendekati lokasi pelanggan.`);
        }

        if (next >= 100) {
          window.clearInterval(interval);
          updateStatus('TALENT_ARRIVED', `${talentDisplayName} telah sampai di lokasi pertemuan.`);
        }

        return next;
      });
    }, 3000);

    return () => window.clearInterval(interval);
  }, [booking, meetingLat, meetingLon, meetingPointReady, startLat, startLon, talentDisplayName]);

  const updateStatus = (newStatus: BookingStatus, notesText?: string) => {
    if (!booking) {
      return;
    }

    const previousStatus = booking.status;
    const nextBookings = getBookings(currentUser?.id);
    const targetIndex = nextBookings.findIndex((item) => item.id === booking.id);

    if (targetIndex === -1) {
      return;
    }

    nextBookings[targetIndex].status = newStatus;

    if (newStatus === 'TALENT_ON_THE_WAY') {
      nextBookings[targetIndex].talentStartedJourneyAt = new Date().toISOString();
      nextBookings[targetIndex].trackingStartedAt = new Date().toISOString();
      addNotification(
        'Talent Mulai Perjalanan',
        `${talentDisplayName} sedang menuju titik temu. Estimasi tiba ${etaMinutes} menit.`,
        'info'
      );
    } else if (newStatus === 'TALENT_ARRIVED') {
      nextBookings[targetIndex].talentArrivedAt = new Date().toISOString();
      addNotification(
        'Talent Sudah Tiba',
        'Talent telah berada di lokasi. Silakan lanjutkan verifikasi PIN untuk memulai layanan.',
        'approved'
      );
    } else if (newStatus === 'SERVICE_ACTIVE') {
      nextBookings[targetIndex].actualStartTime = new Date().toISOString();
      nextBookings[targetIndex].actualDurationMinutes = booking.duration * 60;
      addNotification('Layanan Dimulai', 'Pertemuan berhasil diverifikasi dan waktu layanan mulai dihitung.', 'completed');
    } else if (newStatus === 'COMPLETED') {
      nextBookings[targetIndex].actualEndTime = new Date().toISOString();
      nextBookings[targetIndex].trackingStoppedAt = new Date().toISOString();
      addNotification('Layanan Selesai', 'Pesanan berhasil ditutup dan tracking dihentikan.', 'completed');
    } else if (newStatus === 'CANCELLED') {
      nextBookings[targetIndex].trackingStoppedAt = new Date().toISOString();
    }

    saveBookings(nextBookings);
    setBookings(nextBookings);
    addStatusHistory(booking.id, previousStatus, newStatus, currentUser?.id || 'talent', talentLat ?? undefined, talentLon ?? undefined, notesText);
    setSuccessToast(`Status pesanan berubah ke ${newStatus.replace(/_/g, ' ')}`);
    window.setTimeout(() => setSuccessToast(''), 2800);
  };

  const handleMeetingPointChange = (point: { latitude: number; longitude: number; address?: string }) => {
    if (!booking) {
      return;
    }

    const nextBookings = getBookings(currentUser?.id);
    const targetIndex = nextBookings.findIndex((item) => item.id === booking.id);
    if (targetIndex === -1) {
      return;
    }

    nextBookings[targetIndex] = {
      ...nextBookings[targetIndex],
      meetingLatitude: point.latitude,
      meetingLongitude: point.longitude,
      meetingAddress: point.address || nextBookings[targetIndex].meetingAddress || nextBookings[targetIndex].location,
      meetingPlaceName: point.address || nextBookings[targetIndex].meetingPlaceName || 'Titik Temu Dipilih di Peta',
      meetingType: nextBookings[targetIndex].meetingType || 'CUSTOM_LOCATION',
    };

    saveBookings(nextBookings);
    setBookings(nextBookings);

    if (booking.status !== 'TALENT_ON_THE_WAY' && booking.status !== 'TALENT_NEARBY' && booking.status !== 'TALENT_ARRIVED') {
      setTalentLat(point.latitude - 0.015);
      setTalentLon(point.longitude - 0.012);
      setTravelProgress(0);
    }
  };

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    const sent = await bookingChat.sendMessage(newMessage);
    if (sent) {
      setNewMessage('');
    }
  };

  const handleRaiseSOS = (type: string, description: string) => {
    if (!booking) {
      return;
    }

    createIncident(booking.id, currentUser?.id || 'talent', type, description, talentLat ?? undefined, talentLon ?? undefined);
    addNotification('Alert Darurat Aktif', `Laporan darurat dikirim untuk kategori ${type}.`, 'time_alert');
  };

  const handlePinVerification = async (enteredPin: string) => {
    if (verification?.pinRaw !== enteredPin) {
      return false;
    }

    updateStatus('SERVICE_ACTIVE', 'Pertemuan berhasil diverifikasi via PIN keamanan.');
    return true;
  };

  if (!booking) {
    return (
      <div className="py-28 text-center">
        <h2 className="text-2xl font-black text-[#082B5C]">Pesanan tidak ditemukan</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-24">
      <div className="mx-auto max-w-5xl space-y-6 px-4">
        {successToast && (
          <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-[#082B5C] px-5 py-3 text-xs font-black text-white shadow-xl">
            <CheckCircle size={16} className="text-emerald-400" />
            <span>{successToast}</span>
          </div>
        )}

        <div className="flex flex-col gap-4 rounded-3xl border border-slate-700/10 bg-[#082B5C] p-5 text-white shadow-lg md:flex-row md:items-center md:justify-between">
          <div className="space-y-1 text-left">
            <h1 className="text-sm font-black uppercase tracking-widest text-orange-400">Tracking Operasional Talent</h1>
            <p className="text-sm font-semibold text-slate-200">
              Pantau perjalanan, verifikasi titik temu, dan koordinasi pelanggan dari satu panel kerja.
            </p>
          </div>
          <button
            onClick={() => setShowChatModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-black text-[#082B5C] shadow-sm transition hover:bg-slate-50"
          >
            <MessageSquare size={14} />
            <span>Buka Chat Pelanggan</span>
          </button>
        </div>

        <div className="flex flex-col justify-between gap-4 text-left sm:flex-row sm:items-center">
          <button
            onClick={() => navigate('/profil-talent')}
            className="inline-flex items-center gap-2 text-xs font-black text-[#082B5C] transition hover:text-[#FF6500]"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Dashboard</span>
          </button>
          <span className="block text-[10px] font-black text-gray-400">KODE PESANAN: {booking.id}</span>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            {gpsAccuracy > 50 && (
              <LocationAccuracyWarning accuracyMeters={gpsAccuracy} onRecalibrate={() => setGpsAccuracy(15)} />
            )}

            <LiveTrackingMap
              booking={booking}
              role="talent"
              talentLoc={talentLat !== null && talentLon !== null ? { latitude: talentLat, longitude: talentLon } : null}
              gpsStatus={gpsStatus}
              onMeetingPointChange={handleMeetingPointChange}
              userId={currentUser?.id || booking.talentId}
            />

            {booking.status === 'PAID' && (
              <div className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-md">
                <h4 className="border-l-3 border-[#FF6500] pl-2 text-sm font-black uppercase tracking-wider text-[#082B5C]">
                  Pesanan Baru Masuk
                </h4>
                <p className="text-xs leading-relaxed text-gray-500">
                  {booking.customerName} sudah menyelesaikan pembayaran sebesar {formatCurrency(booking.total)}. Konfirmasi pesanan untuk mulai mempersiapkan perjalanan.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setShowPermissions(true);
                      updateStatus('TALENT_ACCEPTED', `${talentDisplayName} menerima pesanan.`);
                    }}
                    className="rounded-xl bg-emerald-600 py-3 text-center text-xs font-extrabold text-white shadow-md transition hover:bg-emerald-700"
                  >
                    Terima Pesanan
                  </button>
                  <button
                    onClick={() => updateStatus('CANCELLED', `${talentDisplayName} menolak pesanan karena berhalangan.`)}
                    className="rounded-xl py-3 text-center text-xs font-bold text-red-500 transition hover:bg-red-50"
                  >
                    Tolak Pesanan
                  </button>
                </div>
              </div>
            )}

            {(booking.status === 'TALENT_ACCEPTED' || booking.status === 'TALENT_PREPARING') && (
              <div className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-md">
                <h4 className="border-l-3 border-[#FF6500] pl-2 text-sm font-black uppercase tracking-wider text-[#082B5C]">
                  Siap Berangkat
                </h4>
                <p className="text-xs leading-relaxed text-gray-500">
                  Pastikan perlengkapan lengkap dan titik temu sudah benar sebelum tracking perjalanan dimulai.
                </p>
                <button
                  onClick={() => updateStatus('TALENT_ON_THE_WAY', `${talentDisplayName} memulai perjalanan menuju lokasi pelanggan.`)}
                  disabled={!meetingPointReady}
                  className="w-full rounded-xl bg-[#FF6500] py-3.5 text-center text-xs font-extrabold uppercase tracking-wider text-white shadow-md transition hover:bg-[#e05900] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {meetingPointReady ? 'Mulai Perjalanan' : 'Pilih Titik Temu di Peta Dulu'}
                </button>
              </div>
            )}

            {(booking.status === 'TALENT_ON_THE_WAY' || booking.status === 'TALENT_NEARBY') && (
              <div className="space-y-4">
                <ArrivalEstimate
                  distanceKm={distanceKm}
                  etaMinutes={etaMinutes}
                  meetingPlaceName={booking.meetingPlaceName || booking.location}
                />
                <ArrivalConfirmation
                  distanceMeters={distanceKm * 1000}
                  onConfirmArrival={(notes) => updateStatus('TALENT_ARRIVED', notes || `${talentDisplayName} telah tiba di lokasi.`)}
                />
              </div>
            )}

            {booking.status === 'TALENT_ARRIVED' && (
              <MeetingPinVerification
                pinCode={verification?.pinRaw || ''}
                role="talent"
                onVerify={handlePinVerification}
              />
            )}

            {booking.status === 'SERVICE_ACTIVE' && (
              <ServiceTimer
                booking={booking}
                role="talent"
                onCompleteService={() => updateStatus('SERVICE_COMPLETED_BY_TALENT', `${talentDisplayName} menandai layanan selesai.`)}
              />
            )}

            {booking.status === 'SERVICE_COMPLETED_BY_TALENT' && (
              <div className="space-y-3 rounded-3xl border border-slate-100 bg-white p-6 shadow-md">
                <h4 className="border-l-3 border-emerald-500/20 pl-2 text-sm font-black uppercase tracking-wider text-[#082B5C]">
                  Menunggu Konfirmasi Pelanggan
                </h4>
                <p className="text-xs leading-relaxed text-gray-500">
                  Layanan sudah Anda selesaikan. Sistem akan menutup pesanan setelah pelanggan memberikan konfirmasi akhir.
                </p>
              </div>
            )}

            {booking.status === 'COMPLETED' && (
              <div className="space-y-3 rounded-3xl border border-emerald-100 bg-white p-6 shadow-md">
                <h4 className="border-l-3 border-emerald-500 pl-2 text-sm font-black uppercase tracking-wider text-[#082B5C]">
                  Pesanan Selesai
                </h4>
                <p className="text-xs leading-relaxed text-gray-500">
                  Tracking sudah berhenti dan aktivitas pesanan tercatat lengkap.
                </p>
              </div>
            )}

            <EmergencyButton bookingId={booking.id} onRaiseIncident={handleRaiseSOS} />
          </div>

          <div className="space-y-6 lg:col-span-4">
            <div className="space-y-3.5 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <h4 className="border-l-3 border-[#FF6500] pl-2 text-xs font-black uppercase tracking-widest text-[#082B5C]">
                Info Titik Temu
              </h4>
              <div className="space-y-3 text-xs font-medium leading-relaxed text-[#172033]/85">
                <div>
                  <span className="block text-[9px] font-extrabold uppercase text-gray-400">Lokasi</span>
                  <p className="mt-0.5 font-extrabold text-[#082B5C]">{booking.meetingPlaceName || 'Titik Temu Pelanggan'}</p>
                  <p className="mt-0.5 text-[11px] text-gray-500">{booking.meetingAddress || booking.location}</p>
                </div>
                <div>
                  <span className="block text-[9px] font-extrabold uppercase text-gray-400">Catatan</span>
                  <p className="mt-0.5 font-bold text-[#FF6500]">{booking.meetingNotes || 'Belum ada catatan tambahan dari pelanggan.'}</p>
                </div>
                <div className="flex items-center justify-between border-t border-slate-50 pt-3 text-[10px] text-gray-400">
                  <span>Tipe Pertemuan</span>
                  <span className="font-extrabold text-[#082B5C]">
                    {booking.meetingType ? booking.meetingType.replace(/_/g, ' ') : 'CUSTOM LOCATION'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-widest text-[#082B5C]">Chat Terbaru</h4>
                <button onClick={() => setShowChatModal(true)} className="text-[11px] font-bold text-[#FF6500]">
                  Buka
                </button>
              </div>
              {bookingChat.messages.length === 0 ? (
                <p className="text-xs leading-relaxed text-gray-500">Belum ada pesan pada pesanan ini.</p>
              ) : (
                <div className="space-y-2">
                  {bookingChat.messages.slice(-3).map((message) => (
                    <div key={message.id} className="rounded-2xl bg-slate-50 px-3 py-2 text-left">
                      <p className="text-[11px] font-bold text-[#082B5C]">{message.senderName}</p>
                      <p className="mt-1 text-xs leading-relaxed text-gray-500">{message.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <TrackingTimeline currentStatus={booking.status} />
            <TrackingPrivacyNotice />
          </div>
        </div>
      </div>

      {showChatModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 backdrop-blur-xs sm:items-center">
          <div className="flex h-[520px] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-slate-100 bg-white shadow-xl sm:rounded-3xl">
            <div className="flex items-center justify-between bg-[#082B5C] px-5 py-4 text-white">
              <div className="space-y-0.5 text-left">
                <h4 className="text-xs font-black">{booking.customerName}</h4>
                <span className="block text-[10px] text-slate-300">{booking.customerPhone}</span>
              </div>
              <button onClick={() => setShowChatModal(false)} className="rounded-full p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
              {bookingChat.isLoading ? (
                <p className="text-center text-xs font-semibold text-gray-400">Memuat percakapan...</p>
              ) : bookingChat.messages.length === 0 ? (
                <p className="text-center text-xs font-semibold text-gray-400">Belum ada pesan. Gunakan chat untuk koordinasi titik temu atau kebutuhan di lapangan.</p>
              ) : (
                bookingChat.messages.map((message) => {
                  const isMe = message.senderRole === 'talent';
                  return (
                    <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-left text-xs ${
                          isMe
                            ? 'rounded-tr-none bg-[#FF6500] text-white'
                            : 'rounded-tl-none border border-slate-100 bg-white text-gray-800 shadow-sm'
                        }`}
                      >
                        <p className="font-semibold leading-relaxed">{message.message}</p>
                        <span className={`mt-1 block text-right text-[9px] ${isMe ? 'text-orange-200' : 'text-gray-400'}`}>
                          {formatChatTime(message.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-slate-100 bg-white p-3">
              <input
                type="text"
                required
                value={newMessage}
                onChange={(event) => setNewMessage(event.target.value)}
                placeholder="Tulis pesan ke pelanggan"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#FF6500]"
              />
              <button
                type="submit"
                className="rounded-xl bg-[#FF6500] px-4 py-2 text-xs font-black text-white transition hover:bg-[#e05900]"
              >
                Kirim
              </button>
            </form>

            {bookingChat.error && (
              <div className="border-t border-amber-100 bg-amber-50 px-4 py-2 text-[11px] font-semibold text-amber-700">
                {bookingChat.error}
              </div>
            )}
          </div>
        </div>
      )}

      <LocationPermissionModal
        isOpen={showPermissions}
        onClose={() => setShowPermissions(false)}
        role="talent"
        onGrant={(type) => {
          setShowPermissions(false);
          setGpsStatus(type === 'deny' ? 'error' : 'connected');
        }}
      />
    </div>
  );
}

function formatChatTime(value: string) {
  return new Date(value).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
