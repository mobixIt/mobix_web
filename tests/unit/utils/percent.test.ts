import { describe, it, expect } from 'vitest';
import { formatPercent, formatPercentOfTotal } from '@/utils/formatters/percent';

describe('percent formatting utilities', () => {
  it('formats numeric value with exactly one decimal and percent sign', () => {
    expect(formatPercent(70)).toBe('70.0%');
  });

  it('formats numeric value with one decimal and total suffix', () => {
    expect(formatPercentOfTotal(33.333)).toBe('33.3% del total');
  });

  it('uses standard rounding rules from toFixed(1)', () => {
    expect(formatPercent(3.349)).toBe('3.3%');
    expect(formatPercent(3.35)).toBe('3.4%');
  });
});
