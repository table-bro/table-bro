import 'server-only';

import {cols, conf} from './orders';
import {theme}      from './theme';

/** The prerendered table: the attributes of the element <table-bro> and its markup. */
export interface PrerenderedTable {
  attributes: Record<string, string>;
  html: string;
}

/**
 * Renders the table of the orders in its loading state on the server, in the markup of the components of MUI: the page
 * shows it before any script runs, and configure() renders the table with its rows in its place in the browser.
 */
export async function prerenderOrders(): Promise<PrerenderedTable> {
  const {parseHTML} = await import('linkedom');
  const {document, window} = parseHTML('<!doctype html><html><body></body></html>');

  // The elements of the skin extend the HTMLElement of the server DOM: it is global before the import of the skin
  globalThis.HTMLElement ??= window.HTMLElement;

  const {prerenderTableBro} = await import('@table-bro/core');
  const {setMuiTheme} = await import('@table-bro/react-mui/server');

  setMuiTheme(theme);

  const table = document.createElement('table-bro');

  table.id = 'orders';
  document.body.append(table);
  prerenderTableBro(table, {cols, conf});

  return {attributes: Object.fromEntries([...table.attributes].map(({name, value}) => [name, value])), html: table.innerHTML};
}
