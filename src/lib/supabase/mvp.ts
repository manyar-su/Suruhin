import { Talent } from '../../types';
import { getSupabaseBrowserClient } from './client';

export type MvpResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export interface MvpCustomerInput {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  profilePhoto: File | null;
  ktpPhoto: File | null;
}

export interface MvpTalentInput {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  category: string;
  bio: string;
  hobby: string;
  pricePerHour: number;
  profilePhoto: File | null;
  ktpPhoto: File | null;
  skckPhoto: File | null;
}

export interface MvpOrderInput {
  customerId?: string | null;
  talentId?: string | null;
  category: string;
  orderDate: string;
  startTime: string;
  durationHours: number;
  address: string;
  notes: string;
  pricePerHour: number;
  totalPrice: number;
}

export interface MvpRatingInput {
  orderId?: string | null;
  customerId?: string | null;
  talentId: string;
  rating: number;
  review: string;
}

export interface MvpOrderRow {
  id: string;
  customer_id: string | null;
  talent_id: string | null;
  category: string;
  order_date: string;
  start_time: string;
  duration_hours: number;
  address: string;
  notes: string;
  price_per_hour: number;
  total_price: number;
  status: 'pending' | 'accepted' | 'rejected' | 'ongoing' | 'completed' | 'cancelled';
  created_at: string;
}

export interface MvpTalentRow {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  category: string;
  bio: string;
  hobby: string;
  price_per_hour: number | string;
  profile_photo_path: string | null;
  verification_status: 'pending' | 'approved' | 'rejected';
  is_available: boolean;
  average_rating: number | string;
  total_orders: number;
  created_at: string;
}

const SUPABASE_NOT_CONFIGURED = 'Supabase frontend belum dikonfigurasi. Periksa NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY.';

function getClientOrError() {
  try {
    const client = getSupabaseBrowserClient();
    if (!client) return { client: null, error: SUPABASE_NOT_CONFIGURED };
    return { client, error: '' };
  } catch (error) {
    return {
      client: null,
      error: error instanceof Error ? error.message : SUPABASE_NOT_CONFIGURED,
    };
  }
}

function createId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `mvp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getSafeExtension(file: File, fallback: string) {
  const nameExt = file.name.split('.').pop()?.toLowerCase();
  if (nameExt && ['jpg', 'jpeg', 'png', 'pdf'].includes(nameExt)) return nameExt;
  if (file.type === 'image/png') return 'png';
  if (file.type === 'application/pdf') return 'pdf';
  return fallback;
}

async function uploadPrivateFile(bucket: 'customer-files' | 'talent-files', path: string, file: File | null) {
  if (!file) return '';

  const { client, error } = getClientOrError();
  if (!client) throw new Error(error);

  const { error: uploadError } = await client.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  });

  if (uploadError) throw uploadError;
  return path;
}

export async function registerMvpCustomer(input: MvpCustomerInput): Promise<MvpResult<{ id: string }>> {
  const { client, error } = getClientOrError();
  if (!client) return { ok: false, error };

  const id = createId();

  try {
    const profileExt = input.profilePhoto ? getSafeExtension(input.profilePhoto, 'jpg') : 'jpg';
    const ktpExt = input.ktpPhoto ? getSafeExtension(input.ktpPhoto, 'jpg') : 'jpg';
    const profilePath = await uploadPrivateFile('customer-files', `customer/profile/${id}/foto.${profileExt}`, input.profilePhoto);
    const ktpPath = await uploadPrivateFile('customer-files', `customer/ktp/${id}/ktp.${ktpExt}`, input.ktpPhoto);

    const { error: insertError } = await client.from('customers').insert({
      id,
      full_name: input.fullName.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      address: input.address.trim(),
      city: input.city,
      profile_photo_path: profilePath || null,
      ktp_path: ktpPath || null,
    });

    if (insertError) throw insertError;
    return { ok: true, data: { id } };
  } catch (insertError) {
    return { ok: false, error: insertError instanceof Error ? insertError.message : 'Gagal menyimpan data customer.' };
  }
}

export async function registerMvpTalent(input: MvpTalentInput): Promise<MvpResult<{ id: string }>> {
  const { client, error } = getClientOrError();
  if (!client) return { ok: false, error };

  const id = createId();

  try {
    const profileExt = input.profilePhoto ? getSafeExtension(input.profilePhoto, 'jpg') : 'jpg';
    const ktpExt = input.ktpPhoto ? getSafeExtension(input.ktpPhoto, 'jpg') : 'jpg';
    const skckExt = input.skckPhoto ? getSafeExtension(input.skckPhoto, 'pdf') : 'pdf';
    const profilePath = await uploadPrivateFile('talent-files', `talent/profile/${id}/foto.${profileExt}`, input.profilePhoto);
    const ktpPath = await uploadPrivateFile('talent-files', `talent/ktp/${id}/ktp.${ktpExt}`, input.ktpPhoto);
    const skckPath = await uploadPrivateFile('talent-files', `talent/skck/${id}/skck.${skckExt}`, input.skckPhoto);

    const { error: insertError } = await client.from('talents').insert({
      id,
      full_name: input.fullName.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      address: input.address.trim(),
      city: input.city,
      category: input.category,
      bio: input.bio.trim(),
      hobby: input.hobby.trim(),
      price_per_hour: input.pricePerHour,
      profile_photo_path: profilePath || null,
      ktp_path: ktpPath || null,
      skck_path: skckPath || null,
      verification_status: 'pending',
      is_available: false,
    });

    if (insertError) throw insertError;
    return { ok: true, data: { id } };
  } catch (insertError) {
    return { ok: false, error: insertError instanceof Error ? insertError.message : 'Gagal menyimpan data talent.' };
  }
}

export async function createMvpOrder(input: MvpOrderInput): Promise<MvpResult<{ id: string }>> {
  const { client, error } = getClientOrError();
  if (!client) return { ok: false, error };

  const { data, error: insertError } = await client
    .from('orders')
    .insert({
      customer_id: input.customerId ?? null,
      talent_id: input.talentId ?? null,
      category: input.category,
      order_date: input.orderDate,
      start_time: input.startTime,
      duration_hours: input.durationHours,
      address: input.address.trim(),
      notes: input.notes.trim(),
      price_per_hour: input.pricePerHour,
      total_price: input.totalPrice,
      status: 'pending',
    })
    .select('id')
    .single();

  if (insertError) return { ok: false, error: insertError.message };
  return { ok: true, data: data as { id: string } };
}

export async function submitMvpRating(input: MvpRatingInput): Promise<MvpResult<{ id: string }>> {
  const { client, error } = getClientOrError();
  if (!client) return { ok: false, error };

  const { data, error: insertError } = await client
    .from('ratings')
    .insert({
      order_id: input.orderId ?? null,
      customer_id: input.customerId ?? null,
      talent_id: input.talentId,
      rating: input.rating,
      review: input.review.trim(),
    })
    .select('id')
    .single();

  if (insertError) return { ok: false, error: insertError.message };
  return { ok: true, data: data as { id: string } };
}

export async function listApprovedAvailableMvpTalents(): Promise<MvpResult<Talent[]>> {
  const { client, error } = getClientOrError();
  if (!client) return { ok: false, error };

  const { data, error: selectError } = await client
    .from('talents')
    .select('id, full_name, email, phone, address, city, category, bio, hobby, price_per_hour, profile_photo_path, verification_status, is_available, average_rating, total_orders, created_at')
    .eq('verification_status', 'approved')
    .eq('is_available', true)
    .order('average_rating', { ascending: false });

  if (selectError) return { ok: false, error: selectError.message };
  return { ok: true, data: (data as MvpTalentRow[]).map(mapMvpTalentToTalent) };
}

export async function listMvpTalentsForAdmin(): Promise<MvpResult<MvpTalentRow[]>> {
  const { client, error } = getClientOrError();
  if (!client) return { ok: false, error };

  const { data, error: selectError } = await client
    .from('talents')
    .select('id, full_name, email, phone, address, city, category, bio, hobby, price_per_hour, profile_photo_path, verification_status, is_available, average_rating, total_orders, created_at')
    .order('created_at', { ascending: false });

  if (selectError) return { ok: false, error: selectError.message };
  return { ok: true, data: data as MvpTalentRow[] };
}

export async function updateMvpTalentStatus(id: string, patch: Partial<Pick<MvpTalentRow, 'verification_status' | 'is_available'>>): Promise<MvpResult<null>> {
  const { client, error } = getClientOrError();
  if (!client) return { ok: false, error };

  const { error: updateError } = await client.from('talents').update(patch).eq('id', id);
  if (updateError) return { ok: false, error: updateError.message };
  return { ok: true, data: null };
}

export async function listMvpOrders(): Promise<MvpResult<MvpOrderRow[]>> {
  const { client, error } = getClientOrError();
  if (!client) return { ok: false, error };

  const { data, error: selectError } = await client
    .from('orders')
    .select('id, customer_id, talent_id, category, order_date, start_time, duration_hours, address, notes, price_per_hour, total_price, status, created_at')
    .order('created_at', { ascending: false });

  if (selectError) return { ok: false, error: selectError.message };
  return { ok: true, data: data as MvpOrderRow[] };
}

export async function updateMvpOrderStatus(id: string, status: MvpOrderRow['status']): Promise<MvpResult<null>> {
  const { client, error } = getClientOrError();
  if (!client) return { ok: false, error };

  const timestampPatch =
    status === 'accepted' ? { accepted_at: new Date().toISOString() } :
    status === 'ongoing' ? { started_at: new Date().toISOString() } :
    status === 'completed' ? { completed_at: new Date().toISOString() } :
    status === 'cancelled' ? { cancelled_at: new Date().toISOString() } :
    {};

  const { error: updateError } = await client.from('orders').update({ status, ...timestampPatch }).eq('id', id);
  if (updateError) return { ok: false, error: updateError.message };
  return { ok: true, data: null };
}

function mapMvpTalentToTalent(row: MvpTalentRow): Talent {
  const rating = Number(row.average_rating) || 0;
  const joinedYear = new Date(row.created_at).getFullYear() || new Date().getFullYear();

  return {
    id: row.id,
    slug: `mvp-${row.id}`,
    name: row.full_name,
    gender: 'Pria',
    age: 24,
    location: row.city,
    bio: row.bio || row.hobby || 'Talent Suruhin aktif dan siap membantu kebutuhan harian.',
    avatar: row.profile_photo_path || '',
    services: [row.category],
    skills: [row.category, row.hobby].filter(Boolean),
    languages: ['Indonesia'],
    joinedYear,
    rating: rating > 0 ? rating : 5,
    reviewCount: Math.max(0, row.total_orders),
    completedOrders: Math.max(0, row.total_orders),
    verified: row.verification_status === 'approved',
    available: row.is_available,
    schedule: [],
  };
}
