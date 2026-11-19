import {OrdersTable}     from '../OrdersTable';
import {prerenderOrders} from '../prerender-table';

export default async function Page() {
  return <OrdersTable prerendered={await prerenderOrders()} />;
}
