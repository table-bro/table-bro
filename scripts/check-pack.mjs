// The check of the packages as npm publishes them: each package is packed from its build, publint checks the fields of
// its manifest against the files of the tarball, and @arethetypeswrong/cli checks that its types resolve under every
// module resolution of TypeScript that the package supports. Run after `npm run build`; `npm run check:install` installs
// the same tarballs into clean projects.
import {execFileSync}  from 'node:child_process';
import fs              from 'node:fs';
import os              from 'node:os';
import path            from 'node:path';
import {fileURLToPath} from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));

/** The packages of the repository and the folders npm packs them from: the Angular packages from their ng-packagr builds. */
export const packages = [
  {name: '@table-bro/core', dir: 'packages/core'},
  {name: '@table-bro/bootstrap', dir: 'packages/skins/bootstrap'},
  {name: '@table-bro/native', dir: 'packages/skins/native'},
  {name: '@table-bro/angular', dir: 'dist/table-bro.angular'},
  {name: '@table-bro/angular-material', dir: 'dist/table-bro.angular-material'},
  {name: '@table-bro/mcp', dir: 'packages/mcp'}
];

/**
 * Packs every package into the folder, without the scripts of the packages: the build is done.
 * @param dest - the folder of the tarballs
 * @returns the paths of the tarballs by the names of the packages
 */
export function packAll(dest) {
  fs.mkdirSync(dest, {recursive: true});

  return Object.fromEntries(packages.map(({name, dir}) => {
    const [{filename}] = JSON.parse(execFileSync('npm', ['pack', path.join(root, dir), '--pack-destination', dest, '--ignore-scripts', '--json'], {cwd: root, encoding: 'utf8'}));

    return [name, path.join(dest, filename)];
  }));
}

/**
 * Runs a command of the repository and reports its output only when it fails.
 * @param command - the command
 * @param args - its arguments
 */
function check(command, args) {
  try {
    execFileSync(command, args, {cwd: root, encoding: 'utf8', stdio: 'pipe'});

    return true;
  } catch (error) {
    console.error(`${command} ${args.join(' ')}\n${error.stdout}${error.stderr}`);

    return false;
  }
}

/**
 * Checks that the tarball of the core carries the Custom Elements Manifest that the field customElements of its manifest names.
 * @param tarball - the path of the tarball of the core
 * @returns whether the manifest is in the tarball
 */
function hasCustomElements(tarball) {
  const files = execFileSync('tar', ['-tzf', tarball], {encoding: 'utf8'});
  const {customElements} = JSON.parse(fs.readFileSync(path.join(root, 'packages/core/package.json'), 'utf8'));

  return Boolean(customElements) && files.split('\n').includes(`package/${customElements}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dest = fs.mkdtempSync(path.join(os.tmpdir(), 'table-bro-pack-'));
  const tarballs = packAll(dest);
  let failed = false;

  for (const {name, dir} of packages) {
    // The packages are ES modules: a require() of them is not supported, so the types of CommonJS do not count
    const ok = check('npx', ['publint', 'run', dir, '--strict'])
      && check('npx', ['attw', tarballs[name], '--profile', 'esm-only'])
      && (name !== '@table-bro/core' || hasCustomElements(tarballs[name]));

    console.log(`${ok ? 'ok    ' : 'FAILED'} ${name} ${path.basename(tarballs[name])}`);
    failed ||= !ok;
  }

  fs.rmSync(dest, {recursive: true, force: true});
  process.exit(failed ? 1 : 0);
}
