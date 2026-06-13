'use client';

import { useState } from 'react';
import { AlertTriangle, ArrowRight, Loader2, Wallet } from 'lucide-react';
import { FormDialog } from '@/components/ui/Dialog';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import type { Contract } from 'ethers';

interface TransferModalProps {
  isOpen:       boolean;
  tokenId:      string;
  propertyName: string;
  writeContract: Contract | null;
  onClose:      () => void;
  onSuccess:    () => void;
}

export function TransferModal({
  isOpen,
  tokenId,
  propertyName,
  writeContract,
  onClose,
  onSuccess,
}: TransferModalProps) {
  const dispatch = useAppDispatch();
  const [toAddress, setToAddress] = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  const handleTransfer = async () => {
    const addr = toAddress.trim();
    if (!addr || !/^0x[0-9a-fA-F]{40}$/.test(addr)) {
      setError('Enter a valid Ethereum address (0x…)');
      return;
    }
    if (!writeContract) {
      setError('Wallet not connected or contract unavailable.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // listProperty with price 0 would expose it, we just do a direct NFT transfer.
      // The contract allows ADMIN_ROLE to transfer; for self-transfer use the platform.
      // Since platformRestricted allows admin, we call transferFrom via the contract helper.
      // Fallback: backend-assisted transfer (POST /api/properties/:id/transfer)
      const tx = await (writeContract as unknown as {
        transferFrom: (from: string, to: string, tokenId: bigint) => Promise<{ wait: () => Promise<void> }>;
        ownerOf: (tokenId: bigint) => Promise<string>;
      }).ownerOf(BigInt(tokenId)).then(async (owner) =>
        (writeContract as unknown as {
          transferFrom: (from: string, to: string, tokenId: bigint) => Promise<{ wait: () => Promise<void> }>;
        }).transferFrom(owner, addr, BigInt(tokenId))
      );
      await tx.wait();
      dispatch(addToast({
        type:    'success',
        title:   'Transfer complete',
        message: `${propertyName} transferred to ${addr.slice(0, 10)}…`,
      }));
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const e = err as { reason?: string; shortMessage?: string; message?: string };
      const msg = e.reason ?? e.shortMessage ?? e.message ?? 'Transfer failed';
      // If restricted, show a helpful message
      if (msg.includes('platform') || msg.includes('allowed')) {
        setError('Direct transfers are restricted. The platform must approve transfers. Contact support.');
      } else {
        setError(msg.length > 120 ? msg.slice(0, 120) + '…' : msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={() => { onClose(); setToAddress(''); setError(''); }}
      onSubmit={() => void handleTransfer()}
      title="Transfer property ownership"
      description={`Transfer "${propertyName}" to another wallet address. This permanently changes NFT ownership on-chain.`}
      icon={ArrowRight}
      submitLabel={loading ? 'Transferring…' : 'Transfer'}
      isLoading={loading}
      submitDisabled={!toAddress.trim() || loading}
    >
      <div className="space-y-3">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          <AlertTriangle className="mb-1 inline size-3.5" /> This cannot be undone. The recipient
          will become the new registered owner of this property.
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Recipient wallet address
          </label>
          <div className="relative">
            <Wallet className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={toAddress}
              onChange={(e) => { setToAddress(e.target.value); setError(''); }}
              placeholder="0x…"
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm font-mono text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {error && (
          <p className="flex items-start gap-1.5 text-xs text-destructive">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" /> {error}
          </p>
        )}
      </div>
    </FormDialog>
  );
}
