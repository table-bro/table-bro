import fs              from 'node:fs';
import path            from 'node:path';
import {fileURLToPath} from 'node:url';

import ts                     from 'typescript';
import {describe, expect, it} from 'vitest';

import {docPages}                              from '../docs/pages.js';
import {topics}                                from '../docs/topics.js';
import {setupSteps}                            from '../generate/setup.js';
import {cssVariables}                          from './css-variables.js';
import {specSchema}                            from './schema.js';
import {skinCallbacks, skinCallbacksElsewhere} from './skin-config.js';

// The knowledge of the MCP about Table, Bro is written by hand: these tests compare it with the sources of the library
// and fail when one of them changes without the other. A part that the MCP leaves out stands in a list with its reason.

/** The sources of Table, Bro in this repository. */
const root = fileURLToPath(new URL('../../../../', import.meta.url));
const core = path.join(root, 'packages/core');
const styles = path.join(root, 'packages/core/styles');

const read = (file: string): string => fs.readFileSync(file, 'utf8');

/**
 * The TypeScript sources of a package, without its specs, builds and dependencies.
 * @param folder - the folder of the package
 */
const sourceFiles = (folder: string): string[] => (<string[]>fs.readdirSync(folder, {recursive: true}))
  .filter(file => file.endsWith('.ts') && !file.endsWith('.spec.ts') && !file.endsWith('.d.ts') && !/(^|\/)(node_modules|dist)\//.test(file))
  .map(file => path.join(folder, file));
const topicText = (name: string): string => topics.find(topic => topic.name === name)!.text();

/** The checker of TypeScript over the types of the core. */
const program = ts.createProgram([path.join(core, 'types/table-bro.ts')], {strict: true, skipLibCheck: true, noEmit: true});
const checker = program.getTypeChecker();

/** An exported interface of the types of the core, as its type. */
function interfaceType(name: string): ts.Type {
  const file = program.getSourceFile(path.join(core, 'types/table-bro.ts'))!;
  const symbol = checker.getSymbolAtLocation(file)!.exports!.get(<ts.__String>name)!;

  return checker.getDeclaredTypeOfSymbol(symbol);
}

describe('the knowledge of the MCP and the sources of Table, Bro', () => {
  it('has the CSS variables that the core registers', () => {
    const left = {
      '--bro-duration-scale': 'a setting of the developer of the page, not of a table: the first version of the MCP leaves it out',
      '--bro-filter-drawer-opened': 'the state of the Filter Drawer, which the drawer writes itself',
      '--bro-filter-drawer-modal': 'the state of the Filter Drawer, which the drawer writes itself'
    };
    const registered = [...read(path.join(styles, '_custom-properties.scss')).matchAll(/@property (--bro-[a-z0-9-]+)/g)].map(match => match[1]);

    expect(cssVariables.map(variable => variable.name).sort()).toEqual(registered.filter(name => !(name in left)).sort());
  });

  it('names the events and the actions of the core', () => {
    const events: Record<string, string> = Object.fromEntries([...read(path.join(core, 'shared/events.ts')).matchAll(/export const (\w+) = '(bro-[a-z-]+)'/g)].map(match => [match[1], match[2]]));
    const text = topicText('events') + topicText('server-mode');
    const left = {
      toolbarEvent: 'the event of the elements of a toolbar, which the table takes',
      toolbarSearchOpenEvent: 'the toolbar tells the table to open its search',
      toolbarSearchCloseEvent: 'the toolbar tells the table to close its search',
      toolbarMoreExportEvent: 'an item of the menu of the demos of the site',
      filtersOpenEvent: 'the Filter Drawer tells its state to its toolbar',
      filtersCloseEvent: 'the Filter Drawer tells its state to its toolbar',
      filtersSortEvent: 'the sort header tells the table its sort',
      detailsServerLoadedEvent: 'the table tells the row details of the server mode to load, through rowDetailsServer',
      detailsServerFailedEvent: 'the row details of the server mode tell the table that their loading failed, in the topic details',
      paginatorPageEvent: 'the paginator tells the table its page',
      themeChangeEvent: 'the theme of a table follows the page or its theme attribute; the generated code does not listen to it'
    };

    // Every name of the reference is an event of the core, and every event of the core is in the reference or left out
    for (const name of new Set([...text.matchAll(/`(bro-[a-z-]+)`/g)].map(match => match[1]))) {
      expect(Object.values(events), name).toContain(name);
    }

    for (const name of [...text.matchAll(/events\.(\w+)/g)].map(match => match[1])) {
      expect(Object.keys(events), name).toContain(name);
    }

    for (const [constant, name] of Object.entries(events)) {
      expect(text.includes(`\`${name}\``) || text.includes(`events.${constant}`) || constant in left, `${constant}: ${name}`).toBe(true);
    }
  });

  it('names the fields of the config of the core', () => {
    const config = checker.getPropertiesOfType(interfaceType('BroConfig')).map(symbol => symbol.name);
    const table = [...topicText('config').matchAll(/^\| `([a-zA-Z.]+)` \|/gm)].map(match => match[1]);
    const left = {
      css: 'the classes of the table, in the topic skin-config',
      components: 'the components of the skin, in the topic skin-config',
      rowDetailsIsland: 'a field of a paid module, which adds it to the reference itself',
      rowDetailsProgressMode: 'the progress of the row details of the server mode; the generator keeps the default',
      stateAnimationEffect: 'the other animation of the states; the generator keeps the default',
      debug: 'the messages of the table for the developer of the page, not for the code of a table',
      debugAnimation: 'the slow motion of the table for the developer of the table'
    };

    for (const field of table) {
      expect(config, field).toContain(field);
    }

    for (const field of config) {
      expect(table.includes(field) || field in left, field).toBe(true);
    }

    // The config of a spec writes only fields of the config of the core
    const specConfig = Object.keys(<object>(<Record<string, Record<string, unknown>>>(<Record<string, unknown>>specSchema['properties'])['config'])['properties']);

    for (const field of specConfig) {
      expect(config, field).toContain(field);
    }
  });

  it('names the texts of the core and their groups', () => {
    const texts = topicText('config').split('\n').find(line => line.startsWith('| `texts` |'))!;
    const named = new Set([...texts.matchAll(/`([a-zA-Z]+)[`(]/g)].map(match => match[1]));
    const groups = checker.getPropertiesOfType(interfaceType('BroTextGroupTexts'));
    // The fields of the group state are the names of the states, which the reference names with the states
    const groupFields = groups.filter(group => group.name !== 'state').flatMap(group => checker.getPropertiesOfType(checker.getTypeOfSymbol(group)).map(symbol => symbol.name));
    const coreTexts = checker.getPropertiesOfType(interfaceType('BroCoreTexts')).map(symbol => symbol.name);
    const fields = checker.getPropertiesOfType(interfaceType('BroTexts')).map(symbol => symbol.name);

    expect(groups.length).toBeGreaterThan(0);
    // Every field of BroTexts has its deprecated flat field, and the reference names its new place
    expect(fields.filter(field => !checker.getPropertiesOfType(interfaceType('BroFlatTexts')).some(symbol => symbol.name === field))).toEqual([]);

    for (const name of [...groups.map(group => group.name), ...groupFields, ...coreTexts]) {
      expect(named.has(name), name).toBe(true);
    }
  });

  it('has the functions of the skin config of the core', () => {
    const components = interfaceType('BroSkinComponents');
    const functions = checker.getPropertiesOfType(components).flatMap(component => {
      const type = checker.getNonNullableType(checker.getTypeOfSymbol(component));

      return checker.getPropertiesOfType(type)
        .filter(item => checker.getNonNullableType(checker.getTypeOfSymbol(item)).getCallSignatures().length)
        .map(item => `components.${component.name}.${item.name}`);
    });

    // The functions that the config of a table cannot change are known with their reasons too
    expect(skinCallbacks.map(callback => callback.path).sort()).toEqual(functions.filter(item => !(item in skinCallbacksElsewhere)).sort());
    expect(Object.keys(skinCallbacksElsewhere).filter(item => !functions.includes(item))).toEqual([]);
  });

  it('sets up the packages and the CSS that the repository builds', () => {
    const folders = ['core', 'angular', 'mcp', 'skins/bootstrap', 'skins/native', 'skins/angular-material'].map(folder => path.join(root, 'packages', folder));
    const manifests = folders.map(folder => ({folder, name: <string>JSON.parse(read(path.join(folder, 'package.json'))).name}));
    const packages = manifests.map(manifest => manifest.name);
    // The CSS of each package: scripts/build-css.mjs builds the entry files of its styles
    const entries = Object.fromEntries(manifests.map(({folder, name}) => [name, (fs.existsSync(path.join(folder, 'styles')) ? fs.readdirSync(path.join(folder, 'styles')) : [])
      .filter(file => /^table-bro[\w.-]*\.scss$/.test(file))
      .map(file => file.replace(/\.scss$/, ''))]));

    for (const target of <const>['angular', 'vanilla']) {
      for (const skin of <const>['mat', 'bs', 'nv']) {
        const code = setupSteps(target, skin, [], ['withTags', 'withSwitch', ...((skin === 'mat') ? <const>['withToolbarMenu'] : [])]).map(step => step.code ?? '').join('\n');

        for (const name of code.match(/@table-bro\/[a-z-]+/g) ?? []) {
          expect(packages, name).toContain(name);
        }

        // The functions of the registration of the skin are exports of its package
        for (const [, names, name] of code.matchAll(/import \{([^}]+)\} from '(@table-bro\/[a-z-]+)'/g)) {
          const sources = sourceFiles(manifests.find(manifest => manifest.name === name)!.folder).map(read).join('\n');

          for (const item of names.split(', ')) {
            expect(sources, `${name}: ${item}`).toMatch(new RegExp(`export (function|const|class) ${item}\\b|export \\{${item}\\}`));
          }
        }

        for (const [, name, file] of code.matchAll(/node_modules\/@table-bro\/([a-z-]+)\/dist\/([a-z.-]+)\.min\.css/g)) {
          expect(entries[`@table-bro/${name}`], file).toContain(file);
        }
      }
    }
  });

  it('defines in the code of Docs only tags with the prefix bro-cell-, which the library leaves to the application', () => {
    const defined = docPages.flatMap(page => page.files.flatMap(file => Array.from(file.code.matchAll(/customElements\.(?:define|get)\(\s*'([a-z0-9-]+)'/g), match => `${page.path}: ${match[1]}`)));

    expect(defined.length).toBeGreaterThan(0);
    expect(defined.filter(item => !item.includes(': bro-cell-'))).toEqual([]);
  });

  it('describes the spec in its JSON Schema with the fields of its types', () => {
    const specProgram = ts.createProgram([fileURLToPath(new URL('./spec.ts', import.meta.url))], {strict: true, skipLibCheck: true, noEmit: true});
    const specChecker = specProgram.getTypeChecker();
    const specFile = specProgram.getSourceFile(fileURLToPath(new URL('./spec.ts', import.meta.url)))!;
    const fieldsOf = (name: string) => specChecker.getPropertiesOfType(specChecker.getDeclaredTypeOfSymbol(specChecker.getSymbolAtLocation(specFile)!.exports!.get(<ts.__String>name)!)).map(symbol => symbol.name).sort();
    const properties = (schema: unknown) => Object.keys((<{properties: object}>schema).properties).sort();
    const parts = <Record<string, {items?: unknown}>>specSchema['properties'];

    // The types of a spec, the JSON Schema of the tools and the check of validate_spec describe one form
    expect(properties(specSchema)).toEqual(fieldsOf('BroTableSpec'));
    expect(properties(parts['fields'].items)).toEqual(fieldsOf('BroSpecField'));
    expect(properties(parts['cols'].items)).toEqual(fieldsOf('BroSpecCol'));
    expect(properties(parts['cells'].items)).toEqual(fieldsOf('BroSpecCell'));
    expect(properties(parts['filters'].items)).toEqual(fieldsOf('BroSpecFilter'));
    expect(properties(parts['toolbar'])).toEqual(fieldsOf('BroSpecToolbar'));
    expect(properties(parts['api'])).toEqual(fieldsOf('BroSpecApi'));
  });
});
