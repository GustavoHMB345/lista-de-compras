import { describe, expect, it } from '@jest/globals';

// Simple formatter/helper example: currency format
const formatCurrency = (value) => `R$ ${Number(value || 0).toFixed(2)}`;

describe('formatCurrency', () => {
  it('formats numbers to BRL style', () => {
    expect(formatCurrency(12)).toBe('R$ 12.00');
    expect(formatCurrency(12.3)).toBe('R$ 12.30');
  });
});
