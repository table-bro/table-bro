import type {BroDocPage} from '../../pages.js';

/** The page design/dark-light-mode of Docs. */
export const darkLightModePage: BroDocPage = {
  path: 'design/dark-light-mode',
  name: 'Dark/Light mode',
  text: `<!-- table-themes -->
You can set the value to \`auto\`, and the Table, Bro will follow the system color scheme defined by the \`prefers-color-scheme\` media query.

Alternatively, you can set it to \`light\` or \`dark\` to force a specific mode.

<!-- table-themes code -->
{{themes.ts}}`,
  files: [
    {file: 'themes.ts', language: 'ts', code: `import type {BroConfig} from '@table-bro/core';

const config: BroConfig = {
  theme: 'auto' // 'light' | 'dark'
};
`}
  ]
};
