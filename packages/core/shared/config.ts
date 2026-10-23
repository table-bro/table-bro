import type {BroCol, BroConfig, BroResolvedConfig, BroSkinConfig, BroTexts} from '../types/table-bro';

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
  // The texts of the config over the English ones
  resolved.texts = resolveTexts(resolved.texts);

  // A table without shadows gives its regions no class of the shadow
  if (!resolved.shadowsEnabled) {
    delete resolved.css.shadow;
  }

  return resolved;
}

/** The numbers of the range of the paginator, as 1,234. */
const rangeNumber = new Intl.NumberFormat('en-US');

/**
 * The texts of a table: the ones of a config over the English ones. A text that is undefined leaves the English one.
 * The default range is the one of MatPaginatorIntl of Angular Material (MIT), with its numbers formatted.
 * @group Configuration
 */
export function resolveTexts(texts?: Partial<BroTexts>): BroTexts {
  // The fields that are set, and the messages of the states that are set
  const resolved: Record<string, unknown> = {...defined(texts), states: defined(texts?.states)};

  return {
    rowCounter: 'No',
    rowCounterName: 'Row number',
    filters: 'Filters',
    close: 'Close',
    pagination: 'Pagination',
    pageNavigation: 'Table page navigation',
    itemsPerPage: 'Items per page:',
    firstPage: 'First page',
    previousPage: 'Previous page',
    nextPage: 'Next page',
    lastPage: 'Last page',
    first: 'First',
    previous: 'Previous',
    next: 'Next',
    last: 'Last',
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
    loadingProgress: 'Loading progress',
    states: {},
    search: 'Search',
    searchRole: (title: string) => `for ${title || 'rows'}`,
    buttonRole: 'button',
    menuRole: 'menu',
    menuItemRole: 'menu item',
    searchField: 'Search in table',
    back: 'Back',
    clear: 'Clear',
    noItems: 'No data',
    detailsLoading: 'Loading details',
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
