import type {TableBroHTMLElement} from '@table-bro/core';

import type {Locator, Page} from '@playwright/test';

import type {BroContext} from '../packages/core/types/context';
import {bodyTable}       from './table-bro.fixtures';

// A table on the stand page for the e2e files that create their own tables.

/** The window of the stand page, with the errors and the actions of the table. */
type E2EWindow = typeof window & {
  e2eErrors: unknown[];
  e2eEvents: unknown[];
};

export const cols = [{title: 'Name', name: 'name'}, {title: 'Price', name: 'price', dataType: 'number'}];
export const rows = [{name: 'b', price: 3}, {name: 'a', price: 1}, {name: 'c', price: 2}];

/**
 * Creates a <table-bro> on the stand page. The script of the page gets the element and calls its methods:
 * a config with functions is built in the page, since functions do not pass into page.evaluate.
 */
export async function mount(page: Page, script: string): Promise<Locator> {
  // The tables of a test share the stand page: the first one opens it
  if (new URL(page.url()).pathname !== '/') {
    await page.goto('/', {waitUntil: 'networkidle'});
  }

  await page.evaluate(({script, cols, rows}) => {
    document.querySelector('#e2e-table')?.remove();

    const el = document.createElement('table-bro');

    el.id = 'e2e-table';

    const w = window as E2EWindow;

    w.e2eErrors = [];
    w.e2eEvents = [];
    el.addEventListener('bro-error', event => w.e2eErrors.push((event as CustomEvent).detail));
    el.addEventListener('bro-action', event => w.e2eEvents.push((event as CustomEvent).detail));

    new Function('el', 'cols', 'rows', script)(el, cols, rows);
  }, {script, cols, rows});

  return page.locator('table-bro#e2e-table');
}

/** The status, the rows and the filter of the table from its debug context. */
export function tableState(table: Locator): Promise<{status: string; rows: number | undefined; sourceRows: number | undefined; filter: unknown}> {
  return table.evaluate(el => {
    const {state} = (el as TableBroHTMLElement & Record<symbol, BroContext>)[Symbol.for('table-bro:debug')];

    return {status: state.status, rows: state.rows?.length, sourceRows: state.sourceRows?.length, filter: state.filter};
  });
}

export function cellTexts(table: Locator, column: number): Promise<string[]> {
  return bodyTable(table).locator(`tbody > tr[data-row-number] > td:nth-child(${column})`).evaluateAll(cells => {
    return cells.map(cell => cell.textContent?.trim() || '');
  });
}
