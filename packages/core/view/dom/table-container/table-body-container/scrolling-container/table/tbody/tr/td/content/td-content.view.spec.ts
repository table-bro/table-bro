import {describe, expect, it, vi} from 'vitest';

import {BroDom}                                from '../../../../../../../../../../shared/dom';
import {registerSkin}                          from '../../../../../../../../../../shared/skins';
import type {BroContext}                       from '../../../../../../../../../../types/context';
import type {BroResolvedConfig, BroSkinConfig} from '../../../../../../../../../../types/table-bro';
import {BroTdContent}                          from './td-content.view';

describe('BroTdContent', () => {
  it('names in the console, once for each tag, the function of an optional element of the skin that is not defined', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    registerSkin('nv', <BroSkinConfig>{elements: {'test-tags': 'withTags'}});

    const ctx = <BroContext><unknown>{config: <BroResolvedConfig>{skin: 'nv'}, dom: new BroDom(document)};
    const cell = (name: string, selector: string) => <HTMLElement>new BroTdContent(ctx, {title: name, name, component: {selector}}, {[name]: 'a'}).render();

    cell('labels', 'test-tags');
    cell('categories', 'test-tags');
    // An element of the page, which the skin does not name, is no optional element
    cell('own', 'test-own');

    customElements.define('test-defined', class extends HTMLElement {});
    registerSkin('nv', <BroSkinConfig>{elements: {'test-tags': 'withTags', 'test-defined': 'withSwitch'}});
    cell('defined', 'test-defined');

    expect(error.mock.calls).toEqual([['Table, Bro: the column "labels" uses the element test-tags: call withTags() after the import of the skin']]);
    error.mockRestore();
  });
});
