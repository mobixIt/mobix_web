'use client';
import { IndexPageLayout } from '@/components/layout/index-page/IndexPageLayout';
import IndexPageSkeleton from '@/components/layout/index-page/IndexPageSkeleton';
import PageHeaderSection from '@/components/layout/page-header/PageHeaderSection';
import { ForbiddenPage } from '@/components/error-pages';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useAppSelector } from '@/store/hooks';
import { selectPermissionsReady } from '@/store/slices/permissionsSlice';

type BaseInsightsStrategyProps = {
  title?: string;
  subtitle?: string;
};

export default function BaseInsightsStrategy({
  title = 'Insights',
  subtitle = '',
}: BaseInsightsStrategyProps) {
  const permissionsReady = useAppSelector(selectPermissionsReady);
  const canReadInsights = useHasPermission('insights:read');

  if (!permissionsReady) {
    return <IndexPageSkeleton showStats={false} showFilters={false} />;
  }

  if (!canReadInsights) {
    return <ForbiddenPage />;
  }

  return (
    <IndexPageLayout
      header={
        <PageHeaderSection
          title={title}
          subtitle={subtitle}
          showActionButton={false}
          testId="insights-header"
        />
      }
      showAiAssistant={false}
    />
  );
}
