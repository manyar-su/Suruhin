import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdminClient } from '../_lib/supabaseAdmin';

function required(value: unknown, label: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label} wajib diisi.`);
  }
  return value.trim();
}

function optionalString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function optionalNumber(value: unknown) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const client = getSupabaseAdminClient();
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const row = {
      customer_id: optionalString(body?.customerId) || null,
      talent_id: optionalString(body?.talentId) || null,
      category: required(body?.category, 'Kategori order'),
      order_date: required(body?.orderDate, 'Tanggal order'),
      start_time: required(body?.startTime, 'Jam mulai'),
      duration_hours: optionalNumber(body?.durationHours) ?? 1,
      address: required(body?.address, 'Alamat'),
      latitude: optionalNumber(body?.latitude),
      longitude: optionalNumber(body?.longitude),
      notes: optionalString(body?.notes),
      price_per_hour: optionalNumber(body?.pricePerHour) ?? 0,
      total_price: optionalNumber(body?.totalPrice) ?? 0,
      estimated_travel_distance_km: optionalNumber(body?.estimatedTravelDistanceKm),
      estimated_travel_duration_minutes: optionalNumber(body?.estimatedTravelDurationMinutes),
      status: 'pending',
    };

    const { data, error } = await client.from('orders').insert(row as never).select('id').single();
    if (error) throw new Error(error.message);
    const orderData = data as { id: string } | null;
    if (!orderData?.id) throw new Error('Order berhasil dibuat tetapi ID order tidak kembali dari database.');

    return res.status(200).json({
      ok: true,
      data: { id: orderData.id },
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Gagal membuat order.',
    });
  }
}
