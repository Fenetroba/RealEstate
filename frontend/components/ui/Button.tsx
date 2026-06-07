'use client';

import React from 'react';
import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

import { buttonBaseClass, buttonFocusClass } from '@/lib/constants/button-styles';
import { cn } from '@/lib/utils';

const buttonVariants = cva(buttonBaseClass, {
  variants: {
    variant: {
      /** Main action — gold fill, navy label */
      primary:
        'border border-transparent bg-accent text-primary hover:bg-accent-light active:bg-accent-light',
      /** Strong secondary — navy fill */
      secondary:
        'border border-transparent bg-primary text-white hover:bg-primary-light active:bg-primary-light dark:border-border dark:bg-card dark:text-foreground dark:hover:bg-surface',
      /** Default secondary on light backgrounds */
      outline:
        'border border-border bg-background text-foreground hover:bg-surface active:bg-surface',
      /** Low emphasis */
      ghost:
        'border border-transparent bg-transparent text-foreground hover:bg-surface active:bg-surface',
      /** Primary on dark / hero imagery */
      onDark:
        'border border-transparent bg-white text-primary hover:bg-white/90 active:bg-white/90',
      /** Secondary on dark / navy panels */
      onDarkOutline:
        'border border-white/35 bg-transparent text-white hover:border-white/55 hover:bg-white/10 active:bg-white/10',
      /** Tertiary on dark (replaces glass) */
      onDarkGhost:
        'border border-transparent bg-white/10 text-white hover:bg-white/15 active:bg-white/15',
      danger:
        'border border-transparent bg-destructive text-white hover:opacity-90 active:opacity-90',
      success:
        'border border-transparent bg-success text-white hover:opacity-90 active:opacity-90',
      /** @deprecated Use `onDark`. Kept for existing imports. */
      light: 'border border-transparent bg-white text-primary hover:bg-white/90 active:bg-white/90',
      /** @deprecated Use `onDarkGhost`. */
      glass:
        'border border-white/25 bg-white/10 text-white hover:bg-white/15 active:bg-white/15',
      /** @deprecated Use `outline`. */
      accentOutline:
        'border border-accent bg-transparent text-accent hover:bg-accent/10 active:bg-accent/10',
    },
    size: {
      sm: 'h-9 px-3.5 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-11 px-5 text-[0.9375rem]',
      xl: 'h-12 px-6 text-base',
      icon: 'size-10 shrink-0 p-0',
      'icon-sm': 'size-9 shrink-0 p-0',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  href?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      href,
      ...props
    },
    ref,
  ) => {
    const classes = cn(buttonVariants({ variant, size }), className);

    const content = (
      <>
        {isLoading ? <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden /> : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </>
    );

    if (href && !disabled) {
      return (
        <Link href={href} className={classes}>
          {content}
        </Link>
      );
    }

    return (
      <button ref={ref} className={classes} disabled={disabled || isLoading} {...props}>
        {content}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants, buttonFocusClass };
export type { ButtonProps };
