import { Talent } from '../../types';
import { getSupabaseBrowserClient } from './client';

export type MvpResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export interface MvpCustomerInput {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  nik: string;
  birthPlace: string;
  birthDate: string;
  gender: string;
  address: string;
  rtRw: string;
  village: string;
  district: string;
  city: string;
  religion: string;
  maritalStatus: string;
  occupation: string;
  nationality: string;
  profilePhoto: File | null;
  ktpPhoto: File | null;
}

export interface MvpTalentInput {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  nik: string;
  birthPlace: string;
  birthDate: string;
  gender: string;
  address: string;
  rtRw: string;
  village: string;
  district: string;
  city: string;
  religion: string;
  maritalStatus: string;
  occupation: string;
  nationality: string;
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
  latitude?: number | null;
  longitude?: number | null;
  notes: string;
  pricePerHour: number;
  totalPrice: number;
  estimatedTravelDistanceKm?: number | null;
  estimatedTravelDurationMinutes?: number | null;
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
  latitude?: number | null;
  longitude?: number | null;
  notes: string;
  price_per_hour: number;
  total_price: number;
  estimated_travel_distance_km?: number | string | null;
  estimated_travel_duration_minutes?: number | string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'ongoing' | 'completed' | 'cancelled';
  created_at: string;
}

export interface MvpTalentRow {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  nik?: string;
  birth_place?: string;
  birth_date?: string;
  gender?: string;
  address: string;
  rt_rw?: string;
  village?: string;
  district?: string;
  city: string;
  religion?: string;
  marital_status?: string;
  occupation?: string;
  nationality?: string;
  category: string;
  bio: string;
  hobby: string;
  price_per_hour: number | string;
  profile_photo_path: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  ktp_path?: string | null;
  skck_path?: string | null;
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

export function createMvpEntityId() {
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

export async function uploadMvpPrivateFile(
  bucket: 'customer-files' | 'talent-files',
  path: string,
  file: File | null,
  options?: { upsert?: boolean },
) {
  if (!file) return '';

  const { client, error } = getClientOrError();
  if (!client) throw new Error(error);

  const { error: uploadError } = await client.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: options?.upsert ?? true,
    contentType: file.type || undefined,
  });

  if (uploadError) throw uploadError;
  return path;
}

async function readApiResult<T>(response: Response, fallbackError: string): Promise<MvpResult<T>> {
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok) {
    return {
      ok: false,
      error: payload?.error || fallbackError,
    };
  }

  return {
    ok: true,
    data: payload.data as T,
  };
}

export async function registerMvpCustomer(input: MvpCustomerInput): Promise<MvpResult<{ id: string }>> {
  const id = input.id || createMvpEntityId();
  const formData = new FormData();
  formData.append('id', id);
  formData.append('fullName', input.fullName);
  formData.append('email', input.email);
  formData.append('phone', input.phone);
  formData.append('nik', input.nik);
  formData.append('birthPlace', input.birthPlace);
  formData.append('birthDate', input.birthDate);
  formData.append('gender', input.gender);
  formData.append('address', input.address);
  formData.append('rtRw', input.rtRw);
  formData.append('village', input.village);
  formData.append('district', input.district);
  formData.append('city', input.city);
  formData.append('religion', input.religion);
  formData.append('maritalStatus', input.maritalStatus);
  formData.append('occupation', input.occupation);
  formData.append('nationality', input.nationality);
  if (input.profilePhoto) formData.append('profilePhoto', input.profilePhoto);
  if (input.ktpPhoto) formData.append('ktpPhoto', input.ktpPhoto);

  const response = await fetch('/api/register/customer', {
    method: 'POST',
    body: formData,
  });

  return readApiResult<{ id: string }>(response, 'Gagal menyimpan data customer.');
}

export async function registerMvpTalent(input: MvpTalentInput): Promise<MvpResult<{ id: string }>> {
  const id = input.id || createMvpEntityId();
  const formData = new FormData();
  formData.append('id', id);
  formData.append('fullName', input.fullName);
  formData.append('email', input.email);
  formData.append('phone', input.phone);
  formData.append('nik', input.nik);
  formData.append('birthPlace', input.birthPlace);
  formData.append('birthDate', input.birthDate);
  formData.append('gender', input.gender);
  formData.append('address', input.address);
  formData.append('rtRw', input.rtRw);
  formData.append('village', input.village);
  formData.append('district', input.district);
  formData.append('city', input.city);
  formData.append('religion', input.religion);
  formData.append('maritalStatus', input.maritalStatus);
  formData.append('occupation', input.occupation);
  formData.append('nationality', input.nationality);
  formData.append('category', input.category);
  formData.append('bio', input.bio);
  formData.append('hobby', input.hobby);
  formData.append('pricePerHour', String(input.pricePerHour));
  if (input.profilePhoto) formData.append('profilePhoto', input.profilePhoto);
  if (input.ktpPhoto) formData.append('ktpPhoto', input.ktpPhoto);
  if (input.skckPhoto) formData.append('skckPhoto', input.skckPhoto);

  const response = await fetch('/api/register/talent', {
    method: 'POST',
    body: formData,
  });

  return readApiResult<{ id: string }>(response, 'Gagal menyimpan data talent.');
}

export async function createMvpOrder(input: MvpOrderInput): Promise<MvpResult<{ id: string }>> {
  const response = await fetch('/api/orders/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customerId: input.customerId ?? null,
      talentId: input.talentId ?? null,
      category: input.category,
      orderDate: input.orderDate,
      startTime: input.startTime,
      durationHours: input.durationHours,
      address: input.address.trim(),
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      notes: input.notes.trim(),
      pricePerHour: input.pricePerHour,
      totalPrice: input.totalPrice,
      estimatedTravelDistanceKm: input.estimatedTravelDistanceKm ?? null,
      estimatedTravelDurationMinutes: input.estimatedTravelDurationMinutes ?? null,
    }),
  });

  return readApiResult<{ id: string }>(response, 'Gagal membuat order.');
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
    .select('id, full_name, email, phone, address, city, category, bio, hobby, price_per_hour, profile_photo_path, latitude, longitude, verification_status, is_available, average_rating, total_orders, created_at')
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
    .select('id, full_name, email, phone, address, city, category, bio, hobby, price_per_hour, profile_photo_path, latitude, longitude, verification_status, is_available, average_rating, total_orders, created_at')
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

export async function updateMvpTalentProfile(
  id: string,
  patch: {
    fullName?: string;
    bio?: string;
    address?: string;
    city?: string;
  }
): Promise<MvpResult<null>> {
  const { client, error } = getClientOrError();
  if (!client) return { ok: false, error };

  const updatePayload: Record<string, string> = {};
  if (typeof patch.fullName === 'string') updatePayload.full_name = patch.fullName.trim();
  if (typeof patch.bio === 'string') updatePayload.bio = patch.bio.trim();
  if (typeof patch.address === 'string') updatePayload.address = patch.address.trim();
  if (typeof patch.city === 'string') updatePayload.city = patch.city.trim();

  if (Object.keys(updatePayload).length === 0) {
    return { ok: true, data: null };
  }

  const { error: updateError } = await client.from('talents').update(updatePayload).eq('id', id);
  if (updateError) return { ok: false, error: updateError.message };
  return { ok: true, data: null };
}

export async function updateMvpTalentAvatar(id: string, file: File): Promise<MvpResult<{ path: string }>> {
  try {
    const ext = getSafeExtension(file, 'jpg');
    const path = await uploadMvpPrivateFile('talent-files', `talent/profile/${id}/foto.${ext}`, file, { upsert: true });
    const { client, error } = getClientOrError();
    if (!client) return { ok: false, error };

    const { error: updateError } = await client.from('talents').update({
      profile_photo_path: path,
    }).eq('id', id);

    if (updateError) return { ok: false, error: updateError.message };
    return { ok: true, data: { path } };
  } catch (uploadError) {
    return { ok: false, error: uploadError instanceof Error ? uploadError.message : 'Gagal mengunggah foto profil.' };
  }
}

export async function updateMvpTalentDocument(
  id: string,
  documentType: 'ktp' | 'skck',
  file: File
): Promise<MvpResult<{ path: string }>> {
  try {
    const ext = getSafeExtension(file, documentType === 'skck' ? 'pdf' : 'jpg');
    const path = await uploadMvpPrivateFile(
      'talent-files',
      `talent/${documentType}/${id}/${documentType}.${ext}`,
      file,
      { upsert: true }
    );
    const { client, error } = getClientOrError();
    if (!client) return { ok: false, error };

    const updatePayload =
      documentType === 'ktp'
        ? { ktp_path: path, verification_status: 'pending' as const }
        : { skck_path: path, verification_status: 'pending' as const };

    const { error: updateError } = await client.from('talents').update(updatePayload).eq('id', id);
    if (updateError) return { ok: false, error: updateError.message };

    return { ok: true, data: { path } };
  } catch (uploadError) {
    return { ok: false, error: uploadError instanceof Error ? uploadError.message : 'Gagal mengunggah dokumen verifikasi.' };
  }
}

async function removeStoredFile(bucket: 'customer-files' | 'talent-files', path: string | null | undefined) {
  if (!path) return;

  const { client, error } = getClientOrError();
  if (!client) throw new Error(error);

  const { error: removeError } = await client.storage.from(bucket).remove([path]);
  if (removeError) {
    throw removeError;
  }
}

export async function deleteMvpAccount(id: string): Promise<MvpResult<{ role: 'customer' | 'talent' | 'none' }>> {
  const { client, error } = getClientOrError();
  if (!client) return { ok: false, error };

  try {
    const { data: talentRow, error: talentSelectError } = await client
      .from('talents')
      .select('id, profile_photo_path, ktp_path, skck_path')
      .eq('id', id)
      .maybeSingle();

    if (talentSelectError) throw talentSelectError;

    if (talentRow) {
      await removeStoredFile('talent-files', talentRow.profile_photo_path);
      await removeStoredFile('talent-files', talentRow.ktp_path);
      await removeStoredFile('talent-files', talentRow.skck_path);

      const { error: talentDeleteError } = await client.from('talents').delete().eq('id', id);
      if (talentDeleteError) throw talentDeleteError;
      return { ok: true, data: { role: 'talent' } };
    }

    const { data: customerRow, error: customerSelectError } = await client
      .from('customers')
      .select('id, profile_photo_path, ktp_path')
      .eq('id', id)
      .maybeSingle();

    if (customerSelectError) throw customerSelectError;

    if (customerRow) {
      await removeStoredFile('customer-files', customerRow.profile_photo_path);
      await removeStoredFile('customer-files', customerRow.ktp_path);

      const { error: customerDeleteError } = await client.from('customers').delete().eq('id', id);
      if (customerDeleteError) throw customerDeleteError;
      return { ok: true, data: { role: 'customer' } };
    }

    return { ok: true, data: { role: 'none' } };
  } catch (deleteError) {
    return { ok: false, error: deleteError instanceof Error ? deleteError.message : 'Gagal menghapus akun.' };
  }
}

export async function listMvpOrders(): Promise<MvpResult<MvpOrderRow[]>> {
  const { client, error } = getClientOrError();
  if (!client) return { ok: false, error };

  const { data, error: selectError } = await client
    .from('orders')
    .select('id, customer_id, talent_id, category, order_date, start_time, duration_hours, address, latitude, longitude, notes, price_per_hour, total_price, estimated_travel_distance_km, estimated_travel_duration_minutes, status, created_at')
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
  const gender = row.gender === 'Wanita' ? 'Wanita' : 'Pria';

  return {
    id: row.id,
    slug: `mvp-${row.id}`,
    name: row.full_name,
    gender,
    age: 24,
    location: row.city,
    latitude: typeof row.latitude === 'number' ? row.latitude : row.latitude ? Number(row.latitude) : undefined,
    longitude: typeof row.longitude === 'number' ? row.longitude : row.longitude ? Number(row.longitude) : undefined,
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
