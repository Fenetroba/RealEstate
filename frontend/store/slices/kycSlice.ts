import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { KycDocKind, KycDocument, KycSubmission, KycSubmissionStatus } from '@/lib/kyc/types';
import { readKycSubmissions, writeKycSubmissions } from '@/lib/kyc/storage';
interface KycState {
  submissions: KycSubmission[];
  hydrated: boolean;
}

const initialState: KycState = {
  submissions: [],
  hydrated: false,
};

function persist(submissions: KycSubmission[]) {
  writeKycSubmissions(submissions);
}

function findByUserId(submissions: KycSubmission[], userId: string) {
  return submissions.find((s) => s.userId === userId);
}

const kycSlice = createSlice({
  name: 'kyc',
  initialState,
  reducers: {
    hydrateKyc: (state) => {
      state.submissions = readKycSubmissions();
      state.hydrated = true;
    },
    upsertDraftDocument: (
      state,
      action: PayloadAction<{
        userId: string;
        userName: string;
        userEmail: string;
        document: KycDocument;
      }>,
    ) => {
      const { userId, userName, userEmail, document } = action.payload;
      const existing = findByUserId(state.submissions, userId);
      const editable = !existing || existing.status === 'DRAFT' || existing.status === 'REJECTED';

      if (!editable) return;

      if (existing) {
        const withoutKind = existing.documents.filter((d) => d.kind !== document.kind);
        existing.documents = [...withoutKind, document];
        if (existing.status === 'REJECTED') {
          existing.status = 'DRAFT';
          existing.rejectionReason = undefined;
          existing.reviewedAt = undefined;
        }
      } else {
        state.submissions.push({
          id: `kyc-${userId}`,
          userId,
          userName,
          userEmail,
          status: 'DRAFT',
          documents: [document],
          submittedAt: null,
        });
      }
      persist(state.submissions);
    },
    removeDraftDocument: (
      state,
      action: PayloadAction<{ userId: string; documentId: string }>,
    ) => {
      const existing = findByUserId(state.submissions, action.payload.userId);
      if (!existing || existing.status !== 'DRAFT') return;
      existing.documents = existing.documents.filter((d) => d.id !== action.payload.documentId);
      persist(state.submissions);
    },
    submitKycForReview: (
      state,
      action: PayloadAction<{ userId: string; userName: string; userEmail: string }>,
    ) => {
      const { userId, userName, userEmail } = action.payload;
      let existing = findByUserId(state.submissions, userId);
      if (!existing) return;
      if (existing.status !== 'DRAFT' && existing.status !== 'REJECTED') return;

      existing = {
        ...existing,
        userName,
        userEmail,
        status: 'PENDING',
        submittedAt: new Date().toISOString(),
        rejectionReason: undefined,
        reviewedAt: undefined,
      };
      state.submissions = state.submissions.map((s) => (s.userId === userId ? existing! : s));
      persist(state.submissions);
    },
    resetKycAfterReject: (state, action: PayloadAction<{ userId: string }>) => {
      const existing = findByUserId(state.submissions, action.payload.userId);
      if (!existing || existing.status !== 'REJECTED') return;
      existing.status = 'DRAFT';
      existing.documents = [];
      existing.submittedAt = null;
      existing.rejectionReason = undefined;
      existing.reviewedAt = undefined;
      persist(state.submissions);
    },
    setKycSubmissionStatus: (
      state,
      action: PayloadAction<{
        submissionId: string;
        status: Extract<KycSubmissionStatus, 'APPROVED' | 'REJECTED'>;
        rejectionReason?: string;
      }>,
    ) => {
      const { submissionId, status, rejectionReason } = action.payload;
      const sub = state.submissions.find((s) => s.id === submissionId);
      if (!sub || sub.status !== 'PENDING') return;
      sub.status = status;
      sub.reviewedAt = new Date().toISOString();
      sub.rejectionReason = status === 'REJECTED' ? rejectionReason : undefined;
      persist(state.submissions);
    },
  },
});

export const {
  hydrateKyc,
  upsertDraftDocument,
  removeDraftDocument,
  submitKycForReview,
  resetKycAfterReject,
  setKycSubmissionStatus,
} = kycSlice.actions;

export default kycSlice.reducer;

export function selectKycSubmissionForUser(
  submissions: KycSubmission[],
  userId: string | undefined,
): KycSubmission | undefined {
  if (!userId) return undefined;
  return submissions.find((s) => s.userId === userId);
}
