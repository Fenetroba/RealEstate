'use client';

import { useRef } from 'react';
import { FileText, ImageIcon, Pencil } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { DialogBody, DialogFooter, DialogHeader } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { PROPERTY_REGISTRATION_TYPES } from '@/lib/property-update';
import type { PropertyUpdateFormState } from '@/lib/property-update';
import type { RegistryProperty } from '@/types/registry-property';

const ACCEPT_IMAGES = 'image/*';
const ACCEPT_DOCUMENTS = '.pdf,.doc,.docx';

interface UpdateRequestModalProps {
  isOpen: boolean;
  property: RegistryProperty | null;
  form: PropertyUpdateFormState;
  images: File[];
  documents: File[];
  loading: boolean;
  fieldError: string | null;
  dbMissing: boolean;
  onClose: () => void;
  onFormChange: (patch: Partial<PropertyUpdateFormState>) => void;
  onImagesChange: (files: File[]) => void;
  onDocumentsChange: (files: File[]) => void;
  onSubmit: () => void;
}

export function UpdateRequestModal({
  isOpen,
  property,
  form,
  images,
  documents,
  loading,
  fieldError,
  dbMissing,
  onClose,
  onFormChange,
  onImagesChange,
  onDocumentsChange,
  onSubmit,
}: UpdateRequestModalProps) {
  const imageRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);

  if (!property) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" fitContent className="overflow-hidden">
      <DialogHeader
        title={`Metadata update — NFT #${property.id}`}
        description="Upload new files and adjust details. Changes require government approval before they appear on the public registry."
        icon={Pencil}
        iconTone="accent"
        onClose={onClose}
      />

      <DialogBody className="max-h-[min(60vh,520px)] space-y-5 overflow-y-auto pt-2">
        {dbMissing ? (
          <p className="rounded-lg border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-200">
            Property not found in registry database. Updates cannot be uploaded until this NFT is
            linked after mint approval.
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Property name"
            required
            value={form.name}
            onChange={(e) => onFormChange({ name: e.target.value })}
            disabled={loading || dbMissing}
          />
          <Select
            label="Property type"
            required
            value={form.propertyType}
            onChange={(e) =>
              onFormChange({
                propertyType: e.target.value as PropertyUpdateFormState['propertyType'],
              })
            }
            disabled={loading || dbMissing}
            options={PROPERTY_REGISTRATION_TYPES.map((t) => ({ value: t, label: t }))}
          />
        </div>

        <Input
          label="Location"
          required
          value={form.location}
          onChange={(e) => onFormChange({ location: e.target.value })}
          disabled={loading || dbMissing}
        />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Input
            label="Price (ETH)"
            required
            type="number"
            min={0}
            step="any"
            value={form.price}
            onChange={(e) => onFormChange({ price: e.target.value })}
            disabled={loading || dbMissing}
          />
          <Input
            label="Bedrooms"
            required
            type="number"
            min={0}
            value={form.bedrooms}
            onChange={(e) => onFormChange({ bedrooms: e.target.value })}
            disabled={loading || dbMissing}
          />
          <Input
            label="Bathrooms"
            required
            type="number"
            min={0}
            value={form.bathrooms}
            onChange={(e) => onFormChange({ bathrooms: e.target.value })}
            disabled={loading || dbMissing}
          />
          <Input
            label="Sqft"
            required
            type="number"
            min={0}
            value={form.sqft}
            onChange={(e) => onFormChange({ sqft: e.target.value })}
            disabled={loading || dbMissing}
          />
          <Input
            label="Parking (0/1)"
            required
            type="number"
            min={0}
            max={1}
            value={form.parking}
            onChange={(e) => onFormChange({ parking: e.target.value })}
            disabled={loading || dbMissing}
          />
          <Input
            label="Floors"
            required
            type="number"
            min={0}
            value={form.floors}
            onChange={(e) => onFormChange({ floors: e.target.value })}
            disabled={loading || dbMissing}
          />
          <Input
            label="Year built"
            required
            type="number"
            value={form.yearBuilt}
            onChange={(e) => onFormChange({ yearBuilt: e.target.value })}
            disabled={loading || dbMissing}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-dashed border-border p-4">
            <p className="mb-2 text-sm font-medium text-foreground">New images</p>
            <p className="mb-3 text-xs text-muted">Optional. Leave empty to keep current photos.</p>
            <input
              ref={imageRef}
              type="file"
              accept={ACCEPT_IMAGES}
              multiple
              className="hidden"
              disabled={loading || dbMissing}
              onChange={(e) => onImagesChange(Array.from(e.target.files ?? []))}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<ImageIcon className="size-4" />}
              disabled={loading || dbMissing}
              onClick={() => imageRef.current?.click()}
            >
              {images.length ? `${images.length} file(s) selected` : 'Choose images'}
            </Button>
          </div>

          <div className="rounded-xl border border-dashed border-border p-4">
            <p className="mb-2 text-sm font-medium text-foreground">New documents</p>
            <p className="mb-3 text-xs text-muted">Optional. PDF or Word formats.</p>
            <input
              ref={docRef}
              type="file"
              accept={ACCEPT_DOCUMENTS}
              multiple
              className="hidden"
              disabled={loading || dbMissing}
              onChange={(e) => onDocumentsChange(Array.from(e.target.files ?? []))}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<FileText className="size-4" />}
              disabled={loading || dbMissing}
              onClick={() => docRef.current?.click()}
            >
              {documents.length ? `${documents.length} file(s) selected` : 'Choose documents'}
            </Button>
          </div>
        </div>

        {fieldError ? (
          <p className="rounded-lg border border-red-200/80 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            {fieldError}
          </p>
        ) : null}
      </DialogBody>

      <DialogFooter className="mt-0">
        <Button variant="outline" size="md" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="md"
          isLoading={loading}
          disabled={dbMissing}
          onClick={onSubmit}
        >
          Submit update request
        </Button>
      </DialogFooter>
    </Modal>
  );
}
