import { describe, expect, it } from 'vitest';
import { formatCurrency, formatDate } from './format';

describe('format helpers', () => {
  it('formats Philippine peso values', () => {
    expect(formatCurrency(1250)).toContain('1,250.00');
    expect(formatCurrency(1250)).toContain('₱');
  });

  it('formats a stable calendar date', () => {
    expect(formatDate('2026-09-04T00:00:00.000Z')).toMatch(/Sep 4, 2026|4 Sep 2026/);
  });
});
