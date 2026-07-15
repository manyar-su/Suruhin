import { MultipartFile } from './multipart';
import { getSupabaseAdminClient } from './supabaseAdmin';

export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'application/pdf',
]);

export function getSafeExtension(file: Pick<MultipartFile, 'name' | 'type'>, fallback: string) {
  const nameExt = file.name.split('.').pop()?.toLowerCase();
  if (nameExt && ['jpg', 'jpeg', 'png', 'pdf'].includes(nameExt)) return nameExt;
  if (file.type === 'image/png') return 'png';
  if (file.type === 'application/pdf') return 'pdf';
  return fallback;
}

export function assertUploadableFile(file: MultipartFile | undefined, label: string): asserts file is MultipartFile {
  if (!file) {
    throw new Error(`${label} wajib diunggah.`);
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(`${label} harus berformat JPG, JPEG, PNG, atau PDF.`);
  }

  if (file.buffer.length > MAX_FILE_SIZE) {
    throw new Error(`Ukuran ${label} maksimal 5MB.`);
  }
}

export async function uploadPrivateBuffer(
  bucket: 'customer-files' | 'talent-files' | 'job-images' | 'job-files',
  path: string,
  file: MultipartFile,
  options?: { upsert?: boolean },
) {
  const client = getSupabaseAdminClient();
  const { error } = await client.storage.from(bucket).upload(path, file.buffer, {
    cacheControl: '3600',
    upsert: options?.upsert ?? true,
    contentType: file.type || undefined,
  });

  if (error) {
    throw new Error(error.message);
  }

  return path;
}
