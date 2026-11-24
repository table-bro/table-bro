import type {BroDocPage} from '../../pages.js';

/** The page accessibility/localization of Docs. */
export const localizationPage: BroDocPage = {
  path: 'accessibility/localization',
  name: 'Texts and localization',
  text: `<!-- table-localization -->
\`config.texts\` gives the words of the table in the language of your application: the toolbar, its search line, the filter drawer, the paginator, the progress bar, the messages of the states and the column of the row numbers. A text that the config does not set keeps its English default. The code under the table gives every text with its default value, as the table below shows them: change the words for the language of your application.

<!-- table-localization code -->
{{texts.ts}}

<!-- fields -->
#### Texts by the part of the table _since 1.2.0_

The texts of the parts that the core renders come first, flat and named as the options of the config: \`rowCounterTitle\`, \`rowCounterLabel\` and \`rowDetailsLoadingMessage\`. The texts of a component of the skin go into the group named as the component, in the order of the components of the skin: \`filterDrawer\`, \`paginator\`, \`progressBar\`, \`state\`, \`toolbarMain\` and \`toolbarSearch\`. The labels of \`paginator\` have the names and the order of \`MatPaginatorIntl\` of Angular Material, from \`itemsPerPageLabel\` to \`getRangeLabel\`.

| Field | Default | Skins | Since |
| --- | --- | --- | --- |
| \`rowCounterTitle\` | No | mat, mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`rowCounterLabel\` | Row number | mat, mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`rowDetailsLoadingMessage\` | Loading details | mat, mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`filterDrawer.title\` | Filters | mat, mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`filterDrawer.close\` | Close | mat, mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`paginator.itemsPerPageLabel\` | Items per page: | mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`paginator.nextPageLabel\` | Next page | mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`paginator.previousPageLabel\` | Previous page | mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`paginator.firstPageLabel\` | First page | mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`paginator.lastPageLabel\` | Last page | mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`paginator.getRangeLabel(page, pageSize, length)\` | 1 – 5 of 20 | mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`paginator.label\` | Pagination | mat, mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`paginator.navigationLabel\` | Table page navigation | suid, bs, nv | 1.2.0 |
| \`paginator.firstText\` | First | bs, nv | 1.2.0 |
| \`paginator.previousText\` | Previous | bs, nv | 1.2.0 |
| \`paginator.nextText\` | Next | bs, nv | 1.2.0 |
| \`paginator.lastText\` | Last | bs, nv | 1.2.0 |
| \`progressBar.label\` | Loading progress | mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`state.loading\` | Loading | mat, mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`state['no-data']\` | No data | mat, mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`state['not-found']\` | No records found | mat, mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`state.fail\` | Failed | mat, mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`toolbarMain.search\` | Search | mat, mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`toolbarMain.searchRole(title)\` | for Orders, by the title of the toolbar; for rows without a title | bs, nv | 1.2.0 |
| \`toolbarMain.buttonRole\` | button | bs, nv | 1.2.0 |
| \`toolbarMain.menuRole\` | menu | bs | 1.2.0 |
| \`toolbarMain.menuItemRole\` | menu item | bs | 1.2.0 |
| \`toolbarSearch.field\` | Search in table | mat, mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`toolbarSearch.back\` | Back | mat, mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`toolbarSearch.clear\` | Clear | mat, mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |

The flat fields of 1.1.0, as \`texts.itemsPerPage\` for \`texts.paginator.itemsPerPageLabel\` and \`texts.rowCounter\` for \`texts.rowCounterTitle\`, still work and are deprecated: the editor marks them, and 2.0 removes them. A field in a group and a text of the core win over their flat field.

A field that is \`undefined\`, as \`{toolbarMain: {search: undefined}}\`, changes nothing: the text stays the default one, or the flat field of 1.1.0 below it.

<!-- states -->
#### Messages of the states

The group \`state\` gives the messages of the states by their names, \`loading\`, \`no-data\`, \`not-found\` and \`fail\`; the icons stay the ones of the skin. The states, their icons and their Lottie animations are on the page [Animated table states](https://table-bro.com/docs/basics/table-states).

<!-- drawer -->
#### Filter drawer

The filter drawer of every skin takes its title and the name of its close button from \`texts.filterDrawer\` of the config of its table, \`title\` and \`close\`. The container of Bootstrap and Native reads them when it connects and when it opens, so a new \`configure()\` of the table shows at the next opening. The property \`texts\` of \`‹table-bro-filter-drawer-container›\` of 1.1.0 still works and wins over the config of the table; it is deprecated and removed in 2.0.

<!-- tags -->
#### Tags without items _since 1.2.0_

A cell of tags without items shows No data. The text belongs to the tags of the skin: \`withTags({texts: {empty: 'No data'}})\` gives it, and later the signal \`empty\` of the service \`TableBroMatTagsTexts\` of \`@table-bro/angular-material\`, or \`setTagsTexts({empty})\` of \`@table-bro/bootstrap\` and \`@table-bro/native\`, changes it at any time: the tags on the page take it at once. The deprecated \`texts.noItems\` of a config still works below them.

{{tags.ts}}

<!-- paginator -->
#### Paginator of Angular Material

The skin \`mat\` renders the paginator of Angular Material, which takes its texts from \`MatPaginatorIntl\` of the application, as every \`mat-paginator\` does. Of the group \`paginator\`, the skin \`mat\` reads only \`label\`, the name of the paginator. Provide your \`MatPaginatorIntl\` once, in the config of the application:

{{paginator-intl.ts}}

{{app.config.ts}}

<!-- language -->
#### Change of the language

The table takes its texts with its config. A new language is a new config: \`configure({cols, rows, conf})\` with the new \`texts\`, or a new value of the input \`conf\` of \`‹table-bro-ng›\`, renders the table anew. The paginator of Angular Material takes the new labels of \`MatPaginatorIntl\` after its \`changes.next()\`, the filter drawer takes the new texts of its table, with Bootstrap and Native at its next opening, and the tags take their new text from \`TableBroMatTagsTexts\` or \`setTagsTexts()\`.

{{language.ts}}`,
  files: [
    {file: 'texts.ts', language: 'ts', code: `import type {BroConfig, BroTextsConfig} from '@table-bro/core';

/** The numbers of the range of the paginator, as 1,234. */
const rangeNumber = new Intl.NumberFormat('en-US');

// Every text of the table with its default value: change the words for the language of your application
export const texts: BroTextsConfig = {
  // Core texts
  rowCounterTitle: 'No',
  rowCounterLabel: 'Row number',
  rowDetailsLoadingMessage: 'Loading details',

  // Skin component texts
  filterDrawer: {
    title: 'Filters',
    close: 'Close'
  },
  paginator: {
    itemsPerPageLabel: 'Items per page:',
    nextPageLabel: 'Next page',
    previousPageLabel: 'Previous page',
    firstPageLabel: 'First page',
    lastPageLabel: 'Last page',
    getRangeLabel: (page: number, pageSize: number, length: number) => {
      if (length === 0 || pageSize === 0) {
        return \`0 of \${rangeNumber.format(length)}\`;
      }

      length = Math.max(length, 0);

      const start = page * pageSize;
      // A start after the end of the list keeps the end of its page
      const end = (start < length) ? Math.min(start + pageSize, length) : start + pageSize;

      return \`\${rangeNumber.format(start + 1)} – \${rangeNumber.format(end)} of \${rangeNumber.format(length)}\`;
    },
    label: 'Pagination',
    navigationLabel: 'Table page navigation',
    firstText: 'First',
    previousText: 'Previous',
    nextText: 'Next',
    lastText: 'Last'
  },
  progressBar: {
    label: 'Loading progress'
  },
  state: {
    loading: 'Loading',
    'no-data': 'No data',
    'not-found': 'No records found',
    fail: 'Failed'
  },
  toolbarMain: {
    search: 'Search',
    searchRole: (title: string) => \`for \${title || 'rows'}\`,
    buttonRole: 'button',
    menuRole: 'menu',
    menuItemRole: 'menu item'
  },
  toolbarSearch: {
    field: 'Search in table',
    back: 'Back',
    clear: 'Clear'
  }
};

export const conf: BroConfig = {
  skin: 'bs',
  texts,
  toolbarTitle: 'Orders'
};
`},
    {file: 'tags.ts', language: 'ts', code: `import {withTags} from '@table-bro/bootstrap';

// The tags of the skin bs, with the text of a cell without items
withTags({texts: {empty: 'No data'}});
`},
    {file: 'paginator-intl.ts', language: 'ts', code: `import {Injectable} from '@angular/core';

import {MatPaginatorIntl} from '@angular/material/paginator';

/** The texts of the paginators of Angular Material with their default values: change the words for the language of your application. */
@Injectable()
export class AppPaginatorIntl extends MatPaginatorIntl {
  override itemsPerPageLabel = 'Items per page:';
  override nextPageLabel = 'Next page';
  override previousPageLabel = 'Previous page';
  override firstPageLabel = 'First page';
  override lastPageLabel = 'Last page';

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return \`0 of \${length}\`;
    }

    length = Math.max(length, 0);

    const start = page * pageSize;
    // A start after the end of the list keeps the end of its page
    const end = (start < length) ? Math.min(start + pageSize, length) : start + pageSize;

    return \`\${start + 1} – \${end} of \${length}\`;
  };
}
`},
    {file: 'app.config.ts', language: 'ts', code: `import type {ApplicationConfig} from '@angular/core';

import {MatPaginatorIntl}                 from '@angular/material/paginator';
import {provideTableBroMatSkin, withTags} from '@table-bro/angular-material';

import {AppPaginatorIntl} from './paginator-intl';

export const appConfig: ApplicationConfig = {
  providers: [
    provideTableBroMatSkin(withTags({texts: {empty: 'No data'}})),
    {provide: MatPaginatorIntl, useClass: AppPaginatorIntl}
  ]
};
`},
    {file: 'language.ts', language: 'ts', code: `import {setTagsTexts}                                   from '@table-bro/bootstrap';
import type {BroCol, BroConfig, BroRow, BroTextsConfig} from '@table-bro/core';

/**
 * Shows the table in another language: the new config renders the table anew, with the same columns and rows.
 * @param cols - the columns of the table
 * @param rows - the rows of the table
 * @param conf - the config of the table in its language before
 * @param texts - the texts of the table in the new language
 * @param empty - the text of a cell of tags without items in the new language
 */
export function setLanguage(cols: BroCol[], rows: BroRow[], conf: BroConfig, texts: BroTextsConfig, empty: string): void {
  document.querySelector('table-bro')!.configure({cols, rows, conf: {...conf, texts}});
  setTagsTexts({empty});
}
`}
  ]
};
