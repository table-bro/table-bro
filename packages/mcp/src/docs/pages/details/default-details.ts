import type {BroDocPage} from '../../pages.js';

/** The page details/default-details of Docs. */
export const defaultDetailsPage: BroDocPage = {
  path: 'details/default-details',
  name: 'Default Details',
  text: `<!-- table-details-default code -->
{{default-details.ts}}

<!-- table-details-default-server -->
#### Default Details _with server-side data loading_

With default \`indeterminate\` progress bar:

<!-- table-details-default-server code -->
{{default-details_server.ts}}

<!-- table-details-default-server-determinate -->
With \`determinate\` progress bar:

<!-- table-details-default-server-determinate code -->
{{default-details_server-determinate.ts}}

<!-- emit -->
Example how to emit _progress status_ from your Details component (e.g. based on your server logic):

{{details_server-determinate_emit.ts}}

<!-- emit angular -->
or in case of Details is an Angular-component (registered in your Angular-app as a Custom Element):

{{details_server-determinate_emit-angular.ts}}`,
  files: [
    {file: 'default-details.ts', language: 'ts', code: `import type {BroConfig} from '@table-bro/core';

const config: BroConfig = {
  rowDetailsComponent: 'bro-cell-details' // your Details-component as a Custom Element
};
`},
    {file: 'default-details_server.ts', language: 'ts', code: `import type {BroConfig} from '@table-bro/core';

const config: BroConfig = {
  rowDetailsComponent: 'bro-cell-details', // your Details-component as a Custom Element

  rowDetailsServer: true
};
`},
    {file: 'default-details_server-determinate.ts', language: 'ts', code: `import type {BroConfig} from '@table-bro/core';

const config: BroConfig = {
  rowDetailsComponent: 'bro-cell-details', // your Details-component as a Custom Element

  rowDetailsServer: true,
  rowDetailsProgressMode: 'determinate'
};
`},
    {file: 'details_server-determinate_emit.ts', language: 'ts', code: `import {type BroRow, type BroRowDetailsElement, events} from '@table-bro/core';

interface Order extends BroRow {
  description: string;
  price: number;
}

export class BroCellDetailsComponent extends HTMLElement implements BroRowDetailsElement<Order> {
  // The table sets the row before it connects the element, and the attribute server with rowDetailsServer
  row?: Order;

  private progress: number = 0;
  // The table moves loaded server details from its aux row into the row of the details: the content renders once
  private rendered: boolean = false;
  private timerId?: ReturnType<typeof setInterval>;

  connectedCallback(): void {
    if (this.rendered) {
      return;
    }

    if (this.getAttribute('server') !== 'true') {
      this.render();

      return;
    }

    // Emulates the loading of the details: your server logic reports its progress from 0 to 1
    this.timerId = setInterval(() => {
      this.progress = Math.min(1, this.progress + 0.2);

      if (this.progress === 1) {
        clearInterval(this.timerId);
        this.render();
      }

      this.emitProgress(this.progress);
    }, 400);
  }

  disconnectedCallback(): void {
    clearInterval(this.timerId);
  }

  private emitProgress(progress: number): void {
    this.dispatchEvent(new CustomEvent(events.detailsServerLoadedEvent, {detail: progress}));
  }

  private render(): void {
    this.textContent = \`Some details here: \${this.row?.description}\`;
    this.rendered = true;
  }
}

// Somewhere in your app, before the table:
customElements.define('bro-cell-details', BroCellDetailsComponent);
`},
    {file: 'details_server-determinate_emit-angular.ts', language: 'ts', code: `import {ChangeDetectionStrategy, Component, EventEmitter, inject, Injector, Input, type OnDestroy, type OnInit, Output, signal} from '@angular/core';
import {createCustomElement}                                                                                                    from '@angular/elements';

import {TableBroNg}                                                                  from '@table-bro/angular';
import {type BroCol, type BroConfig, type BroRow, type BroRowDetailsElement, events} from '@table-bro/core';

interface Order extends BroRow {
  description: string;
  price: number;
}

@Component({
  selector: 'bro-cell-order-details',
  template: \`
    @if (loaded()) {
      <div>Some details here: {{ row.description }}</div>
    }\`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BroCellOrderDetailsComponent implements OnInit, OnDestroy, BroRowDetailsElement<Order> {
  @Input() row!: Order;
  @Input() server?: string;

  // The Custom Element of the component dispatches the output as the event of its name
  @Output(events.detailsServerLoadedEvent) progressChange = new EventEmitter<number>();

  loaded = signal(false);

  private progress: number = 0;
  private timerId?: ReturnType<typeof setInterval>;

  ngOnInit() {
    if (this.server !== 'true') {
      this.loaded.set(true);

      return;
    }

    // Emulates the loading of the details: your server logic reports its progress from 0 to 1
    this.timerId = setInterval(() => {
      this.progress = Math.min(1, this.progress + 0.2);

      if (this.progress < 1) {
        this.progressChange.emit(this.progress);

        return;
      }

      clearInterval(this.timerId);
      this.loaded.set(true);

      // The next turn of the event loop: the details render their content before the table measures them
      setTimeout(() => this.progressChange.emit(1));
    }, 400);
  }

  ngOnDestroy() {
    clearInterval(this.timerId);
  }
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
    }
  ]);

  rows = signal<Order[] | undefined>(undefined);

  conf = signal<BroConfig>({
    skin: 'mat',
    rowDetailsComponent: 'bro-cell-details', // your Details-component as a Custom Element

    rowDetailsServer: true,
    rowDetailsProgressMode: 'determinate'
  });

  constructor() {
    // The table creates the details by their tag: the Custom Element is defined before it
    if (!customElements.get('bro-cell-details')) {
      customElements.define('bro-cell-details', createCustomElement(BroCellOrderDetailsComponent, {injector: inject(Injector)}));
    }
  }
}
`}

  ]
};
