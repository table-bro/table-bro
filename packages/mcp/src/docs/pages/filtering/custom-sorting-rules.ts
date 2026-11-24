import type {BroDocPage} from '../../pages.js';

/** The page filtering/custom-sorting-rules of Docs. */
export const customSortingRulesPage: BroDocPage = {
  path: 'filtering/custom-sorting-rules',
  name: 'Custom sorting rules',
  text: `<!-- table-custom-sorting-rules -->
You can specify a \`sortKey\` for each column to control the sorting behavior.

For example, the "Date" column can display a formatted date (model's \`date\`), while sorting is performed based on the model's underlying \`timestamp\` field.

<!-- table-custom-sorting-rules code -->
{{custom-sorting-rules.ts}}

<!-- table-custom-sorting-rules-server -->
#### Custom sorting rules _with server-side data loading_`,
  files: [
    {file: 'custom-sorting-rules.ts', language: 'ts', code: `import type {BroCol, BroRow} from '@table-bro/core';

interface Order extends BroRow {
  date: string; // the formatted date that the column shows
  timestamp: number; // the date that the column sorts by
}

const cols: BroCol<Order>[] = [
  {
    title: 'Date',
    name: 'date',
    sortKey: 'timestamp'
  }
];
`}
  ]
};
