'use client';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DialogBody, DialogFooter, DialogHeader } from '@/components/ui/Dialog';
import { typeBodySm } from '@/lib/responsive';
import { cn } from '@/lib/utils';

export interface DashboardReviewDocument {
  name: string;
  url?: string;
}

interface DashboardReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  typeLabel?: string;
  priorityLabel?: string;
  priorityClassName?: string;
  statusLabel?: string;
  statusVariant?: 'success' | 'warning' | 'danger' | 'default';
  documents?: DashboardReviewDocument[];
  notes?: string;
  onApprove?: () => void;
  onReject?: () => void;
  children?: React.ReactNode;
}

export function DashboardReviewModal({
  isOpen,
  onClose,
  title,
  subtitle,
  typeLabel,
  priorityLabel,
  priorityClassName,
  statusLabel,
  statusVariant = 'warning',
  documents = [],
  notes,
  onApprove,
  onReject,
  children,
}: DashboardReviewModalProps) {
  const showActions = statusLabel === 'PENDING' && (onApprove || onReject);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" className="overflow-hidden">
      <DialogHeader title={title} description={subtitle} onClose={onClose} />

      <DialogBody className="space-y-5 pt-2">
        <div className="flex flex-wrap gap-2">
          {typeLabel ? <Badge variant="gold" size="sm">{typeLabel}</Badge> : null}
          {priorityLabel ? (
            <span
              className={cn(
                'inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold',
                priorityClassName,
              )}
            >
              {priorityLabel}
            </span>
          ) : null}
          {statusLabel ? <Badge variant={statusVariant} size="sm">{statusLabel}</Badge> : null}
        </div>

        {children}

        {documents.length > 0 && !children ? (
          <div>
            <p className="mb-3 text-sm font-semibold text-foreground">Documents</p>
            <ul className="space-y-2">
              {documents.map((doc) => (
                <li key={doc.name}>
                  {doc.url ? (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-accent hover:underline"
                    >
                      {doc.name}
                    </a>
                  ) : (
                    <span className="text-sm text-muted">{doc.name}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {notes ? (
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-sm font-semibold text-foreground">Notes</p>
            <p className={cn(typeBodySm, 'mt-2 leading-relaxed')}>{notes}</p>
          </div>
        ) : null}
      </DialogBody>

      <DialogFooter>
        {showActions ? (
          <>
            {onReject ? (
              <Button variant="outline" size="md" className="w-full sm:w-auto sm:min-w-[7rem]" onClick={onReject}>
                Reject
              </Button>
            ) : null}
            {onApprove ? (
              <Button variant="primary" size="md" className="w-full sm:w-auto sm:min-w-[7rem]" onClick={onApprove}>
                Approve
              </Button>
            ) : null}
          </>
        ) : (
          <Button variant="outline" size="md" className="w-full sm:w-auto" onClick={onClose}>
            Close
          </Button>
        )}
      </DialogFooter>
    </Modal>
  );
}
