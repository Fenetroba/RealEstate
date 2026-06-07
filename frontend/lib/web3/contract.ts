import { Contract, type ContractRunner } from 'ethers';

import RealEstateArtifact from '@/abi/RealEstate.json';
import { CONTRACT_ADDRESS } from '@/lib/web3/config';

export const CONTRACT_ABI = RealEstateArtifact.abi;

export function getContract(runner: ContractRunner): Contract {
  if (!CONTRACT_ADDRESS) {
    throw new Error('NEXT_PUBLIC_CONTRACT_ADDRESS is not set');
  }
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, runner);
}

export async function fetchIsAdminOnChain(
  runner: ContractRunner,
  address: string,
): Promise<boolean> {
  if (!CONTRACT_ADDRESS) return false;
  try {
    const contract = getContract(runner);
    return Boolean(await contract.isAdmin(address));
  } catch {
    return false;
  }
}
