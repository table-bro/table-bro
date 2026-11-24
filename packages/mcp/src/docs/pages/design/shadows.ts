import type {BroDocPage} from '../../pages.js';

/** The page design/shadows of Docs. */
export const shadowsPage: BroDocPage = {
  path: 'design/shadows',
  name: 'Shadows',
  text: `<!-- table-shadows -->
Shadows are enabled by default. They can be disabled:

<!-- table-shadows code -->
{{shadows-support.ts}}`,
  files: [
    {file: 'shadows-support.ts', language: 'ts', code: `import type {BroConfig} from '@table-bro/core';

const config: BroConfig = {
  shadowsEnabled: false
};
`}
  ]
};
