'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import {
  isAdminPreviewEnvEnabled,
  readAdminPreviewStorage,
  writeAdminPreviewStorage,
} from '@/lib/constants/admin-preview';
import { useAppDispatch } from '@/store/hooks';
import { setAdminPreview } from '@/store/slices/uiSlice';

/**
 * Restores admin preview from sessionStorage, ?admin=1, or NEXT_PUBLIC_ADMIN_PREVIEW.
 * Runs inside the dashboard layout so the Platform sidebar is available without gov wallet.
 */
export function AdminPreviewHydrator() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fromQuery = searchParams.get('admin') === '1';
    const fromEnv = isAdminPreviewEnvEnabled();
    const enabled = fromQuery || fromEnv;
    if (enabled) {
      dispatch(setAdminPreview(true));
      writeAdminPreviewStorage(true);
    } else {
      // Always clear preview — wallet-based admin check handles it
      dispatch(setAdminPreview(false));
      writeAdminPreviewStorage(false);
    }
  }, [dispatch, searchParams]);

  return null;
}
