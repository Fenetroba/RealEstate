'use client';

import { useCallback, useState } from 'react';
import { type Contract } from 'ethers';

import { submitPropertyUpdateRequest } from '@/lib/api/properties';
import { formatWalletError } from '@/lib/web3/connect-flow';
import { CONTRACT_ADDRESS, EXPECTED_CHAIN_ID } from '@/lib/web3/config';
import { hexToBytes32 } from '@/lib/web3/hexToBytes32';
import { isRegistryMockMode } from '@/lib/web3/registry-mock';
import {
  type PropertyUpdateFormState,
} from '@/lib/property-update';
import { validatePropertyUpdateForm } from '@/lib/validation/property-schemas';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setWalletError, setWalletMessage } from '@/store/slices/walletSlice';
import { addToast } from '@/store/slices/uiSlice';

function formatContractError(error: unknown): string {
  if (error instanceof Error) {
    const e = error as Error & { code?: string; reason?: string; shortMessage?: string };
    if (e.code === 'ACTION_REJECTED' || String(e.code) === '4001') {
      return 'Transaction cancelled by user';
    }
    if (e.reason) return e.reason;
    if (e.shortMessage) return e.shortMessage;
    return e.message;
  }
  return 'Blockchain submission failed';
}

export function useSubmitPropertyUpdate(contract: Contract | null) {
  const dispatch = useAppDispatch();
  const address = useAppSelector((s) => s.wallet.address);
  const chainId = useAppSelector((s) => s.wallet.chainId);
  const isConnected = useAppSelector((s) => s.wallet.isConnected);
  const mockMode = isRegistryMockMode();

  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const submit = useCallback(
    async (params: {
      tokenId: string;
      dbPropertyId: string | null;
      form: PropertyUpdateFormState;
      images: File[];
      documents: File[];
    }) => {
      const { tokenId, dbPropertyId, form, images, documents } = params;

      if (!isConnected || !address) {
        setFieldError('Connect your wallet to submit an update');
        return false;
      }

      const validationError = validatePropertyUpdateForm(form);
      if (validationError) {
        setFieldError(validationError);
        return false;
      }

      if (!dbPropertyId) {
        setFieldError('Property not found in registry database.');
        return false;
      }

      if (mockMode) {
        setLoading(true);
        setFieldError(null);
        await new Promise((r) => setTimeout(r, 600));
        dispatch(
          addToast({
            type: 'info',
            title: 'Demo: update submitted',
            message: 'On-chain submitUpdateRequest runs when the registry is connected.',
          }),
        );
        setLoading(false);
        return true;
      }

      if (!contract || !CONTRACT_ADDRESS) {
        dispatch(setWalletError('Contract not configured. Set NEXT_PUBLIC_CONTRACT_ADDRESS.'));
        return false;
      }

      if (chainId !== null && chainId !== EXPECTED_CHAIN_ID) {
        dispatch(
          setWalletError(
            `Switch to chain ${EXPECTED_CHAIN_ID} before submitting.`,
          ),
        );
        return false;
      }

      if (typeof contract.submitUpdateRequest !== 'function') {
        setFieldError('Contract ABI is missing submitUpdateRequest.');
        return false;
      }

      setLoading(true);
      setFieldError(null);

      try {
        dispatch(setWalletMessage('Uploading files to server…'));

        const apiResult = await submitPropertyUpdateRequest(
          dbPropertyId,
          form,
          images,
          documents,
          address,
        );

        dispatch(setWalletMessage('Submitting update to blockchain…'));

        const { hashes } = apiResult;
        const tx = await contract.submitUpdateRequest(
          tokenId,
          hexToBytes32(hashes.metadataHash),
          hexToBytes32(hashes.imagesRootHash),
          hexToBytes32(hashes.documentsRootHash),
        );
        await tx.wait();

        dispatch(setWalletMessage('Update request submitted — awaiting admin approval.'));
        dispatch(
          addToast({
            type: 'success',
            title: 'Update submitted',
            message: 'Government review is required before metadata goes live.',
          }),
        );
        return true;
      } catch (error: unknown) {
        const err = error as { code?: number | string };
        if (err?.code === 'ACTION_REJECTED' || String(err?.code) === '4001') {
          dispatch(setWalletError('Transaction cancelled by user'));
        } else if (error instanceof Error) {
          const msg = error.message;
          const isRevert =
            msg.includes('revert') || msg.includes('execution reverted') || Boolean(err.code);
          setFieldError(
            isRevert
              ? formatContractError(error)
              : msg.length > 200
                ? `${msg.slice(0, 200)}…`
                : msg,
          );
        } else {
          dispatch(setWalletError(formatWalletError(error)));
        }
        return false;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, address, contract, chainId, mockMode, dispatch],
  );

  return { submit, loading, fieldError, setFieldError };
}
