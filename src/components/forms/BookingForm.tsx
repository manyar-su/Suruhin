import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Calculator, LoaderCircle, Route } from 'lucide-react';
import { Service } from '../../types';
import { formatCurrency } from '../../lib/formatCurrency';
import { generateOrderId } from '../../lib/utils';
import { generateBookingMessage, generateWhatsAppUrl } from '../../lib/whatsapp';
import { Button } from '../shared/Button';
import { FallbackImage } from '../shared/FallbackImage';
import { useTalentCatalog } from '../../hooks/useTalentCatalog';
import { getTalentAvatarPath } from '../../lib/assetPaths';
import { firstValidationError, validatePhone, validateRequiredText } from '../../lib/validation/forms';
import { createMvpOrder } from '../../lib/supabase/mvp';
import { geocodeAddress } from '../../lib/mapbox/geocoding';
import { fetchMatrix } from '../../lib/mapbox/matrix';
import { MapCoordinate } from '../../lib/mapbox/helpers';

interface BookingFormProps {
  service: Service;
  selectedTalentSlug?: string;
  onSuccess?: () => void;
}

interface TalentTravelEstimate {
  talentId: string;
  coordinate: MapCoordinate | null;
  durationMinutes: number | null;
  distanceKm: number | null;
}

function buildDepartureIso(date: string, time: string) {
  if (!date || !time) return '';
  return `${date}T${time}`;
}

export function BookingForm({ service, selectedTalentSlug, onSuccess }: BookingFormProps) {
  const talents = useTalentCatalog();

  const matchingTalents = useMemo(() => {
    return talents.filter((talent) => talent.services.includes(service.slug) && talent.available);
  }, [service.slug, talents]);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [duration, setDuration] = useState(1);
  const [locationAddress, setLocationAddress] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [selectedTalentId, setSelectedTalentId] = useState(() => {
    if (selectedTalentSlug) {
      const match = talents.find((talent) => talent.slug === selectedTalentSlug);
      return match ? match.id : (matchingTalents[0]?.id || '');
    }
    return matchingTalents[0]?.id || '';
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalculatingMatrix, setIsCalculatingMatrix] = useState(false);
  const [matrixError, setMatrixError] = useState('');
  const [customerCoordinate, setCustomerCoordinate] = useState<MapCoordinate | null>(null);
  const [travelEstimates, setTravelEstimates] = useState<Record<string, TalentTravelEstimate>>({});

  useEffect(() => {
    if (selectedTalentSlug) {
      const match = talents.find((talent) => talent.slug === selectedTalentSlug);
      if (match) {
        setSelectedTalentId(match.id);
      }
    }
  }, [selectedTalentSlug, talents]);

  useEffect(() => {
    if (matchingTalents.length === 0) {
      setSelectedTalentId('');
      return;
    }

    if (!matchingTalents.some((talent) => talent.id === selectedTalentId)) {
      setSelectedTalentId(matchingTalents[0].id);
    }
  }, [matchingTalents, selectedTalentId]);

  const selectedTalent = useMemo(() => {
    return talents.find((talent) => talent.id === selectedTalentId);
  }, [selectedTalentId, talents]);

  useEffect(() => {
    const trimmedAddress = locationAddress.trim();
    if (!trimmedAddress || matchingTalents.length === 0) {
      setTravelEstimates({});
      setCustomerCoordinate(null);
      setMatrixError('');
      return;
    }

    let cancelled = false;

    const calculateTravelMatrix = async () => {
      setIsCalculatingMatrix(true);
      setMatrixError('');

      try {
        const customerPoint = await geocodeAddress(trimmedAddress);
        if (!customerPoint) {
          throw new Error('Alamat customer belum bisa diterjemahkan ke koordinat Mapbox.');
        }

        const talentPoints = await Promise.all(
          matchingTalents.map(async (talent) => {
            if (typeof talent.latitude === 'number' && typeof talent.longitude === 'number') {
              return {
                talentId: talent.id,
                coordinate: {
                  latitude: talent.latitude,
                  longitude: talent.longitude,
                  address: talent.location,
                } satisfies MapCoordinate,
              };
            }

            const geocoded = await geocodeAddress(talent.location);
            return {
              talentId: talent.id,
              coordinate: geocoded,
            };
          })
        );

        if (cancelled) return;

        const routableTalentPoints = talentPoints.filter((item) => item.coordinate);
        if (routableTalentPoints.length === 0) {
          throw new Error('Koordinat talent belum tersedia untuk dihitung ETA order.');
        }

        const matrixPoints = [...routableTalentPoints.map((item) => item.coordinate as MapCoordinate), customerPoint];
        const customerIndex = matrixPoints.length - 1;
        const departAt = buildDepartureIso(bookingDate, bookingTime);
        const matrix = await fetchMatrix(matrixPoints, {
          profile: departAt ? 'mapbox/driving-traffic' : 'mapbox/driving',
          annotations: ['duration', 'distance'],
          sources: routableTalentPoints.map((_, index) => index),
          destinations: [customerIndex],
          departAt: departAt || undefined,
          fallbackSpeedKph: 25,
        });

        if (cancelled) return;

        const nextEstimates: Record<string, TalentTravelEstimate> = {};
        routableTalentPoints.forEach((item, index) => {
          const durationSeconds = matrix.durations?.[index]?.[0] ?? null;
          const distanceMeters = matrix.distances?.[index]?.[0] ?? null;
          nextEstimates[item.talentId] = {
            talentId: item.talentId,
            coordinate: item.coordinate,
            durationMinutes: durationSeconds === null ? null : Math.max(1, Math.round(durationSeconds / 60)),
            distanceKm: distanceMeters === null ? null : Number((distanceMeters / 1000).toFixed(1)),
          };
        });

        talentPoints
          .filter((item) => !item.coordinate)
          .forEach((item) => {
            nextEstimates[item.talentId] = {
              talentId: item.talentId,
              coordinate: null,
              durationMinutes: null,
              distanceKm: null,
            };
          });

        setCustomerCoordinate(customerPoint);
        setTravelEstimates(nextEstimates);

        if (!selectedTalentSlug) {
          const best = Object.values(nextEstimates)
            .filter((item) => item.durationMinutes !== null)
            .sort((left, right) => (left.durationMinutes ?? Number.POSITIVE_INFINITY) - (right.durationMinutes ?? Number.POSITIVE_INFINITY))[0];
          if (best?.talentId) {
            setSelectedTalentId(best.talentId);
          }
        }
      } catch (error) {
        if (cancelled) return;
        setMatrixError(error instanceof Error ? error.message : 'ETA talent belum bisa dihitung.');
      } finally {
        if (!cancelled) {
          setIsCalculatingMatrix(false);
        }
      }
    };

    void calculateTravelMatrix();

    return () => {
      cancelled = true;
    };
  }, [bookingDate, bookingTime, locationAddress, matchingTalents, selectedTalentSlug]);

  const orderedTalents = useMemo(() => {
    const list = [...matchingTalents];
    if (!selectedTalentSlug) {
      list.sort((left, right) => {
        const leftEta = travelEstimates[left.id]?.durationMinutes ?? Number.POSITIVE_INFINITY;
        const rightEta = travelEstimates[right.id]?.durationMinutes ?? Number.POSITIVE_INFINITY;
        return leftEta - rightEta;
      });
    }
    return list;
  }, [matchingTalents, selectedTalentSlug, travelEstimates]);

  const selectedTalentEstimate = selectedTalent ? travelEstimates[selectedTalent.id] : undefined;

  const platformFee = 5000;
  const servicePriceTotal = service.price * duration;
  const grandTotal = servicePriceTotal + platformFee;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');

    const validationError = firstValidationError(
      validateRequiredText(customerName, 'Nama lengkap harus diisi.'),
      validatePhone(customerPhone),
      validateRequiredText(bookingDate, 'Silakan pilih tanggal pelaksanaan.'),
      validateRequiredText(bookingTime, 'Silakan tentukan jam mulai.'),
      validateRequiredText(locationAddress, 'Alamat lengkap lokasi pelaksanaan harus diisi.'),
      validateRequiredText(selectedTalentId, 'Silakan pilih Talent pendamping.')
    );

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSubmitting(true);

    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const orderResult = await createMvpOrder({
      talentId: uuidPattern.test(selectedTalentId) ? selectedTalentId : null,
      category: service.slug,
      orderDate: bookingDate,
      startTime: bookingTime,
      durationHours: duration,
      address: locationAddress,
      latitude: customerCoordinate?.latitude ?? null,
      longitude: customerCoordinate?.longitude ?? null,
      notes: additionalNotes,
      pricePerHour: service.price,
      totalPrice: grandTotal,
      estimatedTravelDistanceKm: selectedTalentEstimate?.distanceKm ?? null,
      estimatedTravelDurationMinutes: selectedTalentEstimate?.durationMinutes ?? null,
    });

    if (orderResult.ok === false) {
      setIsSubmitting(false);
      setFormError(orderResult.error);
      return;
    }

    const orderId = orderResult.data.id || generateOrderId();
    const payload = {
      orderId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      serviceTitle: service.title,
      talentName: selectedTalent?.name || 'Talent Rekomendasi Suruhin',
      date: bookingDate,
      time: bookingTime,
      duration: `${duration} ${service.slug.includes('antar') ? 'Sesi/Jarak' : 'Jam'}`,
      location: locationAddress.trim(),
      notes: additionalNotes.trim(),
      price: servicePriceTotal,
      platformFee,
      total: grandTotal
    };

    const message = generateBookingMessage(payload);
    const url = generateWhatsAppUrl(message);
    window.open(url, '_blank', 'noopener,noreferrer');

    setIsSubmitting(false);
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      {formError && (
        <div className="p-4 bg-red-50 border border-red-200 text-[#E5484D] text-xs font-bold rounded-2xl flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E5484D]" />
          <span>{formError}</span>
        </div>
      )}

      <div className="space-y-4">
        <h4 className="text-sm font-black text-[#082B5C] border-l-3 border-[#FF6500] pl-2 uppercase tracking-wider">
          1. Data Diri Pemesan
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Nama Lengkap</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Contoh: Budi Santoso"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-[#172033] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500] transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">No. WhatsApp Aktif</label>
            <input
              type="tel"
              required
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
              placeholder="Contoh: 08123456789"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-[#172033] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500] transition-all"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-black text-[#082B5C] border-l-3 border-[#FF6500] pl-2 uppercase tracking-wider">
          2. Atur Jadwal & Durasi
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Pilih Tanggal</label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={bookingDate}
              onChange={(event) => setBookingDate(event.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500] transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Jam Mulai</label>
            <input
              type="time"
              required
              value={bookingTime}
              onChange={(event) => setBookingTime(event.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500] transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
              {service.slug.includes('antar') ? 'Sesi/Jarak Pengantaran' : 'Durasi Bantuan (Jam)'}
            </label>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setDuration(Math.max(1, duration - 1))} className="w-11 h-11 bg-slate-100 hover:bg-slate-200 text-[#082B5C] font-bold rounded-xl flex items-center justify-center cursor-pointer select-none">
                -
              </button>
              <span className="w-10 text-center font-bold text-[#082B5C]">{duration}</span>
              <button type="button" onClick={() => setDuration(Math.min(12, duration + 1))} className="w-11 h-11 bg-slate-100 hover:bg-slate-200 text-[#082B5C] font-bold rounded-xl flex items-center justify-center cursor-pointer select-none">
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-black text-[#082B5C] border-l-3 border-[#FF6500] pl-2 uppercase tracking-wider">
          3. Alamat Lokasi Pertemuan
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Alamat Lengkap (Tasikmalaya & Sekitarnya)</label>
            <textarea
              required
              rows={2}
              value={locationAddress}
              onChange={(event) => setLocationAddress(event.target.value)}
              placeholder="Contoh: Perum Permata Regency Blok B-12, Cihideung, Kota Tasikmalaya"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-[#172033] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500] transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Catatan Instruksi Khusus (Opsional)</label>
            <textarea
              rows={2}
              value={additionalNotes}
              onChange={(event) => setAdditionalNotes(event.target.value)}
              placeholder="Contoh: Tolong bawakan helm anak satu lagi, atau gunakan kemeja sopan."
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-[#172033] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6500]/20 focus:border-[#FF6500] transition-all"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-black text-[#082B5C] border-l-3 border-[#FF6500] pl-2 uppercase tracking-wider">
          4. Pilih Talent Suruhin
        </h4>
        {matchingTalents.length > 0 ? (
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-gray-500 uppercase">Pilih Mitra yang Tersedia untuk Layanan Ini</label>
            {(isCalculatingMatrix || matrixError) && (
              <div className={`rounded-2xl border p-3 text-xs font-bold ${matrixError ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-blue-100 bg-blue-50 text-[#082B5C]'}`}>
                <div className="flex items-center gap-2">
                  {isCalculatingMatrix ? <LoaderCircle size={14} className="animate-spin" /> : <Route size={14} className="text-[#FF6500]" />}
                  <span>{isCalculatingMatrix ? 'Menghitung ETA customer ke talent dengan Mapbox Matrix...' : matrixError}</span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
              {orderedTalents.map((talent) => {
                const isSelected = talent.id === selectedTalentId;
                const estimate = travelEstimates[talent.id];
                return (
                  <div
                    key={talent.id}
                    onClick={() => setSelectedTalentId(talent.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                      isSelected
                        ? 'bg-orange-50/40 border-[#FF6500] shadow-sm'
                        : 'bg-slate-50 border-slate-100 hover:bg-slate-100/70 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white border border-slate-200 overflow-hidden shrink-0 shadow-sm">
                        <FallbackImage
                          src={getTalentAvatarPath(talent.avatar, talent.name)}
                          alt={talent.name}
                          type="talent"
                          gender={talent.gender}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-1.5">
                          <h5 className="text-xs font-extrabold text-[#082B5C]">{talent.name}</h5>
                          {talent.verified && (
                            <span className="text-[9px] bg-blue-100 text-blue-800 px-1 py-0.2 rounded-sm font-bold">
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {talent.gender} • {talent.age} Thn • {talent.rating.toFixed(1)} ★ ({talent.reviewCount} Ulasan)
                        </p>
                        <p className="text-[10px] text-[#082B5C]/70 mt-1 font-semibold">
                          {estimate?.durationMinutes !== null && estimate?.durationMinutes !== undefined && estimate?.distanceKm !== null && estimate?.distanceKm !== undefined
                            ? `ETA ${estimate.durationMinutes} menit • ${estimate.distanceKm} km ke lokasi customer`
                            : isCalculatingMatrix
                            ? 'Menunggu perhitungan ETA Mapbox Matrix...'
                            : 'ETA belum tersedia'}
                        </p>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                      isSelected
                        ? 'bg-[#FF6500] border-[#FF6500] text-white'
                        : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <span className="text-[10px] font-black">✓</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 text-[#FF6500] text-xs font-semibold">
            Semua talent spesialis untuk layanan ini sedang sibuk. Silakan lakukan pemesanan, tim admin kami akan mencarikan Talent alternatif via WhatsApp.
          </div>
        )}
      </div>

      <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
        <h4 className="text-xs font-bold text-[#082B5C] uppercase tracking-wider flex items-center gap-1.5 mb-1">
          <Calculator size={14} className="text-[#FF6500]" /> Ringkasan Pembayaran
        </h4>

        <div className="space-y-2 text-xs">
          {selectedTalentEstimate?.durationMinutes !== null && selectedTalentEstimate?.durationMinutes !== undefined && selectedTalentEstimate?.distanceKm !== null && selectedTalentEstimate?.distanceKm !== undefined && (
            <div className="flex items-center justify-between text-gray-500">
              <span>Estimasi Talent ke Lokasi</span>
              <span className="font-bold text-[#172033]">{selectedTalentEstimate.durationMinutes} menit • {selectedTalentEstimate.distanceKm} km</span>
            </div>
          )}
          <div className="flex items-center justify-between text-gray-500">
            <span>Harga Layanan ({duration} x {formatCurrency(service.price)})</span>
            <span className="font-bold text-[#172033]">{formatCurrency(servicePriceTotal)}</span>
          </div>
          <div className="flex items-center justify-between text-gray-500">
            <span>Biaya Layanan Platform (Flat)</span>
            <span className="font-bold text-[#172033]">{formatCurrency(platformFee)}</span>
          </div>
          <div className="border-t border-gray-200 pt-3 flex items-center justify-between text-sm">
            <span className="font-extrabold text-[#082B5C]">Total Pembayaran</span>
            <span className="font-black text-lg text-[#FF6500]">{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        loading={isSubmitting}
        fullWidth
        className="font-extrabold text-base shadow-xl shadow-orange-500/15"
      >
        <span>Konfirmasi & Hubungi Admin WhatsApp</span>
        <ArrowRight size={18} className="ml-2 animate-pulse" />
      </Button>

      <p className="text-[10px] text-gray-400 text-center leading-relaxed">
        *Setelah klik tombol di atas, detail pesanan akan disiapkan otomatis dan Anda akan diarahkan langsung ke WhatsApp Official Suruhin untuk konfirmasi ketersediaan kilat.
      </p>
    </form>
  );
}
