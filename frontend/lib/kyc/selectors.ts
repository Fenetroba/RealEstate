import type { KycSubmission } from '@/lib/kyc/types';
import type { RootState } from '@/store';

const EMPTY_SUBMISSIONS: KycSubmission[] = [];

export const selectKycSubmissions = (state: RootState) =>
  state.kyc?.submissions ?? EMPTY_SUBMISSIONS;

export function selectKycSubmissionForUser(
  submissions: KycSubmission[],
  userId: string | undefined,
): KycSubmission | undefined {
  if (!userId) return undefined;
  return submissions.find((s) => s.userId === userId);
}

export const selectKycSubmissionByUserId =
  (userId: string | undefined) => (state: RootState) =>
    selectKycSubmissionForUser(selectKycSubmissions(state), userId);
