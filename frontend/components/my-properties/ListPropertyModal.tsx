'use client';

import { useState } from 'react';
import { AlertTriangle, Loader2, Tag } from 'lucide-react';
import { parseEther } from 'ethers';
import { FormDialog } from '@/components/ui/Dialog';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import apiClient from '@/lib/api/client';
import type { Contract } from 'ethers';

interface ListPropertyModalProps {
  isOpen:        boolean;
  tokenId:       string;       // on-chain NFT token id (numeric string)
  dbPropertyId:  string | null;
  propertyName:  string;
  currentPrice:  string;       // current price in ETH
  writeContract: Contract | null;
  walletAddress: string | null;
  onClose:       () => void;
  onSuccess:     () => void;
}

type ListingChoice = 'SALE' | 'RENT' | 'BOTH';

export function ListPropertyModal({
  isOpen,
  tokenId,
  dbPropertyId,
  propertyName,
  currentPrice,
  writeContract,
  walletAddress,
  onClose,
  onSuccess,
}: ListPropertyModalProps) {
  const dispatch = useAppDispatch();
  const [listingType, setListingType] = useState<ListingChoice>('SALE');
  const [salePrice,   setSalePrice]   = useState(currentPrice || '');
  const [rentPrice,   setRentPrice]   = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  // Detect if this is a DB-only property (no real on-chain NFT yet)
  const isDbOnly = !tokenId || tokenId.startsWith('db_') || tokenId.startsWith('pending_');
  const isNumericToken = /^\d+$/.test(tokenId);

  const handleSubmit = async () => {
    setError('');

    // Validate prices
    const sale = parseFloat(salePrice.trim());
    const rent = parseFloat(rentPrice.trim());

    if ((listingType === 'SALE' || listingType === 'BOTH') && (isNaN(sale) || sale <= 0)) {
      setError('Enter a valid sale price (ETH).');
      return;
    }
    if ((listingType === 'RENT' || listingType === 'BOTH') && (isNaN(rent) || rent <= 0)) {
      setError('Enter a valid monthly rent (ETH).');
      return;
    }

    setLoading(true);

    try {
      // ── On-chain listing (only for properties with a real numeric tokenId) ──
      if (isNumericToken && writeContract) {
        try {
          if (listingType === 'SALE' || listingType === 'BOTH') {
            const tx = await (writeContract as unknown as {
              listProperty: (id: bigint, price: bigint) => Promise<{ wait: () => Promise<void> }>;
            }).listProperty(BigInt(tokenId), BigInt(Math.floor(sale)));
            await tx.wait();
          }
          if (listingType === 'RENT' || listingType === 'BOTH') {
            const tx = await (writeContract as unknown as {
              listForRent: (id: bigint, price: bigint) => Promise<{ wait: () => Promise<void> }>;
            }).listForRent(BigInt(tokenId), BigInt(Math.floor(rent)));
            await tx.wait();
          }
        } catch (chainErr: unknown) {
          const e = chainErr as { reason?: string; shortMessage?: string; message?: string };
          // If on-chain fails, continue with DB update only
          console.warn('[ListPropertyModal] chain call failed:', e.reason ?? e.message);
        }
      }

      // ── DB update — always done ──────────────────────────────────────────────
      if (dbPropertyId) {
        await apiClient.post(`/properties/${dbPropertyId}/list`, {
          wallet:    walletAddress,
          isForSale: listingType === 'SALE' || listingType === 'BOTH',
          isForRent: listingType === 'RENT' || listingType === 'BOTH',
          price:     (listingType === 'SALE' || listingType === 'BOTH') ? salePrice.trim() : undefined,
          rentPrice: (listingType === 'RENT' || listingType === 'BOTH') ? rentPrice.trim() : undefined,
        });
      }

      dispatch(addToast({
        type:    'success',
        title:   'Property listed! 🎉',
        message: `${propertyName} is now on the marketplace.`,
      }));
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; error?: string } } };
      setError(e?.response?.data?.message ?? e?.response?.data?.error ?? 'Failed to list property. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = !loading && (
    ((listingType === 'SALE' || listingType === 'BOTH') ? parseFloat(salePrice) > 0 : true) &&
    ((listingType === 'RENT' || listingType === 'BOTH') ? parseFloat(rentPrice) > 0 : true)
  );

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={() => { onClose(); setError(''); }}
      onSubmit={() => void handleSubmit()}
      title="List property on marketplace"
      description={`Set the price and listing type for "${propertyName}". Buyers can then purchase or rent it.`}
      icon={Tag}
      submitLabel={loading ? 'Listing…' : 'List property'}
      isLoading={loading}
      submitDisabled={!canSubmit}
    >
      <div className="space-y-4">
        {/* Warning for DB-only properties */}
        {isDbOnly && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            The smart contract listing will be skipped (property not yet on-chain), but the DB will be updated so it shows on the marketplace.
          </div>
        )}

        {/* Listing type */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Listing type</label>
          <div className="grid grid-cols-3 gap-2">
            {(['SALE', 'RENT', 'BOTH'] as ListingChoice[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setListingType(t)}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                  listingType === t
                    ? 'border-accent bg-accent/10 text-foreground'
                    : 'border-border bg-background text-muted hover:border-accent/40'
                }`}
              >
                {t === 'BOTH' ? 'Sale & Rent' : t === 'SALE' ? 'For Sale' : 'For Rent'}
              </button>
            ))}
          </div>
        </div>

        {/* Sale price */}
        {(listingType === 'SALE' || listingType === 'BOTH') && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Sale price (ETH)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder="e.g. 5"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        )}

        {/* Rent price */}
        {(listingType === 'RENT' || listingType === 'BOTH') && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Monthly rent (ETH/mo)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={rentPrice}
              onChange={(e) => setRentPrice(e.target.value)}
              placeholder="e.g. 0.5"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        )}

        {/* Commission note */}
        <p className="text-xs text-muted">
          A 2% commission applies when the property is sold or rented on-chain.
          No upfront fee to list.
        </p>

        {error && (
          <p className="flex items-start gap-1.5 text-xs text-destructive">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" /> {error}
          </p>
        )}
      </div>
    </FormDialog>
  );
}
