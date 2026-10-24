// The check of the installation: the tarballs of the packages, as npm publishes them, go into clean projects, which
// build as their users build them and show a table in Chromium. Run after `npm run build`, with the names of the projects
// as arguments, or without them for all: vanilla (ESM through a bundler and UMD through <script>), angular-20,
// angular-21, angular-22 (the skin mat in a new project of each major version of the peer range), angular-ssr (the
// prerender of a page with a table by Angular 22, then its hydration in the browser).
import {execFileSync} from 'node:child_process';
import fs             from 'node:fs';
import http           from 'node:http';
import os             from 'node:os';
import path           from 'node:path';

import {chromium} from '@playwright/test';
import {build}    from 'esbuild';

import {packAll} from './check-pack.mjs';

const projects = {
  vanilla: checkVanilla,
  'angular-20': (dir, tarballs) => checkAngular(dir, 20, false, tarballs),
  'angular-21': (dir, tarballs) => checkAngular(dir, 21, false, tarballs),
  'angular-22': (dir, tarballs) => checkAngular(dir, 22, false, tarballs),
  'angular-ssr': (dir, tarballs) => checkAngular(dir, 22, true, tarballs)
};

/** The rows of the tables of the projects. */
const rows = [{name: 'b', price: 3}, {name: 'a', price: 1}, {name: 'c', price: 2}];

/**
 * Runs a command in a project, with its output in the log of the check.
 * @param dir - the folder of the project
 * @param command - the command
 * @param args - its arguments
 */
function run(dir, command, args) {
  console.log(`$ ${command} ${args.join(' ')}`);
  execFileSync(command, args, {cwd: dir, stdio: 'inherit'});
}

/**
 * Writes the files of a project.
 * @param dir - the folder of the project
 * @param files - the contents of the files by their paths
 */
function write(dir, files) {
  for (const [file, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, file)), {recursive: true});
    fs.writeFileSync(path.join(dir, file), content);
  }
}

/**
 * Serves the folder over HTTP on a free port of localhost: modules and custom elements need a page of a server.
 * @param dir - the folder of the files
 * @returns the address of the server and the function that stops it
 */
async function serve(dir) {
  const types = {'.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json'};
  const server = http.createServer((request, response) => {
    const file = path.join(dir, decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
    const target = fs.existsSync(file) && fs.statSync(file).isDirectory() ? path.join(file, 'index.html') : file;

    if (!target.startsWith(dir) || !fs.existsSync(target)) {
      response.writeHead(404).end();

      return;
    }

    response.writeHead(200, {'content-type': types[path.extname(target)] || 'application/octet-stream'});
    fs.createReadStream(target).pipe(response);
  });

  await new Promise(resolve => server.listen(0, 'localhost', resolve));

  return {url: `http://localhost:${server.address().port}`, close: () => server.close()};
}

/**
 * Opens the page in Chromium and waits for the rows of each table on it.
 * @param url - the address of the page
 * @param tables - the number of the tables of the page
 */
async function expectTables(url, tables) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];

  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => message.type() === 'error' && errors.push(message.text()));

  try {
    await page.goto(url, {waitUntil: 'networkidle'});
    await page.waitForFunction(count => {
      const shown = Array.from(document.querySelectorAll('table-bro')).filter(table => table.querySelectorAll('table.bro-table:not(.bro-table-aux) tbody > tr[data-row-number]').length === 3);

      return shown.length === count;
    }, tables, {timeout: 15_000});
  } catch (error) {
    throw new Error(`${url}: the page shows no ${tables} tables of 3 rows\n${errors.join('\n')}\n${error.message}`);
  } finally {
    await browser.close();
  }

  if (errors.length) {
    throw new Error(`${url}: errors on the page\n${errors.join('\n')}`);
  }
}

/**
 * A page without a framework: the core and the skins bs and nv, once as ES modules through a bundler and once as UMD
 * scripts. Node also imports the packages without a DOM, as a server render does.
 * @param dir - the folder of the project
 * @param tarballs - the paths of the tarballs by the names of the packages
 */
async function checkVanilla(dir, tarballs) {
  write(dir, {
    'package.json': JSON.stringify({name: 'vanilla-check', private: true, type: 'module'}, null, 2),
    'main.js': `
      import {Dropdown, Tooltip} from 'bootstrap';
      import '@table-bro/core';
      import {useBootstrap} from '@table-bro/bootstrap';
      import '@table-bro/native';

      useBootstrap({Dropdown, Tooltip});
      ${renderScript()}`,
    'esm.html': page('<script type="module" src="dist/main.js"></script>'),
    'umd.html': page(`
      <script src="node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"></script>
      <script src="node_modules/@table-bro/core/dist/table-bro.umd.js"></script>
      <script src="node_modules/@table-bro/bootstrap/dist/table-bro.bootstrap.umd.js"></script>
      <script src="node_modules/@table-bro/native/dist/table-bro.native.umd.js"></script>
      <script>${renderScript()}</script>`)
  });

  run(dir, 'npm', ['install', '--no-audit', '--no-fund', 'bootstrap@^5.3.0', tarballs['@table-bro/core'], tarballs['@table-bro/bootstrap'], tarballs['@table-bro/native']]);
  run(dir, 'node', ['--input-type=module', '-e', 'await import("@table-bro/core"); const bs = await import("@table-bro/bootstrap"); const nv = await import("@table-bro/native"); bs.withTags(); bs.withSwitch(); nv.withTags(); nv.withSwitch();']);

  await build({entryPoints: [path.join(dir, 'main.js')], bundle: true, format: 'esm', outdir: path.join(dir, 'dist'), absWorkingDir: dir, logLevel: 'warning'});

  const server = await serve(dir);

  try {
    await expectTables(`${server.url}/esm.html`, 2);
    await expectTables(`${server.url}/umd.html`, 2);
  } finally {
    server.close();
  }

  /** A page with the CSS of Bootstrap, of the core and of the skins, and the scripts of the packages. */
  function page(scripts) {
    return `<!doctype html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>Table, Bro</title>
        <link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap.min.css">
        <link rel="stylesheet" href="node_modules/@table-bro/core/dist/table-bro.min.css">
        <link rel="stylesheet" href="node_modules/@table-bro/bootstrap/dist/table-bro.bootstrap.min.css">
        <link rel="stylesheet" href="node_modules/@table-bro/native/dist/table-bro.native.min.css">
      </head>
      <body>
        ${scripts}
      </body>
      </html>`;
  }

  /** The script that shows a table of each skin. */
  function renderScript() {
    return `
      for (const skin of ['bs', 'nv']) {
        const table = document.createElement('table-bro');

        table.configure({cols: [{title: 'Name', name: 'name'}, {title: 'Price', name: 'price', dataType: 'number'}], rows: ${JSON.stringify(rows)}, conf: {skin}});
        document.body.append(table);
      }`;
  }
}

/**
 * A new Angular project of the major version with the wrapper and the skin mat, built for production with strict
 * templates. With ssr, the build prerenders the page with the table on the server, and the browser hydrates it.
 * @param dir - the folder of the project
 * @param major - the major version of Angular
 * @param ssr - prerender the page
 * @param tarballs - the paths of the tarballs by the names of the packages
 */
async function checkAngular(dir, major, ssr, tarballs) {
  // Angular 20 creates its projects with zone.js, later versions without it
  const zone = major === 20;
  const angular = ['common', 'compiler', 'core', 'elements', 'forms', 'platform-browser', 'router'].map(name => `@angular/${name}@^${major}.0.0`);

  write(dir, {
    'package.json': JSON.stringify({name: `angular-${major}-check`, private: true, type: 'module'}, null, 2),
    'angular.json': JSON.stringify({
      version: 1,
      projects: {
        app: {
          projectType: 'application',
          root: '',
          sourceRoot: 'src',
          architect: {
            build: {
              builder: '@angular/build:application',
              options: {
                outputPath: 'dist',
                browser: 'src/main.ts',
                index: 'src/index.html',
                tsConfig: 'tsconfig.json',
                polyfills: zone ? ['zone.js'] : [],
                styles: ['src/styles.scss', 'node_modules/@table-bro/core/dist/table-bro.min.css', 'node_modules/@table-bro/angular-material/dist/table-bro.material.min.css'],
                ...(ssr ? {server: 'src/main.server.ts', outputMode: 'static'} : {})
              }
            }
          }
        }
      }
    }, null, 2),
    // The settings of a new project: strict TypeScript and strict templates
    'tsconfig.json': JSON.stringify({
      compilerOptions: {
        strict: true,
        noImplicitOverride: true,
        noPropertyAccessFromIndexSignature: true,
        noImplicitReturns: true,
        noFallthroughCasesInSwitch: true,
        skipLibCheck: true,
        isolatedModules: true,
        experimentalDecorators: true,
        importHelpers: true,
        target: 'ES2022',
        module: 'preserve',
        types: ssr ? ['node'] : []
      },
      angularCompilerOptions: {
        strictInjectionParameters: true,
        strictInputAccessModifiers: true,
        strictTemplates: true
      },
      files: ['src/main.ts', ...(ssr ? ['src/main.server.ts'] : [])]
    }, null, 2),
    'src/index.html': '<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <title>Table, Bro</title>\n  <base href="/">\n</head>\n<body>\n  <app-root></app-root>\n</body>\n</html>\n',
    'src/styles.scss': `
      @use '@angular/material' as mat;

      html {
        @include mat.theme((color: (theme-type: light, primary: mat.$violet-palette), typography: Roboto, density: 0));
      }`,
    'src/app.ts': `
      import {Component} from '@angular/core';

      import {TableBroNg} from '@table-bro/angular';
      import {BroCol, BroConfig} from '@table-bro/core';

      interface Price {
        name: string;
        price: number;
      }

      @Component({
        selector: 'app-root',
        template: '<table-bro-ng [cols]="cols" [rows]="rows" [conf]="conf"></table-bro-ng>',
        imports: [TableBroNg]
      })
      export class App {
        cols: BroCol<Price>[] = [{title: 'Name', name: 'name'}, {title: 'Price', name: 'price', dataType: 'number'}];
        rows: Price[] = ${JSON.stringify(rows)};
        conf: BroConfig<Price> = {skin: 'mat'};
      }`,
    'src/app.config.ts': `
      import {ApplicationConfig, ${zone ? 'provideZoneChangeDetection' : 'provideZonelessChangeDetection'}} from '@angular/core';
      import {provideClientHydration} from '@angular/platform-browser';

      import {provideTableBroMatSkin} from '@table-bro/angular-material';

      export const appConfig: ApplicationConfig = {
        providers: [${zone ? 'provideZoneChangeDetection()' : 'provideZonelessChangeDetection()'}, provideTableBroMatSkin()${ssr ? ', provideClientHydration()' : ''}]
      };`,
    'src/main.ts': `
      import {bootstrapApplication} from '@angular/platform-browser';

      import {App} from './app';
      import {appConfig} from './app.config';

      bootstrapApplication(App, appConfig).catch(error => console.error(error));`,
    ...(ssr
      ? {
          'src/main.server.ts': `
        import {mergeApplicationConfig} from '@angular/core';
        import {bootstrapApplication, BootstrapContext} from '@angular/platform-browser';
        import {provideServerRendering, RenderMode, withRoutes} from '@angular/ssr';

        import {App} from './app';
        import {appConfig} from './app.config';

        const serverConfig = mergeApplicationConfig(appConfig, {providers: [provideServerRendering(withRoutes([{path: '**', renderMode: RenderMode.Prerender}]))]});

        export default (context: BootstrapContext) => bootstrapApplication(App, serverConfig, context);`
        }
      : {})
  });

  run(dir, 'npm', ['install', '--no-audit', '--no-fund',
    ...angular, `@angular/cdk@^${major}.0.0`, `@angular/material@^${major}.0.0`, 'rxjs@~7.8.0', 'tslib@^2.3.0', ...(zone ? ['zone.js@~0.15.0'] : []),
    ...(ssr ? [`@angular/platform-server@^${major}.0.0`, `@angular/ssr@^${major}.0.0`] : []),
    tarballs['@table-bro/core'], tarballs['@table-bro/angular'], tarballs['@table-bro/angular-material']]);
  run(dir, 'npm', ['install', '--no-audit', '--no-fund', '--save-dev', `@angular/build@^${major}.0.0`, `@angular/cli@^${major}.0.0`, `@angular/compiler-cli@^${major}.0.0`, ...(ssr ? ['@types/node'] : [])]);
  run(dir, 'npx', ['ng', 'build']);

  const browser = path.join(dir, 'dist/browser');

  if (ssr) {
    const html = fs.readFileSync(path.join(browser, 'index.html'), 'utf8');

    // The server renders the host of the wrapper and prerenders the table in it in its loading state
    if (!/<table-bro-ng[\s>]/.test(html) || !html.includes('ng-server-context')) {
      throw new Error('The prerendered page has no table-bro-ng');
    }

    if (!/<table-bro\s[^>]*data-bro-prerender/.test(html)) {
      throw new Error('The prerendered page has no table-bro in its loading state');
    }
  }

  const server = await serve(browser);

  try {
    await expectTables(server.url, 1);
  } finally {
    server.close();
  }
}

const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(projects);
const unknown = names.filter(name => !projects[name]);

if (unknown.length) {
  console.error(`Unknown projects: ${unknown.join(', ')}; the projects are ${Object.keys(projects).join(', ')}`);
  process.exit(1);
}

const work = fs.mkdtempSync(path.join(os.tmpdir(), 'table-bro-install-'));
const tarballs = packAll(path.join(work, 'packages'));

for (const name of names) {
  console.log(`\n# ${name}`);
  await projects[name](path.join(work, name), tarballs);
  console.log(`ok ${name}`);
}

fs.rmSync(work, {recursive: true, force: true});
