'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clock,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Tag,
  XCircle,
} from 'lucide-react';

import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { cn, formatDate } from '@/lib/utils';
import { dashboardSectionStackClass } from '@/lib/constants/dashboard-layout';
import apiClient from '@/lib/api/client';

// ── Types ─────────────────────────────────────────────────────────────────────

interface DbRequest {
  id: string;
  type: 'MINT' | 'UPDATE';
  status: 'PENDING' | 'APPROVED' | 'DECLINED';
  submittedBy: string;
  submittedAt: string;
  reviewedAt: string | null;
  declineReason: string | null;
  metadataSnapshot: Record<string, unknown>;
  property: {
    id: string;
    name: string;
    location: string;
    propertyType: string;
    status: string;
    price: string;
    tokenId: string;
  } | null;
}

type Filter = 'ALL' | 'PENDING' | 'APPROVED' | 'DECLINED';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'ALL',      label: 'All'      },
  { id: 'PENDING',  label: 'Pending'  },
  { id: 'APPROVED', label: 'Approved' },
  { id: 'DECLINED', label: 'Declined' },
];

// ── Request card ──────────────────────────────────────────────────────────────

function RequestCard({ req }: { req: DbRequest }) {
  const [expanded, setExpanded] = useState(false);

  const prop = req.property;
  const snap = req.metadataSnapshot;
  const name     = (prop?.name     ?? snap?.name     ?? 'Untitled') as string;
  const location = (prop?.location ?? snap?.location ?? '—')        as string;
  const propType = (prop?.propertyType ?? snap?.propertyType ?? '—') as string;
  const price    = (prop?.price    ?? snap?.price    ?? '0')         as string;

  const statusConfig = {
    PENDING:  { icon: Clock,         variant: 'warning'  as const, label: 'Under review'  },
    APPROVED: { icon: CheckCircle,   variant: 'verified' as const, label: 'Approved'       },
    DECLINED: { icon: XCircle,       variant: 'outline'  as const, label: 'Declined'       },
  }[req.status];

  const StatusIcon = statusConfig.icon;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-surface"
      >
        {/* Status icon */}
        <div className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-xl',
          req.status === 'APPROVED' ? 'bg-green-500/10'
          : req.status === 'DECLINED' ? 'bg-destructive/10'
          : 'bg-amber-500/10',
        )}>
          <StatusIcon className={cn(
            'size-5',
            req.status === 'APPROVED' ? 'text-green-600'
            : req.status === 'DECLINED' ? 'text-destructive'
            : 'text-amber-600',
          )} />
        </div>

        {/* Name + location */}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground truncate">{name}</p>
          <p className="flex items-center gap-1 text-xs text-muted truncate">
            <MapPin className="size-3 shrink-0" />
            {location}
          </p>
        </div>

        {/* Badges */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <Badge variant="outline" size="sm">{req.type}</Badge>
          <Badge variant={statusConfig.variant} size="sm">{statusConfig.label}</Badge>
        </div>

        <span className="text-xs text-muted shrink-0 hidden sm:block">{formatDate(req.submittedAt)}</span>
        {expanded ? <ChevronUp className="size-4 shrink-0 text-muted" /> : <ChevronDown className="size-4 shrink-0 text-muted" />}
      </button>

      {expanded && (
        <div className="border-t border-border px-5 py-4 space-y-4">
          {/* Details grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Detail icon={Building2} label="Type"         value={propType} />
            <Detail icon={Tag}       label="Price"        value={`${price} ETH`} />
            <Detail icon={Calendar}  label="Submitted"    value={formatDate(req.submittedAt)} />
            {req.reviewedAt && (
              <Detail icon={Calendar} label="Reviewed" value={formatDate(req.reviewedAt)} />
            )}
            {prop?.tokenId && !prop.tokenId.startsWith('pending_') && !prop.tokenId.startsWith('db_') && (
              <Detail icon={Tag} label="Token ID" value={`#${prop.tokenId}`} />
            )}
          </div>

          {/* Decline reason */}
          {req.status === 'DECLINED' && req.declineReason && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <span className="font-semibold">Decline reason:</span> {req.declineReason}
            </div>
          )}

          {/* Approved message */}
          {req.status === 'APPROVED' && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
              <CheckCircle className="inline size-4 mr-1.5 align-text-bottom" />
              Your property has been approved and is now publicly visible in the marketplace.
            </div>
          )}

          {/* Action for declined — resubmit */}
          {req.status === 'DECLINED' && (
            <Link href="/dashboard/listings/create">
              <Button variant="outline" size="sm" leftIcon={<Plus className="size-4" />}>
                Submit a new request
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function Detail({ icon: Icon, label, value }: { icon: typeof Tag; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-surface px-3 py-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted" />
      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MyRequestsPage() {
  const dispatch = useAppDispatch();
  const [requests, setRequests] = useState<DbRequest[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<Filter>('ALL');

  const { address } = useAppSelector(s => s.wallet);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = address ? `?wallet=${address}` : '';
      const { data } = await apiClient.get(`/properties/my-requests${params}`);
      setRequests(data.data ?? []);
    } catch {
      dispatch(addToast({ type: 'error', title: 'Failed to load requests' }));
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [dispatch, address]);

  useEffect(() => { void load(); }, [load]);

  const counts = useMemo(() => ({
    ALL:      requests.length,
    PENDING:  requests.filter((r) => r.status === 'PENDING').length,
    APPROVED: requests.filter((r) => r.status === 'APPROVED').length,
    DECLINED: requests.filter((r) => r.status === 'DECLINED').length,
  }), [requests]);

  const filtered = useMemo(() =>
    filter === 'ALL' ? requests : requests.filter((r) => r.status === filter),
    [requests, filter],
  );

  return (
    <DashboardShell>
      <div className={dashboardSectionStackClass}>
        <DashboardHeader
          title="My property requests"
          description="Track the status of registration requests you submitted. An admin reviews each one."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/dashboard/listings/create">
                <Button variant="outline" size="sm" leftIcon={<Plus className="size-4" />}>
                  New request
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                leftIcon={loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                onClick={() => void load()}
                disabled={loading}
              >
                Refresh
              </Button>
            </div>
          }
        />

        {/* Filter tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-border pb-px">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                '-mb-px shrink-0 border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                filter === f.id
                  ? 'border-accent text-foreground'
                  : 'border-transparent text-muted hover:text-foreground',
              )}
            >
              {f.label}
              <span className="ml-1.5 text-xs font-normal text-muted">({counts[f.id]})</span>
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
            <Loader2 className="size-5 animate-spin" />
            Loading your requests…
          </div>
        ) : filtered.length === 0 ? (
          <DashboardEmptyState
            icon={ClipboardList}
            title={requests.length === 0 ? 'No requests yet' : 'No requests in this filter'}
            description={
              requests.length === 0
                ? 'Submit a property registration — an admin will review and publish it.'
                : 'Try a different filter.'
            }
            action={
              requests.length === 0 ? (
                <Link href="/dashboard/listings/create">
                  <Button variant="primary" leftIcon={<Plus className="size-4" />}>
                    Submit your first request
                  </Button>
                </Link>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((req) => (
              <RequestCard key={req.id} req={req} />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
