import type { PropertyDocumentDto, PropertyImageDto } from '@/types/registry-property';

export function mediaDataUrl(item: { mimeType: string; data: string }): string {
  const raw = item.data.trim();
  if (raw.startsWith('data:')) return raw;
  const mime = item.mimeType?.trim() || 'application/octet-stream';
  return `data:${mime};base64,${raw}`;
}

export function imageAltText(image: PropertyImageDto, index: number): string {
  return (image.fileName ?? image.name)?.trim() || `Property image ${index + 1}`;
}

export function documentLabel(doc: PropertyDocumentDto, index: number): string {
  return (doc.fileName ?? doc.name)?.trim() || doc.type?.trim() || `Document ${index + 1}`;
}

export function openMediaInNewTab(item: { mimeType: string; data: string }): void {
  const raw = item.data.trim();
  const base64 = raw.startsWith('data:') ? raw.split(',')[1] : raw;
  const mime = item.mimeType?.trim() || 'application/octet-stream';
  const byteChars = atob(base64);
  const byteNumbers = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const blob = new Blob([byteNumbers], { type: mime });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) {
    // Revoke after tab has time to load
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
}