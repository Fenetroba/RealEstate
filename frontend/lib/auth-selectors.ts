import { isGovWalletAddress } from '@/lib/web3/config';
import type { RootState } from '@/store';

/** App account with platform admin privileges (API role, gov wallet, or UI preview). */
export function isAppAdminUser(state: RootState): boolean {
  const role = state.auth.user?.role?.toUpperCase();
  return (
    role === 'ADMIN' ||
    isGovWalletAddress(state.wallet.address) ||
    state.ui.adminPreview
  );
}

export const selectAdminPreview = (state: RootState) => state.ui.adminPreview;

export const selectIsAppAdmin = (state: RootState) => isAppAdminUser(state);
