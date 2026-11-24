import type {BroDocPage} from '../../pages.js';

/** The page basics/auto-detected-column-width of Docs. */
export const autoDetectedColumnWidthPage: BroDocPage = {
  path: 'basics/auto-detected-column-width',
  name: 'Auto-detected column width',
  text: `<!-- table-basics_auto-detected-column-width -->
Before its rows come, the table measures the titles of the columns: the header stands at their widths. The rows that come give the columns the widths of their values, and the header moves to them.

<!-- auto-column-width -->
#### Column widths without auto-detection

The auto-detection measures the values of a column and gives it the width of the longest one. An application that knows the widths it needs turns it off with \`autoColumnWidth: false\` in the config: the table measures nothing and writes no widths, and your CSS gives every column its width through its class, \`className\` of the column. Give the width with the mixin \`bro-text-ellipsis-width\` of the module \`table-bro.api\`, and the column is as wide as you need: a long value keeps to the one line of its row and ends with an ellipsis.

{{auto-column-width.ts}}

{{auto-column-width.scss}}

A table with a Filter Drawer keeps the auto-detection, \`autoColumnWidth: true\` by default. The drawer declares the width that it leaves the table: the columns take it at once and move with the drawer, and a value that does not fit any more ends with an ellipsis and shows whole in the tooltip. With \`autoColumnWidth: false\` the table follows neither the drawer nor a resize: the widths of your CSS stay as they are.`,
  files: [
    {file: 'auto-column-width.ts', language: 'ts', code: `import type {BroCol, BroConfig, BroRow} from '@table-bro/core';

interface Order extends BroRow {
  description: string;
  price: number;
}

const conf: BroConfig = {
  autoColumnWidth: false
};

const cols: BroCol<Order>[] = [
  {
    title: 'Description',
    name: 'description',
    className: 'bro-order_description'
  }, {
    title: 'Price',
    name: 'price',
    dataType: 'number',
    className: 'bro-order_price bro-col_text-right'
  }
];
`},
    {file: 'auto-column-width.scss', language: 'scss', code: `@use "table-bro.api" as *;

@include bro-text-ellipsis-width('.bro-order_description', 400px);
@include bro-text-ellipsis-width('.bro-order_price', 120px);
`}
  ]
};
