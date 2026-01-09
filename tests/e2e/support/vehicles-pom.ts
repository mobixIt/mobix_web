import { type Page, expect, type Locator } from '@playwright/test';
import { getTenantBaseUrl, TENANT_SLUG } from './api-utils';

export class VehiclesPage {
  readonly page: Page;
  readonly filtersContainer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.filtersContainer = page.getByTestId('index-page-filters');
  }

  async goto(): Promise<void> {
    await this.page.goto(`${getTenantBaseUrl(TENANT_SLUG)}/vehicles`);
    await expect(this.page.getByTestId('vehicles-page')).toBeVisible();
  }

  private async closeOpenPopover() {
    const overlay = this.page.locator('.MuiPopover-root, .MuiModal-root').filter({ has: this.page.locator('.MuiBackdrop-root') });
    if (await overlay.first().isVisible({ timeout: 300 }).catch(() => false)) {
      await this.page.keyboard.press('Escape');
      await overlay.first().waitFor({ state: 'detached', timeout: 2000 }).catch(() => {});
    }
  }

  filters = {
    open: async () => {
      const filterBtn = this.page.getByRole('button', { name: /filtros/i }).filter({ visible: true });
      await expect(filterBtn).toBeEnabled({ timeout: 10000 });
      await filterBtn.click();
      await expect(this.filtersContainer).toBeVisible({ timeout: 10000 });
    },
    toggleAdvanced: async () => {
      await this.page.getByTestId('filters-section-toggle').click();
    },
    fillSearch: async (plate: string) => {
      await this.filtersContainer.getByPlaceholder(/Placa/i).fill(plate);
    },
    selectMuiOption: async (label: RegExp, optionName: string | RegExp) => {
      const labelElement = this.filtersContainer.locator('label').filter({ hasText: label }).first();
      await expect(labelElement).toBeVisible();

      const controlId = await labelElement.getAttribute('for');
      const clickableElement = controlId ? this.page.locator(`#${controlId}`) : labelElement;

      await this.closeOpenPopover();
      await clickableElement.click();

      const option = typeof optionName === 'string' 
        ? this.page.getByRole('option', { name: optionName, exact: true })
        : this.page.getByRole('option', { name: optionName });

      await expect(option).toBeVisible();
      await option.click();

      const doneButton = this.page.getByRole('button', { name: /listo/i });
      if (await doneButton.isVisible({ timeout: 500 }).catch(() => false)) {
        await doneButton.click();
      } else {
        await this.closeOpenPopover();
      }
    },
    selectAsyncOption: async (placeholder: RegExp, optionName: string | RegExp) => {
      const input = this.filtersContainer.getByPlaceholder(placeholder);
      await input.click();
      await this.page.getByRole('option', { name: optionName }).click();
    },
    apply: async () => {
      await this.page.getByTestId('filters-section-apply').click();
    },
  };

  stats = {
    open: async () => {
      const statsBtn = this.page.getByRole('button', { name: /estadísticas/i });
      await expect(statsBtn).toBeVisible();
      await statsBtn.click();
      await expect(this.page.getByTestId('index-page-cards')).toBeVisible();
    },
    retry: async () => {
      const retryBtn = this.page.getByTestId('vehicles-stats-retry');
      await expect(retryBtn).toBeVisible();
      await retryBtn.click();
    }
  };

  ai = {
    fillQuestion: async (text: string) => {
      const input = this.page.getByPlaceholder('Pregúntale a Mobix IA...');
      await expect(input).toBeVisible();
      await input.fill(text);
    },
    submit: async () => {
      await this.page.getByLabel(/send question/i).click();
    },
    getQueryInput: () => this.page.getByPlaceholder('Pregúntale a Mobix IA...'),
    historicalBanner: () => this.page.getByText('Consulta histórica detectada'),
    reportButton: () => this.page.getByRole('button', { name: 'Abrir reporte' }),
    analyticsButton: () => this.page.getByRole('button', { name: 'Ver analíticas' })
  };

  chips = {
    getChip: (type: string) => this.page.getByTestId(`active-filter-chip-${type}`),
    remove: async (type: string) => {
      const chip = this.chips.getChip(type);
      await chip.locator('svg').first().click();
      await expect(chip).toBeHidden();
    }
  };
}
