// The element <table-bro> in the JSX of React, with its attribute theme
import type {DetailedHTMLProps, HTMLAttributes} from 'react';

import type {TableBroHTMLElement} from '@table-bro/core';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'table-bro': DetailedHTMLProps<HTMLAttributes<TableBroHTMLElement>, TableBroHTMLElement> & {theme?: 'light' | 'dark' | 'auto'};
    }
  }
}
