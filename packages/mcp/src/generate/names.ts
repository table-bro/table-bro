import type {BroTableSpec} from '../spec/spec.js';

/**
 * The names of the generated code, from the type of the row and the names of the cells.
 */
export class BroNames {
  /** order or purchase-request: the part of the tags, the files and the id. */
  readonly kebab: string;

  /**
   * @param rowType - the type of the row in the generated code, as Order; the names follow it
   * @param tagSuffix - the suffix of the tags of the cells: the site defines new Custom Elements for every generation,
   * and a tag cannot be defined twice
   */
  constructor(readonly rowType: string, private tagSuffix: string = '') {
    this.kebab = rowType.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }

  static of(spec: BroTableSpec, tagSuffix: string = ''): BroNames {
    return new BroNames(spec.rowType, tagSuffix);
  }

  /** The folder of the generated files. */
  get folder(): string {
    return `${this.kebab}-table`;
  }

  get tableId(): string {
    return `${this.kebab}-table${this.tagSuffix ? `-${this.tagSuffix}` : ''}`;
  }

  /** The id of the container of the Filter Drawer of the bs and nv skins. */
  get drawerId(): string {
    return `${this.tableId}-filters`;
  }

  /** OrderFilterValues: the values of the filters, as the class of their component takes OrderFilters. */
  get filtersType(): string {
    return `${this.rowType}FilterValues`;
  }

  /** OrderFilters: the component of the filters, without the suffix Component, as ng generate names it since Angular 20. */
  get filtersClass(): string {
    return `${this.rowType}Filters`;
  }

  /** The file of the filters, from the folder of the page. */
  get filtersFile(): string {
    return `${this.kebab}-filters`;
  }

  /** app-order-filters: the filters are a component of the application, as the page app-order-table. */
  get filtersSelector(): string {
    return `app-${this.kebab}-filters`;
  }

  /** OrderTable: the page, without the suffix Component, as ng generate names it since Angular 20. */
  get pageClass(): string {
    return `${this.rowType}Table`;
  }

  /** The file of the page, from its folder. */
  get pageFile(): string {
    return `${this.kebab}-table`;
  }

  get pageSelector(): string {
    return `app-${this.kebab}-table`;
  }

  /** The service of a server table: it maps the queries of the table and the answers of the API. */
  get serviceClass(): string {
    return `${this.rowType}Service`;
  }

  /** The file of the service, from the folder of the page. */
  get serviceFile(): string {
    return `${this.kebab}.service`;
  }

  /** The request, the answer and an item of the answer of the API of a server table. */
  get apiQueryType(): string {
    return `${this.rowType}ApiQuery`;
  }

  get apiPageType(): string {
    return `${this.rowType}ApiPage`;
  }

  get apiItemType(): string {
    return `${this.rowType}ApiItem`;
  }

  /** bro-cell-order-status for the cell status of the type Order: the prefix bro-cell- belongs to the application. */
  tag(cell: string): string {
    return `bro-cell-${this.kebab}-${cell}${this.tagSuffix ? `-${this.tagSuffix}` : ''}`;
  }

  /**
   * OrderStatusCell for the cell status of the type Order: the prefix Bro belongs to the library, and the suffix Cell
   * keeps the names of the cells apart from the page, the filters and the types of the row.
   */
  cellClass(cell: string): string {
    return `${this.rowType}${cell.split('-').map(part => part[0].toUpperCase() + part.slice(1)).join('')}Cell`;
  }

  /** The file of a cell, from the folder of the page: order-status-cell. */
  cellFile(cell: string): string {
    return `${this.kebab}-${cell}-cell`;
  }
}
