const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PIN_PATTERN = /^\d{4,6}$/;
const ALLOWED_DOCUMENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'application/pdf',
]);
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
]);

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export function normalizePhoneInput(value: string) {
  return value.replace(/\D/g, '');
}

export function validateRequiredText(value: string, message: string, minLength = 1) {
  return value.trim().length >= minLength ? null : message;
}

export function validateEmail(value: string) {
  return EMAIL_PATTERN.test(value.trim()) ? null : 'Alamat email tidak valid.';
}

export function validatePhone(value: string) {
  const normalized = normalizePhoneInput(value);
  return normalized.length >= 9 ? null : 'Nomor WhatsApp tidak valid.';
}

export function validatePin(value: string) {
  return PIN_PATTERN.test(value.trim()) ? null : 'PIN harus terdiri dari 4 sampai 6 angka.';
}

export function validatePositiveNumber(value: number, message: string) {
  return Number.isFinite(value) && value > 0 ? null : message;
}

export function validateSelected<T>(value: T[], message: string) {
  return value.length > 0 ? null : message;
}

export function validateMvpUpload(file: File | null, label: string, required = true) {
  if (!file) {
    return required ? `${label} wajib diunggah.` : null;
  }

  if (!ALLOWED_DOCUMENT_TYPES.has(file.type)) {
    return `${label} harus berupa JPG, JPEG, PNG, atau PDF.`;
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return `${label} maksimal 5MB.`;
  }

  return null;
}

export function validateMvpImageUpload(file: File | null, label: string, required = true) {
  if (!file) {
    return required ? `${label} wajib diunggah.` : null;
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return `${label} harus berupa JPG, JPEG, atau PNG.`;
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return `${label} maksimal 5MB.`;
  }

  return null;
}

export function firstValidationError(...errors: Array<string | null | undefined>) {
  return errors.find(Boolean) || null;
}
