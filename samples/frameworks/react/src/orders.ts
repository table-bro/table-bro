import type {BroCol, BroConfig, BroRow} from '@table-bro/core';

export interface Order extends BroRow {
  description: string;
  price: number;
}

export const cols: BroCol<Order>[] = [
  {
    title: 'Description',
    name: 'description'
  }, {
    title: 'Price',
    name: 'price',
    dataType: 'number',
    className: 'bro-col_text-right'
  }
];

export const rows: Order[] = [
  {
    description: 'Modern Cotton Chair',
    price: 100
  }, {
    description: 'Awesome Concrete Ball',
    price: 200
  }
];

export const conf: BroConfig = {
  skin: 'nv',
  toolbarTitle: 'Orders'
};
