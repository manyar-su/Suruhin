import type { KtpParsedFields } from './ktp';

export async function requestKtpOcr(
  file: File,
  options?: { entityId?: string; entityType?: 'customer' | 'talent' }
): Promise<KtpParsedFields> {
  const formData = new FormData();
  formData.append('file', file);
  if (options?.entityId) formData.append('entityId', options.entityId);
  if (options?.entityType) formData.append('entityType', options.entityType);

  const response = await fetch('/api/ocr/ktp', {
    method: 'POST',
    body: formData,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok || !payload?.data) {
    throw new Error(
      payload?.error || 'Data KTP belum terbaca jelas. Silakan upload ulang foto yang lebih terang atau isi manual.'
    );
  }

  return payload.data as KtpParsedFields;
}
