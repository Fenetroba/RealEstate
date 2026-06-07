/** real-estate-nft Express API (no /api prefix on base — paths include /api/...) */
export const NFT_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:5000';

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

/** Read-only RPC for browsing without a connected wallet */
export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL?.replace(/\/$/, '') || 'http://127.0.0.1:8545';

export const EXPECTED_CHAIN_ID = Number(
  process.env.NEXT_PUBLIC_CHAIN_ID || '31337',
);

export const GOV_WALLET = (process.env.NEXT_PUBLIC_GOV_WALLET || '').toLowerCase();

export const WALLET_STORAGE_KEY = 'edenet-wallet-address';

export function isGovWalletAddress(address: string | null | undefined): boolean {
  if (!address || !GOV_WALLET) return false;
  return address.toLowerCase() === GOV_WALLET;
}
