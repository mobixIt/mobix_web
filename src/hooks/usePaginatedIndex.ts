'use client';

import * as React from 'react';
import type { AsyncThunk, AsyncThunkConfig } from '@reduxjs/toolkit';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';

type Status = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface PaginationMeta {
  page: number;
  per_page: number;
  count: number;
  pages: number;
  prev: number | null;
  next: number | null;
}

interface UsePaginatedIndexOptions<
  TItem,
  TParams,
  TPayload extends { items: TItem[]; pagination: PaginationMeta | null },
  TThunkApiConfig extends AsyncThunkConfig,
> {
  tenantSlug: string | null;

  /**
   * Thunk created with createAsyncThunk
   * Signature: ({ tenantSlug, params? })
   */
  fetchThunk: AsyncThunk<
    TPayload,
    { tenantSlug: string; params?: TParams },
    TThunkApiConfig
  >;

  selectItems: (state: RootState, tenantSlug: string) => TItem[];
  selectStatus: (state: RootState, tenantSlug: string) => Status;
  selectPagination: (
    state: RootState,
    tenantSlug: string,
  ) => PaginationMeta | null;

  defaultPageSize?: number;

  /**
   * Allows injecting filters, sort, etc.
   * If not provided, only page/size is sent.
   */
  buildParams?: (page: number, size: number) => TParams;
}

interface UsePaginatedIndexResult<TItem> {
  items: TItem[];
  status: Status;
  page: number;          // 0-based (MUI)
  rowsPerPage: number;
  totalCount: number;
  pagination: PaginationMeta | null;
  setPage: (page: number) => void;
  setRowsPerPage: (rowsPerPage: number) => void;
}

export function usePaginatedIndex<
  TItem,
  TParams = unknown,
  TPayload extends { items: TItem[]; pagination: PaginationMeta | null } = {
    items: TItem[];
    pagination: PaginationMeta | null;
  },
  TThunkApiConfig extends AsyncThunkConfig = AsyncThunkConfig,
>(
  options: UsePaginatedIndexOptions<
    TItem,
    TParams,
    TPayload,
    TThunkApiConfig
  >,
): UsePaginatedIndexResult<TItem> {
  const {
    tenantSlug,
    fetchThunk,
    selectItems,
    selectStatus,
    selectPagination,
    defaultPageSize = 10,
    buildParams,
  } = options;

  const dispatch = useAppDispatch();

  const [page, setPage] = React.useState(0); // MUI: 0-based
  const [rowsPerPage, setRowsPerPage] =
    React.useState(defaultPageSize);

  // Reset pagination when tenant changes
  React.useEffect(() => {
    setPage(0);
    setRowsPerPage(defaultPageSize);
  }, [tenantSlug, defaultPageSize]);

  const items = useAppSelector((state) =>
    tenantSlug ? selectItems(state, tenantSlug) : [],
  );

  const status = useAppSelector((state) =>
    tenantSlug ? selectStatus(state, tenantSlug) : 'idle',
  ) as Status;

  const pagination = useAppSelector((state) =>
    tenantSlug ? selectPagination(state, tenantSlug) : null,
  );

  const totalCount = pagination?.count ?? items.length;

  // Trigger fetch whenever page or size changes
  React.useEffect(() => {
    if (!tenantSlug) return;

    const params: TParams = buildParams
      ? buildParams(page, rowsPerPage)
      : ({
          page: {
            number: page + 1, // Pagy: 1-based
            size: rowsPerPage,
          },
        } as TParams);

    const thunkAction = fetchThunk({
      tenantSlug,
      params,
    });

    /**
     * NOTE:
     * - At runtime, our store is configured with thunk middleware,
     *   so dispatch can handle thunk functions (AsyncThunkAction).
     * - However, TypeScript's Dispatch type is often `Dispatch<UnknownAction>`,
     *   which only accepts plain actions.
     * - We narrow the dispatch type locally to "a function that accepts
     *   the specific thunkAction type", without using `any`.
     */
    void (dispatch as (action: typeof thunkAction) => unknown)(
      thunkAction,
    );
  }, [tenantSlug, page, rowsPerPage, buildParams, dispatch, fetchThunk]);

  return {
    items,
    status,
    page,
    rowsPerPage,
    totalCount,
    pagination,
    setPage,
    setRowsPerPage,
  };
}
