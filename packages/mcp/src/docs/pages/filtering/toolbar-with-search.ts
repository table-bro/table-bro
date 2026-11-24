import type {BroDocPage} from '../../pages.js';

/** The page filtering/toolbar-with-search of Docs. */
export const toolbarWithSearchPage: BroDocPage = {
  path: 'filtering/toolbar-with-search',
  name: 'Toolbar with Search',
  text: `<!-- table-toolbar-with-search -->
The toolbar starts with the search in every skin. Next to it go your buttons and one menu from \`components.toolbarMain.buttons\`: a button sends its \`eventType\` as the action of the \`bro-action\` event, an item of the menu sends its \`value\`. The tables of this site have the **Filters** button and the menu **More**:

<!-- table-toolbar-with-search code -->
{{toolbar-buttons.ts}}

In the skin mat the menu is an optional element of the skin, which the application adds with \`withToolbarMenu()\`; the skins bs and nv always have it:

{{toolbar-buttons_app.config.ts}}

<!-- table-toolbar-with-search-server -->
#### Toolbar with Search _with server-side data loading_

<!-- toolbar-off -->
#### Without the toolbar or the header

\`toolbar: false\` renders the table without its toolbar, with its title, its search and its buttons. \`header: false\` hides the header of the table, the row of the titles of the columns: the header keeps its place in the DOM, and the widths and the sort of the columns stay as they are.

{{toolbar-off.ts}}`,
  files: [
    {file: 'toolbar-buttons.ts', language: 'ts', code: `import {ChangeDetectionStrategy, Component, signal} from '@angular/core';

import {TableBroNg}                                                             from '@table-bro/angular';
import {type BroActionDetail, type BroCol, type BroConfig, type BroRow, events} from '@table-bro/core';

interface Order extends BroRow {
  description: string;
  price: number;
}

@Component({
  selector: 'app-orders',
  template: \`
    <table-bro-ng [cols]="cols()" [rows]="rows()" [conf]="conf()"
                  (action)="onAction($event)"></table-bro-ng>\`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TableBroNg
  ]
})
export class OrdersComponent {
  cols = signal<BroCol<Order>[]>([
    {
      title: 'Description',
      name: 'description'
    }
  ]);

  rows = signal<Order[] | undefined>(undefined);

  conf = signal<BroConfig>({
    skin: 'mat',
    components: {
      toolbarMain: {
        buttons: [
          // A button sends its eventType; in the mat skin it is an icon with a tooltip
          {buttonTitle: 'Filters', eventType: events.filtersToggleEvent, iconHTML: 'filter_list', buttonTooltip: 'Filters'},
          // A menu: an item sends its value
          {
            buttonTitle: 'More',
            mode: 'navbar-dropdown',
            buttonTooltip: 'Your custom menu',
            options: [
              {value: 'action-1', title: 'Action', iconHTML: 'filter_1'},
              {value: 'action-2', title: 'Another action', iconHTML: 'filter_2'},
              {divider: true},
              {value: 'action-3', title: 'Something else here', iconHTML: 'filter_3'}
            ]
          }
        ]
      }
    }
  });

  onAction({action}: BroActionDetail<Order>) {
    if (action === 'action-1') {
      // your action
    }
  }
}
`},
    {file: 'toolbar-buttons_app.config.ts', language: 'ts', code: `import type {ApplicationConfig} from '@angular/core';

import {provideTableBroMatSkin, withToolbarMenu} from '@table-bro/angular-material';

export const appConfig: ApplicationConfig = {
  providers: [
    provideTableBroMatSkin(withToolbarMenu())
  ]
};
`},
    {file: 'toolbar-off.ts', language: 'ts', code: `import type {BroConfig} from '@table-bro/core';

const config: BroConfig = {
  skin: 'mat',
  toolbar: false, // no toolbar
  header: false // no row of the titles of the columns
};
`}
  ]
};
