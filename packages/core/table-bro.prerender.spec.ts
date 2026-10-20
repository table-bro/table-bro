import {describe, expect, it, vi} from 'vitest';

import {isPrerendered, prerenderTableBro, registerSkin} from './index';
import type {BroSkinConfig}                             from './types/table-bro';

/** A skin of elements that nobody defines, as a server DOM has them. */
const skin = <BroSkinConfig><unknown>{
  css: {shadow: {className: 'test-shadow'}},
  components: {
    button: {selector: 'test-button', iconSelector: '.test-icon', beforeRender: () => undefined},
    filterDrawer: {},
    paginator: {selector: 'test-paginator'},
    progressBar: {selector: 'test-progress-bar'},
    sortHeader: {selector: 'test-sort-header', contentSelector: '.test-sort-header-content'},
    state: {states: {loading: ['⏳', 'Loading'], 'no-data': ['∅', 'No data'], 'not-found': ['∅', 'No records found'], fail: ['!', 'Failed']}},
    textEllipsis: {selector: 'test-text-ellipsis'},
    toolbar: {selector: 'test-toolbar'},
    toolbarMain: {selector: 'test-toolbar-main'}
  }
};

/**
 * A <table-bro> element of a document without a window, as of a server DOM: it has no layout and no custom elements.
 */
function serverElement(): HTMLElement {
  const serverDocument = document.implementation.createHTMLDocument();
  const element = serverDocument.createElement('table-bro');

  serverDocument.body.append(element);

  return element;
}

describe('prerenderTableBro', () => {
  registerSkin('test-prerender', skin);

  it('renders the loading state with the heights of the skin in CSS and marks the table', () => {
    const element = serverElement();

    prerenderTableBro(element, {cols: [{title: 'Name', name: 'name'}], conf: {skin: 'test-prerender', toolbarTitle: 'Names', pageSize: 10}});

    expect(element.classList.contains('test-prerender')).toBe(true);
    expect(element.querySelector('test-toolbar-main')?.getAttribute('title')).toBe('Names');
    expect([...element.querySelectorAll('test-sort-header')].map(header => header.getAttribute('header-title'))).toEqual(['No', 'Name']);
    expect(element.querySelector('.bro-state-message')?.textContent).toBe('Loading');
    expect(element.querySelector<HTMLElement>('.bro-table-body_container')?.style.height).toBe('calc(var(--bro-row-height) * 10 + var(--bro-shadow-size) * 2)');
    expect(element.querySelector<HTMLElement>('.bro-state')?.parentElement?.style.height).toBe('calc(var(--bro-row-height) * 10)');
    expect(element.querySelector('test-paginator')).not.toBeNull();
    expect(isPrerendered(<Element>element.querySelector('test-sort-header'))).toBe(true);
  });

  it('keeps the theme of the page with the theme auto: the server knows no theme of the system', () => {
    const element = serverElement();

    prerenderTableBro(element, {cols: [{title: 'Name', name: 'name'}], conf: {skin: 'test-prerender'}});

    expect([...element.classList].filter(name => name.endsWith('-theme'))).toEqual([]);
  });

  it('creates the nodes of the table in the document of the element: a server DOM needs no global document', () => {
    const element = serverElement();
    const created = [vi.spyOn(document, 'createElement'), vi.spyOn(document, 'createTextNode')];
    let calls: number[];

    try {
      prerenderTableBro(element, {cols: [{title: 'Name', name: 'name'}], conf: {skin: 'test-prerender', toolbarTitle: 'Names'}});
    } finally {
      calls = created.map(spy => spy.mock.calls.length);
      created.forEach(spy => spy.mockRestore());
    }

    expect(calls).toEqual([0, 0]);
    expect(element.querySelector('.bro-state-message')?.textContent).toBe('Loading');
  });

  it('gives a table without shadows no room for them', () => {
    const element = serverElement();

    prerenderTableBro(element, {cols: [{title: 'Name', name: 'name'}], conf: {skin: 'test-prerender', shadowsEnabled: false}});

    expect(element.style.getPropertyValue('--bro-shadow-size')).toBe('0px');
  });

  it('gives the table of the browser the shadow size of the application, not the one of a prerender without shadows', () => {
    const element = document.createElement('table-bro');
    const configure = (shadowsEnabled: boolean) => (<HTMLElement & {configure(options: object): void}>element).configure({cols: [{title: 'Name', name: 'name'}], conf: {skin: 'test-prerender', autoColumnWidth: false, shadowsEnabled}});

    prerenderTableBro(element, {cols: [{title: 'Name', name: 'name'}], conf: {skin: 'test-prerender', shadowsEnabled: false}});
    document.body.append(element);

    configure(false);
    expect(element.style.getPropertyValue('--bro-shadow-size')).toBe('0px');

    configure(true);
    expect(element.style.getPropertyValue('--bro-shadow-size')).toBe('');

    element.remove();
  });

  it('leaves the table to configure() in the browser, which renders it in place of the prerender', () => {
    const element = document.createElement('table-bro');
    const options = {cols: [{title: 'Name', name: 'name'}], conf: {skin: 'test-prerender', autoColumnWidth: false}};

    prerenderTableBro(element, options);
    document.body.append(element);

    (<HTMLElement & {configure(options: object): void}>element).configure(options);

    expect(element.hasAttribute('data-bro-prerender')).toBe(false);
    expect(isPrerendered(<Element>element.querySelector('test-sort-header'))).toBe(false);
    expect(element.querySelectorAll('test-toolbar-main')).toHaveLength(1);

    element.remove();
  });

  it('continues the CSS animations of the prerender, as of its progress bar, in the table of the browser', () => {
    const style = document.createElement('style');
    const element = document.createElement('table-bro');
    const options = {cols: [{title: 'Name', name: 'name'}], conf: {skin: 'test-prerender', autoColumnWidth: false}};

    style.textContent = '@keyframes test-progress { to { opacity: 0; } } test-progress-bar { display: block; animation: test-progress 2s infinite; }';
    document.head.append(style);
    prerenderTableBro(element, options);
    document.body.append(element);

    // The progress bar of the prerender has run since the first paint of the page
    const [prerenderAnimation] = element.getAnimations({subtree: true});
    const startTime = <number>document.timeline.currentTime - 700;

    prerenderAnimation.startTime = startTime;

    (<HTMLElement & {configure(options: object): void}>element).configure(options);

    const [animation] = element.getAnimations({subtree: true});

    expect(animation).not.toBe(prerenderAnimation);
    expect((<CSSAnimation>animation).animationName).toBe('test-progress');
    expect(animation.startTime).toBe(startTime);

    element.remove();
    style.remove();
  });
});
