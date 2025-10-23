import { useMemo, useState } from 'react';
import { aggregatePriceHistory, filterByRange } from '../utils/prices';

export function usePriceHistory(items = []) {
  const [selectedPriceItem, setSelectedPriceItem] = useState('');
  const [historyRange] = useState('all'); // all | 7d | 30d | 6m

  const availablePriceItems = useMemo(() => {
    const set = new Set();
    const collect = (arr = []) => {
      arr.forEach((it) => {
        const n = String(it.name || '').trim().toLowerCase();
        if (n) set.add(n);
        if (Array.isArray(it.priceHistory)) it.priceHistory.forEach(() => n && set.add(n));
      });
    };
    collect(items || []);
    return Array.from(set).filter(Boolean).sort();
  }, [items]);

  const effectiveSelectedItem = selectedPriceItem || availablePriceItems[0] || '';

  const basePriceRows = useMemo(() => {
    if (!effectiveSelectedItem) return [];
    return aggregatePriceHistory(items || [], effectiveSelectedItem);
  }, [items, effectiveSelectedItem]);

  const priceData = useMemo(() => filterByRange(basePriceRows, historyRange), [basePriceRows, historyRange]);

  const priceTrend = useMemo(() => {
    if (priceData.length < 2) return null;
    const last = priceData[priceData.length - 1].value;
    const prev = priceData[priceData.length - 2].value;
    if (prev === 0) return null;
    const diff = last - prev;
    const pct = (diff / prev) * 100;
    return { diff, pct, up: diff > 0 };
  }, [priceData]);

  return {
    historyRange,
    availablePriceItems,
    selectedPriceItem: effectiveSelectedItem,
    setSelectedPriceItem,
    priceData,
    priceTrend,
  };
}
