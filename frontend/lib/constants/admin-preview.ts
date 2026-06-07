export const ADMIN_PREVIEW_STORAGE_KEY = 'edenet-admin-preview';

export function readAdminPreviewStorage(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(ADMIN_PREVIEW_STORAGE_KEY) === '1';
}

export function writeAdminPreviewStorage(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  if (enabled) {
    sessionStorage.setItem(ADMIN_PREVIEW_STORAGE_KEY, '1');
  } else {
    sessionStorage.removeItem(ADMIN_PREVIEW_STORAGE_KEY);
  }
}

/** When true, dashboard can enter admin preview without gov wallet or API ADMIN role. */
export function isAdminPreviewEnvEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ADMIN_PREVIEW === 'true';
}
