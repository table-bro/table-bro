import {onMount}                   from 'solid-js';
import {getRequestEvent, isServer} from 'solid-js/web';

import type {BroActionDetail, TableBroHTMLElement} from '@table-bro/core';

import {cols, conf, rows} from './orders';

/**
 * The table of the orders with its prerender: the page of the server has it prerendered, and configure() renders it with its rows in the
 * browser, in its place. The hydration of Solid keeps the markup of the server, which the browser has no copy of.
 */
export function PrerenderedOrdersTable() {
  let table!: TableBroHTMLElement;
  const prerendered = isServer ? getRequestEvent()?.locals.orders : undefined;
  // The attributes of the prerender as they are, but the id, which the element has: the spread of Solid writes the class
  // of a property with a space after it
  const attributes = Object.fromEntries(Object.entries(prerendered?.attributes ?? {})
    .filter(([name]) => name !== 'id')
    .map(([name, value]) => [`attr:${name}`, value]));

  onMount(() => table.configure({cols, rows, conf}));

  return (
    <div class="bro-table-shadow-container">
      <table-bro {...attributes} id="orders" ref={table} theme="auto" innerHTML={prerendered?.html}
                 on:bro-action={(event: CustomEvent<BroActionDetail>) => console.log(event.detail.action)}></table-bro>
    </div>
  );
}
