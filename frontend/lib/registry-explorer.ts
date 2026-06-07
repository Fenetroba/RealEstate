import { CONTRACT_ADDRESS, EXPECTED_CHAIN_ID } from '@/lib/web3/config';
import { isValidEthAddress } from '@/lib/utils';
import type { Property } from '@/types';

const EXPLORER_BY_CHAIN: Partial<Record<number, string>> = {
  1: 'https://etherscan.io',
  11155111: 'https://sepolia.etherscan.io',
};

function resolveExplorerBase(): string | null {
  const fromEnv = process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  return EXPLORER_BY_CHAIN[EXPECTED_CHAIN_ID] ?? null;
}

/** Public listing: link to token on explorer when contract + token id are real. */
export function getPublicRegistryExplorerUrl(property: Property): string | null {
  const base = resolveExplorerBase();
  if (!base) return null;

  const contract =
    property.blockchain.contractAddress?.trim() ||
    (CONTRACT_ADDRESS && isValidEthAddress(CONTRACT_ADDRESS) ? CONTRACT_ADDRESS : '');
  const tokenId = property.blockchain.tokenId?.trim();

  if (!contract || !isValidEthAddress(contract) || !tokenId) return null;

  return `${base}/token/${contract}?a=${encodeURIComponent(tokenId)}`;
}

export function getExplorerTxUrl(txHash: string): string | null {
  const base = resolveExplorerBase();
  const hash = txHash?.trim();
  if (!base || !hash || !hash.startsWith('0x')) return null;
  return `${base}/tx/${hash}`;
}
