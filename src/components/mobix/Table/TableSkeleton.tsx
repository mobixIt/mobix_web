'use client';

import * as React from 'react';
import { TABLE_SKELETON_DEFAULTS } from './TableSkeleton.constants';
import type { TableSkeletonProps } from './TableSkeleton.types';
import {
  Root,
  Header,
  Action,
  TableWrap,
  Table,
  HeadCell,
  Cell,
  RowLeft,
  SkeletonLine,
  SkeletonCircle,
  SkeletonButton,
} from './TableSkeleton.styled';

export function TableSkeleton({
  rows = TABLE_SKELETON_DEFAULTS.rows,
  columns = TABLE_SKELETON_DEFAULTS.columns,
}: TableSkeletonProps) {
  const headCells = Array.from({ length: columns }, (_, i) => i);
  const bodyRows = Array.from({ length: rows }, (_, i) => i);

  return (
    <Root data-testid="driver-assignments-skeleton">
      <Header>
        <Action aria-hidden="true" />
      </Header>

      <TableWrap>
        <Table>
          <thead>
            <tr>
              {headCells.map((i) => (
                <HeadCell key={`head-${i}`}>
                  <SkeletonLine sx={{ width: i === 0 ? 96 : i === 2 ? 112 : 80, height: 16 }} />
                </HeadCell>
              ))}
            </tr>
          </thead>
          <tbody>
            {bodyRows.map((r) => (
              <tr key={`row-${r}`}>
                <Cell>
                  <RowLeft>
                    <SkeletonCircle />
                    <SkeletonLine sx={{ width: 128 }} />
                  </RowLeft>
                </Cell>
                <Cell>
                  <SkeletonLine sx={{ width: 96 }} />
                </Cell>
                <Cell>
                  <SkeletonLine sx={{ width: 144 }} />
                </Cell>
                <Cell>
                  <SkeletonLine sx={{ width: 80 }} />
                </Cell>
                <Cell>
                  <SkeletonButton />
                </Cell>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>
    </Root>
  );
}

export default TableSkeleton;