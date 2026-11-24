import type {BroDocPage} from '../../pages.js';

/** The page basics/animated-pagination of Docs. */
export const animatedPaginationPage: BroDocPage = {
  path: 'basics/animated-pagination',
  name: 'Animated pagination',
  text: `<!-- table-basics_animated-pagination -->
When paginating, the table animates all visible rows, with no vertical scrollbar.

<!-- animated-pagination-server -->
##### Animated pagination _with server-side data loading_

<!-- animated-pagination-server code -->
{{animated-pagination_server.ts}}`,
  files: [
    {file: 'animated-pagination_server.ts', language: 'ts', code: `import type {BroConfig} from '@table-bro/core';

const config: BroConfig = {
  server: true
};
`}
  ]
};
