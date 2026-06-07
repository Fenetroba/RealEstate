'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Shield,
  User,
  Users,
  Wallet,
  XCircle,
} from 'lucide-react';

import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { authApi, type AdminUser } from '@/lib/api/auth';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { cn, formatDate, getInitials, truncateAddress } from '@/lib/utils';
import { dashboardSectionStackClass } from '@/lib/constants/dashboard-layout';

// ── Helpers ───────────────────────────────────────────────────────────────────

type KycStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

function kycBadge(status: KycStatus | null | undefined) {
  if (!status) return { label: 'No KYC', variant: 'outline' as const, Icon: User };
  if (status === 'APPROVED')  return { label: 'Verified',  variant: 'verified' as const, Icon: CheckCircle };
  if (status === 'PENDING')   return { label: 'Pending',   variant: 'warning'  as const, Icon: Clock };
  return                             { label: 'Rejected',  variant: 'outline'  as const, Icon: XCircle };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KycDocImage({ docId, label }: { docId: string; label: string }) {
  const url = authApi.adminGetKycDocumentUrl(docId);
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  // We can't set auth headers on <img>, so we use a proxy-style approach:
  // render the src directly — the backend serves the image if the cookie is present,
  // but since we use Bearer token we fetch it as a blob URL instead.
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((b) => { if (!cancelled) setBlobUrl(URL.createObjectURL(b)); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => {
      cancelled = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId, token]);

  if (loading) return (
    <div className="flex h-32 items-center justify-center rounded-xl border border-border bg-surface text-xs text-muted">
      <Loader2 className="size-4 animate-spin" />
    </div>
  );
  if (!blobUrl) return (
    <div className="flex h-32 items-center justify-center rounded-xl border border-border bg-surface text-xs text-muted">
      Failed to load
    </div>
  );
  return (
    <a href={blobUrl} target="_blank" rel="noopener noreferrer" title={`View ${label}`}>
      <img src={blobUrl} alt={label} className="h-32 w-full rounded-xl border border-border object-cover transition hover:opacity-90" />
    </a>
  );
}

function UserRow({ user, onApprove, onReject, busy }: {
  user: AdminUser;
  onApprove: (submissionId: string) => void;
  onReject:  (submissionId: string) => void;
  busy: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const kyc = user.latestKyc;
  const badge = kycBadge(kyc?.status);
  const KycIcon = badge.Icon;

  const DOC_LABELS: Record<string, string> = {
    ID_FRONT: 'ID Front',
    ID_BACK:  'ID Back',
    SELFIE:   'Selfie with ID',
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* ── Row header ─── */}
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-surface"
      >
        {/* Avatar */}
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full gradient-gold text-sm font-bold text-white">
          {getInitials(user.first_name, user.last_name)}
        </div>

        {/* Name + email */}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground truncate">
            {user.first_name} {user.last_name}
          </p>
          <p className="text-xs text-muted truncate">{user.email}</p>
        </div>

        {/* Badges */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <Badge variant={user.role === 'ADMIN' ? 'verified' : 'outline'} size="sm">
            {user.role}
          </Badge>
          <Badge variant={badge.variant} size="sm">
            <KycIcon className="size-3" />
            {badge.label}
          </Badge>
        </div>

        {/* Expand icon */}
        {expanded
          ? <ChevronUp className="size-4 shrink-0 text-muted" />
          : <ChevronDown className="size-4 shrink-0 text-muted" />
        }
      </button>

      {/* ── Expanded detail ─── */}
      {expanded && (
        <div className="border-t border-border px-5 py-5 space-y-5">

          {/* User info grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            {user.phone && (
              <div className="flex items-center gap-2 text-sm text-muted">
                <Phone className="size-4 shrink-0" />
                {user.phone}
              </div>
            )}
            {user.location && (
              <div className="flex items-center gap-2 text-sm text-muted">
                <MapPin className="size-4 shrink-0" />
                {user.location}
              </div>
            )}
            {user.walletAddress && (
              <div className="flex items-center gap-2 text-sm text-muted sm:col-span-2">
                <Wallet className="size-4 shrink-0" />
                <span className="font-mono break-all">{truncateAddress(user.walletAddress)}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted">
              <Mail className="size-4 shrink-0" />
              <span>{user.isEmailVerified ? 'Email verified' : 'Email not verified'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted">
              <Shield className="size-4 shrink-0" />
              <span>Joined {formatDate(user.createdAt)}</span>
            </div>
          </div>

          {/* KYC section */}
          {kyc ? (
            <div className="rounded-xl border border-border bg-surface p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-foreground">KYC Submission</p>
                <div className="flex items-center gap-2">
                  <Badge variant={badge.variant} size="sm">
                    <KycIcon className="size-3" />
                    {badge.label}
                  </Badge>
                  <span className="text-xs text-muted">
                    Submitted {formatDate(kyc.submittedAt)}
                  </span>
                </div>
              </div>

              {kyc.rejectReason && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  Rejection reason: {kyc.rejectReason}
                </p>
              )}

              {/* Document images */}
              {kyc.documents.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-3">
                  {kyc.documents.map((doc) => (
                    <div key={doc.id}>
                      <p className="mb-1 text-xs font-medium text-muted">
                        {DOC_LABELS[doc.kind] ?? doc.kind}
                      </p>
                      <KycDocImage docId={doc.id} label={DOC_LABELS[doc.kind] ?? doc.kind} />
                    </div>
                  ))}
                </div>
              )}

              {/* Approve / Reject actions — only for PENDING */}
              {kyc.status === 'PENDING' && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={busy}
                    leftIcon={busy ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4" />}
                    onClick={() => onApprove(kyc.id)}
                  >
                    Approve identity
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    className="text-destructive hover:bg-destructive/10"
                    leftIcon={<XCircle className="size-4" />}
                    onClick={() => onReject(kyc.id)}
                  >
                    Reject
                  </Button>
                </div>
              )}

              {kyc.status === 'APPROVED' && (
                <p className="flex items-center gap-1.5 text-sm text-green-600">
                  <CheckCircle className="size-4" />
                  Identity approved — user is verified
                  {kyc.reviewedAt && <span className="text-muted">· {formatDate(kyc.reviewedAt)}</span>}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted italic">No KYC submission yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

type Filter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'NONE';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'ALL',      label: 'All users' },
  { id: 'PENDING',  label: 'Pending KYC' },
  { id: 'APPROVED', label: 'Verified' },
  { id: 'REJECTED', label: 'Rejected' },
  { id: 'NONE',     label: 'No KYC' },
];

export default function AdminUsersPage() {
  const dispatch   = useAppDispatch();
  const { user }   = useAppSelector((s) => s.auth);

  const [users,   setUsers]   = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<Filter>('ALL');
  const [busy,    setBusy]    = useState<string | null>(null); // submissionId being actioned

  // Reject dialog state
  const [rejectId,     setRejectId]     = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Guard — only ADMIN can see this page
  const isAdmin = user?.role === 'ADMIN';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await authApi.adminListUsers();
      setUsers(data);
    } catch {
      dispatch(addToast({ type: 'error', title: 'Failed to load users' }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => { void load(); }, [load]);

  const handleApprove = async (submissionId: string) => {
    setBusy(submissionId);
    try {
      await authApi.adminApproveKyc(submissionId);
      dispatch(addToast({ type: 'success', title: 'KYC approved', message: 'User is now verified.' }));
      await load();
    } catch {
      dispatch(addToast({ type: 'error', title: 'Approval failed' }));
    } finally {
      setBusy(null);
    }
  };

  const handleReject = async () => {
    if (!rejectId) return;
    setBusy(rejectId);
    try {
      await authApi.adminRejectKyc(rejectId, rejectReason.trim() || undefined);
      dispatch(addToast({ type: 'info', title: 'KYC rejected', message: 'User has been notified.' }));
      setRejectId(null);
      setRejectReason('');
      await load();
    } catch {
      dispatch(addToast({ type: 'error', title: 'Rejection failed' }));
    } finally {
      setBusy(null);
    }
  };

  const filtered = users.filter((u) => {
    if (filter === 'ALL')      return true;
    if (filter === 'NONE')     return !u.latestKyc;
    return u.latestKyc?.status === filter;
  });

  const counts = {
    ALL:      users.length,
    PENDING:  users.filter((u) => u.latestKyc?.status === 'PENDING').length,
    APPROVED: users.filter((u) => u.latestKyc?.status === 'APPROVED').length,
    REJECTED: users.filter((u) => u.latestKyc?.status === 'REJECTED').length,
    NONE:     users.filter((u) => !u.latestKyc).length,
  };

  if (!isAdmin) {
    return (
      <DashboardShell>
        <DashboardEmptyState
          icon={Shield}
          title="Admin access required"
          description="Only admin accounts can view and manage users."
        />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className={dashboardSectionStackClass}>
        <DashboardHeader
          title="User management"
          description="View all registered users, review KYC identity documents, and approve or reject verifications."
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
            { label: 'Total users',     value: counts.ALL,      color: 'text-foreground' },
            { label: 'Pending KYC',     value: counts.PENDING,  color: 'text-amber-600'  },
            { label: 'Verified',        value: counts.APPROVED, color: 'text-green-600'  },
            { label: 'Rejected',        value: counts.REJECTED, color: 'text-destructive'},
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

        {/* User list */}
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
            <Loader2 className="size-5 animate-spin" />
            Loading users…
          </div>
        ) : filtered.length === 0 ? (
          <DashboardEmptyState
            icon={Users}
            title="No users in this filter"
            description="Try a different tab."
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((u) => (
              <UserRow
                key={u.id}
                user={u}
                busy={busy === u.latestKyc?.id}
                onApprove={handleApprove}
                onReject={(id) => { setRejectId(id); setRejectReason(''); }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reject dialog */}
      <ConfirmDialog
        isOpen={rejectId !== null}
        onClose={() => setRejectId(null)}
        onConfirm={() => void handleReject()}
        title="Reject identity verification?"
        description="The user will need to resubmit their documents."
        confirmLabel="Reject"
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
            placeholder="e.g. ID was blurry, selfie did not match…"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </div>
      </ConfirmDialog>
    </DashboardShell>
  );
}
