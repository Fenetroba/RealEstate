'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearWalletMessage } from '@/store/slices/walletSlice';
import { cn } from '@/lib/utils';

/** Above site navbar (z-50); sits under the nav bar on marketing pages. */
const WALLET_BANNER_Z = 'z-[60]';

export function WalletStatusBanner() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { error, message, isConnected } = useAppSelector((s) => s.wallet);

  const text = error || (isConnected ? message : null);
  const isError = Boolean(error);
  const hasSiteNav = pathname ? !pathname.startsWith('/dashboard') : true;

  useEffect(() => {
    const height = text ? '2.75rem' : '0px';
    document.documentElement.style.setProperty('--wallet-status-banner-height', height);
    return () => {
      document.documentElement.style.setProperty('--wallet-status-banner-height', '0px');
    };
  }, [text]);

  if (!text) return null;

  return (
   <div>
    
   </div>
  );
}
