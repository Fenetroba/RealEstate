'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bath,
  Bed,
  Building2,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  ImageIcon,
  Loader2,
  MapPin,
  RefreshCw,
  Ruler,
  Shield,
  Tag,
  User,
  XCircle,
} from 'lucide-react';

import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState';
import { AdminSection } from '@/components/admin/AdminSection';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { cn, formatDate, truncateAddress } from '@/lib/utils';
import { dashboardSectionStackClass } from '@/lib/constants/dashboard-layout';
import apiClient from '@/lib/api/client';

// ── Types ─────────────────────────────────────────────────────────────────────

interface DocMeta {
  id: string;
  fileType: 'IMAGE' | 'DOCUMENT';
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  sha256Hash: string;
  versionNo: number;
  docType: string;
  createdAt: string;
  uploadedBy: string;
}

interface PropertyData {
  id: string;
  tokenId: string;
  ownerWallet: string;
  status: 'PENDING' | 'MINTED' | 'DECLINED';
  name: string;
  location: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  parking: number;
  floors: number;
  yearBuilt: number;
  price: string;
  description: string | null;
  documents: DocMeta[];
}

interface RequestRow {
  id: string;
  type: 'MINT' | 'UPDATE';
  status: 'PENDING' | 'APPROVED' | 'DECLINED';
  submittedBy: string;
  submittedAt: string;
  reviewedAt: string | null;
  declineReason: string | null;
  metadataSnapshot: Record<string, unknown>;
  propertyId: string | null;
  property: PropertyData | null;
}

// ── Image component with auth header ─────────────────────────────────────────

function DocImage({ docId, alt }: { docId: string; alt: string }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const blobRef = useRef<string | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) { setLoading(false); return; }

    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';
    let cancelled = false;

    fetch(`${apiBase}/admin/db-requests/any/image/${docId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.blob())
      .then((b) => {
        if (cancelled) return;
        const url = URL.createObjectURL(b);
        blobRef.current = url;
        setBlobUrl(url);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => {
      cancelled = true;
      if (blobRef.current) URL.revokeObjectURL(blobRef.current);
    };
  }, [docId]);

  if (loading) return (
    <div className="flex h-36 items-center justify-center rounded-xl border border-border bg-surface">
      <Loader2 className="size-5 animate-spin text-muted" />
    </div>
  );
  if (!blobUrl) return (
    <div className="flex h-36 items-center justify-center rounded-xl border border-border bg-surface text-xs text-muted">
      Preview unavailable
    </div>
  );
  return (
    <a href={blobUrl} target="_blank" rel="noopener noreferrer">
      <img
        src={blobUrl}
        alt={alt}
        className="h-36 w-full rounded-xl border border-border object-cover transition hover:opacity-90"
      />
    </a>
  );
}

// ── Document file component — fetches bytes with auth, opens/downloads ────────

function DocFile({ doc }: { doc: DocMeta }) {
  const [fetching, setFetching] = useState(false);

  const handleOpen = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) return;

    setFetching(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';
      const res = await fetch(`${apiBase}/admin/db-requests/any/image/${doc.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch document');

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);

      // PDFs open inline in a new tab; everything else downloads
      if (doc.mimeType === 'application/pdf') {
        window.open(url, '_blank', 'noopener,noreferrer');
        // Revoke after a short delay to allow the tab to load
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      } else {
        const a = document.createElement('a');
        a.href     = url;
        a.download = doc.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5_000);
      }
    } catch {
      /* silent — user will see nothing happened */
    } finally {
      setFetching(false);
    }
  };

  const isPdf = doc.mimeType === 'application/pdf';

  return (
    <li>
      <button
        type="button"
        onClick={() => void handleOpen()}
        disabled={fetching}
        className="group flex w-full items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm transition-colors hover:border-accent hover:bg-accent/5"
      >
        {fetching ? (
          <Loader2 className="size-4 shrink-0 animate-spin text-accent" />
        ) : (
          <FileText className="size-4 shrink-0 text-muted group-hover:text-accent" />
        )}
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate font-medium text-foreground group-hover:text-accent">
            {doc.fileName}
          </p>
          <p className="text-xs text-muted capitalize">
            {doc.docType} · {(doc.sizeBytes / 1024).toFixed(0)} KB
          </p>
        </div>
        <span className="shrink-0 text-xs text-muted group-hover:text-accent">
          {isPdf ? 'View ↗' : 'Download ↓'}
        </span>
      </button>
    </li>
  );
}

function RequestCard({
  req,
  onApprove,
  onDecline,
  busy,
}: {
  req: RequestRow;
  onApprove: (id: string) => void;
  onDecline: (id: string) => void;
  busy: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const prop = req.property;
  const snap = req.metadataSnapshot as Record<string, unknown>;
  const name     = (prop?.name     ?? snap?.name     ?? 'Untitled') as string;
  const location = (prop?.location ?? snap?.location ?? '—')        as string;
  const propType = (prop?.propertyType ?? snap?.propertyType ?? '—') as string;
  const price    = (prop?.price    ?? snap?.price    ?? '0')         as string;
  const desc     = (prop?.description ?? snap?.description ?? '')    as string;

  const images    = prop?.documents?.filter((d) => d.fileType === 'IMAGE')    ?? [];
  const documents = prop?.documents?.filter((d) => d.fileType === 'DOCUMENT') ?? [];

  const statusBadge = {
    PENDING:  { label: 'Pending',  variant: 'warning'  as const },
    APPROVED: { label: 'Approved', variant: 'verified' as const },
    DECLINED: { label: 'Declined', variant: 'outline'  as const },
  }[req.status];

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* ── Card header ── */}
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-surface"
      >
        {/* Icon */}
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
          <Building2 className="size-5 text-accent" />
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
          <Badge variant={statusBadge.variant} size="sm">{statusBadge.label}</Badge>
        </div>

        <span className="text-xs text-muted shrink-0">{formatDate(req.submittedAt)}</span>
        {expanded ? <ChevronUp className="size-4 shrink-0 text-muted" /> : <ChevronDown className="size-4 shrink-0 text-muted" />}
      </button>

      {/* ── Expanded detail ── */}
      {expanded && (
        <div className="border-t border-border px-5 py-5 space-y-6">

          {/* Decline reason */}
          {req.declineReason && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Declined: {req.declineReason}
            </p>
          )}

          {/* Property details grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Detail icon={Tag}      label="Type"        value={propType} />
            <Detail icon={MapPin}   label="Location"    value={location} />
            <Detail icon={Tag}      label="Price"       value={`${price} ETH`} />
            <Detail icon={Bed}      label="Bedrooms"    value={String(prop?.bedrooms  ?? snap?.bedrooms  ?? 0)} />
            <Detail icon={Bath}     label="Bathrooms"   value={String(prop?.bathrooms ?? snap?.bathrooms ?? 0)} />
            <Detail icon={Ruler}    label="Sq ft"       value={String(prop?.squareFeet ?? snap?.squareFeet ?? 0)} />
            <Detail icon={Building2} label="Floors"     value={String(prop?.floors    ?? snap?.floors    ?? 0)} />
            <Detail icon={Calendar} label="Year built"  value={String(prop?.yearBuilt ?? snap?.yearBuilt ?? 0)} />
            <Detail icon={User}     label="Submitted by" value={truncateAddress(req.submittedBy)} />
          </div>

          {desc && (
            <p className="text-sm text-muted rounded-xl bg-surface px-4 py-3">{desc}</p>
          )}

          {/* Images */}
          {images.length > 0 && (
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <ImageIcon className="size-4 text-accent" />
                Photos ({images.length})
              </h4>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {images.map((img) => (
                  <DocImage key={img.id} docId={img.id} alt={img.fileName} />
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {documents.length > 0 && (
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <FileText className="size-4 text-accent" />
                Documents ({documents.length})
              </h4>
              <ul className="space-y-2">
                {documents.map((doc) => (
                  <DocFile key={doc.id} doc={doc} />
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          {req.status === 'PENDING' && (
            <div className="flex flex-wrap gap-3 pt-2 border-t border-border">
              <Button
                variant="primary"
                size="sm"
                disabled={busy}
                leftIcon={busy ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4" />}
                onClick={() => onApprove(req.id)}
              >
                Approve & publish
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                className="text-destructive hover:bg-destructive/10"
                leftIcon={<XCircle className="size-4" />}
                onClick={() => onDecline(req.id)}
              >
                Decline
              </Button>
            </div>
          )}

          {req.status === 'APPROVED' && (
            <p className="flex items-center gap-1.5 text-sm text-green-600">
              <CheckCircle className="size-4" />
              Approved{req.reviewedAt ? ` · ${formatDate(req.reviewedAt)}` : ''}
              {prop?.tokenId && ` · Token: ${prop.tokenId}`}
            </p>
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

type Filter = 'PENDING' | 'APPROVED' | 'DECLINED' | 'ALL';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'PENDING',  label: 'Pending' },
  { id: 'APPROVED', label: 'Approved' },
  { id: 'DECLINED', label: 'Declined' },
  { id: 'ALL',      label: 'All' },
];

export default function PropertyApprovalsPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);

  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<Filter>('PENDING');
  const [busy,     setBusy]     = useState<string | null>(null);

  // Approve dialog
  const [approveId, setApproveId] = useState<string | null>(null);
  // Decline dialog
  const [declineId,     setDeclineId]     = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  const isAdmin = user?.role === 'ADMIN';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter !== 'ALL' ? `?status=${filter}` : '';
      const { data } = await apiClient.get(`/admin/db-requests${params}`);
      setRequests(data.data ?? []);
    } catch {
      dispatch(addToast({ type: 'error', title: 'Failed to load requests' }));
    } finally {
      setLoading(false);
    }
  }, [filter, dispatch]);

  useEffect(() => { void load(); }, [load]);

  const handleApprove = async () => {
    if (!approveId) return;
    setBusy(approveId);
    try {
      await apiClient.post(
        `/admin/approve/${approveId}`,
        {},
      );
      dispatch(addToast({ type: 'success', title: 'Property approved', message: 'The property is now published.' }));
      setApproveId(null);
      await load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error
        ?? (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Approval failed';
      dispatch(addToast({ type: 'error', title: 'Approval failed', message: msg }));
    } finally {
      setBusy(null);
    }
  };

  const handleDecline = async () => {
    if (!declineId) return;
    setBusy(declineId);
    try {
      await apiClient.post(
        `/admin/decline/${declineId}`,
        { reason: declineReason.trim() || undefined },
      );
      dispatch(addToast({ type: 'info', title: 'Property declined' }));
      setDeclineId(null);
      setDeclineReason('');
      await load();
    } catch {
      dispatch(addToast({ type: 'error', title: 'Decline failed' }));
    } finally {
      setBusy(null);
    }
  };

  const counts = {
    PENDING:  requests.filter((r) => r.status === 'PENDING').length,
    APPROVED: requests.filter((r) => r.status === 'APPROVED').length,
    DECLINED: requests.filter((r) => r.status === 'DECLINED').length,
    ALL:      requests.length,
  };

  if (!isAdmin) {
    return (
      <DashboardShell>
        <DashboardEmptyState
          icon={Shield}
          title="Admin access required"
          description="Only admin accounts can review property submissions."
        />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className={dashboardSectionStackClass}>
        <DashboardHeader
          title="Property approvals"
          description="Review property registration requests submitted by users. Approve to publish, or decline with a reason."
          actions={
            <Button
              variant="outline"
              size="sm"
              leftIcon={loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              onClick={() => void load()}
              disabled={loading}
            >
              Refresh
            </Button>
          }
        />

        {/* Stats strip */}
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Pending',  value: counts.PENDING,  color: 'text-amber-600'  },
            { label: 'Approved', value: counts.APPROVED, color: 'text-green-600'  },
            { label: 'Declined', value: counts.DECLINED, color: 'text-destructive' },
            { label: 'Total',    value: counts.ALL,       color: 'text-foreground'  },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
              <span className={cn('text-xl font-bold', s.color)}>{s.value}</span>
              <span className="text-sm text-muted">{s.label}</span>
            </div>
          ))}
        </div>

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

        {/* Request list */}
        <AdminSection
          title={`${filter === 'ALL' ? 'All' : filter.charAt(0) + filter.slice(1).toLowerCase()} requests`}
          subtitle="Click any row to expand and view full property details, photos, and documents."
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
              <Loader2 className="size-5 animate-spin" />
              Loading requests…
            </div>
          ) : requests.length === 0 ? (
            <DashboardEmptyState
              icon={Building2}
              title={`No ${filter === 'ALL' ? '' : filter.toLowerCase() + ' '}requests`}
              description="Requests submitted by users appear here."
            />
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <RequestCard
                  key={req.id}
                  req={req}
                  busy={busy === req.id}
                  onApprove={(id) => setApproveId(id)}
                  onDecline={(id) => { setDeclineId(id); setDeclineReason(''); }}
                />
              ))}
            </div>
          )}
        </AdminSection>
      </div>

      {/* Approve confirm */}
      <ConfirmDialog
        isOpen={approveId !== null}
        onClose={() => setApproveId(null)}
        onConfirm={() => void handleApprove()}
        title="Approve & publish property?"
        description="The property will be marked as MINTED and visible in the marketplace. This action can be reversed by admins."
        confirmLabel="Approve & publish"
        tone="accent"
      />

      {/* Decline dialog */}
      <ConfirmDialog
        isOpen={declineId !== null}
        onClose={() => setDeclineId(null)}
        onConfirm={() => void handleDecline()}
        title="Decline property request?"
        description="The user will be notified. They can resubmit after making corrections."
        confirmLabel="Decline"
        tone="danger"
        confirmVariant="danger"
      >
        <div className="mt-3">
          <label className="block text-sm font-medium text-foreground mb-1">
            Reason <span className="text-muted font-normal">(optional)</span>
          </label>
          <textarea
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            rows={3}
            placeholder="e.g. Documents are incomplete, price is missing…"
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
          />
        </div>
      </ConfirmDialog>
    </DashboardShell>
  );
}
