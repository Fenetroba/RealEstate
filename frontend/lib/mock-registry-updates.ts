import type { RegistryUpdateRequest } from '@/types/registry-update-request';
import { REGISTRY_MOCK_PREVIEW_ACCOUNT } from '@/lib/web3/registry-mock';

export function loadMockPendingUpdates(): RegistryUpdateRequest[] {
  return [
    {
      propertyId: '2',
      updateIndex: 0,
      requester: REGISTRY_MOCK_PREVIEW_ACCOUNT,
      status: 0,
      declineReason: '',
      timestampLabel: new Date().toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    },
  ];
}
