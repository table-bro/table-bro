import '@angular/compiler';
import {ApplicationInitStatus, EnvironmentInjector, PLATFORM_ID, provideZonelessChangeDetection} from '@angular/core';
import {TestBed}                                                                                 from '@angular/core/testing';
import {BrowserTestingModule, platformBrowserTesting}                                            from '@angular/platform-browser/testing';

import {type BroActionDetail, dispatchAction, events, registerSkin, resolveTexts} from '@table-bro/core';

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {BroMaterialSortHeaderComponent}                                from './bro-sort-header.material.component';
import {BroMaterialTagsComponent}                                      from './bro-tags.material.component';
import {defineTableBroMatElements}                                     from './define-table-bro-mat-elements';
import {provideTableBroMatSkin, withSwitch, withTags, withToolbarMenu} from './provide-table-bro-mat-skin';
import {TableBroFilterDrawerContainerNg}                               from './table-bro-filter-drawer-container-ng';
import {matSkinConfig}                                                 from './table-bro.angular-material.config';

// The real registry of the skins, with the calls of the skin seen
vi.mock('@table-bro/core', async importOriginal => {
  const core = await importOriginal<typeof import('@table-bro/core')>();

  return {...core, registerSkin: vi.fn(core.registerSkin)};
});

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());

beforeEach(() => {
  TestBed.configureTestingModule({providers: [provideZonelessChangeDetection()]});
});

// Vitest has no hooks of Angular: the test module and the mocks are reset here
afterEach(() => {
  TestBed.resetTestingModule();
  vi.restoreAllMocks();
});

describe('defineTableBroMatElements', () => {
  const names = ['ng-mat-paginator', 'ng-mat-progress-bar', 'ng-mat-toolbar', 'bro-mat-button', 'bro-mat-tags', 'bro-mat-slide-toggle', 'bro-mat-sort-header', 'bro-mat-toolbar-main', 'bro-mat-toolbar-more', 'bro-mat-text-ellipsis'];
  const features = () => Object.assign({}, ...[withTags(), withSwitch(), withToolbarMenu()].map(feature => feature.elements));

  it('defines the elements of the skin and of its features in the browser only, each one once; an element passes a move and goes on its removal', async () => {
    TestBed.overrideProvider(PLATFORM_ID, {useValue: 'server'});
    defineTableBroMatElements(TestBed.inject(EnvironmentInjector), features());
    expect(names.filter(name => customElements.get(name))).toEqual([]);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({providers: [provideZonelessChangeDetection()]});

    const injector = TestBed.inject(EnvironmentInjector);

    defineTableBroMatElements(injector, features());
    // All of them are Angular elements, none reports a missing feature
    expect(names.filter(name => !('ngElementStrategy' in document.createElement(name)))).toEqual([]);
    expect(() => defineTableBroMatElements(injector, features())).not.toThrow();

    // A move, as a sort moves the rows, neither disconnects the Angular element nor connects it again
    const el = <HTMLElement & {ngElementStrategy: {connect(element: HTMLElement): void; disconnect(): void}}>document.createElement('bro-mat-text-ellipsis');
    const from = document.body.appendChild(document.createElement('div'));
    const to = document.body.appendChild(document.createElement('div'));

    from.append(el);

    const connect = vi.spyOn(el.ngElementStrategy, 'connect');
    const disconnect = vi.spyOn(el.ngElementStrategy, 'disconnect');

    to.append(el);
    await Promise.resolve();

    expect([connect.mock.calls.length, disconnect.mock.calls.length]).toEqual([0, 0]);

    el.remove();
    await Promise.resolve();

    expect([connect.mock.calls.length, disconnect.mock.calls.length]).toEqual([0, 1]);
    from.remove();
    to.remove();
  });
});

describe('provideTableBroMatSkin', () => {
  it('registers the skin and defines its elements when the application starts', async () => {
    TestBed.configureTestingModule({providers: [provideTableBroMatSkin()]});
    await TestBed.inject(ApplicationInitStatus).donePromise;

    expect(registerSkin).toHaveBeenCalledWith('mat', matSkinConfig);
    expect(customElements.get('bro-mat-sort-header')).toBeDefined();
  });
});

describe('BroMaterialTagsComponent', () => {
  it('shows the items of the field of the column as chips, and the text of the config without items', async () => {
    const fixture = TestBed.createComponent(BroMaterialTagsComponent);
    const chips = () => Array.from(<NodeListOf<HTMLElement>>fixture.nativeElement.querySelectorAll('mat-chip')).map(chip => chip.textContent!.trim());

    fixture.componentRef.setInput('col', {title: 'Tags', name: 'tags'});
    fixture.componentRef.setInput('row', {tags: ['<i>a</i>', 'b']});
    fixture.componentRef.setInput('config', {texts: resolveTexts({noItems: 'Nothing'})});
    await fixture.whenStable();

    expect(chips()).toEqual(['<i>a</i>', 'b']);

    fixture.componentRef.setInput('row', {tags: []});
    await fixture.whenStable();

    expect(chips()).toEqual(['Nothing']);
  });
});

describe('BroMaterialSortHeaderComponent', () => {
  it('sends the sort of its column from descending without aria-sort of its own, and a sort of another column resets its arrow', async () => {
    const fixture = TestBed.createComponent(BroMaterialSortHeaderComponent);
    const sorts: unknown[] = [];

    fixture.componentRef.setInput('header-title', 'Name');
    fixture.componentRef.setInput('sort-id', 'name');
    await fixture.whenStable();

    fixture.nativeElement.addEventListener(events.actionEvent, (event: CustomEvent<BroActionDetail>) => sorts.push(event.detail.data));

    const header = fixture.nativeElement.querySelector('.mat-sort-header');

    header.click();
    header.click();
    header.click();

    expect(sorts).toEqual([{sortKey: 'name', sortDirection: 'desc'}, {sortKey: 'name', sortDirection: 'asc'}, {sortKey: 'name', sortDirection: undefined}]);

    header.click();
    fixture.componentRef.setInput('activeSort', {sortKey: 'name', sortDirection: 'desc'});
    await fixture.whenStable();
    expect(fixture.componentInstance.matSortDirection()).toBe('desc');
    // The header cell of the table carries aria-sort, the element of Material inside it does not
    expect(header.hasAttribute('aria-sort')).toBe(false);

    fixture.componentRef.setInput('activeSort', {sortKey: 'title', sortDirection: 'asc'});
    await fixture.whenStable();
    expect(fixture.componentInstance.matSortDirection()).toBe('');
  });
});

describe('TableBroFilterDrawerContainerNg', () => {
  beforeEach(() => {
    // The table renders no skin here: its methods are replaced
    const prototype = <Record<string, () => void>>customElements.get('table-bro')!.prototype;

    for (const method of ['configure', 'replaceRows', 'appendRows', 'setState']) {
      vi.spyOn(prototype, method).mockImplementation((): void => undefined);
    }
  });

  it('opens by the Filters button of the table, closes by its own, and takes the texts and the theme of the table', async () => {
    const fixture = TestBed.createComponent(TableBroFilterDrawerContainerNg);
    const actions: string[] = [];

    fixture.componentRef.setInput('cols', [{title: 'Name', name: 'name'}]);
    fixture.componentRef.setInput('rows', [{name: 'a'}]);
    fixture.componentRef.setInput('conf', {skin: 'mat', texts: {filters: 'Order filters', close: 'Close the filters'}});
    fixture.componentInstance.action.subscribe(action => actions.push(action.action));
    await fixture.whenStable();

    const element: HTMLElement = fixture.nativeElement;
    const table = element.querySelector('table-bro')!;
    const close = element.querySelector<HTMLElement>('.bro-filter-drawer-close')!;

    expect(element.querySelector('.bro-filter-drawer-title')!.textContent).toBe('Order filters');
    expect(close.getAttribute('aria-label')).toBe('Close the filters');

    dispatchAction(table, events.filtersToggleEvent);
    await fixture.whenStable();

    expect(fixture.componentInstance.opened()).toBe(true);
    expect(actions).toContain(events.filtersToggleEvent);

    close.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.opened()).toBe(false);

    // The drawer is a sibling of the table: the container, with the class of the skin, follows the class of the theme
    // of the table host, as the drawer of the core does
    table.classList.add('bro-dark-theme');
    await new Promise(resolve => setTimeout(resolve));
    await fixture.whenStable();

    expect([...element.classList]).toEqual(['mat', 'bro-dark-theme']);
  });
});
