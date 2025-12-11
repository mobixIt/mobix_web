import { describe, it, expect, vi, afterEach } from 'vitest';
import { buildColumnVisibilityStorageKey } from '@/utils/columnVisibilityStorage';

const COLUMN_VISIBILITY_TTL_MS = 24 * 60 * 60 * 1000;

describe('buildColumnVisibilityStorageKey', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('builds a fully scoped key when all params are provided', () => {
    const key = buildColumnVisibilityStorageKey({
      tableId: 'vehicles',
      tenantSlug: 'sobusa',
      userId: 123,
      allowedAttributes: ['plate', 'model_year', 'status'],
    });

    expect(key).toContain('mobix-columns');
    expect(key).toContain('vehicles');
    expect(key).toContain('t=sobusa');
    expect(key).toContain('u=123');
    expect(key).toContain('a=model_year_plate_status');
    expect(key).toMatch(/b=\d+$/);
  });

  it('uses safe defaults when tableId, tenantSlug or userId are missing', () => {
    const key = buildColumnVisibilityStorageKey({
      tableId: '',
      tenantSlug: null,
      userId: null,
      allowedAttributes: null,
    });

    expect(key).toContain('unknown-table');
    expect(key).toContain('t=no-tenant');
    expect(key).toContain('u=anonymous');
    expect(key).toContain('a=all');
  });

  it('uses "all" when allowedAttributes is null', () => {
    const key = buildColumnVisibilityStorageKey({
      tableId: 'vehicles',
      tenantSlug: 'sobusa',
      userId: 1,
      allowedAttributes: null,
    });

    expect(key).toContain('a=all');
  });

  it('uses "all" when allowedAttributes is an empty array', () => {
    const key = buildColumnVisibilityStorageKey({
      tableId: 'vehicles',
      tenantSlug: 'sobusa',
      userId: 1,
      allowedAttributes: [],
    });

    expect(key).toContain('a=all');
  });

  it('handles undefined allowedAttributes without throwing and treats it as "all"', () => {
    const buildWithUndefined = () =>
      buildColumnVisibilityStorageKey({
        tableId: 'vehicles',
        tenantSlug: 'sobusa',
        userId: 1,
        allowedAttributes: undefined as unknown as string[],
      });

    expect(buildWithUndefined).not.toThrow();

    const key = buildWithUndefined();
    expect(key).toContain('a=all');
  });

  it('sorts allowedAttributes so that order does not affect the key', () => {
    const params = {
      tableId: 'vehicles',
      tenantSlug: 'sobusa',
      userId: 1,
      allowedAttributes: ['status', 'plate', 'model_year'],
    };

    const key1 = buildColumnVisibilityStorageKey(params);

    const shuffledParams = {
      ...params,
      allowedAttributes: ['model_year', 'status', 'plate'],
    };

    const key2 = buildColumnVisibilityStorageKey(shuffledParams);

    expect(key1).toEqual(key2);
    expect(key1).toContain('a=model_year_plate_status');
  });

  it('generates different buckets when time jumps beyond the TTL', () => {
    const baseTime = 1_700_000_000_000;
    const nowSpy = vi.spyOn(Date, 'now');

    nowSpy.mockReturnValue(baseTime);
    const key1 = buildColumnVisibilityStorageKey({
      tableId: 'vehicles',
      tenantSlug: 'sobusa',
      userId: 1,
      allowedAttributes: ['plate'],
    });

    nowSpy.mockReturnValue(baseTime + COLUMN_VISIBILITY_TTL_MS + 1);
    const key2 = buildColumnVisibilityStorageKey({
      tableId: 'vehicles',
      tenantSlug: 'sobusa',
      userId: 1,
      allowedAttributes: ['plate'],
    });

    const bucket1 = key1.match(/b=(\d+)$/)?.[1];
    const bucket2 = key2.match(/b=(\d+)$/)?.[1];

    expect(bucket1).toBeDefined();
    expect(bucket2).toBeDefined();
    expect(bucket1).not.toEqual(bucket2);
  });

  it('keeps the same bucket for calls within the same TTL window', () => {
    const baseTime = 1_700_000_000_000;
    const nowSpy = vi.spyOn(Date, 'now');

    nowSpy.mockReturnValue(baseTime);
    const key1 = buildColumnVisibilityStorageKey({
      tableId: 'vehicles',
      tenantSlug: 'sobusa',
      userId: 1,
      allowedAttributes: ['plate'],
    });

    nowSpy.mockReturnValue(baseTime + 60 * 60 * 1000);
    const key2 = buildColumnVisibilityStorageKey({
      tableId: 'vehicles',
      tenantSlug: 'sobusa',
      userId: 1,
      allowedAttributes: ['plate'],
    });

    const bucket1 = key1.match(/b=(\d+)$/)?.[1];
    const bucket2 = key2.match(/b=(\d+)$/)?.[1];

    expect(bucket1).toEqual(bucket2);
  });

  it('always prefixes the key with "mobix-columns"', () => {
    const key = buildColumnVisibilityStorageKey({
      tableId: 'vehicles',
      tenantSlug: 'sobusa',
      userId: 1,
      allowedAttributes: ['plate'],
    });

    expect(key.startsWith('mobix-columns:')).toBe(true);
  });

  it('produces a stable key for the same inputs within the same bucket', () => {
    const baseTime = 1_700_000_000_000;
    vi.spyOn(Date, 'now').mockReturnValue(baseTime);

    const params = {
      tableId: 'vehicles',
      tenantSlug: 'sobusa',
      userId: 1,
      allowedAttributes: ['status', 'plate'],
    };

    const key1 = buildColumnVisibilityStorageKey(params);
    const key2 = buildColumnVisibilityStorageKey(params);

    expect(key1).toEqual(key2);
  });
});
