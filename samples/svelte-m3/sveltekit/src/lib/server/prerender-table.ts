import {prerenderTableBro} from '@table-bro/core';
import '@table-bro/svelte-m3/server';

import {parseHTML} from 'linkedom';

import {cols, conf} from '../orders';

/** The prerendered table: the attributes of the element <table-bro> and its markup. */
export interface PrerenderedTable {
  attributes: Record<string, string>;
  html: string;
}

/**
 * Renders the table of the orders in its loading state on the server, in the markup of the components of M3 Svelte: the
 * page shows it before any script runs, and configure() renders the table with its rows in its place in the browser.
 */
export function prerenderOrders(): PrerenderedTable {
  const {document} = parseHTML('<!doctype html><html><body></body></html>');
  const table = document.createElement('table-bro');

  table.id = 'orders';
  document.body.append(table);
  prerenderTableBro(table, {cols, conf});

  return {attributes: Object.fromEntries([...table.attributes].map(({name, value}) => [name, value])), html: table.innerHTML};
}
