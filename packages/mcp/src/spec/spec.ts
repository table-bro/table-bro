/** An identifier of JavaScript: the names of the fields, the cells and the filters, and a key of an object literal. */
export const specIdentifier = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

/**
 * BroTableSpec: the table as data, without functions and without the tags of a skin. It repeats the names of BroCol and
 * BroConfig of Table, Bro, so a model and a developer learn no second vocabulary. The generator writes the code of the
 * table from it for a target and a skin, and the site renders it with the switch of the skins.
 */
export interface BroTableSpec {
  /** The version of this format. */
  specVersion: 1;
  /** The name of the type of a row, as Order: the generator writes the type with it. */
  rowType: string;
  /** The fields of a row: the type of the row, the schema of the rows on the site, the checks of the columns. */
  fields: BroSpecField[];
  cols: BroSpecCol[];
  /** The contracts of the custom cells and of the row details: what they show, read, and send. */
  cells?: BroSpecCell[];
  /** The filters of the Filter Drawer next to the table. */
  filters?: BroSpecFilter[];
  /** The rows of the spec; locally the generator writes the loading of the data without them. */
  rows?: BroSpecRow[];
  config?: BroSpecConfig;
  /** The buttons and the menu of the toolbar of the table. */
  toolbar?: BroSpecToolbar;
  /** The messages of the states of the table; every skin keeps its own icon. */
  stateMessages?: Partial<Record<BroSpecState, string>>;
  /** The settings of the components of one skin, with the names of the fields of BroConfig. */
  skinConfig?: Partial<Record<BroSpecSkin, BroSpecSkinConfig>>;
  /** The CSS custom properties of the table, as --bro-row-height: 64px. */
  cssVars?: Record<string, string>;
  /** The GET endpoint that gives the rows; the source of every field is the path of its value in an item of the answer. */
  api?: BroSpecApi;
}

export interface BroSpecApi {
  /** The address of the endpoint, http or https. */
  url: string;
  /** The path of the array of the rows in the answer, as products or data.items; empty for an answer that is the array. */
  rows: string;
  /** An API that gives the rows page by page: the query parameters of the size of a page and of its offset or number. */
  paging?: {size: string; offset?: string; page?: string};
  /** The path of the number of all rows in the answer of a page, as total: an API that gives pages has it. */
  total?: string;
  /** An API that gives pages also searches, sorts and filters: the query parameter of its text search, as search. */
  search?: string;
  /** The query parameters of the sort: of the field, and of the direction, asc or desc; without it a minus before the field sorts down. */
  sort?: {field: string; order?: string};
  /** The query parameter of every key of the filters, as {"newsSite": "news_site"}; a range has the keys <name>From and <name>To. */
  filters?: Record<string, string>;
}

export type BroSpecSkin = 'mat' | 'bs' | 'nv';

export type BroSpecFieldType = 'string' | 'number' | 'boolean' | 'string[]';

export interface BroSpecField {
  /** An identifier: it becomes a field of the type of the row. */
  name: string;
  type: BroSpecFieldType;
  /** All values of a string field: the rows take only them, a select filter offers them, a cell knows every variant. */
  values?: string[];
  /** With an API: the path of the value in an item of its answer, as price or meta.createdAt. */
  source?: string;
}

export interface BroSpecCol {
  title: string;
  /** The field of the row the column shows; a column of a custom cell may have none. */
  name?: string;
  /** The title for the narrowest width of the column; the default is the first word of the title. */
  shortTitle?: string;
  tooltip?: string;
  dataType?: 'string' | 'number' | 'boolean';
  sortKey?: string;
  component?: BroSpecColComponent;
}

/** A custom cell by the name of its contract, or a ready element of the skins: its tag depends on the skin. */
export type BroSpecColComponent = {cell: string} | {element: BroSpecElement};

export type BroSpecElement = 'tags' | 'switch' | 'details-button';

export interface BroSpecCell {
  /** In kebab-case: a part of the tag, the class, and the file of the component. */
  name: string;
  /** A cell of a column, or the element of the row details named by config.rowDetailsComponent. */
  kind?: 'cell' | 'details';
  /** What the cell shows, in words: the task for its template. */
  shows: string;
  /** The fields of the row the cell reads. */
  fields: string[];
  /** The actions the cell sends: the page tells them by event.action. */
  actions?: string[];
}

export type BroSpecFilterControl = 'text' | 'select' | 'range' | 'checkbox';

export type BroSpecFilterMatch = 'contains' | 'startsWith' | 'eq' | 'custom';

export interface BroSpecFilter {
  /** The key in the object of the filters; a range has the keys <name>From and <name>To. */
  name: string;
  label: string;
  control: BroSpecFilterControl;
  /** The field of the row the filter compares; a custom rule may read other fields. */
  field?: string;
  /** How the value matches the field; a range compares with gte and lte. */
  match?: BroSpecFilterMatch;
  /** The rule of a custom match in words: the model writes the condition for one row. */
  rule?: string;
}

export type BroSpecRow = Record<string, string | number | boolean | string[] | null>;

export interface BroSpecConfig {
  toolbarTitle?: string;
  pageSize?: number;
  server?: boolean;
  rowCounter?: boolean;
  shadowsEnabled?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  /** The custom element of the row details: a cell of the kind details. */
  rowDetailsComponent?: {cell: string};
  rowDetailsServer?: boolean;
  /** The motion of the row details: kinetic by default, as the pages move; eased opens them in --bro-details-duration. */
  rowDetailsMotion?: 'kinetic' | 'eased';
}

export interface BroSpecToolbar {
  buttons?: BroSpecToolbarButton[];
  /** One menu: the toolbar of the mat skin shows one. */
  menu?: {
    title: string;
    items: BroSpecToolbarButton[];
  };
}

export interface BroSpecToolbarButton {
  title: string;
  /** The action of the bro-action event on a click. */
  action: string;
  /** The name of a Material icon: a button of the toolbar of the mat skin is an icon. */
  icon?: string;
}

export type BroSpecState = 'loading' | 'no-data' | 'not-found' | 'fail';

export interface BroSpecSkinConfig {
  /** Values of BroConfig['css']. */
  css?: Record<string, unknown>;
  /** Values of BroConfig['components'], without functions. */
  components?: Record<string, unknown>;
  /** The functions of the skin config: the model writes their bodies. */
  callbacks?: BroSpecCallback[];
}

export interface BroSpecCallback {
  /** The path of the function in the config, as components.sortHeader.afterRender. */
  path: string;
  /** What the function does, in words. */
  does: string;
}
