'use client';

import * as React from 'react';

import {
  IndexPageRoot,
  HeaderSection,
  CardsSection,
  FiltersSection,
  TableSection,
} from './IndexPageLayout.styled';

export type IndexPageLayoutProps = {
  header?: React.ReactNode;
  statsCards?: React.ReactNode;
  filters?: React.ReactNode;
  table?: React.ReactNode;
};

export function IndexPageLayout({
  header,
  statsCards,
  filters,
  table,
}: IndexPageLayoutProps) {
  return (
      <IndexPageRoot data-testid="index-page-layout">
        {header && <HeaderSection data-testid="index-page-header">{header}</HeaderSection>}

        {statsCards && (
          <CardsSection data-testid="index-page-cards">{statsCards}</CardsSection>
        )}

        {filters && (
          <FiltersSection elevation={0} data-testid="index-page-filters">
            {filters}
          </FiltersSection>
        )}

        {table && (
          <TableSection elevation={0} data-testid="index-page-table">
            {table}
          </TableSection>
        )}
      </IndexPageRoot>
  );
}

export default IndexPageLayout;