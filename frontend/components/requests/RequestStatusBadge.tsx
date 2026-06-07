import { Badge } from '@/components/ui/Badge';
import type { ChainRequestStatus } from '@/types/registry-request';
import { requestStatusLabel } from '@/lib/registry-request-labels';

interface RequestStatusBadgeProps {
  status: ChainRequestStatus;
  className?: string;
}

export function RequestStatusBadge({ status, className }: RequestStatusBadgeProps) {
  const label = requestStatusLabel(status);

  const variant =
    status === 1 ? 'success' : status === 2 ? 'danger' : ('warning' as const);

  return (
    <Badge variant={variant} size="sm" className={className}>
      {label}
    </Badge>
  );
}
