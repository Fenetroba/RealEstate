'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, ShoppingCart, Tag } from 'lucide-react';
import { parseEther } from 'ethers';

import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { useWeb3 } from '@/contexts/Web3Context';
import { isRegistryMockMode } from '@/lib/web3/registry-mock';
import { REGISTRY_MOCK_PREVIEW_ACCOUNT } from '@/lib/web3/registry-mock';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import type { Property } from '@/types';

function txErrorMessage(err: unknown): string {
  const e = err as { shortMessage?: string; reason?: string; message?: string };
  return e?.shortMessage || e?.reason || e?.message || 'Transaction failed';
}

interface PropertyDetailRegistryActionsProps {
  property: Property;
}

export function PropertyDetailRegistryActions({ property }: PropertyDetailRegistryActionsProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { connect, contract: writeContract } = useWeb3();
  const walletAddress = useAppSelector((s) => s.wallet.address);
  const isConnected = useAppSelector((s) => s.wallet.isConnected);
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const mockMode = isRegistryMockMode();

  // ── Access guards ─────────────────────────────────────────────────────────
  // Admins should not be able to buy/rent properties (conflict of interest).
  const isAdmin = user?.role === 'ADMIN';
  // KYC must be approved before buying or renting.
  const isVerified = Boolean(user?.isVerified);

  const [listOpen, setListOpen] = useState(false);
  const [buyOpen, setBuyOpen] = useState(false);
  const [rentOpen, setRentOpen] = useState(false);
  const [txPending, setTxPending] = useState(false);

  const tokenId = property.blockchain?.tokenId ?? property.id;
  const ownerWallet = property.blockchain?.ownerWallet ?? '';
  const isForSale = Boolean(property.registryForSale);
  const isForRent = Boolean(property.registryForRent);

  // "pending_*" tokenIds are truly unreviewed — no actions allowed.
  // "db_*" tokenIds are DB-only approvals (contract was unavailable when admin approved).
  //   These show action buttons but warn the user that on-chain tx is not possible yet.
  // Pure numeric tokenIds come from a real on-chain mint — full contract interaction.
  const isPending = tokenId.startsWith('pending_');
  const isDbApproved = tokenId.startsWith('db_');
  const isOnChain = !isPending && !isDbApproved && /^\d+$/.test(tokenId);

  // DB-approved properties can't interact with the real contract (no on-chain token).
  // Fall back to mock mode so the buttons still show and give user feedback.
  const effectiveMockMode = mockMode || isDbApproved;

  // The contract stores price as whole ETH integers (not wei).
  // For buyProperty we send the ETH value as {value: parseEther(price)}.
  // For listProperty we send the whole number (e.g. 5, not 5e18).
  const priceEthNum = Number(property.price) || 0;
  const rentPriceEthNum = Number(property.rentPrice) || priceEthNum;
  const priceWei = parseEther(String(priceEthNum));
  const rentPriceWei = parseEther(String(rentPriceEthNum));

  const effectiveAccount =
    walletAddress ?? (mockMode ? REGISTRY_MOCK_PREVIEW_ACCOUNT : null);
  const isOwner = Boolean(
    effectiveAccount &&
      ownerWallet &&
      ownerWallet.toLowerCase() === effectiveAccount.toLowerCase(),
  );

  const canList =
    effectiveMockMode
      ? isOwner && !isForSale
      : isOnChain && isConnected && isOwner && !isForSale && Boolean(writeContract);
  const canListForRent =
    effectiveMockMode
      ? isOwner && !isForRent
      : isOnChain && isConnected && isOwner && !isForRent && Boolean(writeContract);
  // Admins cannot buy/rent — only verified non-admin users can.
  const canBuy =
    !isAdmin && isVerified && (
      effectiveMockMode
        ? isForSale && !isOwner
        : isOnChain && isConnected && isForSale && !isOwner && Boolean(writeContract)
    );
  const canRent =
    !isAdmin && isVerified && (
      effectiveMockMode
        ? isForRent && !isOwner
        : isOnChain && isConnected && isForRent && !isOwner && Boolean(writeContract)
    );

  const displayPrice = Number(property.price).toLocaleString(undefined, {
    maximumFractionDigits: 4,
  });
  const displayRentPrice = rentPriceEthNum.toLocaleString(undefined, {
    maximumFractionDigits: 4,
  });

  const refresh = () => router.refresh();

  const requireWallet = (action: () => void) => {
    if (effectiveMockMode) {
      action();
      return;
    }
    if (!isConnected) {
      dispatch(
        addToast({
          type: 'warning',
          title: 'Connect wallet first',
          message: 'Connect your wallet to list, buy, or rent on the registry.',
        }),
      );
      void connect();
      return;
    }
    if (!writeContract) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Contract unavailable',
          message: 'Set NEXT_PUBLIC_CONTRACT_ADDRESS or reconnect your wallet.',
        }),
      );
      return;
    }
    action();
  };

  const handleList = async () => {
    if (effectiveMockMode) {
      setTxPending(true);
      await new Promise((r) => setTimeout(r, 500));
      dispatch(
        addToast({
          type: 'info',
          title: 'Demo: listed for sale',
          message: 'On-chain list will run when the registry is connected.',
        }),
      );
      setListOpen(false);
      setTxPending(false);
      refresh();
      return;
    }
    if (!writeContract || !priceEthNum) return;
    setTxPending(true);
    try {
      const tx = await writeContract.listProperty(
        tokenId,
        BigInt(Math.floor(priceEthNum)),
      );
      await tx.wait();
      dispatch(
        addToast({
          type: 'success',
          title: 'Listed for sale',
          message: `${property.title} is now on the market for ${displayPrice} ETH.`,
        }),
      );
      setListOpen(false);
      refresh();
    } catch (err) {
      dispatch(
        addToast({ type: 'error', title: 'List failed', message: txErrorMessage(err) }),
      );
    } finally {
      setTxPending(false);
    }
  };

  const handleListForRent = async () => {
    if (effectiveMockMode) {
      setTxPending(true);
      await new Promise((r) => setTimeout(r, 500));
      dispatch(
        addToast({
          type: 'info',
          title: 'Demo: listed for rent',
          message: 'On-chain list for rent will run when the registry is connected.',
        }),
      );
      setTxPending(false);
      refresh();
      return;
    }
    if (!writeContract || !priceEthNum) return;
    setTxPending(true);
    try {
      const tx = await writeContract.listForRent(
        tokenId,
        BigInt(Math.floor(priceEthNum)),
      );
      await tx.wait();
      dispatch(
        addToast({
          type: 'success',
          title: 'Listed for rent',
          message: `${property.title} is now available to rent for ${displayPrice} ETH.`,
        }),
      );
      refresh();
    } catch (err) {
      dispatch(
        addToast({
          type: 'error',
          title: 'List for rent failed',
          message: txErrorMessage(err),
        }),
      );
    } finally {
      setTxPending(false);
    }
  };

  const handleBuy = async () => {
    if (effectiveMockMode) {
      setTxPending(true);
      await new Promise((r) => setTimeout(r, 500));
      dispatch(
        addToast({
          type: 'info',
          title: 'Demo: purchase submitted',
          message: 'On-chain buy will run when the registry is connected.',
        }),
      );
      setBuyOpen(false);
      setTxPending(false);
      refresh();
      return;
    }
    if (!writeContract) return;
    setTxPending(true);
    try {
      const tx = await writeContract.buyProperty(tokenId, { value: priceWei });
      await tx.wait();

      // Immediately delist in DB — removes it from the marketplace.
      // The PropertySold event listener also does this, but as a fallback
      // we call the API directly in case the listener missed the event.
      try {
        const dbId = property.blockchain?.dbId;
        if (dbId) {
          const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
          if (token) {
            await fetch(
              `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api'}/properties/${dbId}/delist`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ wallet: walletAddress }),
              },
            );
          }
        }
      } catch { /* silent — event listener handles this too */ }

      dispatch(
        addToast({
          type: 'success',
          title: 'Purchase complete! 🎉',
          message: `You now own ${property.title}. Redirecting to My Properties…`,
          duration: 6000,
        }),
      );
      setBuyOpen(false);
      router.push('/dashboard/my-properties');
    } catch (err) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Purchase failed',
          message: txErrorMessage(err),
        }),
      );
    } finally {
      setTxPending(false);
    }
  };

  const handleRent = async () => {
    if (effectiveMockMode) {
      setTxPending(true);
      await new Promise((r) => setTimeout(r, 500));
      dispatch(
        addToast({
          type: 'info',
          title: 'Demo: rental submitted',
          message: 'On-chain rent will run when the registry is connected.',
        }),
      );
      setRentOpen(false);
      setTxPending(false);
      refresh();
      return;
    }
    if (!writeContract) return;
    setTxPending(true);
    try {
      const tx = await writeContract.rentProperty(tokenId, { value: rentPriceWei });
      await tx.wait();
      dispatch(
        addToast({
          type: 'success',
          title: 'Rental complete! 🎉',
          message: `You are now renting ${property.title}. Redirecting to My Properties…`,
          duration: 6000,
        }),
      );
      setRentOpen(false);
      router.push('/dashboard/my-properties');
    } catch (err) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Rental failed',
          message: txErrorMessage(err),
        }),
      );
    } finally {
      setTxPending(false);
    }
  };

  const hasRegistryAction = canList || canListForRent || canBuy || canRent;
  if (!hasRegistryAction && !property.blockchain?.isVerified) {
    return null;
  }

  return (
    <>
      <div className="space-y-2 border-t border-border pt-4">
        {canBuy ? (
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            leftIcon={<ShoppingCart className="size-4" />}
            onClick={() => requireWallet(() => setBuyOpen(true))}
          >
            Buy for {displayPrice} ETH
          </Button>
        ) : null}
        {canRent ? (
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            leftIcon={<KeyRound className="size-4" />}
            onClick={() => requireWallet(() => setRentOpen(true))}
          >
            Rent for {displayRentPrice} ETH/mo
          </Button>
        ) : null}
        {canList ? (
          <Button
            variant="warning"
            size="lg"
            className="w-full bg-[#FFD700] hover:bg-[#FFC700] text-gray-900 border-[#FFD700]"
            leftIcon={<Tag className="size-4" />}
            onClick={() => requireWallet(() => setListOpen(true))}
            disabled={txPending}
            isLoading={txPending && listOpen}
          >
            List for sale at {displayPrice} ETH
          </Button>
        ) : null}
        {canListForRent ? (
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            leftIcon={<Tag className="size-4" />}
            onClick={() => requireWallet(() => void handleListForRent())}
            disabled={txPending}
            isLoading={txPending}
          >
            List for rent at {displayRentPrice} ETH/mo
          </Button>
        ) : null}
        {!hasRegistryAction && property.blockchain?.isVerified ? (
          <div className="space-y-2 text-sm">
            {/* Admin guard */}
            {isAdmin && (isForSale || isForRent) && !isOwner && (
              <p className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-muted">
                <ShoppingCart className="size-4 shrink-0 text-muted" />
                Administrators cannot purchase or rent properties.
              </p>
            )}
            {/* Verification guard */}
            {!isAdmin && isAuthenticated && !isVerified && (isForSale || isForRent) && !isOwner && (
              <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                <span className="mt-0.5 shrink-0">⚠️</span>
                <span>
                  Your account is not verified. Complete{' '}
                  <a href="/dashboard/verification" className="font-semibold underline hover:no-underline">
                    KYC verification
                  </a>{' '}
                  to buy or rent properties.
                </span>
              </p>
            )}
            {/* Not logged in */}
            {!isAuthenticated && (isForSale || isForRent) && (
              <p className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-muted">
                <ShoppingCart className="size-4 shrink-0" />
                <span>
                  <a href="/auth/login" className="font-semibold text-accent hover:underline">Sign in</a>
                  {' '}and complete KYC verification to buy or rent.
                </span>
              </p>
            )}
            {/* Technical / contract state reasons */}
            {isPending && (
              <p className="text-center text-muted">
                This property is pending admin review. Marketplace actions will be available once approved.
              </p>
            )}
            {isDbApproved && !isPending && (
              <p className="text-center text-muted">
                This property was approved without a deployed smart contract. Re-approval after deployment will enable transactions.
              </p>
            )}
            {!isPending && !isDbApproved && !isAdmin && isAuthenticated && isVerified && (
              <p className="text-center text-muted">
                Connect your wallet to buy, rent, or list this property on-chain.
              </p>
            )}
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        isOpen={listOpen}
        onClose={() => setListOpen(false)}
        title="List for sale"
        description="This will list your property on the marketplace at the current price. Your wallet will sign the listing transaction."
        icon={Tag}
        tone="accent"
        summary={[
          { label: 'Property', value: property.title, highlight: true },
          { label: 'Registry NFT', value: `#${tokenId}` },
          { label: 'Listing price', value: `${displayPrice} ETH`, highlight: true },
        ]}
        notice="Once listed, buyers can purchase this property on-chain at the specified price."
        confirmLabel="List for sale"
        onConfirm={() => void handleList()}
        isLoading={txPending}
      />

      <ConfirmDialog
        isOpen={buyOpen}
        onClose={() => setBuyOpen(false)}
        title="Complete purchase"
        description="Review the details below. Confirming opens your wallet to sign the transaction."
        icon={ShoppingCart}
        tone="accent"
        summary={[
          { label: 'Property', value: property.title },
          { label: 'Registry NFT', value: `#${tokenId}` },
          { label: 'Total', value: `${displayPrice} ETH`, highlight: true },
        ]}
        notice="Funds are sent directly on-chain. This action cannot be undone after the transaction is confirmed."
        confirmLabel="Pay & buy"
        onConfirm={() => void handleBuy()}
        isLoading={txPending}
      />

      <ConfirmDialog
        isOpen={rentOpen}
        onClose={() => setRentOpen(false)}
        title="Complete rental"
        description="Review the details below. Confirming opens your wallet to sign the transaction."
        icon={KeyRound}
        tone="accent"
        summary={[
          { label: 'Property', value: property.title },
          { label: 'Registry NFT', value: `#${tokenId}` },
          { label: 'Monthly rent', value: `${displayRentPrice} ETH/mo`, highlight: true },
        ]}
        notice="Payment is sent on-chain for the listed rent period. Check the listing terms before confirming."
        confirmLabel="Pay & rent"
        onConfirm={() => void handleRent()}
        isLoading={txPending}
      />
    </>
  );
}
