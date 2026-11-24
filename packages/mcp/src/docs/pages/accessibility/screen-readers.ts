import type {BroDocPage} from '../../pages.js';

/** The page accessibility/screen-readers of Docs. */
export const screenReadersPage: BroDocPage = {
  path: 'accessibility/screen-readers',
  name: 'Screen readers',
  text: `<!-- table -->
The table renders its header and its body as two HTML tables; for screen readers they are one table: the element with \`role="table"\` holds them, its name is \`toolbarTitle\`, its rows have \`role="row"\`, and the header cells with a title are column headers. The table tells the number of all its rows by \`aria-rowcount\`, also of the rows of the server that are not loaded, the place of a row by \`aria-rowindex\`, the sort of a column by \`aria-sort\` on its header, and its loading and refreshing by \`aria-busy\`. Screen readers meet only the rows of the current page: the rows of the other pages are \`aria-hidden\`.

<!-- toolbar -->
#### Roles and names of the toolbar

With Bootstrap and Native the controls of the toolbar are links with the role \`button\`, as Bootstrap gives it to a link that goes nowhere. A link says what it is with visually hidden words after its title, in the class \`bro-visually-hidden\` of the core, for screen readers and search engines, which read the text of a link:

| Field | Words | Text of the link | Skins |
| --- | --- | --- | --- |
| \`texts.toolbarMain.searchRole(title)\` | for Orders, by \`toolbarTitle\`; for rows without a title | Search for Orders | bs, nv |
| \`texts.toolbarMain.buttonRole\` | button | Filters button | bs, nv |
| \`texts.toolbarMain.menuRole\` | menu | More menu | bs |
| \`texts.toolbarMain.menuItemRole\` | menu item | Print menu item | bs |

The word \`button\` is for search engines only: it is \`aria-hidden\`, since a screen reader says the role of the link itself. The items of the menu of Bootstrap stay links, as in the markup of Bootstrap; the menu of Native is a \`‹select›\` named by its title. An empty string adds no words:

{{texts-roles.ts}}

With Angular Material the controls of the toolbar are icon buttons of Material, named by \`aria-label\`: the search button by \`texts.toolbarMain.search\`, a button of the config and the menu by their \`buttonTitle\`.

<!-- live -->
#### Live region

After the table the host has its live region, \`‹div class="bro-live-status bro-visually-hidden" role="status" aria-atomic="true"›\`, whose text screen readers say:

1. **The message of a state** when the table shows it: Loading, No data, No records found or Failed, from \`texts.state\` or from the skin. The icon of a state is \`aria-hidden\`: the state is named by its message. Once rows replace the state, the live region is empty.

2. **\`texts.rowDetailsLoadingMessage\`**, Loading details, while row details load from the server, until the details of every row load or leave.

The range of the paginator of Bootstrap and Native, as 6 – 10 of 20, is \`aria-live="polite"\`. The messages of the states are on the page [Animated table states](https://table-bro.com/docs/basics/table-states), and every text of the table on the page [Texts and localization](https://table-bro.com/docs/accessibility/localization).

<!-- names -->
#### Names of the paginator, the row numbers and the details

1. **Paginator**

   The paginator of every skin is a group named by \`texts.paginator.label\`, Pagination. The paginator of Angular Material takes its names from \`MatPaginatorIntl\` of the application. With Bootstrap and Native its links are in a \`‹nav›\` named by \`texts.paginator.navigationLabel\`, Table page navigation; the links are named First page, Previous page, Next page and Last page, a disabled link has \`aria-disabled="true"\`, and the page sizes are named Items per page:.

2. **Column of the row numbers**

   The title of the column is short, No, and a screen reader would read it as a word: its header is named by \`texts.rowCounterLabel\`, Row number.

3. **Row details**

   The details button says whether the details of its row are open by \`aria-expanded\` and points at them by \`aria-controls\`.

4. **Filter Drawer and progress bar**

   With Bootstrap and Native, the filters of the drawer are a region named by \`texts.filterDrawer.title\`, Filters, unless they have a name of their own, and the button that opens the drawer tells its state by \`aria-expanded\` and \`aria-controls\`. The progress bar of Bootstrap and Native is named by \`texts.progressBar.label\`, Loading progress.`,
  files: [
    {file: 'texts-roles.ts', language: 'ts', code: `import type {BroConfig} from '@table-bro/core';

export const conf: BroConfig = {
  skin: 'bs',
  toolbarTitle: 'Orders',
  texts: {
    toolbarMain: {
      // Search for Orders stays; the links of the buttons get no word after their titles
      buttonRole: ''
    }
  }
};
`}
  ]
};
