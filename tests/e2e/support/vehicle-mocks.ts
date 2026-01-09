import { type Page, type Route } from '@playwright/test';
import { isDataRequest, VehicleApiPaths, getPathname } from './api-utils';
import type { VehiclesStatsResponse } from '@/services/vehiclesStatsService';

export interface CapturedRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
}

export interface AppliedFilters {
  brand_id?: string;
  vehicle_class_id?: string;
  status?: string;
  capacity_total_gt?: string;
}

export interface MockVehicleIndexResponse {
  data: unknown[];
  meta: {
    pagination: {
      page: number;
      per_page: number;
      count: number;
      pages: number;
      prev: number | null;
      next: number | null;
    };
    ai: boolean;
    applied_filters: AppliedFilters;
    ai_search?: {
      question: string;
      match_count: number;
      strategy?: string;
    };
  };
}

export function buildStatsResponse(overrides?: Partial<VehiclesStatsResponse['data']>): VehiclesStatsResponse {
  return {
    data: {
      total: 10,
      active: 7,
      inactive: 3,
      new_this_month: 2,
      total_prev_month: 8,
      delta_total_vs_prev_month: 2,
      delta_total_pct_vs_prev_month: 25.1,
      active_pct_of_total: 70.0,
      inactive_pct_of_total: 30.0,
      new_prev_month: 1,
      delta_new_vs_prev_month: 1,
      ...overrides,
    },
    meta: {
      as_of: '2026-01-31T23:59:59-05:00',
      timezone: 'America/Bogota',
      computed_at: '2026-02-01T00:00:00-05:00',
      warnings: [],
    },
  };
}

export async function mockVehiclesStats(page: Page, handler: (route: Route) => Promise<void>): Promise<void> {
  await page.route('**/*', async (route) => {
    const url = route.request().url();
    if (isDataRequest(route) && VehicleApiPaths.stats.test(getPathname(url))) {
      await handler(route);
    } else {
      await route.fallback();
    }
  });
}

export async function mockVehiclesCatalogs(page: Page): Promise<void> {
  await page.route(VehicleApiPaths.catalogs, async (route) => {
    if (route.request().method() !== 'POST') return route.fallback();
    
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          brands: [
            { id: 3, label: 'Hino', code: 'HINO' },
            { id: 10, label: 'Chevrolet', code: 'CHEV' }
          ],
          vehicle_classes: [{ id: 2, label: 'Buseta', code: 'BUSETA' }],
          body_types: [{ id: 30, label: 'Camioneta', code: 'CAM' }],
          owners: [
            { id: 201, label: 'Ana Rodríguez', code: 'ANA' },
            { id: 202, label: 'Carlos Perez', code: 'CAR' },
          ],
          drivers: [{ id: 301, label: 'Juan Conductor', code: 'JC' }],
          statuses: [ { id: 'active', label: 'Activo' } ]
        },
      }),
    });
  });
}

export async function mockVehiclesIndexOk(page: Page): Promise<void> {
  await page.route('**/*', async (route: Route) => {
    const url = route.request().url();
    const path = getPathname(url);

    if (isDataRequest(route) && VehicleApiPaths.index.test(path) && !path.endsWith('/stats')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], meta: { count: 0 } }),
      });
    } else {
      await route.fallback();
    }
  });
}

export async function mockVehiclesIndexWithSink(
  page: Page, 
  sink: (req: CapturedRequest) => void
): Promise<void> {
  await page.route('**/*', async (route) => {
    const req = route.request();
    const url = req.url();
    const path = getPathname(url);

    if (!isDataRequest(route) || !VehicleApiPaths.index.test(path)) return route.fallback();

    sink({ url, method: req.method(), headers: req.headers() });

    const params = new URL(url).searchParams;
    const aiQuestion = params.get('ai_question')?.toLowerCase() || '';

    const hasParam = (key: string, value: string): boolean => 
      params.get(key) === value || params.get(`filters[${key}]`) === value;

    const applied_filters: AppliedFilters = {};

    if (
      aiQuestion.includes('hino') || 
      aiQuestion.includes('marca 3') || 
      params.get('brand_id') === '3' || 
      params.get('filters[brand_id]') === '3'
    ) {
      applied_filters.brand_id = "3";
    }
    
    if (aiQuestion.includes('40') || params.get('filters[capacity_total_gt]') === '40') {
      applied_filters.capacity_total_gt = "40";
    }

    if (aiQuestion.includes('activas') || hasParam('status', 'active')) {
      applied_filters.status = "active";
    }

    if (
      aiQuestion.includes('buseta') || 
      aiQuestion.includes('clase 2') ||
      hasParam('vehicle_class_id', '2')
    ) {
      applied_filters.vehicle_class_id = "2"; 
    }

    const totalCount = aiQuestion ? 87 : 0;

    const responseBody: MockVehicleIndexResponse = {
      data: totalCount > 0 ? [{ id: 1, plate: 'TEST123' }] : [],
      meta: { 
        pagination: { 
          page: 1, 
          per_page: 10,
          count: totalCount, 
          pages: totalCount > 0 ? 1 : 0,
          prev: null, 
          next: totalCount > 10 ? 2 : null
        },
        ai: !!aiQuestion,
        applied_filters: applied_filters || {}, 
        ...(aiQuestion ? {
            ai_search: { 
              question: aiQuestion || "",
              match_count: totalCount,
              ...(aiQuestion ? { strategy: "hybrid_rag" } : {}) 
            }
          } : { ai_search: undefined })
      },
    };

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(responseBody),
    });
  });
}
