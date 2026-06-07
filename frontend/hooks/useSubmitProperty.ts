'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { type Contract } from 'ethers';

import { submitPropertyRequest, confirmPropertyRequest } from '@/lib/api/properties';
import { appendMockRegistryRequest } from '@/lib/mock-registry-requests';
import { formatWalletError } from '@/lib/web3/connect-flow';
import { CONTRACT_ADDRESS, EXPECTED_CHAIN_ID } from '@/lib/web3/config';
import { hexToBytes32 } from '@/lib/web3/hexToBytes32';
import { isRegistryMockMode } from '@/lib/web3/registry-mock';
import {
  emptyPropertyRegistrationForm,
  formToUint256,
  type PropertyRegistrationFormState,
} from '@/lib/submit-property';
import { validatePropertyRegistrationForm } from '@/lib/validation/property-schemas';
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

function toPriceForContract(value: string): bigint {
  const trimmed = value.trim();
  if (!trimmed) throw new Error('Price is required');
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0) throw new Error('Price (ETH) cannot be negative');
  // The contract stores price as whole ETH integer (matches index.js behaviour)
  return BigInt(Math.floor(n));
}

export function useSubmitProperty(contract: Contract | null) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const address = useAppSelector((s) => s.wallet.address);
  const chainId = useAppSelector((s) => s.wallet.chainId);
  const isConnected = useAppSelector((s) => s.wallet.isConnected);
  const mockMode = isRegistryMockMode();

  const [form, setForm] = useState<PropertyRegistrationFormState>(emptyPropertyRegistrationForm);
  const [images, setImages] = useState<File[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setForm(emptyPropertyRegistrationForm());
    setImages([]);
    setDocuments([]);
    setFieldError(null);
    setImageError(null);
  }, []);

  const updateForm = useCallback((patch: Partial<PropertyRegistrationFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setFieldError(null);
  }, []);

  const setImageFiles = useCallback((files: File[]) => {
    setImages(files);
    setImageError(files.length >= 3 ? null : null);
  }, []);

  const setDocumentFiles = useCallback((files: File[]) => {
    setDocuments(files);
  }, []);

  const submit = useCallback(async () => {
    if (!isConnected || !address) {
      setFieldError('Connect wallet to submit a registration request');
      return;
    }

    const validationError = validatePropertyRegistrationForm(form, images.length);
    if (validationError) {
      if (images.length < 3) {
        setImageError('Please upload at least 3 images');
      }
      setFieldError(validationError);
      return;
    }

    if (mockMode) {
      setLoading(true);
      setFieldError(null);
      setImageError(null);
      try {
        dispatch(setWalletMessage('Saving demo registration request…'));
        await new Promise((r) => setTimeout(r, 500));
        appendMockRegistryRequest(address, form);
        resetForm();
        dispatch(setWalletMessage('Property request submitted (demo).'));
        dispatch(
          addToast({
            type: 'success',
            title: 'Request submitted',
            message: 'Track status under My property requests. Live mode uploads files and writes on-chain.',
          }),
        );
        router.push('/dashboard/my-requests');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!contract || !CONTRACT_ADDRESS) {
      dispatch(setWalletError('Contract not configured. Set NEXT_PUBLIC_CONTRACT_ADDRESS.'));
      return;
    }
    if (chainId !== null && chainId !== EXPECTED_CHAIN_ID) {
      dispatch(
        setWalletError(
          `Switch to chain ${EXPECTED_CHAIN_ID} (Hardhat Local) before submitting.`,
        ),
      );
      return;
    }

    setLoading(true);
    setFieldError(null);
    setImageError(null);

    try {
      dispatch(setWalletMessage('Uploading files to server…'));

      console.log('[useSubmitProperty] Starting file upload to backend...');
      const apiResult = await submitPropertyRequest(form, images, documents, address);
      console.log('[useSubmitProperty] Backend response:', apiResult);

      dispatch(setWalletMessage('Submitting to blockchain…'));

      const { hashes, tempId } = apiResult;
      console.log('[useSubmitProperty] Submitting to contract with tempId:', tempId);
      
      const tx = await contract.submitRequest({
        name: form.name.trim(),
        location: form.location.trim(),
        propertyType: form.propertyType,
        price: toPriceForContract(form.price),
        isForSale: form.isForSale,
        isForRent: form.isForRent,
        metadataHash: hexToBytes32(hashes.metadataHash),
        imagesRootHash: hexToBytes32(hashes.imagesRootHash),
        documentsRootHash: hexToBytes32(hashes.documentsRootHash),
        bedrooms: formToUint256(form.bedrooms),
        bathrooms: formToUint256(form.bathrooms),
        sqft: formToUint256(form.sqft),
        parking: formToUint256(form.parking),
        floors: formToUint256(form.floors),
        yearBuilt: formToUint256(form.yearBuilt),
      });
      console.log('[useSubmitProperty] Transaction submitted:', tx.hash);

      dispatch(setWalletMessage('Waiting for blockchain confirmation…'));
      const receipt = await tx.wait();
      console.log('[useSubmitProperty] Transaction confirmed:', receipt);

      // Confirm with backend after chain confirmation
      if (tempId) {
        dispatch(setWalletMessage('Saving to database…'));
        const txHash: string = receipt?.hash ?? receipt?.transactionHash ?? '';
        console.log('[useSubmitProperty] Confirming with backend, tempId:', tempId, 'txHash:', txHash);
        await confirmPropertyRequest(tempId, txHash);
        console.log('[useSubmitProperty] Backend confirmation successful');
      } else {
        console.warn('[useSubmitProperty] No tempId returned, skipping backend confirmation');
      }

      resetForm();
      dispatch(setWalletMessage('Property request submitted successfully!'));
      dispatch(
        addToast({
          type: 'success',
          title: 'Request submitted',
          message: 'Track status under My property requests.',
        }),
      );
      console.log('[useSubmitProperty] Submission completed, redirecting to my-requests');
      router.push('/dashboard/my-requests');
    } catch (error: unknown) {
      console.error('[useSubmitProperty] Submission failed:', error);
      const err = error as { code?: number | string };
      if (err?.code === 'ACTION_REJECTED' || String(err?.code) === '4001') {
        dispatch(setWalletError('Transaction cancelled by user'));
      } else if (error instanceof Error) {
        const msg = error.message;
        const isRevert =
          msg.includes('revert') || msg.includes('execution reverted') || Boolean(err.code);
        dispatch(
          setWalletError(
            isRevert
              ? formatContractError(error)
              : msg.length > 160
                ? `${msg.slice(0, 160)}…`
                : msg,
          ),
        );
      } else {
        dispatch(setWalletError(formatWalletError(error)));
      }
    } finally {
      setLoading(false);
    }
  }, [
    isConnected,
    address,
    contract,
    chainId,
    mockMode,
    form,
    images,
    documents,
    dispatch,
    resetForm,
    router,
  ]);

  return {
    form,
    updateForm,
    images,
    documents,
    setImageFiles,
    setDocumentFiles,
    loading,
    fieldError,
    imageError,
    submit,
    resetForm,
  };
}
