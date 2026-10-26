import type {Locator, Page} from '@playwright/test';

// The parts of a table that the e2e tests read.

export function bodyTable(table: Locator): Locator {
  return table.locator('table.bro-table:not(.bro-table-aux)');
}

export function stateMessage(table: Locator): Locator {
  return table.locator('.bro-state-message');
}

export function rangeLabel(table: Locator): Locator {
  return table.locator('.mat-mdc-paginator-range-label, .bro-paginator-range-label');
}

/**
 * Whether the page takes the styles of the skins for Safari: they are behind @supports (font: -apple-system-body), a
 * system font that only WebKit of macOS and iOS knows. WebKit of Playwright on Linux, as in CI, does not know it and
 * draws the native controls as without these styles.
 * @param page - the page of the test
 */
export function safariStyles(page: Page): Promise<boolean> {
  return page.evaluate(() => CSS.supports('font', '-apple-system-body'));
}
