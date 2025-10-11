// Utilities to aggregate price history per day with unit/total averages
// Contract:
// - items: Array<{ name: string, price?: number, quantity?: string|number, priceHistory?: Array<{ ts: string, price: number, quantity?: number }>, purchasedAt?: string, updatedAt?: string, createdAt?: string }>
// - selectedName: lowercase item name key to aggregate
// Returns: Array<{ date: string (ISO), label: dd/mm, unitAvg: number, totalAvg: number, value: number }>

export function aggregatePriceHistory(items = [], selectedName) {
  if (!selectedName) return [];
  const bucket = new Map();
  const addSnapshot = (isoDate, unitPrice, qty) => {
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) return;
    const d = new Date(isoDate);
    if (isNaN(d)) return;
    const key = isoDate.slice(0, 10);
    const entry = bucket.get(key) || {
      unitSum: 0,
      unitCount: 0,
      totalSum: 0,
      totalCount: 0,
      date: d,
    };
    entry.unitSum += unitPrice;
    entry.unitCount += 1;
    const q = qty || 1;
    entry.totalSum += unitPrice * q;
    entry.totalCount += 1;
    bucket.set(key, entry);
  };
  items.forEach((it) => {
    const n = String(it.name || '')
      .trim()
      .toLowerCase();
    if (n !== selectedName) return;
    const qty = parseInt(it.quantity) || 1;
    if (Number(it.price) > 0)
      addSnapshot(
        it.purchasedAt || it.updatedAt || it.createdAt || new Date().toISOString(),
        Number(it.price),
        qty,
      );
    if (Array.isArray(it.priceHistory))
      it.priceHistory.forEach((ph) => addSnapshot(ph.ts, Number(ph.price), ph.quantity));
  });
  return Array.from(bucket.entries())
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .map(([, v]) => {
      const unitAvg = v.unitCount ? v.unitSum / v.unitCount : 0;
      const totalAvg = v.totalCount ? v.totalSum / v.totalCount : 0;
      const d = v.date;
      const label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      return {
        value: Number(unitAvg.toFixed(2)),
        unitAvg: Number(unitAvg.toFixed(2)),
        totalAvg: Number(totalAvg.toFixed(2)),
        label,
        date: d.toISOString(),
      };
    });
}

export function filterByRange(rows, range) {
  if (!rows || range === 'all' || !range) return rows || [];
  const now = Date.now();
  const ranges = { '7d': 7, '30d': 30, '6m': 30 * 6 };
  const days = ranges[range];
  if (!days) return rows;
  const cutoff = now - days * 24 * 60 * 60 * 1000;
  return rows.filter((r) => new Date(r.date).getTime() >= cutoff);
}
