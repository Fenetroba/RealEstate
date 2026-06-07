'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface FilterSelectOption {
  value: string;
  label: string;
}

interface FilterSelectDropdownProps {
  options: FilterSelectOption[];
  value: string;
  onChange: (value: string) => void;
  /** Visible label above trigger; omit for icon-only layouts */
  label?: string;
  placeholder?: string;
  className?: string;
  'aria-label'?: string;
}

export function FilterSelectDropdown({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select…',
  className,
  'aria-label': ariaLabel,
}: FilterSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const selected = options.find((o) => o.value === value);
  const triggerLabel = selected?.label ?? placeholder;

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div ref={rootRef} className={cn('relative flex flex-col gap-1.5', className)}>
      {label ? (
        <span className="text-sm font-medium text-foreground">{label}</span>
      ) : null}

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel ?? label}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex h-11 w-full items-center justify-between gap-2 rounded-lg border bg-card px-4 text-left text-sm transition-all',
          'border-border text-foreground hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          open && 'border-accent ring-2 ring-accent/20',
        )}
      >
        <span className="truncate">{triggerLabel}</span>
        <ChevronDown
          className={cn('size-4 shrink-0 text-muted transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.375rem)] z-20 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
        >
          <ul className="max-h-56 overflow-y-auto py-1">
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition-colors',
                      isSelected
                        ? 'bg-accent/10 font-medium text-foreground'
                        : 'text-muted hover:bg-surface hover:text-foreground',
                    )}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check className="size-4 shrink-0 text-accent" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
