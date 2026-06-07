'use client';

import { useEffect } from 'react';

import { useAppDispatch } from '@/store/hooks';
import { hydrateSavedProperties } from '@/store/slices/propertySlice';

export function SavedPropertiesHydrator() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(hydrateSavedProperties());
  }, [dispatch]);

  return null;
}
