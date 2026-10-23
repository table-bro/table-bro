import {describe, expect, it} from 'vitest';

import type {BroConfig, BroSkinConfig} from '../types/table-bro';
import {resolveConfig, resolveTexts}   from './config';

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
});

describe('resolveTexts', () => {
  it('leaves the text below an undefined one, the English one', () => {
    const texts = resolveTexts({search: undefined, pagination: 'Pages', states: {fail: 'Error', loading: undefined}});

    expect([texts.search, texts.pagination]).toEqual(['Search', 'Pages']);
    expect(texts.states).toEqual({fail: 'Error'});
    // The config of a table goes through the same texts
    expect(resolveConfig(<BroSkinConfig>{}, {skin: 'nv', texts: {search: undefined}}).texts.search).toBe('Search');
  });
});
