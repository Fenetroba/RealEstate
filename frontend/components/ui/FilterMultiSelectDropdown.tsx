'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface FilterDropdownOption {
  value: string;
  label: string;
}

interface FilterMultiSelectDropdownProps {
  label: string;
  options: FilterDropdownOption[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function FilterMultiSelectDropdown({
  label,
  options,
  values,
  onChange,
  placeholder = 'All types',
  className,
}: FilterMultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const selectedLabels = options
    .filter((option) => values.includes(option.value))
    .map((option) => option.label);

  const triggerLabel =
    selectedLabels.length === 0
      ? placeholder
      : selectedLabels.length <= 2
        ? selectedLabels.join(', ')
        : `${selectedLabels.length} selected`;

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

  const toggleValue = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((item) => item !== value));
      return;
    }
    onChange([...values, value]);
  };

  return (
    <div ref={rootRef} className={cn('relative flex flex-col gap-1.5', className)}>
      <span className="text-sm font-medium text-foreground">{label}</span>

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex h-11 w-full items-center justify-between gap-2 rounded-lg border bg-card px-4 text-left text-sm transition-all',
          'border-border hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          open && 'border-accent ring-2 ring-accent/20',
          values.length > 0 ? 'text-foreground' : 'text-muted',
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
          aria-multiselectable="true"
          className="absolute left-0 right-0 top-[calc(100%+0.375rem)] z-20 overflow-hidden rounded-xl border border-border bg-card"
        >
          <ul className="max-h-56 overflow-y-auto py-1">
            {options.map((option) => {
              const selected = values.includes(option.value);

              return (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => toggleValue(option.value)}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition-colors',
                      selected
                        ? 'bg-accent/10 text-foreground'
                        : 'text-muted hover:bg-surface hover:text-foreground',
                    )}
                  >
                    <span>{option.label}</span>
                    {selected && <Check className="size-4 shrink-0 text-accent" />}
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
