import type {BroDocPage} from '../../pages.js';

/** The page design/css-styling of Docs. */
export const cssStylingPage: BroDocPage = {
  path: 'design/css-styling',
  name: 'Supports CSS styling of ‹table›',
  text: `<!-- table-css -->
Table, Bro uses standard \`‹table›\` CSS styling, allowing you to apply any of your existing \`‹table›\` styles:

<!-- table-css code -->
{{table-css.ts}}

<!-- after -->
Your \`CSS\` of these classes, as of any \`‹table›\` of the page:

{{table-css.css}}`,
  files: [
    {file: 'table-css.ts', language: 'ts', code: `import type {BroConfig} from '@table-bro/core';

const config: BroConfig = {
  css: {
    table: {
      className: '',

      thead: {
        className: '',

        tr: {
          className: 'bro-header-row',

          th: {
            className: 'bro-header-cell'
          }
        }
      },

      tbody: {
        className: '',

        tr: {
          className: 'bro-row',

          td: {
            className: 'bro-cell'
          }
        }
      }
    },

    shadow: {
      className: 'shadow'
    }
  }
};
`},
    {file: 'table-css.css', language: 'css', code: `table-bro th.bro-header-cell,
table-bro td.bro-cell {
  padding: 0 0 0 16px;
}

table-bro tr.bro-header-row {
  height: var(--bro-header-height);
}

table-bro tr.bro-row {
  height: var(--bro-row-height);
}

table-bro table {
  border-color: #dee2e6;
}

table-bro.bro-dark-theme table {
  border-color: #495057;
}
`}
  ]
};
