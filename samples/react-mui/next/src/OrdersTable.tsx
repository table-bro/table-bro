'use client';

import './skin';

import {useEffect, useRef} from 'react';

import type {BroActionDetail, TableBroHTMLElement} from '@table-bro/core';

import {cols, conf, rows}           from './orders';
import type {PrerenderedTable} from './prerender-table';

/**
 * The table of the orders: the page of the server has it prerendered, and configure() renders it with its rows in the
 * browser, in its place.
 * @param props - the prerendered table
 * @param props.prerendered - its attributes and its markup
 */
export function OrdersTable({prerendered}: {prerendered: PrerenderedTable}) {
  const table = useRef<TableBroHTMLElement>(null);

  useEffect(() => {
    const element = table.current!;
    const onAction = (event: CustomEvent<BroActionDetail>) => console.log(event.detail.action);

    queueMicrotask(() => element.configure({cols, rows, conf}));
    element.addEventListener('bro-action', onAction);

    return () => element.removeEventListener('bro-action', onAction);
  }, []);

  return (
    <div className="bro-table-shadow-container">
      <table-bro {...prerendered.attributes} ref={table} theme="auto" dangerouslySetInnerHTML={{__html: prerendered.html}}></table-bro>
    </div>
  );
}
