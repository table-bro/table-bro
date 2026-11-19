// The check of the packages as npm publishes them: each package is packed from its build, publint checks the fields of
// its manifest against the files of the tarball, and @arethetypeswrong/cli checks that its types resolve under every
// module resolution of TypeScript that the package supports. Each workspace either is published from its own folder or
// refuses `npm publish` of its sources. Run after `npm run build`; `npm run check:install` installs the same tarballs
// into clean projects.
import {execFileSync}  from 'node:child_process';
import fs              from 'node:fs';
import os              from 'node:os';
import path            from 'node:path';
import {fileURLToPath} from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));

/** The packages of the repository and the folders npm packs them from: the Angular packages from their ng-packagr builds. */
export const packages = [
  {name: '@table-bro/core', dir: 'packages/core'},
  {name: '@table-bro/react-mui', dir: 'packages/skins/react-mui'},
  {name: '@table-bro/svelte-m3', dir: 'packages/skins/svelte-m3'},
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

/**
 * Checks that a workspace of the repository is published only from the folder of its package: npm publishes a workspace
 * from its own folder, so a package that npm publishes from its build in dist/ refuses `npm publish` of its sources. Its
 * prepublishOnly fails before npm asks the registry, also in a dry run.
 * @param workspace - the folder of the workspace
 * @returns whether the workspace is published from its own folder or refuses its publication
 */
function isPublishedFromItsFolder(workspace) {
  const {name} = JSON.parse(fs.readFileSync(path.join(root, workspace, 'package.json'), 'utf8'));
  const dir = packages.find(entry => entry.name === name)?.dir;

  if (!dir) {
    console.error(`${name} of ${workspace} is not among the packages that npm publishes`);

    return false;
  }

  if (dir === workspace) {
    return true;
  }

  try {
    execFileSync('npm', ['publish', '-w', workspace, '--dry-run'], {cwd: root, encoding: 'utf8', stdio: 'pipe'});
  } catch (error) {
    if (`${error.stdout}${error.stderr}`.includes(`npm publishes this package from ${dir}`)) {
      return true;
    }
  }

  console.error(`npm publish -w ${workspace} does not refuse to publish the sources of ${name}, which npm publishes from ${dir}`);

  return false;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dest = fs.mkdtempSync(path.join(os.tmpdir(), 'table-bro-pack-'));
  const tarballs = packAll(dest);
  const {workspaces} = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  let failed = false;

  for (const workspace of workspaces) {
    const ok = isPublishedFromItsFolder(workspace);

    console.log(`${ok ? 'ok    ' : 'FAILED'} npm publish -w ${workspace}`);
    failed ||= !ok;
  }

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
