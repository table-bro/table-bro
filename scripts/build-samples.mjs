// The build of the pages of samples/: each is a project of one skin, or of one framework in samples/frameworks, set up
// as its page of Docs says, which installs the tarballs of the packages, as npm publishes them, from a local npm
// registry (Verdaccio) and builds into dist/samples/<name> under the base path of the pages. The other packages come
// from npmjs through the registry. Run after `npm run build`, with the names of the samples as arguments or without them
// for all, frameworks for the projects of all frameworks; REGISTRY_PORT sets the port of the registry (4873 by default)
// and SAMPLES_BASE the base path of the pages (/samples/ by default).
import {execFileSync, spawn} from 'node:child_process';
import fs                    from 'node:fs';
import os                    from 'node:os';
import path                  from 'node:path';

import {packAll, root} from './check-pack.mjs';

/** The version of Verdaccio: an exact one, as the other tools of the repository. */
const verdaccio = 'verdaccio@6.10.4';

/**
 * Runs a command in a folder, with its output in the log of the build.
 * @param dir - the folder
 * @param command - the command
 * @param args - its arguments
 */
function run(dir, command, args) {
  console.log(`$ ${command} ${args.join(' ')}`);
  execFileSync(command, args, {cwd: dir, stdio: 'inherit'});
}

/**
 * Starts a local npm registry with the tarballs of the packages of the repository: it gives @table-bro/* only from
 * them and every other package from npmjs.
 * @param tarballs - the paths of the tarballs by the names of the packages
 * @param port - the port of the registry on localhost
 * @returns the address of the registry, the .npmrc that publishes to it and the function that stops it
 */
export async function startRegistry(tarballs, port) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'table-bro-registry-'));
  const url = `http://localhost:${port}/`;

  fs.writeFileSync(path.join(dir, 'config.yaml'), [
    `storage: ${path.join(dir, 'storage')}`,
    'auth:',
    '  htpasswd:',
    `    file: ${path.join(dir, 'htpasswd')}`,
    'uplinks:',
    '  npmjs:',
    '    url: https://registry.npmjs.org/',
    'packages:',
    '  \'@table-bro/*\':',
    '    access: $all',
    '    publish: $authenticated',
    '  \'**\':',
    '    access: $all',
    '    proxy: npmjs',
    'log: {type: stdout, format: pretty, level: warn}',
    ''
  ].join('\n'));

  const server = spawn('npx', ['--yes', verdaccio, '--config', path.join(dir, 'config.yaml'), '--listen', `localhost:${port}`], {stdio: 'inherit'});
  const close = () => server.kill();

  try {
    await waitFor(`${url}-/ping`);

    // A user of the registry: the publication needs one
    const user = await fetch(`${url}-/user/org.couchdb.user:table-bro`, {
      method: 'PUT',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({name: 'table-bro', password: 'table-bro'})
    });
    const {token} = await user.json();
    const npmrc = path.join(dir, '.npmrc');

    fs.writeFileSync(npmrc, `registry=${url}\n//localhost:${port}/:_authToken=${token}\n`);

    for (const tarball of Object.values(tarballs)) {
      run(dir, 'npm', ['publish', tarball, '--userconfig', npmrc, '--registry', url, '--ignore-scripts']);
    }

    return {url, close};
  } catch (error) {
    close();
    throw error;
  }
}

/**
 * Waits for an address to answer 200, for a minute at most.
 * @param url - the address
 */
async function waitFor(url) {
  for (let i = 0; i < 120; i++) {
    try {
      if ((await fetch(url)).ok) {
        return;
      }
    } catch {
      // Not listening yet
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  throw new Error(`${url} does not answer`);
}

/**
 * The projects of the samples: a folder of samples/ with its package.json, or the folders of a folder without one, as
 * frameworks/react of samples/frameworks.
 * @param names - the names of the folders of samples/
 * @returns the paths of the projects under samples/
 */
function sampleProjects(names) {
  return names.flatMap(name => {
    const dir = path.join(root, 'samples', name);

    if (fs.existsSync(path.join(dir, 'package.json'))) {
      return [name];
    }

    return fs.readdirSync(dir, {withFileTypes: true})
      .filter(entry => entry.isDirectory() && fs.existsSync(path.join(dir, entry.name, 'package.json')))
      .map(entry => `${name}/${entry.name}`);
  });
}

/**
 * Installs a copy of a sample from the registry, as its users install it, and builds it into dist/samples/<name>.
 * @param name - the path of the project of the sample under samples/
 * @param registry - the address of the registry
 * @param base - the base path of the pages
 */
function buildSample(name, registry, base) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `table-bro-sample-${name.replace('/', '-')}-`));
  const angular = fs.existsSync(path.join(root, 'samples', name, 'angular.json'));
  const dest = path.join(root, 'dist/samples', name);

  fs.cpSync(path.join(root, 'samples', name), dir, {recursive: true, filter: file => !/[\\/](node_modules|dist)$/.test(file)});
  fs.writeFileSync(path.join(dir, '.npmrc'), `registry=${registry}\n`);
  run(dir, 'npm', ['install', '--no-audit', '--no-fund']);
  run(dir, 'npm', ['run', 'build', '--', angular ? `--base-href=${base}${name}/` : `--base=${base}${name}/`]);
  fs.rmSync(dest, {recursive: true, force: true});
  fs.cpSync(path.join(dir, 'dist'), dest, {recursive: true});
  fs.rmSync(dir, {recursive: true, force: true});
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const names = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync(path.join(root, 'samples'), {withFileTypes: true}).filter(entry => entry.isDirectory()).map(entry => entry.name);
  const tarballs = packAll(fs.mkdtempSync(path.join(os.tmpdir(), 'table-bro-pack-')));
  const registry = await startRegistry(tarballs, Number(process.env.REGISTRY_PORT ?? 4873));

  try {
    for (const name of sampleProjects(names)) {
      buildSample(name, registry.url, process.env.SAMPLES_BASE ?? '/samples/');
    }
  } finally {
    registry.close();
  }
}
