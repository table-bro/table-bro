import type {BroSpecFillings} from '../generate/fillings.js';
import type {BroTableSpec}    from './spec.js';

export interface BroBuiltinSpec {
  name: string;
  description: string;
  spec: BroTableSpec;
  fillings: BroSpecFillings;
}

/**
 * The built-in specs of the reference: generate_code gives the code of a built-in spec by its name, and the check
 * of the generator runs every built-in spec through every pair of a target and a skin.
 */
export const builtinSpecs: BroBuiltinSpec[] = [
  {
    name: 'orders',
    description: 'Orders with custom cells and their actions, row details, filters in the Filter Drawer, buttons of the toolbar, a message of a state and a taller row',
    spec: {
      specVersion: 1,
      rowType: 'Order',
      fields: [
        {name: 'number', type: 'string'},
        {name: 'customer', type: 'string'},
        {name: 'total', type: 'number'},
        {name: 'status', type: 'string', values: ['paid', 'pending', 'refunded']},
        {name: 'tags', type: 'string[]'},
        {name: 'urgent', type: 'boolean'}
      ],
      cols: [
        {title: 'Order', name: 'number'},
        {title: 'Customer', name: 'customer', component: {cell: 'customer'}},
        {title: 'Total amount', shortTitle: 'Total', name: 'total'},
        {title: 'Status', name: 'status', component: {cell: 'status'}},
        {title: 'Tags', name: 'tags', component: {element: 'tags'}},
        {title: 'Urgent', name: 'urgent', component: {element: 'switch'}},
        {title: '', component: {cell: 'actions'}},
        {title: '', component: {element: 'details-button'}}
      ],
      cells: [
        {name: 'customer', shows: 'the customer and the order number below it in a smaller font', fields: ['customer', 'number']},
        {name: 'status', shows: 'the status as a badge of the library of the skin, paid stands out', fields: ['status']},
        {name: 'actions', shows: 'Edit and Delete icon buttons', fields: ['number'], actions: ['edit', 'delete']},
        {name: 'details', kind: 'details', shows: 'the customer, the total and the tags of the order', fields: ['customer', 'total', 'tags']}
      ],
      filters: [
        {name: 'customer', label: 'Customer', control: 'text', field: 'customer'},
        {name: 'status', label: 'Status', control: 'select', field: 'status'},
        {name: 'total', label: 'Total', control: 'range', field: 'total'},
        {name: 'urgent', label: 'Urgent only', control: 'checkbox', field: 'urgent'},
        {name: 'big', label: 'Big orders', control: 'checkbox', match: 'custom', rule: 'the total is over 1000'}
      ],
      rows: [
        {number: 'A-1042', customer: 'Ada Lovelace', total: 1200, status: 'paid', tags: ['new', 'priority'], urgent: true},
        {number: 'A-1043', customer: 'Alan Turing', total: 310, status: 'pending', tags: ['new'], urgent: false},
        {number: 'A-1044', customer: 'Grace Hopper', total: 75, status: 'paid', tags: [], urgent: false},
        {number: 'A-1045', customer: 'Edsger Dijkstra', total: 990, status: 'refunded', tags: ['return'], urgent: true},
        {number: 'A-1046', customer: 'Barbara Liskov', total: 1450, status: 'pending', tags: ['priority'], urgent: false}
      ],
      config: {toolbarTitle: 'Orders', pageSize: 10, rowDetailsComponent: {cell: 'details'}},
      toolbar: {
        buttons: [{title: 'Export', action: 'export', icon: 'download'}],
        menu: {title: 'More', items: [{title: 'Archive', action: 'archive'}]}
      },
      stateMessages: {'no-data': 'No orders yet', 'not-found': 'No orders match the filters'},
      cssVars: {'--bro-row-height': '56px'}
    },
    fillings: {
      cells: {
        customer: {
          mat: {
            template: '<span class="customer">{{ row.customer }}</span>\n<small class="number">{{ row.number }}</small>',
            styles: ':host {\n  display: flex;\n  flex-direction: column;\n  line-height: 1.2;\n}\n\n.number {\n  font-size: 12px;\n  opacity: .7;\n}'
          },
          bs: {
            template: '<span>{{ row.customer }}</span>\n<small class="text-body-secondary">{{ row.number }}</small>',
            styles: ':host {\n  display: flex;\n  flex-direction: column;\n  line-height: 1.2;\n}',
            render: "const customer = document.createElement('div');\nconst number = document.createElement('small');\n\ncustomer.textContent = this.row?.customer ?? '';\nnumber.className = 'text-body-secondary';\nnumber.textContent = this.row?.number ?? '';\n\nthis.style.lineHeight = '1.2';\nthis.append(customer, number);"
          },
          nv: {
            template: '<span>{{ row.customer }}</span>\n<small class="number">{{ row.number }}</small>',
            styles: ':host {\n  display: flex;\n  flex-direction: column;\n  line-height: 1.2;\n}\n\n.number {\n  opacity: .7;\n}',
            render: "const customer = document.createElement('div');\nconst number = document.createElement('small');\n\ncustomer.textContent = this.row?.customer ?? '';\nnumber.style.opacity = '.7';\nnumber.textContent = this.row?.number ?? '';\n\nthis.style.lineHeight = '1.2';\nthis.append(customer, number);"
          }
        },
        status: {
          mat: {
            template: '<mat-chip-set>\n  <mat-chip [highlighted]="row.status === \'paid\'">{{ row.status }}</mat-chip>\n</mat-chip-set>'
          },
          bs: {
            template: '<span class="badge" [class]="colors[row.status] ?? \'text-bg-light\'">{{ row.status }}</span>',
            members: "colors: Record<string, string> = {paid: 'text-bg-success', pending: 'text-bg-warning', refunded: 'text-bg-secondary'};",
            render: "const badge = document.createElement('span');\nconst colors: Record<string, string> = {paid: 'text-bg-success', pending: 'text-bg-warning', refunded: 'text-bg-secondary'};\n\nbadge.className = `badge ${colors[this.row?.status ?? ''] ?? 'text-bg-light'}`;\nbadge.textContent = this.row?.status ?? '';\n\nthis.append(badge);"
          },
          nv: {
            template: '<span class="status" [class.status_paid]="row.status === \'paid\'">{{ row.status }}</span>',
            styles: '.status {\n  padding: 0 6px;\n  border: 1px solid GrayText;\n  border-radius: 4px;\n}\n\n.status_paid {\n  border-color: CanvasText;\n}',
            render: "const badge = document.createElement('span');\n\nbadge.style.padding = '0 6px';\nbadge.style.border = `1px solid ${(this.row?.status === 'paid') ? 'CanvasText' : 'GrayText'}`;\nbadge.style.borderRadius = '4px';\nbadge.textContent = this.row?.status ?? '';\n\nthis.append(badge);"
          }
        },
        actions: {
          mat: {
            template: '<button matIconButton aria-label="Edit" matTooltip="Edit" matTooltipPosition="above" (click)="action.emit(\'edit\')">\n  <mat-icon>edit</mat-icon>\n</button>\n<button matIconButton aria-label="Delete" matTooltip="Delete" matTooltipPosition="above" (click)="action.emit(\'delete\')">\n  <mat-icon>delete</mat-icon>\n</button>',
            styles: ':host {\n  --mat-icon-button-icon-color: var(--mat-sys-primary);\n}'
          },
          bs: {
            template: '<button type="button" class="btn btn-link" (click)="action.emit(\'edit\')">Edit</button>\n<button type="button" class="btn btn-link" (click)="action.emit(\'delete\')">Delete</button>',
            render: "for (const [action, title] of [['edit', 'Edit'], ['delete', 'Delete']]) {\n  const button = document.createElement('button');\n\n  button.type = 'button';\n  button.className = 'btn btn-link';\n  button.textContent = title;\n  button.addEventListener('click', () => this.sendAction(action));\n\n  this.append(button);\n}"
          },
          nv: {
            template: '<a href="" role="button" (click)="$event.preventDefault(); action.emit(\'edit\')">Edit</a>\n<a href="" role="button" (click)="$event.preventDefault(); action.emit(\'delete\')">Delete</a>',
            styles: ':host {\n  display: flex;\n  gap: 16px;\n}\n\na {\n  color: LinkText;\n}',
            render: "for (const [action, title] of [['edit', 'Edit'], ['delete', 'Delete']]) {\n  const link = document.createElement('a');\n\n  link.href = '';\n  link.setAttribute('role', 'button');\n  link.style.color = 'LinkText';\n  link.textContent = title;\n  link.addEventListener('click', event => {\n    event.preventDefault();\n    this.sendAction(action);\n  });\n\n  this.append(link);\n}"
          }
        },
        details: {
          mat: {
            template: '<dl>\n  <dt>Customer</dt>\n  <dd>{{ row.customer }}</dd>\n  <dt>Total</dt>\n  <dd>{{ row.total }}</dd>\n  <dt>Tags</dt>\n  <dd>\n    <mat-chip-set>\n      @for (tag of row.tags; track tag) {\n        <mat-chip>{{ tag }}</mat-chip>\n      }\n    </mat-chip-set>\n  </dd>\n</dl>',
            styles: ':host {\n  display: block;\n}\n\ndl {\n  padding: 16px 24px;\n  display: grid;\n  grid-template-columns: max-content 1fr;\n  align-items: center;\n  gap: 8px 24px;\n  margin: 0;\n}\n\ndt {\n  color: var(--mat-sys-on-surface-variant);\n}\n\ndd {\n  margin: 0;\n}'
          },
          bs: {
            template: '<dl>\n  <dt>Customer</dt>\n  <dd>{{ row.customer }}</dd>\n  <dt>Total</dt>\n  <dd>{{ row.total }}</dd>\n  <dt>Tags</dt>\n  <dd>\n    @for (tag of row.tags; track tag) {\n      <span class="badge text-bg-secondary me-1">{{ tag }}</span>\n    }\n  </dd>\n</dl>',
            styles: ':host {\n  display: block;\n}\n\ndl {\n  padding: 12px 16px;\n  display: grid;\n  grid-template-columns: max-content 1fr;\n  gap: 8px 24px;\n  margin: 0;\n}\n\ndt {\n  font-weight: normal;\n  color: var(--bs-secondary-color);\n}\n\ndd {\n  margin: 0;\n}',
            render: "this.style.display = 'block';\n\nconst list = document.createElement('dl');\n\nlist.style.cssText = 'display: grid; grid-template-columns: max-content 1fr; gap: 8px 24px; margin: 0; padding: 12px 16px;';\n\nfor (const [label, value] of [['Customer', this.row?.customer], ['Total', this.row?.total], ['Tags', this.row?.tags.join(', ')]] as [string, unknown][]) {\n  const term = document.createElement('dt');\n  const detail = document.createElement('dd');\n\n  term.style.cssText = 'font-weight: normal; color: var(--bs-secondary-color);';\n  term.textContent = label;\n  detail.style.margin = '0';\n  detail.textContent = String(value ?? '');\n  list.append(term, detail);\n}\n\nthis.append(list);"
          },
          nv: {
            template: '<dl>\n  <dt>Customer</dt>\n  <dd>{{ row.customer }}</dd>\n  <dt>Total</dt>\n  <dd>{{ row.total }}</dd>\n  <dt>Tags</dt>\n  <dd>{{ row.tags.join(\', \') }}</dd>\n</dl>',
            styles: ':host {\n  display: block;\n}\n\ndl {\n  padding: 12px 16px;\n  display: grid;\n  grid-template-columns: max-content 1fr;\n  gap: 8px 24px;\n  margin: 0;\n}\n\ndt {\n  color: GrayText;\n}\n\ndd {\n  margin: 0;\n}',
            render: "this.style.display = 'block';\n\nconst list = document.createElement('dl');\n\nlist.style.cssText = 'display: grid; grid-template-columns: max-content 1fr; gap: 8px 24px; margin: 0; padding: 12px 16px;';\n\nfor (const [label, value] of [['Customer', this.row?.customer], ['Total', this.row?.total], ['Tags', this.row?.tags.join(', ')]] as [string, unknown][]) {\n  const term = document.createElement('dt');\n  const detail = document.createElement('dd');\n\n  term.style.color = 'GrayText';\n  term.textContent = label;\n  detail.style.margin = '0';\n  detail.textContent = String(value ?? '');\n  list.append(term, detail);\n}\n\nthis.append(list);"
          }
        }
      },
      filterRules: {
        big: 'return row.total > 1000;'
      }
    }
  },
  {
    name: 'users-server',
    description: 'Users loaded from the server page by page, with a search of the toolbar and the sort of the columns',
    spec: {
      specVersion: 1,
      rowType: 'User',
      fields: [
        {name: 'name', type: 'string'},
        {name: 'email', type: 'string'},
        {name: 'role', type: 'string', values: ['admin', 'editor', 'viewer']},
        {name: 'active', type: 'boolean'}
      ],
      cols: [
        {title: 'Name', name: 'name'},
        {title: 'Email', name: 'email'},
        {title: 'Role', name: 'role'},
        {title: 'Active', name: 'active', component: {element: 'switch'}}
      ],
      config: {toolbarTitle: 'Users', pageSize: 20, server: true}
    },
    fillings: {}
  },
  {
    name: 'products',
    description: 'The smallest table: columns of the fields of a row, the rows loaded by the page',
    spec: {
      specVersion: 1,
      rowType: 'Product',
      fields: [
        {name: 'title', type: 'string'},
        {name: 'price', type: 'number'}
      ],
      cols: [
        {title: 'Product', name: 'title'},
        {title: 'Price', name: 'price'}
      ]
    },
    fillings: {}
  }
];
