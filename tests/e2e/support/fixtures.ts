import { test as base } from '@playwright/test';
import { VehiclesPage } from './vehicles-pom';

type MyFixtures = {
  vehiclesPage: VehiclesPage;
};

export const test = base.extend<MyFixtures>({
  vehiclesPage: async ({ page }, provide) => {
    const vPage = new VehiclesPage(page);
    await provide(vPage);
  },
});

export { expect } from '@playwright/test';
