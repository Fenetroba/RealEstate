'use client';

import { useCallback, useState } from 'react';
import { type Contract, parseEther } from 'ethers';

import { submitPropertyRequest, confirmPropertyRequest } from '@/lib/api/properties';
import { formatWalletError } from '@/lib/web3/connect-flow';
import { CONTRACT_ADDRESS, EXPECTED_CHAIN_ID } from '@/lib/web3/config';
import { hexToBytes32 } from '@/lib/web3/hexToBytes32';
import { isRegistryMockMode } from '@/lib/web3/registry-mock';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setWalletError, setWalletMessage } from '@/store/slices/walletSlice';
import { addToast } from '@/store/slices/uiSlice';

export function useSubmitPropertyRegistration(contract: Contract | null) {
  const dispatch = useAppDispatch();
  const address = useAppSelector((s) => s.wallet.address);
  const chainId = useAppSelector((s) => s.wallet.chainId);
  const isConnected = useAppSelector((s) => s.wallet.isConnected);
  const mockMode = isRegistryMockMode();

  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [dupWarning, setDupWarning] = useState<string | null>(null);

  const submit = useCallback(
    async (params: {
      form: {
        name: string; location: string; propertyType: string; price: string;
        isForSale: boolean; isForRent: boolean; bedrooms: string; bathrooms: string;
        sqft: string; parking: string; floors: string; yearBuilt: string;
        titleNumber?: string;
      };
      images: File[];
      documents: File[];
    }) => {
      const { form, images, documents } = params;

      if (!isConnected || !address) {
        setFieldError('Connect your wallet to submit a registration.');
        return false;
      }

      if (mockMode) {
        setLoading(true);
        setFieldError(null);
        await new Promise((r) => setTimeout(r, 600));
        dispatch(
          addToast({
            type: 'info',
            title: 'Demo: registration submitted',
            message: 'On-chain submitRequest runs when the registry is connected.',
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

      if (typeof contract.submitRequest !== 'function') {
        setFieldError('Contract ABI is missing submitRequest.');
        return false;
      }

      setLoading(true);
      setFieldError(null);
      setDupWarning(null);

      try {
        dispatch(setWalletMessage('Uploading files to server…'));

        // Step 1: Prepare details on the backend
        const apiResult = await submitPropertyRequest(
          form,
          images,
          documents,
          address,
        );

        if (apiResult.warnings?.duplicateDocuments?.length) {
          setDupWarning(apiResult.warnings.message);
          dispatch(addToast({
            type: 'warning',
            title: 'Duplicate documents detected',
            message: apiResult.warnings.message,
            duration: 8000,
          }));
        }

        dispatch(setWalletMessage('Please sign the transaction (Requires 0.07 ETH fee)…'));

        // Step 2: Sign the transaction on-chain
        const { hashes } = apiResult;

        // Construct the PropertyDetails struct for RealEstate.sol
        const propertyDetails = {
          name: form.name.trim(),
          location: form.location.trim(),
          propertyType: form.propertyType,
          price: Math.floor(Number(form.price.trim()) || 0), // Assuming price is passed straight up if logic in contract multiplies by 1 ether
          isForSale: form.isForSale,
          metadataHash: hexToBytes32(hashes.metadataHash),
          imagesRootHash: hexToBytes32(hashes.imagesRootHash),
          documentsRootHash: hexToBytes32(hashes.documentsRootHash),
          bedrooms: Number(form.bedrooms) || 0,
          bathrooms: Number(form.bathrooms) || 0,
          sqft: Number(form.sqft) || 0,
          parking: Number(form.parking) || 0,
          floors: Number(form.floors) || 0,
          yearBuilt: Number(form.yearBuilt) || 0,
        };

        const tx = await contract.submitRequest(
          propertyDetails, 
          { value: parseEther('0.07') }
        );
        
        dispatch(setWalletMessage('Waiting for blockchain confirmation…'));
        const receipt = await tx.wait();

        // Extract the on-chain requestId from the RequestSubmitted event
        // RequestSubmitted(uint256 indexed requestId, address requester, string name)
        // The requestId is the second topic (first indexed param)
        let onChainRequestId: number | null = null;
        for (const log of receipt?.logs ?? []) {
          if (log.topics && log.topics.length >= 2) {
            try {
              onChainRequestId = Number(BigInt(log.topics[1]));
              break;
            } catch { /* skip */ }
          }
        }

        dispatch(setWalletMessage('Confirming request with the server…'));
        
        // Step 3: Confirm with backend so it isn't orphaned
        await confirmPropertyRequest(apiResult.tempId!, tx.hash, onChainRequestId);

        dispatch(setWalletMessage('Registration request completed successfully.'));
        dispatch(
          addToast({
            type: 'success',
            title: 'Request submitted',
            message: 'Your request is safely on-chain and awaiting admin approval.',
          }),
        );
        return true;
      } catch (error: unknown) {
        const err = error as { code?: number | string; response?: any };
        if (err?.code === 'ACTION_REJECTED' || String(err?.code) === '4001') {
          dispatch(setWalletError('Transaction cancelled by user'));
        } else if (err?.response?.data?.code === 'DUPLICATE_TITLE_NUMBER') {
          const existing = err.response?.data?.existingPropertyName;
          setFieldError(`This land title number is already registered${existing ? ` under "${existing}"` : ''}.`);
        } else if (error instanceof Error) {
          const msg = error.message;
          const isRevert =
            msg.includes('revert') || msg.includes('execution reverted') || Boolean(err.code);
          setFieldError(
            isRevert
              ? 'Blockchain submission failed. Ensure you have 0.07 ETH.'
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

  return { submit, loading, fieldError, setFieldError, dupWarning };
}
