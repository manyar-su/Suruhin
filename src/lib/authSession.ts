import { talents } from '../data/talents';
import { Talent } from '../types';

const LEGACY_USER_KEY = 'suruhin_user';
const SESSION_KEY = 'suruhin_auth_session';
const CUSTOM_TALENT_KEY = 'suruhin_custom_talent';
const CUSTOM_CREDENTIALS_KEY = 'suruhin_custom_credentials';
const LOGIN_GUARD_KEY = 'suruhin_login_guard';
const SUBMIT_GUARD_KEY = 'suruhin_auth_submit_guard';

const SESSION_INACTIVITY_MS = 6 * 60 * 60 * 1000;
const SESSION_MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;
const FAILED_WINDOW_MS = 15 * 60 * 1000;
const LOCK_DURATION_MS = 30 * 60 * 1000;
const SUBMIT_COOLDOWN_MS = 1200;
export const TALENT_CATALOG_UPDATED_EVENT = 'suruhin_talents_updated';

const DEFAULT_DEMO_CREDENTIAL = {
  phone: '08123456789',
  pin: '1234',
  userId: 't-1',
  isCustom: false,
};

interface SessionEnvelope {
  user: Talent;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
}

interface StoredCredential {
  phone: string;
  pin: string;
  userId: string;
  registeredAt?: string;
  isCustom: boolean;
}

interface LoginGuardState {
  failedAttempts: number;
  firstFailedAt?: string;
  lastAttemptAt?: string;
  lockedUntil?: string;
}

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(error);
    return null;
  }
}

function nowIso() {
  return new Date().toISOString();
}

export function normalizePhone(value: string) {
  return value.replace(/\D/g, '');
}

function getStoredTalentOverrides(): Talent[] {
  const parsed = safeParse<Talent | Talent[]>(localStorage.getItem(CUSTOM_TALENT_KEY));
  if (!parsed) {
    return [];
  }

  return Array.isArray(parsed) ? parsed : [parsed];
}

function emitTalentCatalogUpdated() {
  window.dispatchEvent(new Event(TALENT_CATALOG_UPDATED_EVENT));
}

export function getAllTalents(): Talent[] {
  const overrides = getStoredTalentOverrides();
  if (overrides.length === 0) {
    return [...talents];
  }

  const overrideMap = new Map(overrides.map((talent) => [talent.id, talent]));
  const mergedStatic = talents.map((talent) => overrideMap.get(talent.id) || talent);
  const appendedCustom = overrides.filter((talent) => !talents.some((item) => item.id === talent.id));

  return [...appendedCustom, ...mergedStatic];
}

export function upsertCustomTalent(user: Talent) {
  const currentOverrides = getStoredTalentOverrides();
  const nextOverrides = currentOverrides.filter((talent) => talent.id !== user.id);
  nextOverrides.unshift(user);
  localStorage.setItem(CUSTOM_TALENT_KEY, JSON.stringify(nextOverrides));
  emitTalentCatalogUpdated();
}

function resolveUserById(userId: string): Talent | null {
  return getAllTalents().find((talent) => talent.id === userId) || null;
}

function buildSession(user: Talent): SessionEnvelope {
  const now = Date.now();
  return {
    user,
    createdAt: new Date(now).toISOString(),
    lastActiveAt: new Date(now).toISOString(),
    expiresAt: new Date(now + SESSION_MAX_AGE_MS).toISOString(),
  };
}

function persistSession(session: SessionEnvelope) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(session.user));
}

function clearLegacyArtifacts() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
}

export function createUserSession(user: Talent) {
  persistSession(buildSession(user));
}

export function updateStoredUser(user: Talent) {
  const existing = safeParse<SessionEnvelope>(localStorage.getItem(SESSION_KEY));
  if (existing) {
    persistSession({
      ...existing,
      user,
      lastActiveAt: nowIso(),
    });
  } else {
    createUserSession(user);
  }

  emitTalentCatalogUpdated();
}

export function clearUserSession() {
  clearLegacyArtifacts();
}

export function touchUserSession() {
  const existing = safeParse<SessionEnvelope>(localStorage.getItem(SESSION_KEY));
  if (!existing) return;
  persistSession({
    ...existing,
    lastActiveAt: nowIso(),
  });
}

function isSessionExpired(session: SessionEnvelope) {
  const now = Date.now();
  const lastActiveAt = new Date(session.lastActiveAt).getTime();
  const expiresAt = new Date(session.expiresAt).getTime();
  return Number.isNaN(lastActiveAt) || Number.isNaN(expiresAt) || now - lastActiveAt > SESSION_INACTIVITY_MS || now > expiresAt;
}

function migrateLegacySession(): Talent | null {
  const legacyUser = safeParse<Talent>(localStorage.getItem(LEGACY_USER_KEY));
  if (!legacyUser) {
    return null;
  }
  createUserSession(legacyUser);
  return legacyUser;
}

export function getCurrentSessionUser(): Talent | null {
  const session = safeParse<SessionEnvelope>(localStorage.getItem(SESSION_KEY));
  if (session) {
    if (isSessionExpired(session)) {
      clearLegacyArtifacts();
      return null;
    }
    return session.user;
  }
  return migrateLegacySession();
}

function getStoredCredentials(): StoredCredential[] {
  const customCredential = safeParse<StoredCredential>(localStorage.getItem(CUSTOM_CREDENTIALS_KEY));
  if (customCredential) {
    return [customCredential, DEFAULT_DEMO_CREDENTIAL];
  }
  return [DEFAULT_DEMO_CREDENTIAL];
}

export function registerCustomCredential(phone: string, pin: string, userId: string) {
  const credential: StoredCredential = {
    phone: normalizePhone(phone),
    pin,
    userId,
    registeredAt: nowIso(),
    isCustom: true,
  };
  localStorage.setItem(CUSTOM_CREDENTIALS_KEY, JSON.stringify(credential));
}

export function isPhoneAlreadyRegistered(phone: string) {
  const normalized = normalizePhone(phone);
  return getStoredCredentials().some((credential) => credential.phone === normalized && credential.isCustom);
}

export function resolveLoginUser(phone: string, pin: string): Talent | null {
  const normalizedPhone = normalizePhone(phone);
  const credential = getStoredCredentials().find((item) => item.phone === normalizedPhone && item.pin === pin);
  if (!credential) {
    return null;
  }
  return resolveUserById(credential.userId);
}

function getLoginGuardMap() {
  return safeParse<Record<string, LoginGuardState>>(localStorage.getItem(LOGIN_GUARD_KEY)) || {};
}

function saveLoginGuardMap(guards: Record<string, LoginGuardState>) {
  localStorage.setItem(LOGIN_GUARD_KEY, JSON.stringify(guards));
}

function getGuardKey(phone: string) {
  const normalized = normalizePhone(phone);
  return normalized || 'anonymous';
}

function formatMinutes(ms: number) {
  return Math.max(1, Math.ceil(ms / 60000));
}

export function checkLoginAttempt(phone: string) {
  const guard = getLoginGuardMap()[getGuardKey(phone)];
  if (!guard?.lockedUntil) {
    return { allowed: true as const };
  }

  const remainingMs = new Date(guard.lockedUntil).getTime() - Date.now();
  if (remainingMs <= 0) {
    clearLoginAttempts(phone);
    return { allowed: true as const };
  }

  return {
    allowed: false as const,
    message: `Terlalu banyak percobaan gagal. Coba lagi dalam ${formatMinutes(remainingMs)} menit.`,
  };
}

export function recordFailedLogin(phone: string) {
  const guards = getLoginGuardMap();
  const key = getGuardKey(phone);
  const now = Date.now();
  const existing = guards[key];

  let failedAttempts = 1;
  let firstFailedAt = new Date(now).toISOString();

  if (existing?.firstFailedAt) {
    const firstWindow = new Date(existing.firstFailedAt).getTime();
    if (now - firstWindow <= FAILED_WINDOW_MS) {
      failedAttempts = existing.failedAttempts + 1;
      firstFailedAt = existing.firstFailedAt;
    }
  }

  guards[key] = {
    failedAttempts,
    firstFailedAt,
    lastAttemptAt: new Date(now).toISOString(),
    lockedUntil: failedAttempts >= MAX_FAILED_ATTEMPTS ? new Date(now + LOCK_DURATION_MS).toISOString() : undefined,
  };

  saveLoginGuardMap(guards);
  return guards[key];
}

export function clearLoginAttempts(phone: string) {
  const guards = getLoginGuardMap();
  delete guards[getGuardKey(phone)];
  saveLoginGuardMap(guards);
}

export function getFailedAttemptSummary(phone: string) {
  const guard = getLoginGuardMap()[getGuardKey(phone)];
  if (!guard) return null;

  if (guard.lockedUntil) {
    const remainingMs = new Date(guard.lockedUntil).getTime() - Date.now();
    if (remainingMs > 0) {
      return {
        remainingAttempts: 0,
        lockMessage: `Akun sementara dikunci ${formatMinutes(remainingMs)} menit untuk melindungi sesi.`,
      };
    }
  }

  return {
    remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - guard.failedAttempts),
  };
}

export function checkAuthSubmitThrottle(scope: 'login' | 'register') {
  const throttleMap = safeParse<Record<string, string>>(localStorage.getItem(SUBMIT_GUARD_KEY)) || {};
  const lastSubmit = throttleMap[scope] ? new Date(throttleMap[scope]).getTime() : 0;
  const elapsed = Date.now() - lastSubmit;

  if (elapsed < SUBMIT_COOLDOWN_MS) {
    return {
      allowed: false as const,
      message: 'Tunggu sebentar sebelum mengirim ulang formulir.',
    };
  }

  throttleMap[scope] = nowIso();
  localStorage.setItem(SUBMIT_GUARD_KEY, JSON.stringify(throttleMap));

  return { allowed: true as const };
}

export function getSessionPolicySummary() {
  return {
    inactivityHours: SESSION_INACTIVITY_MS / (60 * 60 * 1000),
    maxAgeDays: SESSION_MAX_AGE_MS / (24 * 60 * 60 * 1000),
    maxFailedAttempts: MAX_FAILED_ATTEMPTS,
    failedWindowMinutes: FAILED_WINDOW_MS / 60000,
    lockDurationMinutes: LOCK_DURATION_MS / 60000,
  };
}
