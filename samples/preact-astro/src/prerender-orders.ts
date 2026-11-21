// The server DOM first: the core takes its HTMLElement
import './server-dom';

import {prerenderTableBro} from '@table-bro/core';

import {parseHTML} from 'linkedom';

import {cols, conf} from './orders';
import {theme}      from './theme';

/** The prerendered table: the attributes of the element <table-bro> and its markup. */
export interface PrerenderedTable {
  attributes: Record<string, string>;
  html: string;
}

/**
 * Renders the table of the orders in its loading state on the server, in the markup of the components of MUI: the page
 * shows it before any script runs, and configure() renders the table with its rows in its place in the browser. The
 * server entry of the skin renders its elements in the theme of the application.
 */
export async function prerenderOrders(): Promise<PrerenderedTable> {
  // The server entry registers the skin mui with its elements for the server DOM after the browser entry, which the
  // table of the page imports, has registered it without them
  const {setMuiTheme} = await import('@table-bro/react-mui/server');

  setMuiTheme(theme);

  const {document} = parseHTML('<!doctype html><html><body></body></html>');
  const table = document.createElement('table-bro');

  table.id = 'orders';
  document.body.append(table);
  prerenderTableBro(table, {cols, conf});

  return {attributes: Object.fromEntries([...table.attributes].map(({name, value}) => [name, value])), html: table.innerHTML};
}
