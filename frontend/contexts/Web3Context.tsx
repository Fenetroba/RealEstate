'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BrowserProvider, type Contract, type Signer } from 'ethers';

import { formatWalletError } from '@/lib/web3/connect-flow';
import { getContract } from '@/lib/web3/contract';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { connectWallet, disconnectWallet, tryAutoConnect, setWalletError } from '@/store/slices/walletSlice';

interface Web3ContextValue {
  signer: Signer | null;
  contract: Contract | null;
  provider: BrowserProvider | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const Web3Context = createContext<Web3ContextValue | null>(null);

async function buildSignerContext(address: string | null): Promise<{
  provider: BrowserProvider | null;
  signer: Signer | null;
  contract: Contract | null;
}> {
  if (!address || typeof window === 'undefined' || !window.ethereum) {
    return { provider: null, signer: null, contract: null };
  }
  try {
    const browserProvider = new BrowserProvider(window.ethereum);
    const signer = await browserProvider.getSigner();
    const contract = getContract(signer);
    return { provider: browserProvider, signer, contract };
  } catch {
    return { provider: null, signer: null, contract: null };
  }
}

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const address = useAppSelector((s) => s.wallet.address);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);

  const syncSigner = useCallback(async (addr: string | null) => {
    const ctx = await buildSignerContext(addr);
    setProvider(ctx.provider);
    setSigner(ctx.signer);
    setContract(ctx.contract);
  }, []);

  useEffect(() => {
    void dispatch(tryAutoConnect());
  }, [dispatch]);

  useEffect(() => {
    void syncSigner(address);
  }, [address, syncSigner]);

  useEffect(() => {
    const ethereum = typeof window !== 'undefined' ? window.ethereum : undefined;
    if (!ethereum?.on) return;

    const onAccountsChanged = (accounts: unknown) => {
      const list = accounts as string[];
      if (!list.length) {
        dispatch(disconnectWallet());
        return;
      }
      void dispatch(connectWallet());
    };

    const onChainChanged = () => {
      window.location.reload();
    };

    ethereum.on('accountsChanged', onAccountsChanged);
    ethereum.on('chainChanged', onChainChanged);

    return () => {
      ethereum.removeListener?.('accountsChanged', onAccountsChanged);
      ethereum.removeListener?.('chainChanged', onChainChanged);
    };
  }, [dispatch]);

  const connect = useCallback(async () => {
    try {
      await dispatch(connectWallet()).unwrap();
    } catch (err) {
      dispatch(setWalletError(formatWalletError(err)));
    }
  }, [dispatch]);

  const disconnect = useCallback(() => {
    dispatch(disconnectWallet());
    setProvider(null);
    setSigner(null);
    setContract(null);
  }, [dispatch]);

  const value = useMemo(
    () => ({ signer, contract, provider, connect, disconnect }),
    [signer, contract, provider, connect, disconnect],
  );

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export function useWeb3(): Web3ContextValue {
  const ctx = useContext(Web3Context);
  if (!ctx) {
    throw new Error('useWeb3 must be used within Web3Provider');
  }
  return ctx;
}
