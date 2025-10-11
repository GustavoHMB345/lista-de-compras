import { aggregatePriceHistory, filterByRange } from '../src/utils/prices';

describe('prices utils', () => {
  const baseDate = new Date('2024-01-10T10:00:00.000Z');
  const iso = (d) => new Date(d).toISOString();

  const items = [
    {
      id: '1',
      name: 'Arroz',
      quantity: '2',
      price: 10,
      createdAt: iso(baseDate),
      priceHistory: [
        { id: 'h1', ts: iso('2024-01-08T12:00:00.000Z'), price: 9, quantity: 1 },
        { id: 'h2', ts: iso('2024-01-10T09:00:00.000Z'), price: 10, quantity: 2 },
      ],
    },
    {
      id: '2',
      name: 'arroz',
      quantity: '1',
      price: 12,
      createdAt: iso('2024-01-12T10:00:00.000Z'),
      priceHistory: [{ id: 'h3', ts: iso('2024-01-12T08:00:00.000Z'), price: 12, quantity: 1 }],
    },
    {
      id: '3',
      name: 'Feijao',
      quantity: '1',
      price: 7,
      createdAt: iso('2024-01-12T10:00:00.000Z'),
    },
  ];

  it('aggregates by day with unit and total averages', () => {
    const rows = aggregatePriceHistory(items, 'arroz');
    // dates: 2024-01-08, 2024-01-10, 2024-01-12
    expect(rows.length).toBe(3);
    const d8 = rows.find((r) => r.date.startsWith('2024-01-08'));
    const d10 = rows.find((r) => r.date.startsWith('2024-01-10'));
    const d12 = rows.find((r) => r.date.startsWith('2024-01-12'));

    expect(d8.unitAvg).toBeCloseTo(9, 2);
    expect(d8.totalAvg).toBeCloseTo(9 * 1, 2);

    // day 10 has two entries: priceHistory(10 with q=2) and current price 10 with q=2
    expect(d10.unitAvg).toBeCloseTo(10, 2);
    expect(d10.totalAvg).toBeCloseTo(10 * 2, 2);

    // day 12 has price 12 (two sources: history and current) both 12 with q=1 -> averages remain 12 and total 12
    expect(d12.unitAvg).toBeCloseTo(12, 2);
    expect(d12.totalAvg).toBeCloseTo(12 * 1, 2);
  });

  it('filters by range', () => {
    const rows = aggregatePriceHistory(items, 'arroz');
    const all = filterByRange(rows, 'all');
    expect(all.length).toBe(3);

    // Mock Date.now to a fixed point for deterministic test
    const realNow = Date.now;
    Date.now = () => new Date('2024-01-13T00:00:00.000Z').getTime();
    try {
      const last7 = filterByRange(rows, '7d');
      // from 13th, 7 days covers 7th-13th inclusive -> still includes all 3
      expect(last7.length).toBe(3);

      const last30 = filterByRange(rows, '30d');
      expect(last30.length).toBe(3);

      const sixM = filterByRange(rows, '6m');
      expect(sixM.length).toBe(3);
    } finally {
      Date.now = realNow;
    }
  });
});
