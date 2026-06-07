export const SAVED_PROPERTIES_STORAGE_KEY = 'edenet-saved-property-ids';

export function readSavedPropertyIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_PROPERTIES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function writeSavedPropertyIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SAVED_PROPERTIES_STORAGE_KEY, JSON.stringify(ids));
}
