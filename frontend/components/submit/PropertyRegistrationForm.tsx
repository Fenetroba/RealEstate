'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bath,
  Bed,
  Building2,
  Calendar,
  Car,
  FileText,
  ImageIcon,
  Layers,
  Loader2,
  MapPin,
  Ruler,
  Tag,
  Trash2,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { submitPropertyRequest, confirmPropertyRequest } from '@/lib/api/properties';
import { PROPERTY_REGISTRATION_TYPES, emptyPropertyRegistrationForm } from '@/lib/submit-property';
import { validatePropertyRegistrationForm } from '@/lib/validation/property-schemas';

const MAX_IMAGE_MB = 10;
const MAX_DOC_MB   = 10;
const ALLOWED_IMAGES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOCS   = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

function formatBytes(b: number) {
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Image preview card ────────────────────────────────────────────────────────

function ImagePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const url = URL.createObjectURL(file);
  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-surface">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={file.name} className="size-full object-cover" onLoad={() => URL.revokeObjectURL(url)} />
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
        aria-label="Remove image"
      >
        <X className="size-3.5" />
      </button>
      <p className="absolute bottom-0 left-0 right-0 truncate bg-black/50 px-1.5 py-0.5 text-[10px] text-white/90">
        {file.name}
      </p>
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────

export function PropertyRegistrationForm() {
  const router   = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const walletAddress = useAppSelector((s) => s.wallet.address);

  const [form, setForm] = useState(emptyPropertyRegistrationForm());
  const [images,    setImages]    = useState<File[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const imageRef = useRef<HTMLInputElement>(null);
  const docRef   = useRef<HTMLInputElement>(null);

  const update = (patch: Partial<typeof form>) => {
    setForm((p) => ({ ...p, ...patch }));
    setError(null);
  };

  // ── File handlers ───────────────────────────────────────────────────────────

  const addImages = (files: FileList | null) => {
    if (!files) return;
    const valid: File[] = [];
    for (const f of Array.from(files)) {
      if (!ALLOWED_IMAGES.includes(f.type)) {
        dispatch(addToast({ type: 'error', title: 'Invalid file', message: `${f.name} is not a supported image type.` }));
        continue;
      }
      if (f.size > MAX_IMAGE_MB * 1024 * 1024) {
        dispatch(addToast({ type: 'error', title: 'File too large', message: `${f.name} exceeds ${MAX_IMAGE_MB} MB.` }));
        continue;
      }
      valid.push(f);
    }
    if (valid.length) setImages((p) => [...p, ...valid]);
  };

  const addDocuments = (files: FileList | null) => {
    if (!files) return;
    const valid: File[] = [];
    for (const f of Array.from(files)) {
      if (!ALLOWED_DOCS.includes(f.type)) {
        dispatch(addToast({ type: 'error', title: 'Invalid file', message: `${f.name} is not a supported document type (PDF, DOC, DOCX).` }));
        continue;
      }
      if (f.size > MAX_DOC_MB * 1024 * 1024) {
        dispatch(addToast({ type: 'error', title: 'File too large', message: `${f.name} exceeds ${MAX_DOC_MB} MB.` }));
        continue;
      }
      valid.push(f);
    }
    if (valid.length) setDocuments((p) => [...p, ...valid]);
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    setError(null);

    // Use wallet address or user email as identifier
    const submitterWallet = walletAddress ?? `user:${user?.id ?? 'anonymous'}`;

    const validationErr = validatePropertyRegistrationForm(form, images.length);
    if (validationErr) {
      setError(validationErr);
      return;
    }

    setLoading(true);
    try {
      // Step 1: Upload files + hash on backend
      const prepareResult = await submitPropertyRequest(form, images, documents, submitterWallet);

      // Step 2: Confirm with a placeholder txHash (no blockchain needed)
      const fakeTxHash = `db_submit_${Date.now()}`;
      await confirmPropertyRequest(prepareResult.tempId!, fakeTxHash);

      dispatch(addToast({
        type:    'success',
        title:   'Request submitted',
        message: 'Your property is under admin review. You will be notified when approved.',
        duration: 6000,
      }));

      // Reset and redirect
      setForm(emptyPropertyRegistrationForm());
      setImages([]);
      setDocuments([]);
      router.push('/dashboard/my-requests');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed. Please try again.';
      setError(msg);
      dispatch(addToast({ type: 'error', title: 'Submission failed', message: msg }));
    } finally {
      setLoading(false);
    }
  }, [form, images, documents, walletAddress, user, dispatch, router]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }}
    >
      {/* ── Basic info ── */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="font-heading text-base font-semibold text-foreground flex items-center gap-2">
            <Building2 className="size-4 text-accent" />
            Property details
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Property name"
              required
              placeholder="e.g. Sunset Villa"
              value={form.name}
              onChange={(e) => update({ name: e.target.value })}
              disabled={loading}
            />
            <Select
              label="Property type"
              required
              value={form.propertyType}
              onChange={(e) => update({ propertyType: e.target.value as typeof form.propertyType })}
              disabled={loading}
              options={PROPERTY_REGISTRATION_TYPES.map((t) => ({ value: t, label: t }))}
            />
          </div>

          <Input
            label="Location / Address"
            required
            placeholder="Full address or area"
            leftIcon={<MapPin className="size-4" />}
            value={form.location}
            onChange={(e) => update({ location: e.target.value })}
            disabled={loading}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Price (ETH)"
              required
              type="number"
              min={0}
              step="any"
              placeholder="0.5"
              leftIcon={<Tag className="size-4" />}
              value={form.price}
              onChange={(e) => update({ price: e.target.value })}
              disabled={loading}
            />
            <Select
              label="List for sale?"
              required
              value={form.isForSale ? 'true' : 'false'}
              onChange={(e) => update({ isForSale: e.target.value === 'true' })}
              disabled={loading}
              options={[
                { value: 'false', label: 'No — registry only' },
                { value: 'true',  label: 'Yes — list for sale' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Property specs ── */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="font-heading text-base font-semibold text-foreground flex items-center gap-2">
            <Ruler className="size-4 text-accent" />
            Specifications
          </h2>

          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
            <Input
              label="Bedrooms"
              required
              type="number" min={0} step={1}
              leftIcon={<Bed className="size-4" />}
              value={form.bedrooms}
              onChange={(e) => update({ bedrooms: e.target.value })}
              disabled={loading}
            />
            <Input
              label="Bathrooms"
              required
              type="number" min={0} step={1}
              leftIcon={<Bath className="size-4" />}
              value={form.bathrooms}
              onChange={(e) => update({ bathrooms: e.target.value })}
              disabled={loading}
            />
            <Input
              label="Area (sq ft)"
              required
              type="number" min={0} step={1}
              leftIcon={<Ruler className="size-4" />}
              value={form.sqft}
              onChange={(e) => update({ sqft: e.target.value })}
              disabled={loading}
            />
            <Input
              label="Parking spots"
              required
              type="number" min={0} step={1}
              leftIcon={<Car className="size-4" />}
              value={form.parking}
              onChange={(e) => update({ parking: e.target.value })}
              disabled={loading}
            />
            <Input
              label="Floors"
              required
              type="number" min={0} step={1}
              leftIcon={<Layers className="size-4" />}
              value={form.floors}
              onChange={(e) => update({ floors: e.target.value })}
              disabled={loading}
            />
            <Input
              label="Year built"
              required
              type="number" min={1800} max={2100} step={1}
              leftIcon={<Calendar className="size-4" />}
              value={form.yearBuilt}
              onChange={(e) => update({ yearBuilt: e.target.value })}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Images ── */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold text-foreground flex items-center gap-2">
              <ImageIcon className="size-4 text-accent" />
              Photos
              <span className="text-xs font-normal text-muted">(min 3, JPEG/PNG/WebP)</span>
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<ImageIcon className="size-4" />}
              onClick={() => imageRef.current?.click()}
              disabled={loading}
            >
              Add photos
            </Button>
          </div>

          <input
            ref={imageRef}
            type="file"
            accept={ALLOWED_IMAGES.join(',')}
            multiple
            className="hidden"
            onChange={(e) => { addImages(e.target.files); e.target.value = ''; }}
            disabled={loading}
          />

          {images.length === 0 ? (
            <button
              type="button"
              onClick={() => imageRef.current?.click()}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border py-10 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
            >
              <ImageIcon className="size-5" />
              Click to add photos
            </button>
          ) : (
            <div className="grid gap-3 grid-cols-3 sm:grid-cols-4">
              {images.map((img, i) => (
                <ImagePreview
                  key={`${img.name}-${i}`}
                  file={img}
                  onRemove={() => setImages((p) => p.filter((_, idx) => idx !== i))}
                />
              ))}
            </div>
          )}

          {images.length > 0 && images.length < 3 && (
            <p className="text-xs text-destructive">Please add at least {3 - images.length} more photo{3 - images.length > 1 ? 's' : ''}.</p>
          )}
          {images.length >= 3 && (
            <p className="text-xs text-green-600">{images.length} photo{images.length !== 1 ? 's' : ''} ready.</p>
          )}
        </CardContent>
      </Card>

      {/* ── Documents ── */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold text-foreground flex items-center gap-2">
              <FileText className="size-4 text-accent" />
              Supporting documents
              <span className="text-xs font-normal text-muted">(optional — PDF, DOC)</span>
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<FileText className="size-4" />}
              onClick={() => docRef.current?.click()}
              disabled={loading}
            >
              Add files
            </Button>
          </div>

          <input
            ref={docRef}
            type="file"
            accept={ALLOWED_DOCS.join(',')}
            multiple
            className="hidden"
            onChange={(e) => { addDocuments(e.target.files); e.target.value = ''; }}
            disabled={loading}
          />

          {documents.length === 0 ? (
            <button
              type="button"
              onClick={() => docRef.current?.click()}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border py-8 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
            >
              <FileText className="size-5" />
              Title deed, survey, etc. (optional)
            </button>
          ) : (
            <ul className="space-y-2">
              {documents.map((doc, i) => (
                <li
                  key={`${doc.name}-${i}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3"
                >
                  <FileText className="size-4 shrink-0 text-muted" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{doc.name}</p>
                    <p className="text-xs text-muted">{formatBytes(doc.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDocuments((p) => p.filter((_, idx) => idx !== i))}
                    className="text-muted hover:text-destructive"
                    aria-label="Remove document"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* ── Error + Submit ── */}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-3 pb-6">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={loading}
          leftIcon={loading ? <Loader2 className="size-5 animate-spin" /> : undefined}
        >
          {loading ? 'Uploading & submitting…' : 'Submit registration request'}
        </Button>
        <p className="text-center text-xs text-muted">
          Your property will be reviewed by an admin before it becomes publicly visible.
          You can track the status under{' '}
          <a href="/dashboard/my-requests" className="font-medium text-accent hover:underline">
            My requests
          </a>.
        </p>
      </div>
    </form>
  );
}
