'use client';

import { type RefObject, useEffect, useState } from 'react';

const WIDE_LAYOUT_MEDIA = '(min-width: 1536px)';

function getColumnCount(width: number): number {
  if (width >= 1536) return 3;
  if (width >= 640) return 2;
  return 1;
}

/** Height of the first two rows of property cards (2xl+ only). */
export function usePropertyGridTwoRowHeight(
  gridRef: RefObject<HTMLElement | null>,
  itemCount: number,
): number | undefined {
  const [height, setHeight] = useState<number | undefined>();

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const media = window.matchMedia(WIDE_LAYOUT_MEDIA);

    const measure = () => {
      if (!media.matches || itemCount === 0) {
        setHeight(undefined);
        return;
      }

      const cells = Array.from(grid.children) as HTMLElement[];
      if (cells.length === 0) {
        setHeight(undefined);
        return;
      }

      const cols = getColumnCount(window.innerWidth);
      const rowCells = Math.min(cells.length, cols * 2);
      let top = Infinity;
      let bottom = -Infinity;

      for (let i = 0; i < rowCells; i++) {
        const rect = cells[i].getBoundingClientRect();
        top = Math.min(top, rect.top);
        bottom = Math.max(bottom, rect.bottom);
      }

      if (!Number.isFinite(top) || !Number.isFinite(bottom)) {
        setHeight(undefined);
        return;
      }

      setHeight(Math.ceil(bottom - top));
    };

    const observer = new ResizeObserver(measure);

    const observeTargets = () => {
      observer.disconnect();
      observer.observe(grid);
      for (const child of grid.children) {
        observer.observe(child);
      }
      measure();
    };

    observeTargets();
    media.addEventListener('change', observeTargets);
    window.addEventListener('resize', observeTargets);

    const mutation = new MutationObserver(observeTargets);
    mutation.observe(grid, { childList: true });

    return () => {
      observer.disconnect();
      mutation.disconnect();
      media.removeEventListener('change', observeTargets);
      window.removeEventListener('resize', observeTargets);
    };
  }, [gridRef, itemCount]);

  return height;
}
