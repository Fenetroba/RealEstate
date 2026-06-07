'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { getPaginationPages } from '@/lib/pagination';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  startIndex?: number;
  endIndex?: number;
  hideWhenSinglePage?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  startIndex,
  endIndex,
  hideWhenSinglePage = true,
  className,
}: PaginationProps) {
  if (hideWhenSinglePage && totalPages <= 1) {
    return null;
  }

  const pages = getPaginationPages(currentPage, totalPages);
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const showSummary =
    totalItems !== undefined &&
    startIndex !== undefined &&
    endIndex !== undefined &&
    totalItems > 0;

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        'flex flex-col gap-4 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6',
        className,
      )}
    >
      {showSummary ? (
        <p className="text-sm text-muted">
          Showing{' '}
          <span className="font-medium text-foreground">
            {startIndex}–{endIndex}
          </span>{' '}
          of{' '}
          <span className="font-medium text-foreground">{totalItems}</span>
        </p>
      ) : (
        <span className="hidden sm:block" />
      )}

      <div className="flex items-center gap-1">
        <PaginationButton
          aria-label="Previous page"
          disabled={!canGoPrev}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="size-4" />
        </PaginationButton>

        {pages.map((page, index) =>
          page === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-sm text-muted"
              aria-hidden
            >
              …
            </span>
          ) : (
            <PaginationButton
              key={page}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
              active={page === currentPage}
              onClick={() => onPageChange(page)}
            >
              {page}
            </PaginationButton>
          ),
        )}

        <PaginationButton
          aria-label="Next page"
          disabled={!canGoNext}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight className="size-4" />
        </PaginationButton>
      </div>
    </nav>
  );
}

function PaginationButton({
  active = false,
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-lg text-sm font-semibold transition-colors',
        'disabled:pointer-events-none disabled:opacity-40',
        active
          ? 'bg-primary text-white dark:bg-accent dark:text-primary'
          : 'text-muted hover:bg-surface hover:text-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
