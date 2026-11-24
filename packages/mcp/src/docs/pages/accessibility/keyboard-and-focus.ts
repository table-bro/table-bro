import type {BroDocPage} from '../../pages.js';

/** The page accessibility/keyboard-and-focus of Docs. */
export const keyboardAndFocusPage: BroDocPage = {
  path: 'accessibility/keyboard-and-focus',
  name: 'Keyboard and focus',
  text: `<!-- order -->
The table is HTML of the page, so Tab goes through its controls in the order of the DOM: the toolbar, the column headers, the rows of the current page and the paginator.

| Part | Angular Material | Bootstrap | Native |
| --- | --- | --- | --- |
| Toolbar | The search button, the buttons of the config and the menu: buttons of Material | The search link, the buttons of the config and the menu: links with the role \`button\` | The search link and the buttons of the config: links with the role \`button\`; the menu is a \`‹select›\` |
| Search line | Back, the field, Clear: buttons of Material | Back, the field, Clear: Back and Clear are links with the role \`button\` | Back, the field, Clear: Back and Clear are links with the role \`button\` |
| Column headers | The sort headers of Material | A header with a title: \`role="button"\` and \`tabindex="0"\` | A header with a title: \`role="button"\` and \`tabindex="0"\` |
| Rows | The controls of the cells and the details button, a button of Material | The controls of the cells and the details button, a \`‹button›\` | The controls of the cells and the details button, a link with the role \`button\` |
| Paginator | The paginator of Material | The page size dropdown, then the links First, Previous, Next and Last | The page size \`‹select›\`, then the links First, Previous, Next and Last |

All loaded rows are in the DOM, but only the rows of the current page take the focus: the controls of the other pages get \`tabindex="-1"\` and take their own \`tabindex\` back on their page. The tags that do not fit their cell take no focus either, until they show. A row or a paginator that the table renders anew, as for new rows, keeps the focus of the keyboard on its control.

<!-- keys -->
#### Keys

1. **Links with the role button**

   The toolbar links of Bootstrap and Native, Back and Clear of their search line and the details link of Native take Enter, as every link does, and Space, as a button does, instead of scrolling the page.

2. **Sort headers**

   Enter and Space on a column header sort the column, as a click does: with Angular Material the header is the sort header of Material, with Bootstrap and Native a control of the skin.

3. **Row details**

   Enter and Space on the details button open and close the details of its row, and the focus stays on the button.

4. **Search line**

   The search button opens the search line and puts the focus into its field. Escape in the field closes the search line, as Back does, and the focus returns to the search button; Escape stays in the table, so a dialog around the table stays open. Clear empties the field and keeps the focus in it; Clear in an empty field closes the search line.

5. **Filter Drawer**

   Escape in the drawer closes it, with Angular Material as in the drawer of Material. With Bootstrap and Native, the opened drawer takes the focus into your filters, or to its close button when the filters have no control. With every skin the closed drawer gives the focus back to the button that opened it, when the focus was in the drawer; after a click of the pointer the button shows no focus ring.

<!-- rings -->
#### Focus rings

Each skin shows the focus of the keyboard in the look of its library:

1. **Bootstrap**: the focus ring of Bootstrap, from its variables \`--bs-focus-ring-*\`, also on the sort headers, which Bootstrap does not have.

2. **Native**: the outline of the browser; the skin keeps it one rectangle around the sort headers, the details link and the toolbar links, also in Safari.

3. **Angular Material**: the focus indication of the components of Material.

A control in a cell shows its whole focus ring: the cell, which cuts its content at its edges, lets the ring of a control in focus out.

<!-- safari -->
#### Safari

By default Tab in Safari skips links. The toolbar links of Bootstrap and Native, Back and Clear of their search line, the links of their paginator and the details link of Native take the focus by Option+Tab, or by Tab once **Press Tab to highlight each item on a webpage** is on in the settings of Safari, Advanced.`,
  files: []
};
