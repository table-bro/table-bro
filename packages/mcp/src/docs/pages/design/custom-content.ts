import type {BroDocPage} from '../../pages.js';

/** The page design/custom-content of Docs. */
export const customContentPage: BroDocPage = {
  path: 'design/custom-content',
  name: 'Custom content in tables using Custom Elements',
  text: `<!-- table-custom-content -->
You can use any component inside table cells, creating it as a \`Custom Element\`, or transforming your _Angular/React/Svelte/Vue/[Your framework](https://custom-elements-everywhere.com/)_ components to \`Custom Element\`, e.g.

<!-- after -->
Name your own elements of the cells \`bro-cell-*\`: the library never defines this prefix and leaves it to the application.

Switcher-component as a _[Custom Element](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements)_:

{{bro-cell-switch.ts}}

and define it in your app and name it in the column of its cells:

{{bro-cell-switch_define.ts}}

Switcher-component as an _Angular_-component:

{{bro-cell-slide-toggle.component.ts}}

and define it in your app with \`@angular/elements\`, on the example of the page of the table:

{{bro-cell-slide-toggle.component_define.ts}}`,
  files: [
    {file: 'bro-cell-switch.ts', language: 'ts', code: `import type {BroCellElement, BroCol, BroConfig, BroRow} from '@table-bro/core';

interface Order extends BroRow {
  description: string;
  price: number;
  action: boolean;
}

export class BroCellSwitchComponent extends HTMLElement implements BroCellElement<Order> {
  // The table sets the config, the column and the row of the cell before it connects the element
  config?: BroConfig;
  col?: BroCol<Order>;
  row?: Order;

  connectedCallback(): void {
    const input = document.createElement('input');

    input.type = 'checkbox';
    input.role = 'switch';
    input.checked = this.getAttribute('checked') === 'true';

    this.replaceChildren(input);
  }
}
`},
    {file: 'bro-cell-switch_define.ts', language: 'ts', code: `import type {BroCol, BroRow} from '@table-bro/core';

import {BroCellSwitchComponent} from './bro-cell-switch';

interface Order extends BroRow {
  description: string;
  price: number;
  action: boolean;
}

customElements.define('bro-cell-switch', BroCellSwitchComponent);

const cols: BroCol<Order>[] = [
  {
    title: 'Description',
    name: 'description'
  }, {
    title: 'Action',
    name: 'action',
    component: {
      selector: 'bro-cell-switch',
      attrs: {
        checked: (_col, row) => row.action
      }
    }
  }
];
`},
    {file: 'bro-cell-slide-toggle.component.ts', language: 'ts', code: `import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

import {MatSlideToggle}                      from '@angular/material/slide-toggle';
import type {BroCellElement, BroCol, BroRow} from '@table-bro/core';

interface Order extends BroRow {
  description: string;
  price: number;
  action: boolean;
}

@Component({
  selector: 'bro-cell-slide-toggle',
  template: \`
    <mat-slide-toggle [hideIcon]="true" [checked]="row.action"></mat-slide-toggle>\`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatSlideToggle
  ]
})
export class BroCellSlideToggleComponent implements BroCellElement<Order> {
  @Input() col!: BroCol<Order>;
  @Input() row!: Order;
}
`},
    {file: 'bro-cell-slide-toggle.component_define.ts', language: 'ts', code: `import {ChangeDetectionStrategy, Component, inject, Injector, signal} from '@angular/core';
import {createCustomElement}                                          from '@angular/elements';

import {TableBroNg}                     from '@table-bro/angular';
import type {BroCol, BroConfig, BroRow} from '@table-bro/core';

import {BroCellSlideToggleComponent} from './bro-cell-slide-toggle.component';

interface Order extends BroRow {
  description: string;
  price: number;
  action: boolean;
}

@Component({
  selector: 'app-orders',
  template: \`
    <table-bro-ng [cols]="cols()" [rows]="rows()" [conf]="conf()"></table-bro-ng>\`,
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
    }, {
      title: 'Action',
      name: 'action',
      component: 'bro-cell-slide-toggle'
    }
  ]);

  rows = signal<Order[] | undefined>(undefined);
  conf = signal<BroConfig>({skin: 'mat'});

  private injector = inject(Injector);

  constructor() {
    this.defineCustomElements();
  }

  /** The cells are Custom Elements: the table creates them by their tags, so they are defined before it. */
  private defineCustomElements() {
    if (customElements.get('bro-cell-slide-toggle')) {
      return;
    }

    customElements.define('bro-cell-slide-toggle', createCustomElement(BroCellSlideToggleComponent, {injector: this.injector}));
  }
}
`}
  ]
};
