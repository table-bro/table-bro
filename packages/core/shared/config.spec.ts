import {describe, expect, it} from 'vitest';

import type {BroConfig, BroCoreTexts, BroSkinConfig, BroTextGroupName, BroTextGroups, BroTexts, BroTextsConfig} from '../types/table-bro';
import {resolveConfig, resolveTexts}                                                                            from './config';

describe('resolveConfig', () => {
  it('gives an empty title to a config without one', () => {
    expect(resolveConfig(<BroSkinConfig>{}).toolbarTitle).toBe('');
    expect(resolveConfig(<BroSkinConfig>{}, {skin: 'nv', toolbarTitle: 'Orders'}).toolbarTitle).toBe('Orders');
  });

  it('gives a table without shadows no class of the shadow, in its own copy of the config of the skin', () => {
    const skin = <BroSkinConfig>{css: {shadow: {className: 'mat-elevation-z8'}}};

    expect(resolveConfig(skin, {skin: 'mat', shadowsEnabled: false}).css.shadow).toBeUndefined();
    expect(resolveConfig(skin, {skin: 'mat'}).css.shadow?.className).toBe('mat-elevation-z8');
    expect(skin.css.shadow?.className).toBe('mat-elevation-z8');
  });

  it('changes neither the config of the application nor the one of the skin', () => {
    const skin = <BroSkinConfig>{css: {table: {className: 'mat-table'}, shadow: {className: 'mat-elevation-z8'}}};
    const app = <BroConfig>{skin: 'mat', pageSize: 10, texts: {noItems: 'Nothing'}, css: {table: {className: 'orders'}}};
    const before = JSON.stringify([skin, app]);

    const config = resolveConfig(skin, app);

    expect(JSON.stringify([skin, app])).toBe(before);
    expect(config.css.table?.className).toBe('orders');
    expect(config.texts.noItems).toBe('Nothing');
  });

  it('takes the groups of the texts of a config into its flat texts', () => {
    const app: BroConfig = {skin: 'nv', texts: {toolbarMain: {search: 'Find'}, paginator: {nextPageLabel: 'Go to next page'}, state: {fail: 'Error'}}};

    const config = resolveConfig(<BroSkinConfig>{}, app);

    expect(config.texts.search).toBe('Find');
    expect(config.texts.nextPage).toBe('Go to next page');
    expect(config.texts.previousPage).toBe('Previous page');
    expect(config.texts.states).toEqual({fail: 'Error'});
    expect(Object.keys(config.texts)).toEqual(Object.keys(resolveTexts()));
  });
});

describe('resolveTexts', () => {
  it('takes the flat texts of 1.1.0 over the English ones', () => {
    const texts = resolveTexts({search: 'Find', itemsPerPage: 'Rows per page:', states: {'no-data': 'Nothing here'}});

    expect(texts.search).toBe('Find');
    expect(texts.itemsPerPage).toBe('Rows per page:');
    expect(texts.states).toEqual({'no-data': 'Nothing here'});
    expect(texts.close).toBe('Close');
  });

  it('takes each field of each group and each text of the core into its flat field, without the groups', () => {
    const range = (): string => 'Page';
    const texts = resolveTexts({
      rowCounterTitle: 'Num.',
      rowCounterLabel: 'Line number',
      rowDetailsLoadingMessage: 'Fetching details',
      toolbarMain: {search: 'Find', searchRole: () => 'in the table', buttonRole: 'action', menuRole: 'dropdown', menuItemRole: 'dropdown item'},
      toolbarSearch: {field: 'Find in table', back: 'Return', clear: 'Erase'},
      filterDrawer: {title: 'Refine', close: 'Dismiss'},
      paginator: {
        label: 'Pages', navigationLabel: 'Page links', itemsPerPageLabel: 'Rows per page:',
        firstPageLabel: 'Go to first page', previousPageLabel: 'Go to previous page', nextPageLabel: 'Go to next page', lastPageLabel: 'Go to last page',
        firstText: 'Start', previousText: 'Return', nextText: 'Forward', lastText: 'End', getRangeLabel: range
      },
      progressBar: {label: 'Load progress'},
      state: {'no-data': 'Nothing here'}
    });
    const english = resolveTexts();

    expect([texts.rowCounter, texts.rowCounterName]).toEqual(['Num.', 'Line number']);
    expect([texts.search, texts.searchRole('Orders'), texts.buttonRole, texts.menuRole, texts.menuItemRole]).toEqual(['Find', 'in the table', 'action', 'dropdown', 'dropdown item']);
    expect([texts.searchField, texts.back, texts.clear]).toEqual(['Find in table', 'Return', 'Erase']);
    expect([texts.filters, texts.close]).toEqual(['Refine', 'Dismiss']);
    expect([texts.pagination, texts.pageNavigation, texts.itemsPerPage]).toEqual(['Pages', 'Page links', 'Rows per page:']);
    expect([texts.firstPage, texts.previousPage, texts.nextPage, texts.lastPage]).toEqual(['Go to first page', 'Go to previous page', 'Go to next page', 'Go to last page']);
    expect([texts.first, texts.previous, texts.next, texts.last, texts.rangeLabel]).toEqual(['Start', 'Return', 'Forward', 'End', range]);
    expect([texts.loadingProgress, texts.states, texts.detailsLoading]).toEqual(['Load progress', {'no-data': 'Nothing here'}, 'Fetching details']);
    expect(Object.keys(texts)).toEqual(Object.keys(english));
    // The groups and the texts of the core hold every text of the table but noItems of the tags, at the top level
    expect(Object.keys(texts).filter(key => texts[<keyof BroTexts>key] === english[<keyof BroTexts>key])).toEqual(['noItems']);
  });

  it('takes a field of a group over its flat field, in a config of both forms', () => {
    const texts = resolveTexts({filters: 'Filter panel', close: 'Shut', search: 'Look up', filterDrawer: {title: 'Refine'}, noItems: 'Empty'});

    expect(texts.filters).toBe('Refine');
    expect(texts.close).toBe('Shut');
    expect(texts.search).toBe('Look up');
    expect(texts.noItems).toBe('Empty');
  });

  it('takes a text of the core over its deprecated flat field, and leaves the default without either', () => {
    const texts = resolveTexts({rowCounter: '#', rowCounterTitle: 'Num.', detailsLoading: 'Fetching'});

    expect([texts.rowCounter, texts.detailsLoading, texts.rowCounterName]).toEqual(['Num.', 'Fetching', 'Row number']);
    expect(Object.keys(texts)).toEqual(Object.keys(resolveTexts()));
  });

  it('leaves the text below an undefined one: the flat field, or the English one', () => {
    const texts = resolveTexts({
      search: undefined,
      pagination: 'Pages',
      paginator: {label: undefined, nextPageLabel: undefined},
      rowCounter: '#',
      rowCounterTitle: undefined,
      rowDetailsLoadingMessage: undefined,
      states: {fail: 'Error', loading: undefined},
      state: {fail: undefined}
    });

    expect([texts.search, texts.pagination, texts.nextPage]).toEqual(['Search', 'Pages', 'Next page']);
    expect([texts.rowCounter, texts.detailsLoading]).toEqual(['#', 'Loading details']);
    expect(texts.states).toEqual({fail: 'Error'});
    // The config of a table goes through the same texts
    expect(resolveConfig(<BroSkinConfig>{}, {skin: 'nv', texts: {search: undefined, toolbarSearch: {field: undefined}}}).texts.searchField).toBe('Search in table');
    expect(resolveConfig(<BroSkinConfig>{}, {skin: 'nv', texts: {search: undefined}}).texts.search).toBe('Search');
  });

  it('takes the message of a state of the group state over the flat one, and keeps the other flat messages', () => {
    const texts = resolveTexts({states: {'no-data': 'Empty', fail: 'Error'}, state: {'no-data': 'Nothing here'}});

    expect(texts.states).toEqual({'no-data': 'Nothing here', fail: 'Error'});
  });

  it('changes one field of a group and keeps the other fields of its part', () => {
    const texts = resolveTexts({paginator: {nextText: 'Forward'}});

    expect(texts.next).toBe('Forward');
    expect([texts.previous, texts.nextPage, texts.pagination]).toEqual(['Previous', 'Next page', 'Pagination']);
  });

  it('takes the range of the paginator from its group', () => {
    const texts = resolveTexts({rangeLabel: () => 'flat', paginator: {getRangeLabel: (page, pageSize, length) => `${page * pageSize + 1} out of ${length}`}});

    expect(texts.rangeLabel(1, 5, 20)).toBe('6 out of 20');
    expect(resolveTexts().rangeLabel(1, 5, 20)).toBe('6 – 10 of 20');
  });

  // The type check of the core compiles this spec: the texts of 1.1.0 keep their types, and a wrong name fails
  it('keeps the types of the flat texts and finds a wrong name in a group', () => {
    const flat: Partial<BroTexts> = {rowCounter: '#', rangeLabel: (page, pageSize, length) => `${page} ${pageSize} ${length}`, states: {'no-data': 'None'}};
    const config: BroConfig = {skin: 'nv', texts: flat};
    const back: Partial<BroTexts> | undefined = config.texts;
    const resolve: (texts?: Partial<BroTexts>) => BroTexts = resolveTexts;
    const groups: BroTextGroups = {paginator: {itemsPerPageLabel: 'Rows per page:'}};
    const grouped: BroConfig = {skin: 'nv', texts: {...groups, state: {}}};
    // @ts-expect-error: no field itemsPerPag in the group paginator
    const fieldOfGroup: BroConfig = {skin: 'nv', texts: {paginator: {itemsPerPag: 'x'}}};
    // @ts-expect-error: the group paginator names its fields without the flat names
    const flatInGroup: BroConfig = {skin: 'nv', texts: {paginator: {itemsPerPage: 'x'}}};
    // @ts-expect-error: no flat field serch
    const flatField: BroConfig = {skin: 'nv', texts: {serch: 'x'}};
    // @ts-expect-error: no group cells
    const group: BroConfig = {skin: 'nv', texts: {cells: {noItems: 'x'}}};

    // A config still has every flat field of BroTexts
    type ConfigFields = Exclude<keyof BroTextsConfig, BroTextGroupName | keyof BroCoreTexts>;

    const configFields: [ConfigFields, keyof BroTexts] extends [keyof BroTexts, ConfigFields] ? true : never = true;

    expect(configFields).toBe(true);
    expect(resolve(back).rowCounter).toBe('#');
    expect(resolveTexts(grouped.texts).itemsPerPage).toBe('Rows per page:');
    expect([fieldOfGroup, flatInGroup, flatField, group].map(({texts}) => Object.keys(texts ?? {}))).toEqual([['paginator'], ['paginator'], ['serch'], ['cells']]);
  });
});
