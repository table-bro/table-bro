import {useEffect, useRef} from 'react';

import type {BroActionDetail, TableBroHTMLElement} from '@table-bro/core';

import {cols, conf, rows} from './orders';

export function OrdersTable() {
  const table = useRef<TableBroHTMLElement>(null);

  useEffect(() => {
    const element = table.current!;
    const onAction = (event: CustomEvent<BroActionDetail>) => console.log(event.detail.action);

    element.configure({cols, rows, conf});
    element.addEventListener('bro-action', onAction);

    return () => element.removeEventListener('bro-action', onAction);
  }, []);

  return (
    <div className="bro-table-shadow-container">
      <table-bro id="orders" ref={table} theme="auto"></table-bro>
    </div>
  );
}
