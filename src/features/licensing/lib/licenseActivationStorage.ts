import type { StoredLicenseActivation } from '../types/license.types';

const LICENSE_ACTIVATION_STORAGE_KEY = 'xandeflix.licenseActivation';

export function getStoredLicenseActivation(): StoredLicenseActivation | null {
  const storedValue = window.localStorage.getItem(LICENSE_ACTIVATION_STORAGE_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(storedValue) as StoredLicenseActivation;

    if (!parsedValue.licenseCode?.trim() || !parsedValue.deviceIdentifier?.trim()) {
      return null;
    }

    return parsedValue;
  } catch {
    return null;
  }
}

export function saveStoredLicenseActivation(
  activation: StoredLicenseActivation,
) {
  window.localStorage.setItem(
    LICENSE_ACTIVATION_STORAGE_KEY,
    JSON.stringify(activation),
  );
}

export function clearStoredLicenseActivation() {
  window.localStorage.removeItem(LICENSE_ACTIVATION_STORAGE_KEY);
}
