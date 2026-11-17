// The element <table-bro> in the JSX of Preact, with its attribute theme and its event bro-action
import type {HTMLAttributes} from 'preact';

import type {BroActionDetail, TableBroHTMLElement} from '@table-bro/core';

declare module 'preact' {
  namespace JSX {
    interface IntrinsicElements {
      'table-bro': HTMLAttributes<TableBroHTMLElement> & {theme?: 'light' | 'dark' | 'auto'; 'onbro-action'?: (event: CustomEvent<BroActionDetail>) => void};
    }
  }
}
