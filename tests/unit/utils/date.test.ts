import { describe, it, expect } from 'vitest';
import { getDateKey } from '@/utils/date';

describe('getDateKey', () => {
  it('formats a date into YYYY-MM-DD', () => {
    const date = new Date(2025, 10, 15);
    const result = getDateKey(date);
    expect(result).toBe('2025-11-15');
  });

  it('pads month and day with zeros when needed', () => {
    const date = new Date(2025, 0, 5);
    const result = getDateKey(date);
    expect(result).toBe('2025-01-05');
  });

  it('pads only the month when the day has 2 digits', () => {
    const date = new Date(2025, 0, 12);
    const result = getDateKey(date);
    expect(result).toBe('2025-01-12');
  });

  it('pads only the day when the month has 2 digits', () => {
    const date = new Date(2025, 9, 3);
    const result = getDateKey(date);
    expect(result).toBe('2025-10-03');
  });

  it('handles a date at the end of the year correctly', () => {
    const date = new Date(2025, 11, 31);
    const result = getDateKey(date);
    expect(result).toBe('2025-12-31');
  });

  it('returns a string type', () => {
    const date = new Date(2025, 3, 9);
    const result = getDateKey(date);
    expect(typeof result).toBe('string');
  });
});
