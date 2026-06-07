'use client';

import { useEffect } from 'react';

import { useAppDispatch } from '@/store/hooks';
import { hydrateKyc } from '@/store/slices/kycSlice';

export function KycHydrator() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(hydrateKyc());
  }, [dispatch]);

  return null;
}
