import fs from 'node:fs';

import {describe, expect, it} from 'vitest';

import {cssVariables}        from '../spec/css-variables.js';
import {tableBroVersion}     from '../version.js';
import {getDocs, getStarted} from './docs.js';
import {topics}              from './topics.js';

describe('the reference', () => {
  it('describes the version of the package', () => {
    const manifest = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));

    expect(tableBroVersion).toBe(manifest.version);
    expect(getDocs()).toMatch(new RegExp(`^_table-bro ${tableBroVersion}_`));
  });

  it('lists the topics and gives one by its name', () => {
    const list = getDocs();

    topics.forEach(topic => expect(list).toContain(`\`${topic.name}\``));

    const css = getDocs({topic: 'css-variables'});

    cssVariables.forEach(variable => expect(css).toContain(variable.name));
    expect(getDocs({topic: 'tables'})).toContain('No topic tables');
  });

  it('finds the topics of a query', () => {
    expect(getDocs({query: 'filter drawer of the bs skin'})).toContain('# Filters and the Filter Drawer');
  });

  it('weighs a rare word of a query more than a common one', () => {
    // The two topics of the height of a row: the page of Docs and the reference of its variable, none of the many topics of rows
    expect(getDocs({query: 'row height'})).toMatch(/^_[^\n]+_\n\n# Fixed row height\n[^]+\n# The CSS variables\n/);
    expect(getDocs({query: 'register skin'})).toMatch(/^_[^\n]+_\n\n# The setup of a project\n/);
  });

  it('gives a minimal table for the target and the skin of a project', () => {
    const angular = getStarted({target: 'angular', skin: 'mat'});

    expect(angular).toContain('npm install @table-bro/core @table-bro/angular @table-bro/angular-material @angular/elements');
    expect(angular).toContain('<table-bro-ng class="bro-table-shadow-container" tableId="product-table"');

    expect(getStarted({target: 'vanilla', skin: 'nv'})).toContain('export function renderProductTable(container: HTMLElement): TableBroHTMLElement {');
  });

  it('names no paid module', () => {
    // The island space is a variable of the core: the Filter Drawer stands this far from the table
    const texts = [getStarted(), ...topics.map(topic => topic.text())].join('\n').replaceAll('--bro-island-space-size', '');

    expect(texts).not.toMatch(/island|rowDetailsIsland|table-bro-extended/i);
  });
});
