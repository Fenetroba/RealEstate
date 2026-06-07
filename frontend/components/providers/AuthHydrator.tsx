'use client';

import { useEffect } from 'react';

import { isMockAuthMode, readMockAuthSession } from '@/lib/mock-auth';
import { useAppDispatch } from '@/store/hooks';
import { fetchCurrentUser, setCredentials } from '@/store/slices/authSlice';

export function AuthHydrator() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isMockAuthMode()) {
      const session = readMockAuthSession();
      if (session) {
        dispatch(setCredentials(session));
      }
      return;
    }

    const token =
      typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      void dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  return null;
}
