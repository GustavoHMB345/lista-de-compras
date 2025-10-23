import { useMemo, useState } from 'react';

export function useListFilters(items = []) {
  const [query, setQuery] = useState('');
  const [showOnlyPending, setShowOnlyPending] = useState(false);
  const [showOnlyCompleted, setShowOnlyCompleted] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredItems = useMemo(() => {
    const src = Array.isArray(items) ? items : [];
    return src
      .filter((it) => {
        if (query && !String(it.name || '').toLowerCase().includes(query.toLowerCase())) return false;
        if (showOnlyPending && it.isPurchased) return false;
        if (showOnlyCompleted && !it.isPurchased) return false;
        if (categoryFilter !== 'all' && it.category !== categoryFilter) return false;
        return true;
      })
      .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
  }, [items, query, showOnlyPending, showOnlyCompleted, categoryFilter]);

  return {
    filteredItems,
    query,
    setQuery,
    showOnlyPending,
    setShowOnlyPending,
    showOnlyCompleted,
    setShowOnlyCompleted,
    categoryFilter,
    setCategoryFilter,
  };
}
