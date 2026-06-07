import type { PropertyDocument, PropertyTimelineEvent, TransferRecord } from '@/types';

function mockDocumentsFor(id: string, docsRoot: string): PropertyDocument[] {
  const base = `https://ipfs.io/ipfs/${docsRoot.replace(/^QmMock/, 'Qm')}`;
  return [
    {
      id: `${id}-title`,
      name: 'Title & ownership record',
      type: 'PDF',
      url: `${base}/title-deed.pdf`,
      ipfsHash: docsRoot,
      uploadedAt: '2024-06-01T00:00:00Z',
    },
    {
      id: `${id}-survey`,
      name: 'Property survey',
      type: 'PDF',
      url: `${base}/survey.pdf`,
      uploadedAt: '2024-06-15T00:00:00Z',
    },
    {
      id: `${id}-registry`,
      name: 'Registry certificate',
      type: 'PDF',
      url: `${base}/registry-cert.pdf`,
      uploadedAt: '2024-07-01T00:00:00Z',
    },
  ];
}

function mockTimelineFor(id: string, isForSale: boolean): PropertyTimelineEvent[] {
  const events: PropertyTimelineEvent[] = [
    {
      id: `${id}-mint`,
      type: 'TRANSFERRED',
      title: 'Minted on registry',
      description: 'Property NFT created and metadata anchored on-chain.',
      date: '2024-01-10T00:00:00Z',
    },
    {
      id: `${id}-verify`,
      type: 'LEGAL',
      title: 'Ownership verified',
      description: 'Registry verification completed for this token.',
      date: '2024-02-20T00:00:00Z',
    },
  ];

  if (isForSale) {
    events.push({
      id: `${id}-list`,
      type: 'LISTED',
      title: 'Listed for sale',
      description: 'Owner enabled on-chain sale listing.',
      date: '2024-08-01T00:00:00Z',
    });
  }

  return events;
}

function mockTransfersFor(id: string, owner: string): TransferRecord[] {
  const prior = '0x0000000000000000000000000000000000000000';
  return [
    {
      from: prior,
      to: owner,
      txHash: `0x${id.padStart(4, '0')}mint${'a'.repeat(56)}`.slice(0, 66),
      timestamp: '2024-01-10T12:00:00Z',
      price: 0,
    },
  ];
}

export function getRegistryDetailExtras(
  id: string,
  owner: string,
  documentsRootHash: string,
  isForSale: boolean,
): {
  documents: PropertyDocument[];
  timeline: PropertyTimelineEvent[];
  transferHistory: TransferRecord[];
} {
  return {
    documents: mockDocumentsFor(id, documentsRootHash),
    timeline: mockTimelineFor(id, isForSale),
    transferHistory: mockTransfersFor(id, owner),
  };
}
