import type {Locator} from '@playwright/test';

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
