import {useEffect, useRef} from 'preact/hooks';

import type {BroActionDetail, TableBroHTMLElement} from '@table-bro/core';

import {cols, conf, rows} from './orders';

export function OrdersTable() {
  const table = useRef<TableBroHTMLElement>(null);

  useEffect(() => {
    table.current!.configure({cols, rows, conf});
  }, []);

  return (
    <div class="bro-table-shadow-container">
      <table-bro id="orders" ref={table} theme="auto"
                 onbro-action={(event: CustomEvent<BroActionDetail>) => console.log(event.detail.action)}></table-bro>
    </div>
  );
}
