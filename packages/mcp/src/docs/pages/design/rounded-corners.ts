import type {BroDocPage} from '../../pages.js';

/** The page design/rounded-corners of Docs. */
export const roundedCornersPage: BroDocPage = {
  path: 'design/rounded-corners',
  name: 'Rounded corners',
  text: `<!-- table-rounded-corners -->
The table and the Filter Drawer have the rounded corners of Material 3: 12 px for the table, 16 px for the drawer.

Open details split the table into cards, and each card rounds its corners at the spaces between them.

<!-- table-rounded-corners-square -->
##### Square corners

A radius of \`0\` keeps the corners square:

<!-- table-rounded-corners-square code -->
Set the CSS variables on the table itself, the element \`‹table-bro›\` or \`tableId\` of the wrapper, and on the container of its Filter Drawer, without a new build of the skin:

{{rounded-corners.css}}

Or build the skin from its SCSS sources with square corners for all its tables:

{{rounded-corners.scss}}`,
  files: [
    {file: 'rounded-corners.css', language: 'css', code: `#orders,
table-bro-filter-drawer-container,
table-bro-filter-drawer-container-ng {
  --bro-corner-radius: 0;
  --bro-filter-drawer-corner-radius: 0;
}
`},
    {file: 'rounded-corners.scss', language: 'scss', code: `// The skin of the project: "table-bro.material", "table-bro.bootstrap" or "table-bro.native"
@use "table-bro.material" with ($bro-corner-radius: 0, $bro-filter-drawer-corner-radius: 0);
`}
  ]
};
