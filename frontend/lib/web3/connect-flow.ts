import { BrowserProvider, formatEther } from 'ethers';

import { EXPECTED_CHAIN_ID } from '@/lib/web3/config';
import { fetchIsAdminOnChain } from '@/lib/web3/contract';

const HARDHAT_CHAIN_HEX = `0x${EXPECTED_CHAIN_ID.toString(16)}`;

/** User-facing message for MetaMask / EIP-1193 failures */
export function formatWalletError(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;

  const e = error as { code?: number; message?: string };
  if (e?.code === 4001) {
    return 'Connection cancelled — approve the MetaMask prompt to connect.';
  }
  if (e?.code === -32002) {
    return 'MetaMask already has a pending request — open MetaMask and try again.';
  }
  if (typeof e?.message === 'string' && e.message) return e.message;

  return 'Failed to connect wallet. Install MetaMask, unlock it, and try again.';
}

async function switchToExpectedChain(provider: EthereumProvider): Promise<void> {
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: HARDHAT_CHAIN_HEX }],
    });
    return;
  } catch (switchError: unknown) {
    const code = (switchError as { code?: number })?.code;
    if (code !== 4902) throw switchError;
  }

  await provider.request({
    method: 'wallet_addEthereumChain',
    params: [
      {
        chainId: HARDHAT_CHAIN_HEX,
        chainName: 'Hardhat Local',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['http://127.0.0.1:8545'],
      },
    ],
  });
}

export interface WalletConnectResult {
  address: string;
  chainId: number;
  balance: string;
  isAdminOnChain: boolean;
}

export function getMetaMaskProvider(): EthereumProvider {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Install MetaMask to connect your wallet');
  }
  return window.ethereum;
}

export async function ensureCorrectChain(provider: EthereumProvider): Promise<number> {
  const chainHex = (await provider.request({ method: 'eth_chainId' })) as string;
  const chainId = parseInt(chainHex, 16);
  if (chainId !== EXPECTED_CHAIN_ID) {
    try {
      await switchToExpectedChain(provider);
    } catch (err: unknown) {
      const code = (err as { code?: number })?.code;
      if (code === 4001) {
        throw new Error(
          'Network switch cancelled — approve switching to Hardhat Local (chain 31337) in MetaMask.',
        );
      }
      throw new Error(
        `Use Hardhat Local (chain ${EXPECTED_CHAIN_ID}). Your wallet is on chain ${chainId}. Start \`npx hardhat node\` if the network was not added.`,
      );
    }
    const afterHex = (await provider.request({ method: 'eth_chainId' })) as string;
    return parseInt(afterHex, 16);
  }
  return chainId;
}

export async function runWalletConnect(
  requestAccounts = true,
): Promise<WalletConnectResult> {
  try {
    const ethereum = getMetaMaskProvider();

    const accounts = requestAccounts
      ? ((await ethereum.request({ method: 'eth_requestAccounts' })) as string[])
      : ((await ethereum.request({ method: 'eth_accounts' })) as string[]);

    if (!accounts?.length) {
      throw new Error('No wallet account selected — unlock MetaMask and try again.');
    }

    const address = accounts[0];
    const chainId = await ensureCorrectChain(ethereum);

    const browserProvider = new BrowserProvider(ethereum);
    const balanceWei = await browserProvider.getBalance(address);
    const signer = await browserProvider.getSigner();
    const isAdminOnChain = await fetchIsAdminOnChain(signer, address);

    return {
      address,
      chainId,
      balance: formatEther(balanceWei),
      isAdminOnChain,
    };
  } catch (error: unknown) {
    throw new Error(formatWalletError(error));
  }
}

export async function tryAutoConnectWallet(): Promise<WalletConnectResult | null> {
  if (typeof window === 'undefined' || !window.ethereum) return null;
  const accounts = (await window.ethereum.request({
    method: 'eth_accounts',
  })) as string[];
  if (!accounts?.length) return null;
  try {
    return await runWalletConnect(false);
  } catch {
    return null;
  }
}
