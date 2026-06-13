// config.ts

/** =========================
 *  API CONFIG
 *  ========================= */
// When NEXT_PUBLIC_API_URL is set (e.g. http://localhost:5000/api), use it.
// Otherwise fall back to dynamic detection so network access (192.168.x.x) works too.
export const NFT_API_BASE_URL = (() => {
  const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (configured) return configured;
  // Client-side: use the same hostname the browser is on, backend on port 5000
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:5000/api`;
  }
  return 'http://localhost:5000/api';
})();

/** =========================
 *  BLOCKCHAIN CONFIG
 *  ========================= */
export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL?.replace(/\/$/, '') ||
  'http://127.0.0.1:8545';

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
export const EXPECTED_CHAIN_ID = Number(
  process.env.NEXT_PUBLIC_CHAIN_ID || '31337'
);

/** =========================
 *  GOV WALLET
 *  ========================= */
export const GOV_WALLET = process.env.NEXT_PUBLIC_GOV_WALLET?.toLowerCase();

/** =========================
 *  STORAGE
 *  ========================= */
export const WALLET_STORAGE_KEY = 'edenet-wallet-address';

/** =========================
 *  VALIDATION (VERY IMPORTANT)
 *  ========================= */
export function validateConfig() {
  if (!CONTRACT_ADDRESS) {
    throw new Error('❌ Missing NEXT_PUBLIC_CONTRACT_ADDRESS');
  }

  if (!RPC_URL) {
    throw new Error('❌ Missing NEXT_PUBLIC_RPC_URL');
  }

  if (!EXPECTED_CHAIN_ID) {
    throw new Error('❌ Missing NEXT_PUBLIC_CHAIN_ID');
  }

  console.log('✅ Blockchain config validated');
}

/** =========================
 *  GOV CHECK
 *  ========================= */
export function isGovWalletAddress(address?: string | null): boolean {
  if (!address || !GOV_WALLET) return false;
  return address.toLowerCase() === GOV_WALLET;
}