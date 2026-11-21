import './skin';

import {useEffect, useRef} from 'preact/hooks';

import type {BroActionDetail, TableBroHTMLElement} from '@table-bro/core';

import {cols, conf, rows}      from './orders';
import type {PrerenderedTable} from './prerender-orders';

/**
 * The table of the orders: the page of the server has it prerendered, and configure() renders it with its rows in the
 * browser, in its place. The hydration of Preact keeps the markup of the server.
 * @param props - the prerendered table
 * @param props.prerendered - its attributes and its markup
 */
export function OrdersTable({prerendered}: {prerendered: PrerenderedTable}) {
  const table = useRef<TableBroHTMLElement>(null);

  useEffect(() => {
    table.current!.configure({cols, rows, conf});
  }, []);

  return (
    <div class="bro-table-shadow-container">
      <table-bro {...prerendered.attributes} ref={table} theme="auto" dangerouslySetInnerHTML={{__html: prerendered.html}}
                 onbro-action={(event: CustomEvent<BroActionDetail>) => console.log(event.detail.action)}></table-bro>
    </div>
  );
}
