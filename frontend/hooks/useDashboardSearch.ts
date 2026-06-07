'use client';

import { useCallback, useState } from 'react';

export function useDashboardSearch(initialApplied = '') {
  const [queryInput, setQueryInput] = useState(initialApplied);
  const [appliedQuery, setAppliedQuery] = useState(initialApplied);

  const runSearch = useCallback(() => {
    setAppliedQuery(queryInput.trim());
  }, [queryInput]);

  const clearSearch = useCallback(() => {
    setQueryInput('');
    setAppliedQuery('');
  }, []);

  /** Set both draft and applied query (e.g. “find this user” from a table action). */
  const applyQuery = useCallback((query: string) => {
    const trimmed = query.trim();
    setQueryInput(trimmed);
    setAppliedQuery(trimmed);
  }, []);

  return {
    queryInput,
    appliedQuery,
    setQueryInput,
    setAppliedQuery,
    runSearch,
    clearSearch,
    applyQuery,
  };
}
