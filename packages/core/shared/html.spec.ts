import {describe, expect, it} from 'vitest';

import {BroHTML, classAttr} from './html';

describe('BroHTML.escape', () => {
  it('gives a text that a template shows as it is, in the content and in a quoted attribute', () => {
    expect(BroHTML.escape('<b>"Tom" & \'Jerry\'</b>')).toBe('&#60;b&#62;&#34;Tom&#34; &#38; &#39;Jerry&#39;&#60;/b&#62;');
    expect(BroHTML.escape(undefined)).toBe('');
    expect(BroHTML.escape(null)).toBe('');
  });
});

describe('BroHTML.text', () => {
  it('gives the text of markup', () => {
    expect(BroHTML.text('<b>a</b> &amp; <i>b</i><img src="x" onerror="alert(1)">')).toBe('a & b');
  });
});

describe('classAttr', () => {
  it('gives the escaped classes that have a value, and no attribute without them', () => {
    expect(classAttr('table', undefined, '', 'a"b')).toBe('class="table a&#34;b"');
    expect(classAttr(undefined, '')).toBe('');
  });
});
