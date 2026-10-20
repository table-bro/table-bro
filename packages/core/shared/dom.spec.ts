import {describe, expect, it} from 'vitest';

import {BroDom} from './dom';

describe('BroDom', () => {
  it('creates the nodes in its document, not in the global one', () => {
    const other = document.implementation.createHTMLDocument('server');
    const dom = new BroDom(other);
    const nodes = [dom.createElement('div'), dom.createTextNode('a'), dom.createTemplate('<b>a</b>')];

    expect(nodes.map(node => node.ownerDocument === other)).toEqual([true, true, true]);
    // The element of markup comes from the content of a template of that document
    expect(dom.createFromHTML('<b>a</b>').ownerDocument).not.toBe(document);
  });

  it('gives the first element of markup without the whitespace around it', () => {
    const element = new BroDom(document).createFromHTML('\n  <span class="a">text</span>  ');

    expect([element.tagName, element.className, element.textContent]).toEqual(['SPAN', 'a', 'text']);
  });
});
