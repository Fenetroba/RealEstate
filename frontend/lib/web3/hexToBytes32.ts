/** Normalize a hex hash (with or without 0x) to bytes32 for contract calls. */
export function hexToBytes32(hash: string): string {
  let hex = hash.trim();
  if (!hex) {
    throw new Error('Missing hash for blockchain submission');
  }
  if (!hex.startsWith('0x')) {
    hex = `0x${hex}`;
  }
  const body = hex.slice(2);
  if (!/^[0-9a-fA-F]+$/.test(body)) {
    throw new Error('Invalid hash format');
  }
  if (body.length > 64) {
    throw new Error('Hash is too long for bytes32');
  }
  return `0x${body.padStart(64, '0').toLowerCase()}`;
}
