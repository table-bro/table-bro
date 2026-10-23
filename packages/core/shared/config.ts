import type {BroCol, BroConfig, BroCoreTexts, BroResolvedConfig, BroSkinConfig, BroTextGroupName, BroTextGroupTexts, BroTexts, BroTextsConfig} from '../types/table-bro';

/**
 * The instance config: a copy of the skin config, the defaults, then a copy of the user config on top.
 * Nested objects are merged; arrays and functions are replaced as a whole.
 */
export function resolveConfig<T extends object>(skinConfig: BroSkinConfig, config?: BroConfig<T>): BroResolvedConfig {
  const resolved = <BroResolvedConfig>deepCopy(skinConfig);

  // A config without a title gives a toolbar without text, and not the text undefined
  Object.assign(resolved, {
    theme: 'auto',
    shadowsEnabled: true,
    toolbarTitle: '',
    shortColumnTitle: (col: BroCol) => col.title?.split(' ')[0],
    rowCounter: true,
    pageSize: 5,
    pageSizeOptions: [5, 10, 15, 20, 25, 50, 100]
  });

  merge(resolved, deepCopy(config ?? {}));
  // The texts of the config, by their groups or flat, over the English ones
  resolved.texts = resolveTexts(resolved.texts);

  // A table without shadows gives its regions no class of the shadow
  if (!resolved.shadowsEnabled) {
    delete resolved.css.shadow;
  }

  return resolved;
}

/** The fields of BroTexts by the names of the fields of the groups of the texts of a config, where the names differ. */
const groupFields: {[K in BroTextGroupName]?: Partial<Record<keyof BroTextGroupTexts[K], keyof BroTexts>>} = {
  filterDrawer: {title: 'filters'},
  paginator: {
    itemsPerPageLabel: 'itemsPerPage',
    nextPageLabel: 'nextPage',
    previousPageLabel: 'previousPage',
    firstPageLabel: 'firstPage',
    lastPageLabel: 'lastPage',
    getRangeLabel: 'rangeLabel',
    label: 'pagination',
    navigationLabel: 'pageNavigation',
    firstText: 'first',
    previousText: 'previous',
    nextText: 'next',
    lastText: 'last'
  },
  progressBar: {label: 'loadingProgress'},
  toolbarSearch: {field: 'searchField'}
};

/** The fields of BroTexts by the names of the texts of the core in a config. */
const coreFields: Record<keyof BroCoreTexts, keyof BroTexts> = {
  rowCounterTitle: 'rowCounter',
  rowCounterLabel: 'rowCounterName',
  rowDetailsLoadingMessage: 'detailsLoading'
};

/** The numbers of the range of the paginator, as 1,234. */
const rangeNumber = new Intl.NumberFormat('en-US');

/**
 * The texts of a table: the ones of a config over the English ones, a field of a group or a text of the core over its
 * deprecated flat field. A text that is undefined leaves the one below it, the flat field or the English one.
 * The default range is the one of MatPaginatorIntl of Angular Material (MIT), with its numbers formatted.
 * @param texts - the texts of a config, by their groups or flat
 * @group Configuration
 */
export function resolveTexts(texts?: BroTextsConfig): BroTexts {
  const {rowCounterTitle, rowCounterLabel, rowDetailsLoadingMessage, filterDrawer, paginator, progressBar, state, toolbarMain, toolbarSearch, ...flat} = texts ?? {};
  // The flat fields that are set, and the messages of the group state over the flat ones, each by its state
  const resolved: Record<string, unknown> = {...defined(flat), states: {...defined(flat.states), ...defined(state)}};

  // A text of the core goes into the flat field of its part
  for (const [name, value] of Object.entries(defined({rowCounterTitle, rowCounterLabel, rowDetailsLoadingMessage}))) {
    resolved[coreFields[<keyof BroCoreTexts>name]] = value;
  }

  // A field of a group goes into the flat field of its name in groupFields, or of its own name
  for (const [name, group] of Object.entries({filterDrawer, paginator, progressBar, toolbarMain, toolbarSearch})) {
    for (const [field, value] of Object.entries(defined(group))) {
      resolved[(<Record<string, Record<string, string> | undefined>>groupFields)[name]?.[field] ?? field] = value;
    }
  }

  return {
    // Core texts
    rowCounter: 'No',
    rowCounterName: 'Row number',
    detailsLoading: 'Loading details',

    // Skin component texts: filterDrawer
    filters: 'Filters',
    close: 'Close',

    // Skin component texts: paginator
    itemsPerPage: 'Items per page:',
    nextPage: 'Next page',
    previousPage: 'Previous page',
    firstPage: 'First page',
    lastPage: 'Last page',
    rangeLabel: (page: number, pageSize: number, length: number) => {
      if (length === 0 || pageSize === 0) {
        return `0 of ${rangeNumber.format(length)}`;
      }

      length = Math.max(length, 0);

      const start = page * pageSize;
      // A start after the end of the list keeps the end of its page
      const end = (start < length) ? Math.min(start + pageSize, length) : start + pageSize;

      return `${rangeNumber.format(start + 1)} – ${rangeNumber.format(end)} of ${rangeNumber.format(length)}`;
    },
    pagination: 'Pagination',
    pageNavigation: 'Table page navigation',
    first: 'First',
    previous: 'Previous',
    next: 'Next',
    last: 'Last',

    // Skin component texts: progressBar
    loadingProgress: 'Loading progress',

    // Skin component texts: state
    states: {},

    // Skin component texts: toolbarMain
    search: 'Search',
    searchRole: (title: string) => `for ${title || 'rows'}`,
    buttonRole: 'button',
    menuRole: 'menu',
    menuItemRole: 'menu item',

    // Skin component texts: toolbarSearch
    searchField: 'Search in table',
    back: 'Back',
    clear: 'Clear',

    // Skin tags texts
    noItems: 'No data',
    ...resolved
  };
}

/**
 * The fields of an object of texts without the undefined ones, which leave the texts below them.
 * @param texts - the texts, or none
 */
function defined(texts: object = {}): Record<string, unknown> {
  return Object.fromEntries(Object.entries(texts).filter(([, value]) => value !== undefined));
}

function deepCopy<T extends object>(object: T): T {
  if (!isObject(object)) {
    return object;
  }

  const copy: Record<string, unknown> = {};

  for (const key of Object.keys(object)) {
    const value = object[key];

    if (isObject(value)) {
      // Recursively copy nested plain object
      copy[key] = deepCopy(value);
    } else {
      // Assign value directly (arrays, primitives, etc. are kept as-is)
      copy[key] = value;
    }
  }

  return <T>copy;
}

function merge<T extends object>(target: T, ...sources: object[]): T {
  const into = <Record<string, unknown>>target;

  for (const src of sources) {
    if (!isObject(src)) {
      continue;
    }

    for (const key of Object.keys(src)) {
      const srcValue = src[key];
      const targetValue = into[key];

      if (isObject(srcValue) && isObject(targetValue)) {
        merge(targetValue, srcValue);
      } else {
        into[key] = isObject(srcValue) ? {...srcValue} : srcValue;
      }
    }
  }

  return target;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
