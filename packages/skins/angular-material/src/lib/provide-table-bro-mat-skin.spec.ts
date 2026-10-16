import '@angular/compiler';
import {ApplicationInitStatus, provideZonelessChangeDetection} from '@angular/core';
import {TestBed}                                               from '@angular/core/testing';
import {BrowserTestingModule, platformBrowserTesting}          from '@angular/platform-browser/testing';

import {afterEach, describe, expect, it, vi} from 'vitest';

import {provideTableBroMatSkin} from './provide-table-bro-mat-skin';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());

const optional = ['bro-mat-tags', 'bro-mat-slide-toggle', 'bro-mat-toolbar-more'];

/**
 * Starts an application with the skin without features.
 * @param devMode - the value of ngDevMode, which the production build of the application sets to false
 */
async function start(devMode: boolean): Promise<void> {
  const global = <{ngDevMode?: unknown}>globalThis;
  const ngDevMode = global.ngDevMode;

  TestBed.configureTestingModule({providers: [provideZonelessChangeDetection(), provideTableBroMatSkin()]});

  global.ngDevMode = devMode ? ngDevMode : false;

  try {
    await TestBed.inject(ApplicationInitStatus).donePromise;
  } finally {
    global.ngDevMode = ngDevMode;
  }
}

afterEach(() => {
  TestBed.resetTestingModule();
  vi.restoreAllMocks();
});

// One file for both modes: the registry of the elements is one for the page, the production mode goes first
describe('provideTableBroMatSkin without features', () => {
  it('in production defines the elements of every table and leaves the optional elements undefined', async () => {
    await start(false);

    expect(customElements.get('bro-mat-sort-header')).toBeDefined();
    expect(optional.filter(name => customElements.get(name))).toEqual([]);
  });

  it('in the dev mode defines the optional elements as ones that report their missing features, once per column and once for the toolbar', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await start(true);

    // The table gives a cell element its column before it connects it; the toolbar gives the menu no column
    for (const [tag, name] of [['bro-mat-tags', 'tags'], ['bro-mat-tags', 'tags'], ['bro-mat-slide-toggle', 'done'], ['bro-mat-toolbar-more', ''], ['bro-mat-toolbar-more', '']]) {
      document.body.append(Object.assign(document.createElement(tag), name ? {col: {title: name, name}} : {}));
    }

    expect(error.mock.calls).toEqual([
      ['Table, Bro: the column "tags" uses the element tags: add withTags() to provideTableBroMatSkin()'],
      ['Table, Bro: the column "done" uses the element switch: add withSwitch() to provideTableBroMatSkin()'],
      ['Table, Bro: the toolbar uses the element toolbar menu: add withToolbarMenu() to provideTableBroMatSkin()']
    ]);

    document.body.replaceChildren();
  });
});
