import {describe, expect, it} from 'vitest';

import bootstrapPackage from '../skins/bootstrap/package.json';
import nativePackage    from '../skins/native/package.json';
import muiPackage       from '../skins/react-mui/package.json';
import m3Package        from '../skins/svelte-m3/package.json';
import corePackage      from './package.json';

/** The build configs of the core and the vanilla skins, as text. */
const buildConfigs = import.meta.glob<string>(['./tsdown.config.ts', '../skins/*/tsdown.config.ts'], {query: '?raw', import: 'default', eager: true});

/** The Lottie animations of the states, as text: their sources in the core, and their copies in its build. */
const lottieSources = import.meta.glob<string>('./lottie/**/*.json', {query: '?raw', import: 'default', eager: true});
const lottieBuilt = import.meta.glob<string>('./dist/lottie/**/*.json', {query: '?raw', import: 'default', eager: true});

/**
 * The files of a glob by their paths in a folder.
 *
 * @param files the files of the glob, by their paths from this folder
 * @param folder the folder of the files, as the paths of the glob start
 */
function inFolder(files: Record<string, string>, folder: string): Record<string, string> {
  return Object.fromEntries(Object.entries(files).map(([file, text]) => [file.slice(folder.length), text]));
}

/** The sources of the core, the skins and the Angular wrapper, as text, without their specs and builds. */
const librarySources = import.meta.glob<string>(['./**/*.ts', '../skins/**/*.ts', '../angular/src/**/*.ts', '!**/*.spec.ts', '!**/*.d.ts', '!**/dist/**', '!**/node_modules/**'], {query: '?raw', import: 'default', eager: true});

const packages = [corePackage, bootstrapPackage, nativePackage, muiPackage, m3Package];

describe('the packages of the core and the skins', () => {
  it('give import and require one ES module, so a project gets one copy of the core', () => {
    for (const {name, exports} of packages) {
      const file = name.replace('@table-bro/core', 'table-bro').replace('@table-bro/', 'table-bro.');
      // The condition svelte of the skin m3-svelte marks it as a library of Svelte: the bundler of a server render then
      // bundles it and compiles the components of M3 Svelte that it imports, the same module
      const svelte = (name === '@table-bro/svelte-m3') ? {svelte: `./dist/${file}.esm.js`} : {};

      expect(exports['.'], name).toEqual({types: `./dist/${file}.d.ts`, ...svelte, import: `./dist/${file}.esm.js`, default: `./dist/${file}.esm.js`});
    }
  });

  it('ship and export the CSS and the SCSS of the core and of the skins', () => {
    for (const {name, exports, files} of packages) {
      expect(exports, name).toMatchObject({'./dist/*.css': './dist/*.css', './styles/*': './styles/*'});
      expect(files, name).toEqual(name === '@table-bro/core' ? ['dist/', 'styles/'] : ['dist/', 'styles/', 'THIRD_PARTY_NOTICES.md']);
    }
  });

  it('carry and export the Lottie animations of the states of mat and bs, copied by the build of the core', () => {
    const built = inFolder(lottieBuilt, './dist/lottie/');

    expect(Object.keys(built).sort()).toEqual([
      'bs/dark/fail.json', 'bs/dark/loading.json', 'bs/dark/no-data.json', 'bs/fail.json', 'bs/loading.json', 'bs/no-data.json',
      'mat/dark/fail.json', 'mat/dark/loading.json', 'mat/dark/no-data.json', 'mat/fail.json', 'mat/loading.json', 'mat/no-data.json'
    ]);
    expect(built).toEqual(inFolder(lottieSources, './lottie/'));
    expect(corePackage.exports['./dist/lottie/*']).toBe('./dist/lottie/*');
  });

  it('keep their built entries as side effects: the core defines its element, a skin registers itself', () => {
    expect(corePackage.sideEffects).toEqual(expect.arrayContaining(['./dist/table-bro.esm.js', './dist/table-bro.umd.js', './dist/*.css']));

    // The import of a vanilla skin registers it: its entries, built and source, and its CSS are side effects
    for (const [manifest, name] of <const>[[bootstrapPackage, 'bootstrap'], [nativePackage, 'native']]) {
      expect(manifest.sideEffects).toEqual(['./js/index.ts', `./js/table-bro.${name}.ts`, `./dist/table-bro.${name}.esm.js`, `./dist/table-bro.${name}.umd.js`, './dist/*.css']);
    }

    // The skin mui is built for bundlers only, without a UMD bundle; its entries of the browser and of the server share
    // the chunk that registers it
    expect(muiPackage.sideEffects).toEqual([
      './js/index.ts', './js/table-bro.react-mui.ts', './js/table-bro.react-mui.server.ts',
      './dist/table-bro.react-mui.esm.js', './dist/table-bro.react-mui.server.esm.js', './dist/table-bro.react-mui.shared.esm.js', './dist/*.css'
    ]);

    // The skin m3-svelte is built for bundlers only, without a UMD bundle; its entries of the browser and of the server
    // share the chunk that registers it
    expect(m3Package.sideEffects).toEqual([
      './js/index.ts', './js/table-bro.svelte-m3.ts', './js/table-bro.svelte-m3.server.ts',
      './dist/table-bro.svelte-m3.esm.js', './dist/table-bro.svelte-m3.server.esm.js', './dist/table-bro.svelte-m3.shared.esm.js', './dist/*.css'
    ]);
  });

  it('define no tag with the prefix bro-cell-: the library leaves it to the elements of the application', () => {
    // The tags: definitions, element maps, selectors of the skin configs and created elements; classes may use the prefix
    const tags = Object.values(librarySources).flatMap(text => Array.from(
      text.matchAll(/(?:customElements\.define|defineElement|createElement)\(\s*'([a-z0-9-]+)'|selector:\s*'([a-z0-9-]+)'|^\s*'([a-z0-9-]+-[a-z0-9-]+)':\s*[A-Z]/gm),
      match => match[1] ?? match[2] ?? match[3]
    ));

    for (const tag of ['table-bro', 'bro-mat-sort-header', 'bro-bs-tags', 'bro-switch']) {
      expect(tags, tag).toContain(tag);
    }

    expect(tags.filter(tag => tag.startsWith('bro-cell-'))).toEqual([]);
  });

  it('give each UMD bundle its own global name', () => {
    // The skins mui and m3-svelte are built for bundlers only: they have no UMD bundle and no global name
    const umdConfigs = Object.entries(buildConfigs).filter(([file]) => !['../skins/react-mui/tsdown.config.ts', '../skins/svelte-m3/tsdown.config.ts'].includes(file));
    const names = umdConfigs.map(([, config]) => config.match(/globalName:\s*'([^']+)'/)?.[1]);

    expect(names.sort()).toEqual(['TableBro', 'TableBroBootstrap', 'TableBroNative']);
  });
});
