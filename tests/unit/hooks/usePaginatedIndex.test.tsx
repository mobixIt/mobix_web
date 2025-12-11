import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, act, waitFor } from '@testing-library/react';
import type { AsyncThunk, AsyncThunkConfig } from '@reduxjs/toolkit';

import {
  usePaginatedIndex,
  type PaginationMeta,
} from '@/hooks/usePaginatedIndex';
import type { RootState } from '@/store/store';

let mockDispatch: ReturnType<typeof vi.fn>;

vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: RootState) => unknown) =>
    selector({} as RootState),
}));

type Status = 'idle' | 'loading' | 'succeeded' | 'failed';

interface TestItem {
  id: number;
  name: string;
}

interface HookResult {
  items: TestItem[];
  status: Status;
  page: number;
  rowsPerPage: number;
  totalCount: number;
  pagination: PaginationMeta | null;
  setPage: (page: number) => void;
  setRowsPerPage: (rowsPerPage: number) => void;
}

type TestPayload = {
  items: TestItem[];
  pagination: PaginationMeta | null;
};

const fetchThunkMock = vi.fn(
  (arg: { tenantSlug: string; params?: unknown }) => ({
    type: 'test/fetch',
    meta: { arg },
  }),
);

const fetchThunk = fetchThunkMock as unknown as AsyncThunk<
  TestPayload,
  { tenantSlug: string; params?: unknown },
  AsyncThunkConfig
>;

interface TestComponentProps {
  options: Parameters<typeof usePaginatedIndex<TestItem>>[0];
  onRender: (result: HookResult) => void;
}

function TestComponent({ options, onRender }: TestComponentProps) {
  const result = usePaginatedIndex<TestItem>(options) as HookResult;
  React.useEffect(() => {
    onRender(result);
  }, [result, onRender]);
  return null;
}

function renderUsePaginatedIndex(
  options: Parameters<typeof usePaginatedIndex<TestItem>>[0],
) {
  let latestResult: HookResult | null = null;

  const handleRender = (result: HookResult) => {
    latestResult = result;
  };

  const { rerender } = render(
    <TestComponent options={options} onRender={handleRender} />,
  );

  return {
    getResult: () => latestResult,
    rerender: (
      newOptions: Parameters<typeof usePaginatedIndex<TestItem>>[0],
    ) => rerender(<TestComponent options={newOptions} onRender={handleRender} />),
  };
}

describe('usePaginatedIndex', () => {
  beforeEach(() => {
    mockDispatch = vi.fn();
    vi.clearAllMocks();
    fetchThunkMock.mockClear();
  });

  it('does not dispatch when tenantSlug is null and returns idle state with empty data', async () => {
    const options = {
      tenantSlug: null as string | null,
      fetchThunk,
      selectItems: () => [
        { id: 1, name: 'A' },
      ],
      selectStatus: () => 'succeeded' as const,
      selectPagination: () => ({
        page: 1,
        per_page: 10,
        count: 1,
        pages: 1,
        prev: null,
        next: null,
      }),
      defaultPageSize: 10,
    };

    const { getResult } = renderUsePaginatedIndex(options);

    await waitFor(() => {
      const res = getResult();
      expect(res).not.toBeNull();
    });

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(fetchThunkMock).not.toHaveBeenCalled();

    const result = getResult()!;
    expect(result.items).toEqual([]);
    expect(result.status).toBe('idle');
    expect(result.pagination).toBeNull();
    expect(result.totalCount).toBe(0);
    expect(result.page).toBe(0);
    expect(result.rowsPerPage).toBe(10);
  });

  it('dispatches fetchThunk on mount when tenantSlug is present using default params', async () => {
    const tenantSlug = 'tenant-1';

    const selectItems = vi.fn(
      (): TestItem[] => [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ],
    );

    const selectStatus = vi.fn(
      (): Status => 'succeeded',
    );

    const paginationMeta: PaginationMeta = {
      page: 1,
      per_page: 10,
      count: 100,
      pages: 10,
      prev: null,
      next: 2,
    };

    const selectPagination = vi.fn(
      (): PaginationMeta | null => paginationMeta,
    );

    const options = {
      tenantSlug,
      fetchThunk,
      selectItems,
      selectStatus,
      selectPagination,
      defaultPageSize: 10,
    };

    const { getResult } = renderUsePaginatedIndex(options);

    await waitFor(() => {
      expect(fetchThunkMock).toHaveBeenCalledTimes(1);
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);

    const thunkArg = fetchThunkMock.mock.calls[0][0];
    expect(thunkArg.tenantSlug).toBe(tenantSlug);
    expect(thunkArg.params).toEqual({
      page: {
        number: 1,
        size: 10,
      },
    });

    const dispatchedAction = mockDispatch.mock.calls[0][0];
    expect(dispatchedAction).toEqual({
      type: 'test/fetch',
      meta: { arg: thunkArg },
    });

    const result = getResult()!;
    expect(result.items).toHaveLength(2);
    expect(result.status).toBe('succeeded');
    expect(result.pagination).toEqual(paginationMeta);
    expect(result.totalCount).toBe(100);
    expect(result.page).toBe(0);
    expect(result.rowsPerPage).toBe(10);
  });

  it('uses buildParams when provided instead of default pagination payload', async () => {
    const tenantSlug = 'tenant-build-params';

    const selectItems = (): TestItem[] => [];
    const selectStatus = () => 'loading' as const;
    const selectPagination = () => null;

    const buildParams = vi.fn((page: number, size: number) => ({
      pageNumber: page,
      limit: size,
      extra: true,
    }));

    const options = {
      tenantSlug,
      fetchThunk,
      selectItems,
      selectStatus,
      selectPagination,
      defaultPageSize: 20,
      buildParams,
    };

    renderUsePaginatedIndex(options);

    await waitFor(() => {
      expect(fetchThunkMock).toHaveBeenCalledTimes(1);
    });

    expect(buildParams).toHaveBeenCalledWith(0, 20);

    const thunkArg = fetchThunkMock.mock.calls[0][0];
    expect(thunkArg.tenantSlug).toBe(tenantSlug);
    expect(thunkArg.params).toEqual({
      pageNumber: 0,
      limit: 20,
      extra: true,
    });
  });

  it('updates page and dispatches again with new page value (0-based to 1-based)', async () => {
    const tenantSlug = 'tenant-paging';

    const selectItems = (): TestItem[] => [];
    const selectStatus = () => 'idle' as const;
    const selectPagination = () => null;

    const options = {
      tenantSlug,
      fetchThunk,
      selectItems,
      selectStatus,
      selectPagination,
      defaultPageSize: 10,
    };

    const { getResult } = renderUsePaginatedIndex(options);

    await waitFor(() => {
      expect(fetchThunkMock).toHaveBeenCalledTimes(1);
    });

    const firstArg = fetchThunkMock.mock.calls[0][0];
    expect(firstArg.params).toEqual({
      page: { number: 1, size: 10 },
    });

    const firstResult = getResult()!;
    expect(firstResult.page).toBe(0);

    await act(async () => {
      getResult()!.setPage(2);
    });

    await waitFor(() => {
      expect(fetchThunkMock).toHaveBeenCalledTimes(2);
    });

    const secondArg = fetchThunkMock.mock.calls[1][0];
    expect(secondArg.params).toEqual({
      page: { number: 3, size: 10 },
    });

    const secondResult = getResult()!;
    expect(secondResult.page).toBe(2);
  });

  it('updates rowsPerPage and dispatches again with new size', async () => {
    const tenantSlug = 'tenant-rows';

    const selectItems = (): TestItem[] => [];
    const selectStatus = () => 'idle' as const;
    const selectPagination = () => null;

    const options = {
      tenantSlug,
      fetchThunk,
      selectItems,
      selectStatus,
      selectPagination,
      defaultPageSize: 5,
    };

    const { getResult } = renderUsePaginatedIndex(options);

    await waitFor(() => {
      expect(fetchThunkMock).toHaveBeenCalledTimes(1);
    });

    const initialArg = fetchThunkMock.mock.calls[0][0];
    expect(initialArg.params).toEqual({
      page: { number: 1, size: 5 },
    });

    const initialResult = getResult()!;
    expect(initialResult.rowsPerPage).toBe(5);

    await act(async () => {
      getResult()!.setRowsPerPage(25);
    });

    await waitFor(() => {
      expect(fetchThunkMock).toHaveBeenCalledTimes(2);
    });

    const secondArg = fetchThunkMock.mock.calls[1][0];
    expect(secondArg.params).toEqual({
      page: { number: 1, size: 25 },
    });

    const secondResult = getResult()!;
    expect(secondResult.rowsPerPage).toBe(25);
    expect(secondResult.page).toBe(0);
  });

  it('resets page and rowsPerPage when tenantSlug changes and dispatches with new tenant', async () => {
    const selectItems = (state: RootState, tenant: string): TestItem[] => {
      void state;
      void tenant;
      return [];
    };

    const selectStatus = (state: RootState, tenant: string) => {
      void state;
      void tenant;
      return 'idle' as const;
    };

    const selectPagination = (state: RootState, tenant: string) => {
      void state;
      void tenant;
      return null;
    };

    const optionsTenant1 = {
      tenantSlug: 'tenant-a',
      fetchThunk,
      selectItems,
      selectStatus,
      selectPagination,
      defaultPageSize: 10,
    };

    const { getResult, rerender } = renderUsePaginatedIndex(optionsTenant1);

    await waitFor(() => {
      expect(fetchThunkMock).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      getResult()!.setPage(3);
    });

    await waitFor(() => {
      expect(fetchThunkMock).toHaveBeenCalledTimes(2);
    });

    const optionsTenant2 = {
      tenantSlug: 'tenant-b',
      fetchThunk,
      selectItems,
      selectStatus,
      selectPagination,
      defaultPageSize: 20,
    };

    await act(async () => {
      rerender(optionsTenant2);
    });

    await waitFor(() => {
      expect(fetchThunkMock).toHaveBeenCalledTimes(4);
    });

    const lastCallIndex = fetchThunkMock.mock.calls.length - 1;
    const lastArg = fetchThunkMock.mock.calls[lastCallIndex][0];

    expect(lastArg.tenantSlug).toBe('tenant-b');
    expect(lastArg.params).toEqual({
      page: { number: 1, size: 20 },
    });

    const resultAfterChange = getResult()!;
    expect(resultAfterChange.page).toBe(0);
    expect(resultAfterChange.rowsPerPage).toBe(20);
  });

  it('uses pagination.count as totalCount when pagination is present', async () => {
    const tenantSlug = 'tenant-total-with-pagination';

    const selectItems = (): TestItem[] => [
      { id: 1, name: 'A' },
      { id: 2, name: 'B' },
    ];

    const selectStatus = () => 'succeeded' as const;

    const selectPagination = (): PaginationMeta => ({
      page: 2,
      per_page: 10,
      count: 42,
      pages: 5,
      prev: 1,
      next: 3,
    });

    const options = {
      tenantSlug,
      fetchThunk,
      selectItems,
      selectStatus,
      selectPagination,
      defaultPageSize: 10,
    };

    const { getResult } = renderUsePaginatedIndex(options);

    await waitFor(() => {
      expect(fetchThunkMock).toHaveBeenCalledTimes(1);
    });

    const result = getResult()!;
    expect(result.items).toHaveLength(2);
    expect(result.totalCount).toBe(42);
    expect(result.pagination?.count).toBe(42);
  });

  it('uses items.length as totalCount when pagination is null', async () => {
    const tenantSlug = 'tenant-total-without-pagination';

    const selectItems = (): TestItem[] => [
      { id: 1, name: 'A' },
      { id: 2, name: 'B' },
      { id: 3, name: 'C' },
    ];

    const selectStatus = () => 'succeeded' as const;

    const selectPagination = () => null;

    const options = {
      tenantSlug,
      fetchThunk,
      selectItems,
      selectStatus,
      selectPagination,
      defaultPageSize: 10,
    };

    const { getResult } = renderUsePaginatedIndex(options);

    await waitFor(() => {
      expect(fetchThunkMock).toHaveBeenCalledTimes(1);
    });

    const result = getResult()!;
    expect(result.items).toHaveLength(3);
    expect(result.pagination).toBeNull();
    expect(result.totalCount).toBe(3);
  });
});
