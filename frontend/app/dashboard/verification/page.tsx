'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Camera,
  CheckCircle,
  Clock,
  CreditCard,
  Loader2,
  Shield,
  Trash2,
  Upload,
  XCircle,
} from 'lucide-react';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardSectionLabel } from '@/components/dashboard/DashboardSectionLabel';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { dashboardPanelClass } from '@/lib/constants/dashboard-layout';
import { authApi, type KycSubmissionStatus } from '@/lib/api/auth';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateUser } from '@/store/slices/authSlice';
import { addToast } from '@/store/slices/uiSlice';
import { cn, formatDate } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

type DocKind = 'ID_FRONT' | 'ID_BACK' | 'SELFIE';

interface DocSlot {
  kind:        DocKind;
  label:       string;
  description: string;
  Icon:        typeof CreditCard;
}

const DOC_SLOTS: DocSlot[] = [
  {
    kind:        'ID_FRONT',
    label:       'ID — Front',
    description: 'Clear photo of the front of your government-issued ID.',
    Icon:        CreditCard,
  },
  {
    kind:        'ID_BACK',
    label:       'ID — Back',
    description: 'Clear photo of the back of your government-issued ID.',
    Icon:        CreditCard,
  },
  {
    kind:        'SELFIE',
    label:       'Selfie with ID',
    description: 'Photo of your face clearly holding your ID next to it.',
    Icon:        Camera,
  },
];

const MAX_SIZE_MB = 10;
const MAX_SIZE    = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED     = ['image/jpeg', 'image/png', 'image/webp'];

function formatBytes(b: number) {
  if (b < 1024)          return `${b} B`;
  if (b < 1024 * 1024)   return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function VerificationPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);

  // Server-side KYC status
  const [submission, setSubmission] = useState<KycSubmissionStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Local draft files (before submit)
  const [drafts, setDrafts] = useState<Partial<Record<DocKind, File>>>({});
  const [previews, setPreviews] = useState<Partial<Record<DocKind, string>>>({});

  const [submitting, setSubmitting] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [removeKind, setRemoveKind] = useState<DocKind | null>(null);

  // Revoke preview URLs on unmount
  const previewRef = useRef(previews);
  previewRef.current = previews;
  useEffect(() => {
    return () => {
      Object.values(previewRef.current).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, []);

  // Load status from server
  const loadStatus = useCallback(async () => {
    try {
      setLoadingStatus(true);
      const data = await authApi.getKycStatus();
      setSubmission(data);
      if (data?.status === 'APPROVED') {
        dispatch(updateUser({ isVerified: true }));
      }
    } catch {
      // not critical — user can still try to submit
    } finally {
      setLoadingStatus(false);
    }
  }, [dispatch]);

  useEffect(() => { void loadStatus(); }, [loadStatus]);

  const status   = submission?.status ?? null;
  const canEdit  = status === null || status === 'REJECTED';
  const isPending  = status === 'PENDING';
  const isApproved = status === 'APPROVED';
  const isRejected = status === 'REJECTED';

  const allPresent = DOC_SLOTS.every((s) => drafts[s.kind]);

  // ── File handlers ───────────────────────────────────────────────────────────

  const handleFileChange = (kind: DocKind, files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    if (!ALLOWED.includes(file.type)) {
      dispatch(addToast({
        type: 'error',
        title: 'Invalid file type',
        message: 'Only JPEG, PNG, or WebP images are accepted.',
      }));
      return;
    }
    if (file.size > MAX_SIZE) {
      dispatch(addToast({
        type: 'error',
        title: 'File too large',
        message: `Max ${MAX_SIZE_MB} MB per image.`,
      }));
      return;
    }

    // Revoke old preview
    if (previews[kind]) URL.revokeObjectURL(previews[kind]!);

    const url = URL.createObjectURL(file);
    setDrafts((p)   => ({ ...p, [kind]: file }));
    setPreviews((p) => ({ ...p, [kind]: url  }));
    dispatch(addToast({ type: 'success', title: 'Image added', message: file.name }));
  };

  const handleRemove = (kind: DocKind) => {
    if (previews[kind]) URL.revokeObjectURL(previews[kind]!);
    setDrafts((p)   => { const n = { ...p }; delete n[kind]; return n; });
    setPreviews((p) => { const n = { ...p }; delete n[kind]; return n; });
    setRemoveKind(null);
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!drafts.ID_FRONT || !drafts.ID_BACK || !drafts.SELFIE) return;
    setConfirmSubmit(false);
    setSubmitting(true);
    try {
      await authApi.submitKyc({
        id_front: drafts.ID_FRONT,
        id_back:  drafts.ID_BACK,
        selfie:   drafts.SELFIE,
      });
      dispatch(addToast({
        type:    'success',
        title:   'Submitted for review',
        message: 'An admin will approve or decline your identity documents.',
      }));
      // Clear local drafts and reload server status
      Object.values(previews).forEach((url) => { if (url) URL.revokeObjectURL(url); });
      setDrafts({});
      setPreviews({});
      await loadStatus();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Submission failed. Please try again.';
      dispatch(addToast({ type: 'error', title: 'Submission failed', message: msg }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResubmit = () => {
    setSubmission(null); // clear local state so canEdit becomes true again
    setDrafts({});
    setPreviews({});
    dispatch(addToast({
      type:    'info',
      title:   'Ready to resubmit',
      message: 'Upload new photos, then submit again.',
    }));
  };

  // ── Status banner ───────────────────────────────────────────────────────────

  const banner = (() => {
    if (isApproved) return {
      icon:       CheckCircle,
      iconClass:  'text-green-600',
      wrapClass:  'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
      title:      'Identity approved',
      body:       'An admin verified your documents. You have full platform access.',
    };
    if (isPending) return {
      icon:       Clock,
      iconClass:  'text-amber-600',
      wrapClass:  'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800',
      title:      'Waiting for admin review',
      body:       'Your ID and selfie are under review. You will be notified when approved or declined.',
    };
    if (isRejected) return {
      icon:       XCircle,
      iconClass:  'text-red-600',
      wrapClass:  'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
      title:      'Submission declined',
      body:       submission?.rejectReason ?? 'Your documents were not accepted. Upload new photos and submit again.',
    };
    return {
      icon:       Shield,
      iconClass:  'text-primary',
      wrapClass:  'bg-primary/5 border-primary/20',
      title:      'Submit identity documents',
      body:       'Upload your government ID (front & back) and a selfie holding the ID. An admin reviews every submission manually.',
    };
  })();

  const BannerIcon = banner.icon;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <DashboardShell>
      <DashboardHeader
        title="Identity Verification (KYC)"
        description="Submit ID photos for manual admin review. Approval is not automatic."
      />

      {/* Status banner */}
      <div className={cn('mb-8 flex items-start gap-4 rounded-2xl border p-5', banner.wrapClass)}>
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/60 dark:bg-black/20">
          <BannerIcon className={cn('size-6', banner.iconClass)} />
        </div>
        <div className="flex-1">
          <h3 className="font-heading text-base font-semibold text-foreground">{banner.title}</h3>
          <p className="mt-1 text-sm text-muted">{banner.body}</p>
          {isRejected && (
            <Button variant="primary" size="sm" className="mt-4" onClick={handleResubmit}>
              Upload new documents
            </Button>
          )}
        </div>
        {status && (
          <Badge
            variant={isApproved ? 'verified' : isPending ? 'warning' : 'outline'}
            size="sm"
          >
            {status}
          </Badge>
        )}
      </div>

      {loadingStatus ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
          <Loader2 className="size-5 animate-spin" />
          Loading status…
        </div>
      ) : !isApproved && (
        <>
          {/* Document upload slots */}
          <section className="mb-8">
            <DashboardSectionLabel className="mb-4">
              {isPending ? 'Submitted documents' : 'Required photos'}
            </DashboardSectionLabel>

            <div className="grid gap-4">
              {DOC_SLOTS.map(({ kind, label, description, Icon }) => {
                const submittedDoc = submission?.documents.find((d) => d.kind === kind);
                const draft        = drafts[kind];
                const preview      = previews[kind];
                const hasFile      = !!submittedDoc || !!draft;

                return (
                  <Card key={kind} className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                        <Icon className="size-6 text-accent" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-foreground">{label}</p>
                            <p className="mt-0.5 text-sm text-muted">{description}</p>
                          </div>
                          <Badge
                            variant={hasFile ? (isPending ? 'warning' : 'verified') : 'outline'}
                            size="sm"
                          >
                            {hasFile ? (isPending ? 'Submitted' : 'Ready') : 'Missing'}
                          </Badge>
                        </div>

                        {/* Preview image */}
                        {preview && (
                          <div className="mt-4 overflow-hidden rounded-xl border border-border">
                            <img
                              src={preview}
                              alt={label}
                              className="max-h-48 w-full object-cover"
                            />
                          </div>
                        )}

                        {/* File info */}
                        {(draft || submittedDoc) && (
                          <div className="mt-3 rounded-lg bg-surface px-4 py-3">
                            <p className="text-sm font-medium text-foreground">
                              {draft?.name ?? submittedDoc?.fileName}
                            </p>
                            <p className="text-xs text-muted">
                              {formatBytes(draft?.size ?? submittedDoc?.sizeBytes ?? 0)}
                              {submittedDoc && ` · submitted ${formatDate(submittedDoc.createdAt)}`}
                            </p>

                            {canEdit && draft && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2 text-destructive hover:bg-destructive/10"
                                leftIcon={<Trash2 className="size-4" />}
                                onClick={() => setRemoveKind(kind)}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        )}

                        {/* Upload button */}
                        {canEdit && !draft && !submittedDoc && (
                          <div className="mt-4">
                            <label>
                              <input
                                type="file"
                                className="hidden"
                                accept={ALLOWED.join(',')}
                                onChange={(e) => {
                                  handleFileChange(kind, e.target.files);
                                  e.target.value = '';
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="md"
                                leftIcon={<Upload className="size-4" />}
                                onClick={(e) => {
                                  (e.currentTarget.parentElement as HTMLLabelElement)
                                    ?.querySelector('input')?.click();
                                }}
                              >
                                Upload image
                              </Button>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Submit button */}
            {canEdit && (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  disabled={!allPresent || submitting}
                  leftIcon={submitting ? <Loader2 className="size-4 animate-spin" /> : undefined}
                  onClick={() => setConfirmSubmit(true)}
                >
                  {submitting ? 'Submitting…' : 'Submit for admin review'}
                </Button>
                {!allPresent && (
                  <p className="text-sm text-muted">Upload all three images to continue.</p>
                )}
              </div>
            )}
          </section>
        </>
      )}

      {/* Guidelines */}
      <Card className={cn(dashboardPanelClass, 'p-5')}>
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-muted" aria-hidden />
          <ul className="space-y-1 text-sm text-muted">
            <li>· JPEG, PNG, or WebP only — max {MAX_SIZE_MB} MB each</li>
            <li>· ID must be government-issued, valid, and fully visible</li>
            <li>· Selfie must show your face and the ID clearly in one photo</li>
            <li>· Review is manual — typical turnaround 24–48 hours</li>
            <li>· You will be notified by email when approved or declined</li>
          </ul>
        </div>
      </Card>

      {/* Remove confirm */}
      <ConfirmDialog
        isOpen={removeKind !== null}
        onClose={() => setRemoveKind(null)}
        onConfirm={() => { if (removeKind) handleRemove(removeKind); }}
        title="Remove this image?"
        description="You can upload a replacement before submitting."
        confirmLabel="Remove"
        tone="danger"
        confirmVariant="danger"
      />

      {/* Submit confirm */}
      <ConfirmDialog
        isOpen={confirmSubmit}
        onClose={() => setConfirmSubmit(false)}
        onConfirm={() => void handleSubmit()}
        title="Submit for review?"
        description="An admin will check your ID and selfie. You cannot edit files while pending."
        confirmLabel="Submit"
        tone="accent"
        summary={[
          { label: 'Name',  value: `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim(), highlight: true },
          { label: 'Email', value: user?.email ?? '' },
          { label: 'Files', value: '3 images' },
        ]}
      />
    </DashboardShell>
  );
}
