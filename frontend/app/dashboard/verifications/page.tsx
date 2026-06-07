'use client';

import { useMemo, useState } from 'react';
import { CheckCircle, Eye, Shield, XCircle } from 'lucide-react';

import {
  DashboardOverviewStats,
  type DashboardOverviewStat,
} from '@/components/dashboard/DashboardOverviewStats';
import {
  DashboardDataTable,
  DashboardTableBody,
  DashboardTableHead,
  DashboardTableRow,
  DashboardTd,
  DashboardTh,
} from '@/components/dashboard/DashboardDataTable';
import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState';
import { DashboardFilterTabs } from '@/components/dashboard/DashboardFilterTabs';
import { DashboardFiltersBar } from '@/components/dashboard/DashboardFiltersBar';
import { DashboardSearchField } from '@/components/dashboard/DashboardSearchField';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardPanel } from '@/components/dashboard/DashboardPanel';
import { DashboardReviewModal } from '@/components/dashboard/DashboardReviewModal';
import { DashboardSectionLabel } from '@/components/dashboard/DashboardSectionLabel';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import {
  DashboardTableAction,
  DashboardTableActions,
  DashboardTableTextAction,
} from '@/components/dashboard/DashboardTableActions';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import { useDashboardSearch } from '@/hooks/useDashboardSearch';
import { KYC_DOC_LABELS } from '@/lib/kyc/types';
import { getKycDocPreview } from '@/lib/kyc/preview-cache';
import type { KycSubmission } from '@/lib/kyc/types';
import { dashboardPanelClass } from '@/lib/constants/dashboard-layout';
import { cn, formatRelativeTime } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateUser } from '@/store/slices/authSlice';
import { selectKycSubmissions } from '@/lib/kyc/selectors';
import { setKycSubmissionStatus } from '@/store/slices/kycSlice';
import { addToast } from '@/store/slices/uiSlice';

type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

const DEFAULT_REJECTION_REASON =
  'Documents could not be verified. Please submit clearer ID and selfie photos.';

function statusBadgeVariant(status: KycSubmission['status']) {
  if (status === 'APPROVED') return 'success' as const;
  if (status === 'REJECTED') return 'danger' as const;
  if (status === 'PENDING') return 'warning' as const;
  return 'default' as const;
}

function queueStatusLabel(status: KycSubmission['status']) {
  if (status === 'DRAFT') return 'Draft';
  return status;
}

function countByStatus(submissions: KycSubmission[], status: StatusFilter): number {
  if (status === 'ALL') return submissions.length;
  return submissions.filter((s) => s.status === status).length;
}

type StatusConfirmAction = 'approve' | 'reject';

export default function VerificationsPage() {
  const dispatch = useAppDispatch();
  const { user: authUser } = useAppSelector((s) => s.auth);
  const submissions = useAppSelector(selectKycSubmissions);

  const search = useDashboardSearch();
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('PENDING');
  const [selected, setSelected] = useState<KycSubmission | null>(null);
  const [statusConfirm, setStatusConfirm] = useState<{
    action: StatusConfirmAction;
    submission: KycSubmission;
  } | null>(null);

  const queue = useMemo(
    () => submissions.filter((s) => s.status !== 'DRAFT' && s.submittedAt),
    [submissions],
  );

  const stats = useMemo((): DashboardOverviewStat[] => {
    const pending = countByStatus(queue, 'PENDING');
    const approved = countByStatus(queue, 'APPROVED');
    const rejected = countByStatus(queue, 'REJECTED');
    return [
      { label: 'Pending', value: String(pending), positive: false },
      { label: 'Approved', value: String(approved), positive: true },
      { label: 'Declined', value: String(rejected), positive: false },
      { label: 'Total', value: String(queue.length) },
    ];
  }, [queue]);

  const statusTabs = useMemo(() => {
    const labels: Record<StatusFilter, string> = {
      ALL: 'All',
      PENDING: 'Pending',
      APPROVED: 'Approved',
      REJECTED: 'Declined',
    };
    return (['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((id) => ({
      id,
      label: labels[id],
      count: countByStatus(queue, id),
    }));
  }, [queue]);

  const filtered = useMemo(
    () =>
      queue.filter((sub) => {
        const q = search.appliedQuery.toLowerCase();
        const matchesSearch =
          !q ||
          sub.userName.toLowerCase().includes(q) ||
          sub.userEmail.toLowerCase().includes(q);
        const matchesStatus = filterStatus === 'ALL' || sub.status === filterStatus;
        return matchesSearch && matchesStatus;
      }),
    [queue, search.appliedQuery, filterStatus],
  );

  const hasActiveFilters = search.appliedQuery.length > 0 || filterStatus !== 'PENDING';

  const applyAuthVerified = (submission: KycSubmission, verified: boolean) => {
    if (authUser?.id && submission.userId === authUser.id) {
      dispatch(updateUser({ isVerified: verified }));
    }
  };

  const handleConfirmStatus = () => {
    if (!statusConfirm) return;
    const { action, submission } = statusConfirm;
    const nextStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';

    dispatch(
      setKycSubmissionStatus({
        submissionId: submission.id,
        status: nextStatus,
        rejectionReason: action === 'reject' ? DEFAULT_REJECTION_REASON : undefined,
      }),
    );

    applyAuthVerified(submission, action === 'approve');

    dispatch(
      addToast({
        type: 'success',
        title: action === 'approve' ? 'Identity approved' : 'Identity declined',
        message: `${submission.userName} — ${nextStatus.toLowerCase()}.`,
      }),
    );

    setStatusConfirm(null);
    setSelected(null);
  };

  const reviewDocuments =
    selected?.documents.map((doc) => ({
      name: KYC_DOC_LABELS[doc.kind],
      url: getKycDocPreview(doc.id),
    })) ?? [];

  return (
    <DashboardShell>
      <DashboardHeader
        title="Identity review"
        description="Manually approve or decline user ID and selfie submissions. Property registry work stays under Admin dashboard."
      />

      <section className={cn(dashboardPanelClass, 'mb-8')}>
        <DashboardSectionLabel className="mb-6 block">Queue overview</DashboardSectionLabel>
        <DashboardOverviewStats stats={stats} />
      </section>

      <DashboardFilterTabs
        className="mb-0 pb-1"
        options={statusTabs}
        value={filterStatus}
        onChange={(id) => setFilterStatus(id as StatusFilter)}
      />

      <DashboardFiltersBar className="!mt-10">
        <DashboardSearchField
          name="identity-review-search"
          placeholder="Search by name or email…"
          aria-label="Search identity submissions"
          value={search.queryInput}
          onChange={search.setQueryInput}
          onSearch={search.runSearch}
          onClear={search.clearSearch}
        />
        {hasActiveFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="h-11 shrink-0"
            onClick={() => {
              search.clearSearch();
              setFilterStatus('PENDING');
            }}
          >
            Clear filters
          </Button>
        ) : null}
      </DashboardFiltersBar>

      <DashboardPanel title={`Submissions (${filtered.length})`} bodyClassName="p-0">
        {filtered.length === 0 ? (
          <DashboardEmptyState
            icon={Shield}
            title="No identity submissions"
            description="When users submit ID and selfie photos from KYC, they appear here for review."
            className="border-0"
          />
        ) : (
          <DashboardDataTable minWidth="min-w-[44rem]">
            <DashboardTableHead>
              <tr>
                <DashboardTh>Applicant</DashboardTh>
                <DashboardTh>Status</DashboardTh>
                <DashboardTh>Submitted</DashboardTh>
                <DashboardTh>Files</DashboardTh>
                <DashboardTh className="text-right">Actions</DashboardTh>
              </tr>
            </DashboardTableHead>
            <DashboardTableBody>
              {filtered.map((sub) => (
                <DashboardTableRow key={sub.id}>
                  <DashboardTd>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{sub.userName}</p>
                      <p className="truncate text-sm text-muted">{sub.userEmail}</p>
                    </div>
                  </DashboardTd>
                  <DashboardTd>
                    <Badge variant={statusBadgeVariant(sub.status)} size="sm">
                      {queueStatusLabel(sub.status)}
                    </Badge>
                  </DashboardTd>
                  <DashboardTd className="whitespace-nowrap text-muted">
                    {sub.submittedAt ? formatRelativeTime(sub.submittedAt) : '—'}
                  </DashboardTd>
                  <DashboardTd>{sub.documents.length}</DashboardTd>
                  <DashboardTd>
                    <DashboardTableActions>
                      <DashboardTableTextAction
                        label="Review"
                        icon={<Eye className="size-3.5" />}
                        onClick={() => setSelected(sub)}
                      />
                      {sub.status === 'PENDING' && (
                        <>
                          <DashboardTableAction
                            label="Approve identity"
                            variant="accent"
                            icon={<CheckCircle className="size-4" />}
                            onClick={() =>
                              setStatusConfirm({ action: 'approve', submission: sub })
                            }
                          />
                          <DashboardTableAction
                            label="Decline identity"
                            variant="danger"
                            icon={<XCircle className="size-4" />}
                            onClick={() =>
                              setStatusConfirm({ action: 'reject', submission: sub })
                            }
                          />
                        </>
                      )}
                    </DashboardTableActions>
                  </DashboardTd>
                </DashboardTableRow>
              ))}
            </DashboardTableBody>
          </DashboardDataTable>
        )}
      </DashboardPanel>

      <DashboardReviewModal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.userName ?? 'Review'}
        subtitle={selected?.userEmail}
        typeLabel="Identity (KYC)"
        statusLabel={selected ? queueStatusLabel(selected.status) : undefined}
        statusVariant={selected ? statusBadgeVariant(selected.status) : 'warning'}
        documents={reviewDocuments}
        notes={
          selected?.status === 'REJECTED' && selected.rejectionReason
            ? selected.rejectionReason
            : 'Check that the ID is valid and the selfie clearly shows the applicant holding the same ID.'
        }
        onApprove={
          selected?.status === 'PENDING'
            ? () => setStatusConfirm({ action: 'approve', submission: selected })
            : undefined
        }
        onReject={
          selected?.status === 'PENDING'
            ? () => setStatusConfirm({ action: 'reject', submission: selected })
            : undefined
        }
      >
        {selected && selected.documents.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {selected.documents.map((doc) => {
              const preview = getKycDocPreview(doc.id);
              return (
                <div
                  key={doc.id}
                  className="overflow-hidden rounded-xl border border-border bg-surface"
                >
                  <p className="border-b border-border px-3 py-2 text-xs font-semibold text-foreground">
                    {KYC_DOC_LABELS[doc.kind]}
                  </p>
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={preview}
                      alt={KYC_DOC_LABELS[doc.kind]}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  ) : (
                    <p className="px-3 py-6 text-center text-xs text-muted">
                      {doc.fileName}
                      <span className="mt-1 block">Preview unavailable after reload</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : null}
      </DashboardReviewModal>

      <ConfirmDialog
        isOpen={!!statusConfirm}
        onClose={() => setStatusConfirm(null)}
        title={
          statusConfirm?.action === 'approve' ? 'Approve identity?' : 'Decline identity?'
        }
        description={
          statusConfirm?.action === 'approve'
            ? 'Mark this person as verified. They gain full platform access when signed in as this account.'
            : 'Decline this submission. The user can upload new ID and selfie photos and submit again.'
        }
        icon={statusConfirm?.action === 'approve' ? CheckCircle : XCircle}
        tone={statusConfirm?.action === 'approve' ? 'accent' : 'danger'}
        summary={
          statusConfirm
            ? [
                { label: 'Applicant', value: statusConfirm.submission.userName, highlight: true },
                { label: 'Email', value: statusConfirm.submission.userEmail },
                { label: 'Files', value: String(statusConfirm.submission.documents.length) },
              ]
            : undefined
        }
        confirmLabel={statusConfirm?.action === 'approve' ? 'Approve' : 'Decline'}
        confirmVariant={statusConfirm?.action === 'approve' ? 'primary' : 'danger'}
        onConfirm={handleConfirmStatus}
      />
    </DashboardShell>
  );
}
