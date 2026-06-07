'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'dialog' | 'lg' | 'xl' | 'full';
  /** When true, content is not clamped to a scrollable max-height (use for Confirm/Form dialogs). */
  fitContent?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  dialog: 'max-w-xl sm:max-w-2xl',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-7xl',
};

/** Above site navbar (z-50) and mobile drawer */
const MODAL_Z = 'z-[120]';

function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  fitContent = false,
  className,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;

  const hasLegacyHeader = Boolean(title || description);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className={cn(
            MODAL_Z,
            'fixed inset-0 flex items-center justify-center overflow-y-auto',
            'p-4 sm:p-6',
            'pt-[max(1rem,calc(var(--site-nav-header-height,5rem)+0.75rem))]',
            'pb-[max(1rem,env(safe-area-inset-bottom))]',
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={hasLegacyHeader ? 'modal-title' : undefined}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={cn(
              'relative z-10 my-auto w-full shrink-0',
              'rounded-2xl bg-card text-card-foreground shadow-2xl',
              sizeClasses[size],
              className,
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {hasLegacyHeader && (
              <div className="flex items-start justify-between gap-4 border-b border-border px-6 pb-5 pt-6">
                <div className="min-w-0 flex-1">
                  {title && (
                    <h2
                      id="modal-title"
                      className="font-heading text-lg font-semibold leading-snug text-foreground"
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="shrink-0 rounded-lg p-2 text-muted transition-colors hover:bg-surface hover:text-foreground"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            <div
              className={cn(
                fitContent
                  ? 'overflow-visible'
                  : 'max-h-[min(70vh,calc(100dvh-var(--site-nav-header-height,5rem)-4rem))] overflow-y-auto',
              )}
            >
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export { Modal };
