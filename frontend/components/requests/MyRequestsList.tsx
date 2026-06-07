'use client';

import { RequestCard } from '@/components/requests/RequestCard';
import { dashboardCardGridClass } from '@/lib/constants/dashboard-layout';
import { cn } from '@/lib/utils';
import type { RegistryRequest } from '@/types/registry-request';

interface MyRequestsListProps {
  requests: RegistryRequest[];
  className?: string;
}

export function MyRequestsList({ requests, className }: MyRequestsListProps) {
  return (
    <div className={cn(dashboardCardGridClass, 'grid-cols-1 lg:grid-cols-2', className)}>
      {requests.map((request) => (
        <RequestCard key={request.id} request={request} />
      ))}
    </div>
  );
}
