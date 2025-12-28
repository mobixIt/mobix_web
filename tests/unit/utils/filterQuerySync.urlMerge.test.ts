import { describe, it, expect } from 'vitest';

import { filtersToQueryString, filtersFromQueryString } from '@/utils/filterQuerySync';

describe('filterQuerySync URL handling', () => {
  it('serializes stringArray from comma separated string', () => {
    const query = filtersToQueryString(
      { status: 'active, inactive , ,draft' },
      { status: { type: 'stringArray' } },
    );
    expect(query).toBe('status=active%2Cinactive%2Cdraft');
  });

  it('rehydrates stringArray into array preserving order', () => {
    const values = filtersFromQueryString(
      '?status=active,inactive,draft',
      { status: { type: 'stringArray' } },
    );
    expect(values).toEqual({ status: ['active', 'inactive', 'draft'] });
  });
});
