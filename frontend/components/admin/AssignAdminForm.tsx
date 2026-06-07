'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { isAddress } from 'ethers';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { assignAdminOnChain } from '@/lib/web3/admin-on-chain';
import type { Contract } from 'ethers';

interface AssignAdminFormProps {
  contract: Contract | null;
  mockMode: boolean;
  onSuccess?: () => void;
}

export function AssignAdminForm({ contract, mockMode, onSuccess }: AssignAdminFormProps) {
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    const trimmed = address.trim();
    if (!isAddress(trimmed)) {
      setError('Enter a valid Ethereum address.');
      return;
    }

    if (mockMode) {
      setDone(true);
      setAddress('');
      onSuccess?.();
      return;
    }

    if (!contract) {
      setError('Registry contract is not available. Check NEXT_PUBLIC_CONTRACT_ADDRESS.');
      return;
    }

    setLoading(true);
    try {
      await assignAdminOnChain(contract, trimmed);
      setDone(true);
      setAddress('');
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Grant registry admin rights to another wallet. This calls{' '}
        <span className="font-mono text-xs text-foreground">addAdmin</span> on the deployed
        contract — only existing admins can sign.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Input
          label="New admin address"
          placeholder="0x…"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            setDone(false);
          }}
          containerClassName="min-w-0 flex-1"
          disabled={loading}
        />
        <Button
          variant="outline"
          size="md"
          leftIcon={<UserPlus className="size-4" />}
          isLoading={loading}
          onClick={() => void handleSubmit()}
          className="w-full sm:w-auto"
        >
          Add admin
        </Button>
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {done ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-400">
          {mockMode ? 'Demo: admin assignment recorded locally.' : 'Admin added on-chain.'}
        </p>
      ) : null}
    </div>
  );
}
