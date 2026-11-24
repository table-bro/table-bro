import type {BroDocPage} from '../../pages.js';

/** The page basics/animated-page-size of Docs. */
export const animatedPageSizePage: BroDocPage = {
  path: 'basics/animated-page-size',
  name: 'Animated page size change',
  text: `<!-- table-basics_animated-page-size -->
The table uses animation when the number of visible rows changes.

<!-- animated-page-size-server -->
##### Animated page size change _with server-side data loading_

<!-- animated-page-size-server code -->
{{animated-page-size_server.ts}}`,
  files: [
    {file: 'animated-page-size_server.ts', language: 'ts', code: `import type {BroConfig} from '@table-bro/core';

const config: BroConfig = {
  server: true
};
`}
  ]
};
