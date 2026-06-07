'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setTheme } from '@/store/slices/uiSlice';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);

  useEffect(() => {
    const saved = localStorage.getItem('edenet-theme');
    if (saved === 'light' || saved === 'dark') {
      dispatch(setTheme(saved));
    }
  }, [dispatch]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('edenet-theme', theme);
  }, [theme]);

  return <>{children}</>;
}
