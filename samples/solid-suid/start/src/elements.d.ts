// The element <table-bro> in the JSX of Solid, with its attribute theme and its event bro-action for on:bro-action
import type {JSX as SolidJSX} from 'solid-js';

import type {BroActionDetail, TableBroHTMLElement} from '@table-bro/core';

declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements {
      'table-bro': SolidJSX.HTMLAttributes<TableBroHTMLElement> & {theme?: 'light' | 'dark' | 'auto'};
    }

    interface CustomEvents {
      'bro-action': CustomEvent<BroActionDetail>;
    }
  }
}
