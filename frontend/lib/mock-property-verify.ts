import type { PropertyVerifyReport } from '@/types/property-verify';

export function buildMockVerifyReport(tokenId: string, propertyName?: string): PropertyVerifyReport {
  const hash = 'a1b2c3d4e5f6789012345678abcdef9012345678abcdef9012345678abcdef90';
  return {
    tokenId,
    propertyName: propertyName ?? `Demo property #${tokenId}`,
    currentVersion: 2,
    tamperProof: true,
    onChainMatch: true,
    metadataHashMatch: true,
    imagesRootMatch: true,
    documentsRootMatch: true,
    allFilesIntact: true,
    filesIntegrity: [
      {
        fileName: 'front.jpg',
        fileType: 'IMAGE',
        storedHash: hash,
        recomputedHash: hash,
        match: true,
      },
      {
        fileName: 'title-deed.pdf',
        fileType: 'DOCUMENT',
        storedHash: hash,
        recomputedHash: hash,
        match: true,
      },
    ],
    dbMetadataHash: hash,
    recomputedMetadataHash: hash,
    onChainHash: hash,
    versionHistory: [hash, hash],
    chainError: null,
  };
}
