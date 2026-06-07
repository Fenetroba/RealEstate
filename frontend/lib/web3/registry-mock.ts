import { CONTRACT_ADDRESS } from '@/lib/web3/config';

/**
 * Mock registry when explicitly enabled or when no contract address is configured.
 * Set NEXT_PUBLIC_USE_REGISTRY_MOCK=false to force live mode (requires env + chain).
 */
export function isRegistryMockMode(): boolean {
  const flag = process.env.NEXT_PUBLIC_USE_REGISTRY_MOCK;
  if (flag === 'false') return false;
  if (flag === 'true') return true;
  return !CONTRACT_ADDRESS;
}

/** Hardhat account #0 — used as demo "You" for owner/buyer UI in mock mode */
export const REGISTRY_MOCK_PREVIEW_ACCOUNT =
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
