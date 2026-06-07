import type { Contract } from 'ethers';

export async function approveUpdateOnChain(
  contract: Contract,
  propertyId: string,
  updateIndex: number,
): Promise<void> {
  const tx = await contract.approveUpdateRequest(propertyId, updateIndex);
  await tx.wait();
}

export async function declineUpdateOnChain(
  contract: Contract,
  propertyId: string,
  updateIndex: number,
  reason: string,
): Promise<void> {
  const tx = await contract.declineUpdateRequest(propertyId, updateIndex, reason.trim());
  await tx.wait();
}

export async function assignAdminOnChain(contract: Contract, newAdmin: string): Promise<void> {
  const tx = await contract.addAdmin(newAdmin);
  await tx.wait();
}
