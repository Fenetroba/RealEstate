'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, LogOut, Wallet } from 'lucide-react';

import { Button, type ButtonProps } from '@/components/ui/Button';
import { useWeb3 } from '@/contexts/Web3Context';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { cn, truncateAddress } from '@/lib/utils';

interface WalletConnectControlProps {
  className?: string;
  chipClassName?: string;
  walletVariant?: ButtonProps['variant'];
  fullWidth?: boolean;
}

export function WalletConnectControl({
  className,
  chipClassName,
  walletVariant = 'outline',
  fullWidth = false,
}: WalletConnectControlProps) {
  const dispatch = useAppDispatch();
  const { connect, disconnect } = useWeb3();
  const { address, isConnected, isConnecting, error } = useAppSelector((s) => s.wallet);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const [mounted, setMounted] = useState(false);
  const prevConnected = useRef<boolean>(isConnected); // init from current state, not false
  const prevError = useRef<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // Toast on connect / disconnect — only fires when state genuinely changes
  useEffect(() => {
    if (!mounted) return;

    if (isConnected && !prevConnected.current && address) {
      dispatch(addToast({
        type: 'success',
        title: 'Wallet connected',
        message: truncateAddress(address),
        duration: 4000,
      }));
    }

    if (!isConnected && prevConnected.current) {
      dispatch(addToast({
        type: 'info',
        title: 'Wallet disconnected',
        duration: 3000,
      }));
    }

    prevConnected.current = isConnected;
  }, [isConnected, address, mounted, dispatch]);

  // Toast on wallet error (e.g. user rejected MetaMask)
  useEffect(() => {
    if (!mounted) return;
    if (error && error !== prevError.current) {
      dispatch(addToast({
        type: 'error',
        title: 'Wallet error',
        message: error,
        duration: 5000,
      }));
    }
    prevError.current = error;
  }, [error, mounted, dispatch]);

  const handleConnect = () => {
    if (!isAuthenticated) {
      dispatch(addToast({
        type: 'warning',
        title: 'Login required',
        message: 'Please log in first to connect your wallet.',
        duration: 4000,
      }));
      return;
    }
    void connect();
  };

  // Stable SSR placeholder
  if (!mounted) {
    return (
      <Button
        variant={walletVariant}
        size="sm"
        className={cn(fullWidth && 'w-full', className)}
        leftIcon={<Wallet className="size-4" />}
        disabled={false}
        onClick={handleConnect}
      >
        Wallet
      </Button>
    );
  }

  // ── Connected ───────────────────────────────────────────────────────────────
  if (isConnected && address) {
    return (
      <div className={cn('flex items-center gap-2', fullWidth && 'w-full', className)}>
        <span
          className={cn(
            'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs',
            'border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-400',
            chipClassName,
          )}
        >
          <span className="relative flex size-2 shrink-0">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-green-500" />
          </span>
          {truncateAddress(address)}
        </span>

        <button
          type="button"
          onClick={disconnect}
          className="inline-flex size-8 items-center justify-center rounded-full border border-green-500/30 text-green-600 transition-colors hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-950"
          title="Disconnect wallet"
          aria-label="Disconnect wallet"
        >
          <LogOut className="size-3.5" />
        </button>
      </div>
    );
  }

  // ── Disconnected ────────────────────────────────────────────────────────────
  return (
    <Button
      variant={walletVariant}
      size="sm"
      className={cn(fullWidth && 'w-full', className)}
      leftIcon={
        isConnecting
          ? <Loader2 className="size-4 animate-spin" />
          : <Wallet className="size-4" />
      }
      disabled={isConnecting}
      onClick={handleConnect}
    >
      Wallet
    </Button>
  );
}



