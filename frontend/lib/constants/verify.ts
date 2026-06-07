export const verifyCopy = {
  pageTitle: 'Registry integrity audit',
  pageSubtitle:
    'Re-hashes every file and metadata field in the database and compares them to on-chain fingerprints. Read-only — no wallet required.',
  backToProperty: 'Back to property',
  backToListings: 'Browse properties',
  runAgain: 'Run audit again',
  loading: 'Running integrity audit…',
  mockNotice: 'Demo mode — showing a sample audit report.',
  chainWarningTitle: 'Chain unavailable',
  chainWarningBody:
    'On-chain comparison could not complete. File and database checks may still be shown below.',
  tamperProofTitle: 'Tamper-proof',
  tamperProofPass: 'Database files and hashes match what the blockchain records for this NFT.',
  tamperProofFail:
    'Inconsistency detected between stored files, database hashes, and/or on-chain data.',
  notMintedTitle: 'Not minted yet',
  notMintedBody:
    'This property is not on-chain yet. Integrity audit applies after government approval and mint.',
  notFoundTitle: 'Property not found',
  notFoundBody: 'No registry record exists for this token id.',
  checksSection: 'Integrity checks',
  filesSection: 'Per-file verification',
  filesEmpty: 'No files returned for this version.',
  versionsSection: 'On-chain version history',
  versionsEmpty: 'No version hashes from the contract.',
  technicalSection: 'Technical details',
  technicalHint: 'Full hashes for auditors and demos.',
  disclaimer:
    'This audit confirms technical integrity of registry storage vs chain fingerprints. It is not legal or financial due diligence.',
  linkFromDetail: 'Verify registry integrity',
  linkFullReport: 'View full audit report',
} as const;

export const verifyCheckLabels = {
  metadata: 'Metadata hash',
  metadataHelp: 'Name, location, price, roots, and version recomputed vs DB and chain.',
  files: 'All files',
  filesHelp: 'Each image and document byte-for-byte vs stored SHA-256.',
  imagesRoot: 'Images root',
  documentsRoot: 'Documents root',
  onChain: 'On-chain metadata',
} as const;
