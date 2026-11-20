// The build of the pages of samples/: each is a project of one skin, or of one framework in samples/frameworks, set up
// as its page of Docs says, which installs the packages from a local npm registry (Verdaccio) and builds into
// dist/samples/<name> under the base path of the pages. The registry has the packages as `npm run publish:packages`
// publishes them for a release, and the other packages from npmjs. A page without a build, a folder with index.html and
// no package.json, as no-build, takes the packages from a CDN and is copied as it is, with the base path of the page in
// its index.html. A project of Next.js, Nuxt or SvelteKit, as react-mui/next, vue-vuetify/nuxt and svelte-m3/sveltekit,
// takes the base path from the variable BASE_PATH of its config and exports its pages into dist; a project of the
// server render of Angular, as angular-ssr, prerenders its pages at the build, and only the files of the browser go to
// the site. Run after `npm run build`, with the names of the samples as arguments or without them for all, frameworks
// for the projects of all frameworks; REGISTRY_PORT sets the port of the registry (4873 by default) and SAMPLES_BASE
// the base path of the pages (/samples/ by default).
import {execFileSync, spawn} from 'node:child_process';
import fs                    from 'node:fs';
import os                    from 'node:os';
import path                  from 'node:path';

import {root}       from './check-pack.mjs';
import {publishAll} from './publish.mjs';

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
 * Starts a local npm registry with the packages of the repository, published by `npm run publish:packages` as the
 * release publishes them: it gives @table-bro/* only from them and every other package from npmjs.
 * @param port - the port of the registry on localhost
 * @returns the address of the registry, the .npmrc that publishes to it and the function that stops it
 */
export async function startRegistry(port) {
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

    // The build is done: the scripts of the packages would build them again
    publishAll(['--userconfig', npmrc, '--registry', url, '--ignore-scripts']);

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
 * The projects of the samples: a folder of samples/ with its package.json or its index.html, or the folders of a folder
 * without them, as frameworks/react of samples/frameworks.
 * @param names - the names of the folders of samples/
 * @returns the paths of the projects under samples/
 */
function sampleProjects(names) {
  return names.flatMap(name => {
    const dir = path.join(root, 'samples', name);

    if (fs.existsSync(path.join(dir, 'package.json')) || fs.existsSync(path.join(dir, 'index.html'))) {
      return [name];
    }

    return fs.readdirSync(dir, {withFileTypes: true})
      .filter(entry => entry.isDirectory() && fs.existsSync(path.join(dir, entry.name, 'package.json')))
      .map(entry => `${name}/${entry.name}`);
  });
}

/**
 * Installs a copy of a sample from the registry, as its users install it, and builds it into dist/samples/<name>; a page
 * without a build goes there as it is, with <base> of its base path: the site serves it without the trailing slash.
 * @param name - the path of the project of the sample under samples/
 * @param registry - the address of the registry
 * @param base - the base path of the pages
 */
function buildSample(name, registry, base) {
  const dest = path.join(root, 'dist/samples', name);

  if (!fs.existsSync(path.join(root, 'samples', name, 'package.json'))) {
    fs.rmSync(dest, {recursive: true, force: true});
    fs.cpSync(path.join(root, 'samples', name), dest, {recursive: true});
    fs.writeFileSync(path.join(dest, 'index.html'), fs.readFileSync(path.join(dest, 'index.html'), 'utf8').replace('<head>\n', `<head>\n    <base href="${base}${name}/" />\n`));

    return;
  }

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `table-bro-sample-${name.replace('/', '-')}-`));
  const angular = fs.existsSync(path.join(root, 'samples', name, 'angular.json'));
  // Next.js, Nuxt and SvelteKit take the base path from their configs, which read BASE_PATH, and export the pages into
  // dist
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'samples', name, 'package.json'), 'utf8'));
  const next = ['next', 'nuxt', '@sveltejs/kit'].some(framework => framework in {...manifest.dependencies, ...manifest.devDependencies});

  fs.cpSync(path.join(root, 'samples', name), dir, {recursive: true, filter: file => !/[\\/](node_modules|dist|\.next|\.nuxt|\.output|\.svelte-kit)$/.test(file)});
  fs.writeFileSync(path.join(dir, '.npmrc'), `registry=${registry}\n`);
  run(dir, 'npm', ['install', '--no-audit', '--no-fund']);

  if (next) {
    console.log(`$ BASE_PATH=${base}${name} npm run build`);
    execFileSync('npm', ['run', 'build'], {cwd: dir, stdio: 'inherit', env: {...process.env, 'BASE_PATH': `${base}${name}`}});
  } else {
    run(dir, 'npm', ['run', 'build', '--', angular ? `--base-href=${base}${name}/` : `--base=${base}${name}/`]);
  }

  fs.rmSync(dest, {recursive: true, force: true});
  // The server render of Angular, as of angular-ssr, prerenders the pages at the build: the site takes the pages and
  // the files of the browser, not the bundle of the server
  fs.cpSync(path.join(dir, 'dist'), dest, {recursive: true, filter: file => file !== path.join(dir, 'dist', 'server')});
  fs.rmSync(dir, {recursive: true, force: true});
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const names = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync(path.join(root, 'samples'), {withFileTypes: true}).filter(entry => entry.isDirectory()).map(entry => entry.name);
  const registry = await startRegistry(Number(process.env.REGISTRY_PORT ?? 4873));

  try {
    for (const name of sampleProjects(names)) {
      buildSample(name, registry.url, process.env.SAMPLES_BASE ?? '/samples/');
    }
  } finally {
    registry.close();
  }
}
