'use client';

import { Search, X } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

export interface DashboardSearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onClear?: () => void;
  placeholder?: string;
  name?: string;
  'aria-label'?: string;
  inputContainerClassName?: string;
  className?: string;
}

export function DashboardSearchField({
  value,
  onChange,
  onSearch,
  onClear,
  placeholder = 'Search…',
  name = 'dashboard-search',
  'aria-label': ariaLabel = 'Search',
  inputContainerClassName = 'min-w-[12rem] flex-1',
  className,
}: DashboardSearchFieldProps) {
  const handleClear = () => {
    onChange('');
    onClear?.();
  };

  return (
    <>
      <Input
        type="text"
        inputMode="search"
        autoComplete="off"
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onSearch();
          }
        }}
        rightIcon={
          value ? (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-md p-0.5 text-muted transition-colors hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          ) : undefined
        }
        containerClassName={inputContainerClassName}
        className="h-11"
        aria-label={ariaLabel}
      />
      <Button
        type="button"
        variant="primary"
        size="lg"
        className={cn('h-11 shrink-0', className)}
        leftIcon={<Search className="size-4" aria-hidden />}
        onClick={onSearch}
      >
        Search
      </Button>
    </>
  );
}
