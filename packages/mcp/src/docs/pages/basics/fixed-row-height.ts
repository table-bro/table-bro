import type {BroDocPage} from '../../pages.js';

/** The page basics/fixed-row-height of Docs. */
export const fixedRowHeightPage: BroDocPage = {
  path: 'basics/fixed-row-height',
  name: 'Fixed row height',
  text: `<!-- intro -->
All body rows of a table have one fixed height, and its header has one too. Give them with the CSS variables of the skin on the table itself, before it renders: the CSS and the script of the table take them together, without a new build of the skin.

{{fixed-row-height.css}}

#### From the SCSS sources

The package of each skin ships its built CSS and its SCSS sources. A build of the SCSS of the skin gives it other heights for all its tables: configure the skin where your SCSS loads it, with \`node_modules/@table-bro/<skin>/styles\` and \`node_modules/@table-bro/core/styles/mappings/production\` among the load paths of Sass.

{{fixed-row-height.scss}}`,
  files: [
    {file: 'fixed-row-height.css', language: 'css', code: `#orders {
  --bro-header-height: 64px;
  --bro-row-height: 64px;
}
`},
    {file: 'fixed-row-height.scss', language: 'scss', code: `// The skin of the project: "table-bro.material", "table-bro.bootstrap" or "table-bro.native"
@use "table-bro.material" with ($bro-table-header-height: 64px, $bro-table-row-height: 64px);
`}
  ]
};
