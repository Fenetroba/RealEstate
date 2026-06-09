'use client';

import { useEffect, useState } from 'react';

/** Initial and incremental batch size: two rows of cards */
const GRID_ROWS = 2;

function getColumnCount(width: number): number {
  if (width >= 1536) return 3;
  if (width >= 640) return 2;
  return 1;
}

function calculatePageSize(width: number): number {
  return getColumnCount(width) * GRID_ROWS;
}

/** Cards per "page" = 2 rows for the current breakpoint. */
export function usePropertyGridPageSize(): number {
  // Always start with a fixed number (e.g. 6) to match the server-side render.
  // We refine this value in useEffect after the component mounts on the client.
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    const update = () => {
      setPageSize(calculatePageSize(window.innerWidth));
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return pageSize;
}
