'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { propertyListingCardWidthClass } from '@/lib/constants/properties-browse';
import { cn } from '@/lib/utils';

interface HorizontalScrollRowProps {
  children: React.ReactNode;
  className?: string;
  itemClassName?: string;
}

/** Normalize wheel delta; only used for horizontal scrolling (never maps vertical wheel). */
function normalizeWheelDelta(raw: number, deltaMode: number): number {
  if (raw === 0) return 0;

  if (deltaMode === WheelEvent.DOM_DELTA_LINE) {
    return raw * 16;
  }

  if (deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return raw * window.innerHeight;
  }

  return raw;
}

/** Horizontal gesture only — vertical wheel passes through to the page. */
function horizontalWheelDelta(event: WheelEvent): number {
  if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
    return normalizeWheelDelta(event.deltaX, event.deltaMode);
  }

  if (event.shiftKey && event.deltaY !== 0) {
    return normalizeWheelDelta(event.deltaY, event.deltaMode);
  }

  return 0;
}

export function HorizontalScrollRow({
  children,
  className,
  itemClassName = propertyListingCardWidthClass,
}: HorizontalScrollRowProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false });
  const [isDragging, setIsDragging] = useState(false);

  const onWheel = useCallback((event: WheelEvent) => {
    const el = scrollerRef.current;
    if (!el) return;

    const delta = horizontalWheelDelta(event);
    if (delta === 0) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;

    const next = el.scrollLeft + delta;
    const atStart = el.scrollLeft <= 0 && delta < 0;
    const atEnd = el.scrollLeft >= maxScroll && delta > 0;

    if (atStart || atEnd) return;

    event.preventDefault();
    el.scrollLeft = next;
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;

    const el = scrollerRef.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;

    // Don't intercept clicks on native interactive elements
    const target = event.target as HTMLElement;
    if (target.closest('button, input, select, textarea')) return;

    // Record start position — don't preventDefault yet, that happens on first move > 4px
    dragRef.current = {
      active: true,
      startX: event.pageX,
      scrollLeft: el.scrollLeft,
      moved: false,
    };
    el.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;

    const el = scrollerRef.current;
    if (!el) return;

    const walk = event.pageX - dragRef.current.startX;

    if (!dragRef.current.moved && Math.abs(walk) > 4) {
      dragRef.current.moved = true;
      setIsDragging(true);
    }

    if (dragRef.current.moved) {
      event.preventDefault();
      el.scrollLeft = dragRef.current.scrollLeft - walk;
    }
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;

    dragRef.current.active = false;
    setIsDragging(false);

    const el = scrollerRef.current;
    if (el?.hasPointerCapture(event.pointerId)) {
      el.releasePointerCapture(event.pointerId);
    }
  };

  const handleClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    // Only block the click if we actually dragged (moved > 4px)
    if (dragRef.current.moved) {
      event.preventDefault();
      event.stopPropagation();
      dragRef.current.moved = false;
    }
  };

  return (
    <div
      ref={scrollerRef}
      className={cn(
        'flex w-full min-w-0 flex-nowrap gap-5 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-auto pb-2',
        'cursor-grab touch-auto [-webkit-overflow-scrolling:touch]',
        '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        isDragging && 'cursor-grabbing select-none',
        className,
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDragStart={(event) => event.preventDefault()}
      onClickCapture={handleClickCapture}
    >
      {React.Children.map(children, (child, index) => (
        <div key={index} className={itemClassName}>
          {child}
        </div>
      ))}
    </div>
  );
}
