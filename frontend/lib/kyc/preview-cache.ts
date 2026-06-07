const previewByDocId = new Map<string, string>();

export function setKycDocPreview(docId: string, objectUrl: string) {
  const existing = previewByDocId.get(docId);
  if (existing && existing.startsWith('blob:')) {
    URL.revokeObjectURL(existing);
  }
  previewByDocId.set(docId, objectUrl);
}

export function getKycDocPreview(docId: string): string | undefined {
  return previewByDocId.get(docId);
}

export function revokeKycDocPreview(docId: string) {
  const url = previewByDocId.get(docId);
  if (url?.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
  previewByDocId.delete(docId);
}
