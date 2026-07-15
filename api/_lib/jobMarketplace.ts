import { MultipartFile, readMultipartPayload } from './multipart';
import { getSupabaseAdminClient } from './supabaseAdmin';
import { assertUploadableFile, getSafeExtension, uploadPrivateBuffer } from './mvpUpload';
import type { VercelRequest } from '@vercel/node';

export type JobPostStatus = "DRAFT" | "OPEN" | "IN_DISCUSSION" | "RECRUITED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "EXPIRED";
export type JobApplicationStatus = "SUBMITTED" | "VIEWED" | "SHORTLISTED" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
export type JobServiceMode = "ONLINE" | "OFFLINE" | "HYBRID";

export interface JobCreatePayload {
  customerId: string;
  customerName: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  budget: number;
  location: string;
  latitude: number | null;
  longitude: number | null;
  serviceMode: JobServiceMode;
  deadline: string | null;
  status: JobPostStatus;
  imagePath: string | null;
  filePath: string | null;
}

export function required(value: unknown, label: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label} wajib diisi.`);
  }
  return value.trim();
}

export function optionalString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export function optionalNumber(value: unknown) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function parseDate(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return value.trim();
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export async function readJobMultipartPayload(req: VercelRequest) {
  const { fields, files } = await readMultipartPayload(req);
  const jobId = required(fields.id, 'ID pekerjaan');

  const imageFile = files.imageFile;
  const attachmentFile = files.attachmentFile;

  let imagePath = '';
  let filePath = '';

  if (imageFile) {
    assertUploadableFile(imageFile, 'Gambar pekerjaan');
    const imageExt = getSafeExtension(imageFile, 'jpg');
    imagePath = await uploadPrivateBuffer('job-images', `job/posts/${jobId}/cover.${imageExt}`, imageFile, { upsert: true });
  }

  if (attachmentFile) {
    assertUploadableFile(attachmentFile, 'Lampiran pekerjaan');
    const fileExt = getSafeExtension(attachmentFile, 'pdf');
    filePath = await uploadPrivateBuffer('job-files', `job/files/${jobId}/brief.${fileExt}`, attachmentFile, { upsert: true });
  }

  return {
    fields,
    files,
    jobId,
    imagePath: imagePath || null,
    filePath: filePath || null,
  };
}

export function normalizeJobCreatePayload(input: {
  customerId?: unknown;
  customerName?: unknown;
  title?: unknown;
  description?: unknown;
  categoryId?: unknown;
  categoryName?: unknown;
  budget?: unknown;
  location?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  serviceMode?: unknown;
  deadline?: unknown;
  status?: unknown;
  imagePath?: string | null;
  filePath?: string | null;
}): JobCreatePayload {
  const normalizedStatus = typeof input.status === 'string' ? input.status.trim().toUpperCase() : 'OPEN';
  const normalizedServiceMode = typeof input.serviceMode === 'string' ? input.serviceMode.trim().toUpperCase() : 'OFFLINE';

  return {
    customerId: required(input.customerId, 'Customer'),
    customerName: required(input.customerName, 'Nama customer'),
    title: required(input.title, 'Judul pekerjaan'),
    description: required(input.description, 'Deskripsi pekerjaan'),
    categoryId: required(input.categoryId, 'Kategori pekerjaan'),
    categoryName: required(input.categoryName, 'Nama kategori'),
    budget: optionalNumber(input.budget) ?? 0,
    location: required(input.location, 'Lokasi pekerjaan'),
    latitude: optionalNumber(input.latitude),
    longitude: optionalNumber(input.longitude),
    serviceMode: (['ONLINE', 'OFFLINE', 'HYBRID'].includes(normalizedServiceMode) ? normalizedServiceMode : 'OFFLINE') as JobServiceMode,
    deadline: parseDate(input.deadline),
    status: (['DRAFT', 'OPEN', 'IN_DISCUSSION', 'RECRUITED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED'].includes(normalizedStatus) ? normalizedStatus : 'OPEN') as JobPostStatus,
    imagePath: input.imagePath || null,
    filePath: input.filePath || null,
  };
}

export function buildJobSelectQuery() {
  return `
    id,
    customer_id,
    customer_name,
    title,
    slug,
    description,
    category_id,
    category_name,
    budget,
    location,
    latitude,
    longitude,
    service_mode,
    deadline,
    status,
    image_path,
    file_path,
    selected_talent_id,
    selected_application_id,
    accepted_order_id,
    created_at,
    updated_at
  `.replace(/\s+/g, ' ').trim();
}

export async function getJobWithRelations(jobId: string) {
  const client = getSupabaseAdminClient();
  const { data: job, error: jobError } = await client
    .from('job_posts')
    .select(buildJobSelectQuery())
    .eq('id', jobId)
    .single();

  if (jobError) {
    throw new Error(jobError.message);
  }

  const [{ data: comments, error: commentsError }, { data: applications, error: applicationsError }] = await Promise.all([
    client
      .from('job_comments')
      .select('id, job_id, user_id, actor_role, actor_name, message, created_at')
      .eq('job_id', jobId)
      .order('created_at', { ascending: true }),
    client
      .from('job_applications')
      .select('id, job_id, talent_id, talent_name, talent_avatar, offer_price, estimated_duration, message, status, created_at')
      .eq('job_id', jobId)
      .order('created_at', { ascending: true }),
  ]);

  if (commentsError) throw new Error(commentsError.message);
  if (applicationsError) throw new Error(applicationsError.message);

  return {
    job,
    comments: comments || [],
    applications: applications || [],
  };
}

export async function countJobRelations(jobId: string) {
  const client = getSupabaseAdminClient();
  const [{ count: commentsCount }, { count: applicationsCount }] = await Promise.all([
    client.from('job_comments').select('id', { count: 'exact', head: true }).eq('job_id', jobId),
    client.from('job_applications').select('id', { count: 'exact', head: true }).eq('job_id', jobId),
  ]);

  return {
    commentsCount: commentsCount || 0,
    applicationsCount: applicationsCount || 0,
  };
}

export function mapJobRow(row: any, counts?: { commentsCount: number; applicationsCount: number }) {
  return {
    id: String(row.id),
    slug: String(row.slug),
    customerId: String(row.customer_id),
    customerName: String(row.customer_name || 'Customer Suruhin'),
    title: String(row.title),
    description: String(row.description || ''),
    categoryId: String(row.category_id),
    categoryName: String(row.category_name || ''),
    budget: Number(row.budget || 0),
    location: String(row.location || ''),
    latitude: row.latitude === null || row.latitude === undefined ? null : Number(row.latitude),
    longitude: row.longitude === null || row.longitude === undefined ? null : Number(row.longitude),
    serviceMode: row.service_mode,
    deadline: row.deadline ? String(row.deadline) : null,
    status: row.status,
    imagePath: row.image_path ? String(row.image_path) : null,
    filePath: row.file_path ? String(row.file_path) : null,
    commentCount: counts?.commentsCount || 0,
    applicationCount: counts?.applicationsCount || 0,
    selectedTalentId: row.selected_talent_id ? String(row.selected_talent_id) : null,
    selectedApplicationId: row.selected_application_id ? String(row.selected_application_id) : null,
    acceptedOrderId: row.accepted_order_id ? String(row.accepted_order_id) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapCommentRow(row: any) {
  return {
    id: String(row.id),
    jobId: String(row.job_id),
    userId: String(row.user_id),
    actorRole: row.actor_role,
    actorName: String(row.actor_name),
    message: String(row.message),
    createdAt: String(row.created_at),
  };
}

export function mapApplicationRow(row: any) {
  return {
    id: String(row.id),
    jobId: String(row.job_id),
    talentId: String(row.talent_id),
    talentName: String(row.talent_name),
    talentAvatar: row.talent_avatar ? String(row.talent_avatar) : null,
    offerPrice: Number(row.offer_price || 0),
    estimatedDuration: String(row.estimated_duration || ''),
    message: String(row.message || ''),
    status: row.status,
    createdAt: String(row.created_at),
  };
}
