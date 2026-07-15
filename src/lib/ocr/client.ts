import type { KtpParsedFields } from './ktp';

export async function requestKtpOcr(file: File): Promise<KtpParsedFields> {
  const formData = new FormData();
  formData.append('file', file);

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
