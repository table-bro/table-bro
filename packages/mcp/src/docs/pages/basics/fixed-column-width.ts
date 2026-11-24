import type {BroDocPage} from '../../pages.js';

/** The page basics/fixed-column-width of Docs. */
export const fixedColumnWidthPage: BroDocPage = {
  path: 'basics/fixed-column-width',
  name: 'Fixed column width',
  text: `<!-- intro -->
The table gives every column its optimal width by itself: \`autoColumnWidth\`, on by default, measures the titles and the values of the columns and shares the width of the table between them.

Any column can still have a fixed width. Give the column a class with \`className\` and the width of its cells in your CSS: the table measures the column at this width and keeps it, the other columns share the rest, and a longer value ends with an ellipsis and shows whole in the tooltip.

{{fixed-col-width.ts}}

{{fixed-col-width.css}}

A build from the SCSS sources has the mixin \`bro-text-ellipsis-width\` of the module \`table-bro.api\` for it:

{{fixed-col-width.scss}}`,
  files: [
    {file: 'fixed-col-width.ts', language: 'ts', code: `import type {BroCol, BroRow} from '@table-bro/core';

interface Order extends BroRow {
  description: string;
  price: number;
}

const cols: BroCol<Order>[] = [
  {
    title: 'Description',
    name: 'description',
    className: 'bro-order_description'
  }, {
    title: 'Price',
    name: 'price',
    dataType: 'number',
    className: 'bro-col_text-right'
  }
];
`},
    {file: 'fixed-col-width.css', language: 'css', code: `.bro-order_description .bro-cell_component {
  width: 400px;
}
`},
    {file: 'fixed-col-width.scss', language: 'scss', code: `@use "table-bro.api" as *;

@include bro-text-ellipsis-width('.bro-order_description', 400px);
`}
  ]
};
