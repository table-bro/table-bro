// The prerendered table of the page in the locals of a request of the server
import type {PrerenderedTable} from './prerender-orders';

declare global {
  namespace App {
    interface RequestEventLocals {
      orders?: PrerenderedTable;
    }
  }
}
