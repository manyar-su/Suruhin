import { getSupabaseBrowserClient } from './supabase/client';
import { getCurrentCustomerProfile } from './customerProfile';
import { getBookings, saveBookings } from '../data/mockExtensionData';
import { generateOrderId } from './utils';
import { getCurrentSessionUser } from './authSession';
import type { Booking, JobApplication, JobComment, JobPost } from '../types';

const JOBS_UPDATED_EVENT = 'suruhin_jobs_updated';
const CHAT_STORAGE_KEY_PREFIX = 'suruhin_booking_chat';

function dispatchJobsUpdated() {
  window.dispatchEvent(new Event(JOBS_UPDATED_EVENT));
}

async function readApiResult<T>(response: Response, fallbackError: string) {
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || fallbackError);
  }
  return payload.data as T;
}

export function createJobEntityId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `job-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function listOpenJobs() {
  const response = await fetch('/api/jobs');
  return readApiResult<JobPost[]>(response, 'Gagal memuat daftar pekerjaan.');
}

export async function listCustomerJobs(customerId: string) {
  const response = await fetch(`/api/jobs?scope=customer&customerId=${encodeURIComponent(customerId)}`);
  return readApiResult<JobPost[]>(response, 'Gagal memuat pekerjaan customer.');
}

export async function listTalentApplications(talentId: string) {
  const response = await fetch(`/api/jobs?scope=talent-applications&talentId=${encodeURIComponent(talentId)}`);
  return readApiResult<JobApplication[]>(response, 'Gagal memuat lamaran talent.');
}

export async function getJobDetailBySlug(slug: string) {
  const response = await fetch(`/api/jobs?slug=${encodeURIComponent(slug)}`);
  return readApiResult<{ job: JobPost; comments: JobComment[]; applications: JobApplication[] }>(response, 'Gagal memuat detail pekerjaan.');
}

export async function getJobDetailById(id: string) {
  const response = await fetch(`/api/jobs?id=${encodeURIComponent(id)}`);
  return readApiResult<{ job: JobPost; comments: JobComment[]; applications: JobApplication[] }>(response, 'Gagal memuat detail pekerjaan.');
}

export async function createJobPost(input: {
  id: string;
  customerId: string;
  customerName: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  budget: number;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  serviceMode: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  deadline?: string;
  status?: 'DRAFT' | 'OPEN';
  imageFile: File | null;
  attachmentFile: File | null;
}) {
  const formData = new FormData();
  formData.append('id', input.id);
  formData.append('customerId', input.customerId);
  formData.append('customerName', input.customerName);
  formData.append('title', input.title);
  formData.append('description', input.description);
  formData.append('categoryId', input.categoryId);
  formData.append('categoryName', input.categoryName);
  formData.append('budget', String(input.budget));
  formData.append('location', input.location);
  formData.append('latitude', input.latitude !== undefined && input.latitude !== null ? String(input.latitude) : '');
  formData.append('longitude', input.longitude !== undefined && input.longitude !== null ? String(input.longitude) : '');
  formData.append('serviceMode', input.serviceMode);
  formData.append('deadline', input.deadline || '');
  formData.append('status', input.status || 'OPEN');
  if (input.imageFile) formData.append('imageFile', input.imageFile);
  if (input.attachmentFile) formData.append('attachmentFile', input.attachmentFile);

  const response = await fetch('/api/jobs', {
    method: 'POST',
    body: formData,
  });

  const data = await readApiResult<{ id: string; slug: string }>(response, 'Gagal membuat posting pekerjaan.');
  dispatchJobsUpdated();
  return data;
}

export async function addJobComment(input: {
  jobId: string;
  userId: string;
  actorRole: 'customer' | 'talent' | 'admin';
  actorName: string;
  message: string;
}) {
  const response = await fetch('/api/jobs/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const data = await readApiResult<JobComment>(response, 'Gagal mengirim diskusi.');
  dispatchJobsUpdated();
  return data;
}

export async function submitJobApplication(input: {
  jobId: string;
  talentId: string;
  talentName: string;
  talentAvatar?: string;
  offerPrice: number;
  estimatedDuration: string;
  message: string;
}) {
  const response = await fetch('/api/jobs/applications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const data = await readApiResult<JobApplication>(response, 'Gagal mengirim penawaran.');
  dispatchJobsUpdated();
  return data;
}

export async function updateJobApplicationStatus(id: string, status: JobApplication['status']) {
  const response = await fetch('/api/jobs/applications', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, status }),
  });

  const data = await readApiResult<JobApplication>(response, 'Gagal memperbarui lamaran.');
  dispatchJobsUpdated();
  return data;
}

export async function acceptJobApplication(jobId: string, applicationId: string) {
  const response = await fetch('/api/jobs/accept', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ jobId, applicationId }),
  });

  const data = await readApiResult<{
    orderId: string;
    jobId: string;
    applicationId: string;
    customerName: string;
    talentId: string;
    talentName: string;
    title: string;
    location: string;
    date: string;
    time: string;
    durationHours: number;
    totalPrice: number;
  }>(response, 'Gagal menerima lamaran.');

  seedBookingAndChat(data);
  dispatchJobsUpdated();
  return data;
}

function seedBookingAndChat(payload: {
  orderId: string;
  customerName: string;
  talentId: string;
  talentName: string;
  title: string;
  location: string;
  date: string;
  time: string;
  durationHours: number;
  totalPrice: number;
}) {
  const currentCustomer = getCurrentCustomerProfile();
  const existingBookings = getBookings(payload.talentId);
  const alreadyExists = existingBookings.some((booking) => booking.id === payload.orderId);
  if (!alreadyExists) {
    const nextBooking: Booking = {
      id: payload.orderId || generateOrderId(),
      serviceId: 'job-marketplace',
      talentId: payload.talentId,
      date: payload.date,
      time: payload.time,
      duration: payload.durationHours,
      location: payload.location,
      notes: `Booking otomatis dari lowongan: ${payload.title}`,
      customerName: currentCustomer?.fullName || payload.customerName,
      customerPhone: currentCustomer?.phone || '-',
      price: payload.totalPrice,
      platformFee: 0,
      total: payload.totalPrice,
      status: 'confirmed',
      bookedStartTime: `${payload.date}T${payload.time}:00`,
      bookedEndTime: `${payload.date}T${payload.time}:00`,
      bookedDurationMinutes: Math.round(payload.durationHours * 60),
      actualDurationMinutes: 0,
      overtimeMinutes: 0,
    };
    saveBookings([nextBooking, ...existingBookings]);
  }

  const now = new Date().toISOString();
  localStorage.setItem(
    `${CHAT_STORAGE_KEY_PREFIX}:${payload.orderId}`,
    JSON.stringify([
      {
        id: `${payload.orderId}-sys-1`,
        bookingId: payload.orderId,
        senderId: null,
        senderRole: 'system',
        senderName: 'Suruhin',
        message: `Booking untuk pekerjaan "${payload.title}" berhasil dibuat. Chat customer dan talent sekarang aktif.`,
        createdAt: now,
      },
      {
        id: `${payload.orderId}-sys-2`,
        bookingId: payload.orderId,
        senderId: payload.talentId,
        senderRole: 'talent',
        senderName: payload.talentName,
        message: 'Halo, saya siap lanjut koordinasi detail pekerjaan ini.',
        createdAt: now,
      },
    ])
  );
}

export function subscribeJobRealtime(onChange: () => void) {
  const supabase = getSupabaseBrowserClient();

  const handleLocalUpdate = () => onChange();
  window.addEventListener(JOBS_UPDATED_EVENT, handleLocalUpdate);

  if (!supabase) {
    return () => {
      window.removeEventListener(JOBS_UPDATED_EVENT, handleLocalUpdate);
    };
  }

  const channel = supabase
    .channel('suruhin-job-marketplace')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'job_posts' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'job_comments' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'job_applications' }, onChange)
    .subscribe();

  return () => {
    window.removeEventListener(JOBS_UPDATED_EVENT, handleLocalUpdate);
    supabase.removeChannel(channel);
  };
}

export function getJobsViewerContext() {
  const currentTalent = getCurrentSessionUser();
  const currentCustomer = getCurrentCustomerProfile();

  return {
    currentTalent,
    currentCustomer,
    isTalentLoggedIn: Boolean(currentTalent),
    isCustomerReady: Boolean(currentCustomer),
  };
}
