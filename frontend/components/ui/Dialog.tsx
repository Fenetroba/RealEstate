'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, X } from 'lucide-react';

import { Button, type ButtonProps } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

export function DialogHeader({
  title,
  description,
  icon: Icon,
  iconTone = 'default',
  onClose,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconTone?: 'default' | 'danger' | 'accent';
  onClose?: () => void;
}) {
  const iconWrapClass = cn(
    'mb-4 flex size-11 shrink-0 items-center justify-center rounded-xl',
    iconTone === 'danger' && 'bg-red-500/10 text-red-600 dark:text-red-400',
    iconTone === 'accent' && 'bg-accent/15 text-accent',
    iconTone === 'default' && 'bg-surface text-foreground',
  );

  return (
    <div className="relative px-6 pt-6 pb-1">
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-muted transition-colors hover:bg-surface hover:text-foreground"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>
      ) : null}
      {Icon ? (
        <div className={iconWrapClass} aria-hidden>
          <Icon className="size-5" strokeWidth={2} />
        </div>
      ) : null}
      <h2 id="dialog-title" className="pr-10 font-heading text-lg font-semibold leading-snug text-foreground">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>
      ) : null}
    </div>
  );
}

export function DialogBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('px-6 py-5', className)}>{children}</div>;
}

export function DialogSummary({
  rows,
  className,
}: {
  rows: { label: string; value: React.ReactNode; highlight?: boolean }[];
  className?: string;
}) {
  return (
    <dl
      className={cn(
        'mx-6 mb-1 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface/80',
        className,
      )}
    >
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-start justify-between gap-4 px-4 py-3.5 text-sm sm:items-center"
        >
          <dt className="shrink-0 text-muted">{row.label}</dt>
          <dd
            className={cn(
              'min-w-0 text-right font-medium text-foreground',
              row.highlight && 'font-heading text-base text-accent',
            )}
          >
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function DialogFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'mt-5 flex flex-col-reverse gap-3 border-t border-border bg-surface/40 px-6 py-4 sm:flex-row sm:justify-end',
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: LucideIcon;
  tone?: 'default' | 'danger' | 'accent';
  summary?: { label: string; value: React.ReactNode; highlight?: boolean }[];
  notice?: string;
  cancelLabel?: string;
  confirmLabel: string;
  onConfirm: () => void;
  confirmVariant?: ButtonProps['variant'];
  isLoading?: boolean;
  confirmDisabled?: boolean;
  size?: 'sm' | 'md' | 'dialog';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  title,
  description,
  icon,
  tone = 'default',
  summary,
  notice,
  cancelLabel = 'Cancel',
  confirmLabel,
  onConfirm,
  confirmVariant = 'primary',
  isLoading = false,
  confirmDisabled = false,
  size = 'dialog',
}: ConfirmDialogProps) {
  const Icon = icon ?? (tone === 'danger' ? AlertTriangle : undefined);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={size} fitContent className="overflow-hidden">
      <DialogHeader
        title={title}
        description={description}
        icon={Icon}
        iconTone={tone === 'danger' ? 'danger' : tone === 'accent' ? 'accent' : 'default'}
        onClose={onClose}
      />
      {summary && summary.length > 0 ? <DialogSummary rows={summary} /> : null}
      {notice ? (
        <DialogBody className="py-2">
          <p className="rounded-lg border border-border/80 bg-card px-4 py-3 text-sm leading-relaxed text-muted">
            {notice}
          </p>
        </DialogBody>
      ) : null}
      <DialogFooter className="mt-3">
        <Button variant="outline" size="md" className="w-full sm:w-auto sm:min-w-[7rem]" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button
          variant={confirmVariant}
          size="md"
          className="w-full sm:w-auto sm:min-w-[7rem]"
          isLoading={isLoading}
          disabled={confirmDisabled}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </DialogFooter>
    </Modal>
  );
}

export interface FormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  cancelLabel?: string;
  submitLabel: string;
  onSubmit: () => void;
  isLoading?: boolean;
  submitDisabled?: boolean;
  submitVariant?: ButtonProps['variant'];
  size?: 'sm' | 'md' | 'dialog';
}

export function FormDialog({
  isOpen,
  onClose,
  title,
  description,
  icon,
  children,
  cancelLabel = 'Cancel',
  submitLabel,
  onSubmit,
  isLoading = false,
  submitDisabled = false,
  submitVariant = 'primary',
  size = 'dialog',
}: FormDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={size} fitContent className="overflow-hidden">
      <DialogHeader title={title} description={description} icon={icon} onClose={onClose} />
      <DialogBody className="space-y-4 pt-2">{children}</DialogBody>
      <DialogFooter className="mt-3">
        <Button variant="outline" size="md" className="w-full sm:w-auto sm:min-w-[7rem]" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button
          variant={submitVariant}
          size="md"
          className="w-full sm:w-auto sm:min-w-[7rem]"
          isLoading={isLoading}
          disabled={submitDisabled}
          onClick={onSubmit}
        >
          {submitLabel}
        </Button>
      </DialogFooter>
    </Modal>
  );
}
