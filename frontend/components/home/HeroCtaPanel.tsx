'use client';

import { ArrowRight, FilePlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface HeroCtaPanelProps {
  className?: string;
}

export function HeroCtaPanel({ className }: HeroCtaPanelProps) {
  const router = useRouter();

  return (
    <div className={cn('flex flex-wrap gap-4', className)}>
      <Button
        variant="primary"
        size="lg"
        rightIcon={<ArrowRight className="size-5" />}
        onClick={() => router.push('/properties')}
      >
        Browse listings
      </Button>
      <Button
        variant="onDarkGhost"
        size="lg"
        leftIcon={<FilePlus className="size-5" />}
        onClick={() => router.push('/dashboard/listings/create')}
      >
        Submit registration
      </Button>
    </div>
  );
}
