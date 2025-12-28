import type { Page, Route } from '@playwright/test';

const isApiRequest = (route: Route) => {
  const rt = route.request().resourceType();
  return rt === 'xhr' || rt === 'fetch';
};

const urlPath = (url: string) => {
  try {
    return new URL(url).pathname;
  } catch {
    return '';
  }
};

const isVehiclesIndexApiUrl = (url: string) => {
  const path = urlPath(url);
  if (path === '/vehicles') return false;
  const isIndex = /\/v1\/vehicles$/.test(path) || /\/api\/firstparty\/v1\/vehicles$/.test(path);
  const isStats = path.endsWith('/vehicles/stats');
  return isIndex && !isStats;
};

const isVehiclesStatsApiUrl = (url: string) => {
  const path = urlPath(url);
  return /\/v1\/vehicles\/stats$/.test(path) || /\/api\/firstparty\/v1\/vehicles\/stats$/.test(path);
};

export async function mockVehiclesIndexOk(page: Page): Promise<void> {
  await page.route('**/*', async (route: Route) => {
    const url = route.request().url();
    if (!isApiRequest(route)) {
      await route.fallback();
      return;
    }
    if (!isVehiclesIndexApiUrl(url)) {
      await route.fallback();
      return;
    }

    const urlObj = new URL(url);
    const aiQuestion = urlObj.searchParams.get('ai_question') ?? '';
    const isAi = Boolean(aiQuestion.trim());

    let appliedFilters: Record<string, string> | undefined;
    if (isAi) {
      const q = aiQuestion.toLowerCase();
      const includeCapacity = q.includes('capacidad');
      appliedFilters = {
        status: 'active',
        brand: 'Hino',
        vehicle_class: 'buseta',
      };
      if (includeCapacity) {
        appliedFilters.capacity_total_gt = '40';
      }
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [],
        meta: {
          ai: isAi,
          ai_explanation: isAi ? 'consulta IA' : null,
          applied_filters: appliedFilters,
          pagination: {
            page: 1,
            per_page: 10,
            pages: 1,
            count: 0,
            prev: null,
            next: null,
          },
        },
      }),
    });
  });
}

export async function mockVehiclesStats(page: Page, handler: (route: Route) => Promise<void>): Promise<void> {
  await page.route('**/*', async (route: Route) => {
    const url = route.request().url();
    if (!isApiRequest(route)) {
      await route.fallback();
      return;
    }
    if (!isVehiclesStatsApiUrl(url)) {
      await route.fallback();
      return;
    }
    await handler(route);
  });
}
