export type VerifyFileType = 'IMAGE' | 'DOCUMENT' | string;

export interface VerifyFileIntegrityRow {
  fileName: string;
  fileType: VerifyFileType;
  storedHash: string;
  recomputedHash: string;
  match: boolean;
}

export interface PropertyVerifyReport {
  tokenId: string;
  propertyName?: string;
  currentVersion?: number;
  tamperProof: boolean;
  onChainMatch?: boolean;
  metadataHashMatch?: boolean;
  imagesRootMatch?: boolean;
  documentsRootMatch?: boolean;
  allFilesIntact?: boolean;
  filesIntegrity?: VerifyFileIntegrityRow[];
  dbMetadataHash?: string;
  recomputedMetadataHash?: string;
  onChainHash?: string;
  versionHistory?: Array<{ versionNo: number; metadataHash: string; timestamp: number } | string>;
  chainError?: string | null;
  message?: string;
}

/** Legacy backend fields */
export type LegacyVerifyFields = { ok?: boolean; valid?: boolean };

export type PropertyVerifyPayload = Partial<PropertyVerifyReport> & LegacyVerifyFields;

export function resolveTamperProof(report: PropertyVerifyPayload): boolean {
  if (typeof report.tamperProof === 'boolean') return report.tamperProof;
  if (report.ok === true || report.valid === true) return true;
  return false;
}
