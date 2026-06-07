export type KycDocKind = 'ID_FRONT' | 'ID_BACK' | 'SELFIE';

export type KycSubmissionStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface KycDocument {
  id: string;
  kind: KycDocKind;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface KycSubmission {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: KycSubmissionStatus;
  documents: KycDocument[];
  submittedAt: string | null;
  reviewedAt?: string;
  rejectionReason?: string;
}

export const KYC_STORAGE_KEY = 'edenet-kyc-submissions-v1';

export const KYC_DOC_LABELS: Record<KycDocKind, string> = {
  ID_FRONT: 'Government ID (front)',
  ID_BACK: 'Government ID (back)',
  SELFIE: 'Selfie with ID',
};

export const KYC_DOC_DESCRIPTIONS: Record<KycDocKind, string> = {
  ID_FRONT: 'Clear photo of the front of your government-issued ID.',
  ID_BACK: 'Clear photo of the back of the same ID.',
  SELFIE: 'Photo of your face holding the ID next to you — both must be readable.',
};

export const KYC_REQUIRED_KINDS: KycDocKind[] = ['ID_FRONT', 'ID_BACK', 'SELFIE'];
