import type { IndexPageControlToolbarLabels } from './IndexPageControlToolbar.types';

export const DEFAULT_LABELS: Required<Pick<
  IndexPageControlToolbarLabels,
  'stats' | 'filters' | 'totalSuffix' | 'activeFiltersText'
>> = {
  stats: 'Estadísticas',
  filters: 'Filtros',
  totalSuffix: 'en total',
  activeFiltersText: (count: number) =>
    `${count} filtro${count === 1 ? '' : 's'} activo${count === 1 ? '' : 's'}`,
};
