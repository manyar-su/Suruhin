import { CustomerProfile } from '../types';

const CUSTOMER_PROFILE_KEY = 'suruhin_customer_profile';

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export function getCurrentCustomerProfile() {
  return safeParse<CustomerProfile>(localStorage.getItem(CUSTOMER_PROFILE_KEY));
}

export function saveCurrentCustomerProfile(profile: CustomerProfile) {
  localStorage.setItem(CUSTOMER_PROFILE_KEY, JSON.stringify(profile));
}

export function clearCurrentCustomerProfile() {
  localStorage.removeItem(CUSTOMER_PROFILE_KEY);
}
