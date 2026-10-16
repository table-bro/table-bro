// The CSS of a package: Dart Sass compiles the entry point in styles/ of the package, and Lightning CSS lowers it for the
// target browsers and minifies it into dist/<entry>.min.css. A skin first gets a copy of the styles that the skins
// share, at the paths its @use rules name: styles/skin/shared/, styles/skin/vanilla-js/shared/ for bootstrap and native,
// and the SCSS API of the core that the API of each skin forwards, _table-bro.api.scss with its styles/mixins/. The
// copies are not sources: the build writes them, and git ignores them. A skin gets THIRD_PARTY_NOTICES.md of the root
// as well: its CSS and its bundle carry code of Angular Material and Bootstrap, and minified CSS keeps no comments.
// Usage: node build-css.mjs <package folder> <entry>, with --dev for readable CSS with the development names of the
// selector maps
import fs   from 'node:fs';
import path from 'node:path';
import url  from 'node:url';

import {transform} from 'lightningcss';
import * as sass   from 'sass';

const root = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const [folder, entry] = process.argv.slice(2).filter(arg => !arg.startsWith('--'));
const dev = process.argv.includes('--dev');
const pkg = path.resolve(folder);
const styles = path.join(pkg, 'styles');
const dist = path.join(pkg, 'dist');
const core = path.join(root, 'packages/core/styles');
const shared = path.join(root, 'packages/skins/shared/styles');

// The browsers of Angular 20, Baseline Widely Available. Lightning CSS adds the vendor prefixes they need and computes
// what they lack, such as color-mix() of static colors that the Angular Material tokens have
const version = major => major << 16;
const targets = {chrome: version(107), edge: version(107), firefox: version(104), safari: version(16), 'ios_saf': version(16)};

/**
 * Copies a folder of shared styles into the styles of the skin, replacing the previous copy.
 *
 * @param from the folder of the shared styles
 * @param to the folder in the styles of the skin
 */
function copy(from, to) {
  fs.rmSync(to, {recursive: true, force: true});
  fs.cpSync(from, to, {recursive: true});
}

if (styles !== core) {
  copy(path.join(shared, 'shared'), path.join(styles, 'skin/shared'));
  copy(path.join(core, 'mixins'), path.join(styles, 'mixins'));
  fs.copyFileSync(path.join(core, '_table-bro.api.scss'), path.join(styles, '_table-bro.api.scss'));
  fs.copyFileSync(path.join(root, 'THIRD_PARTY_NOTICES.md'), path.join(pkg, 'THIRD_PARTY_NOTICES.md'));

  if (fs.existsSync(path.join(styles, 'skin/vanilla-js'))) {
    copy(path.join(shared, 'vanilla-js/shared'), path.join(styles, 'skin/vanilla-js/shared'));
  }
}

fs.mkdirSync(dist, {recursive: true});

const {css} = sass.compile(path.join(styles, `${entry}.scss`), {
  loadPaths: [path.join(core, 'mappings', dev ? 'development' : 'production'), path.join(root, 'node_modules')],
  // Only the Bootstrap 5 adapter still uses @import, as Bootstrap 5 has no Sass modules, and Bootstrap warns about its own Sass from node_modules
  silenceDeprecations: ['import'],
  quietDeps: true,
  // Lightning CSS keeps the spaces of a calc() with var() as they are; the compressed output of Sass has none
  style: dev ? 'expanded' : 'compressed'
});

const {code} = transform({filename: `${entry}.css`, code: Buffer.from(css), minify: !dev, targets});

fs.writeFileSync(path.join(dist, `${entry}.min.css`), code);
