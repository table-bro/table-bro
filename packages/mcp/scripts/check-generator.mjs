// The check of the generator: every built-in spec goes through every pair of a target and a skin, and the generated code
// compiles against the packages of Table, Bro, with the strict settings of a new Angular project: ngc with strict
// templates for Angular, tsc for Vanilla JS. ESLint lints it as code of an application, with the settings of the repository.
// Only the problems of the generated files count.
import {spawnSync}     from 'node:child_process';
import fs              from 'node:fs';
import path            from 'node:path';
import {fileURLToPath} from 'node:url';

import {ESLint} from 'eslint';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const work = path.join(root, 'packages/mcp/.check');
const code = path.join(work, 'code');

const pairs = [['angular', 'mat'], ['angular', 'bs'], ['angular', 'nv'], ['vanilla', 'bs'], ['vanilla', 'nv']];

fs.rmSync(work, {recursive: true, force: true});

run('npx', ['tsc', '-p', 'packages/mcp/tsconfig.json', '--outDir', path.join(work, 'dist')], true);

const {builtinSpecs, generateCode} = await import(path.join(work, 'dist/index.js'));
const files = {angular: [], vanilla: []};
const eslint = new ESLint({cwd: root});
const remarks = [];
let failed = false;

// The built-in specs in every pair, and each Angular one again in the server mode: with the simulated server of the site,
// and with the rows of an API
const angularPairs = pairs.filter(([target]) => target === 'angular');
const variants = builtinSpecs.flatMap(builtin => [
  ...pairs.map(([target, skin]) => ({name: `${builtin.name}-${target}-${skin}`, spec: builtin.spec, fillings: builtin.fillings, target, skin})),
  ...(builtin.spec.config?.server
    ? []
    : angularPairs.flatMap(([target, skin]) => [{
        name: `${builtin.name}-${target}-${skin}-simulated`, spec: {...builtin.spec, config: {...builtin.spec.config, server: true}}, fillings: builtin.fillings, target, skin, simulateServer: true
      }, {
        name: `${builtin.name}-${target}-${skin}-api`, fillings: builtin.fillings, target, skin,
        spec: {...builtin.spec, config: {...builtin.spec.config, server: true}, fields: builtin.spec.fields.map(field => ({...field, source: field.name})), api: {url: 'https://dummyjson.com/carts', rows: 'carts'}}
      }, {
        name: `${builtin.name}-${target}-${skin}-api-pages`, fillings: builtin.fillings, target, skin,
        spec: {...builtin.spec, config: {...builtin.spec.config, server: true}, fields: builtin.spec.fields.map(field => ({...field, source: `api_${field.name}`})), api: pagedApi(builtin.spec, skin)}
      }]))
]);

/** An API that gives pages, with its parameters for the search, the sort and every filter: two forms of the sort. */
function pagedApi(spec, skin) {
  const keys = (spec.filters ?? []).flatMap(filter => (filter.control === 'range') ? [`${filter.name}From`, `${filter.name}To`] : [filter.name]);

  return {
    url: 'https://api.spaceflightnewsapi.net/v4/articles/', rows: 'results', paging: {size: 'limit', offset: 'offset'}, total: 'count', search: 'search',
    sort: (skin === 'mat') ? {field: 'ordering'} : {field: 'sortBy', order: 'order'},
    ...(keys.length ? {filters: Object.fromEntries(keys.map(key => [key, `api_${key}`]))} : {})
  };
}

for (const {name, spec, fillings, target, skin, simulateServer} of variants) {
  const result = generateCode(spec, {target, skin, fillings, simulateServer});

  if (!result.report.valid) {
    console.error(`${name}: the spec has errors`, result.report.errors);
    failed = true;
    continue;
  }

  for (const file of result.files) {
    const filePath = path.join(code, name, file.path);

    fs.mkdirSync(path.dirname(filePath), {recursive: true});
    fs.writeFileSync(filePath, file.content);

    if (filePath.endsWith('.ts')) {
      files[target].push(filePath);

      // The folder of the check is out of the lint, so the file is linted at a place of an application
      const [result] = await eslint.lintText(file.content, {filePath: path.join(root, 'mcp-check', name, file.path)});

      remarks.push(...result.messages.map(message => `${name}/${file.path}:${message.line} ${message.message} (${message.ruleId})`));
    }
  }
}

// The components of scaffold_component for the cells, the details and the filters of every built-in spec, in every pair: the
// same generators as above, linted alike
const {scaffoldComponent} = await import(path.join(work, 'dist/generate/scaffold.js'));
let scaffolds = 0;

for (const builtin of builtinSpecs) {
  const {spec} = builtin;
  const requests = [
    ...(spec.cells ?? []).map(cell => ({kind: (cell.kind === 'details') ? 'details' : 'cell', name: cell.name, shows: cell.shows, reads: cell.fields, actions: cell.actions})),
    ...(spec.filters?.length ? [{kind: 'filters', filters: spec.filters}] : [])
  ];

  for (const [target, skin] of pairs) {
    for (const request of requests) {
      const name = `${builtin.name}-${target}-${skin}-scaffold-${request.name ?? request.kind}`;
      const scaffold = scaffoldComponent({...request, target, skin, rowType: spec.rowType, fields: spec.fields});

      if (!scaffold.report.valid) {
        console.error(`${name}: the request has errors`, scaffold.report.errors);
        failed = true;
        continue;
      }

      const [result] = await eslint.lintText(scaffold.content, {filePath: path.join(root, 'mcp-check', name, scaffold.path)});

      scaffolds++;
      remarks.push(...result.messages.map(message => `${name}/${scaffold.path}:${message.line} ${message.message} (${message.ruleId})`));
    }
  }
}

console.log(`eslint: ${remarks.length} remarks, ${scaffolds} components of scaffold_component among the files`);
remarks.forEach(line => console.log('  ' + line));
failed ||= remarks.length > 0;

for (const target of ['angular', 'vanilla']) {
  const tsconfig = path.join(work, `tsconfig.${target}.json`);

  fs.writeFileSync(tsconfig, JSON.stringify({
    // The packages of Table, Bro from their sources in this repository
    compilerOptions: {
      paths: {
        '@table-bro/core': [path.join(root, 'packages/core/index.ts')],
        '@table-bro/bootstrap': [path.join(root, 'packages/skins/bootstrap/js/table-bro.bootstrap.ts')],
        '@table-bro/native': [path.join(root, 'packages/skins/native/js/table-bro.native.ts')],
        '@table-bro/angular': [path.join(root, 'packages/angular/src/public-api.ts')],
        '@table-bro/angular-material': [path.join(root, 'packages/skins/angular-material/src/public-api.ts')]
      },
      types: [],
      target: 'ES2022',
      module: 'ES2022',
      moduleResolution: 'bundler',
      lib: ['ES2022', 'dom'],
      experimentalDecorators: true,
      esModuleInterop: true,
      skipLibCheck: true,
      noPropertyAccessFromIndexSignature: true,
      noFallthroughCasesInSwitch: true,
      outDir: path.join(work, 'out', target),
      rootDir: root,
      strict: true,
      strictNullChecks: true,
      strictPropertyInitialization: true,
      noImplicitReturns: true,
      noImplicitOverride: true,
      useDefineForClassFields: true,
      // As the template vanilla-ts of Vite: a type comes in by import type or an inline type
      verbatimModuleSyntax: true,
      pretty: false,
      // The flags of the tsconfig of a new project: create-vite for Vanilla JS, ng new for Angular
      ...((target === 'vanilla')
        ? {noUnusedLocals: true, noUnusedParameters: true, erasableSyntaxOnly: true, moduleDetection: 'force'}
        : {isolatedModules: true})
    },
    files: files[target],
    include: [],
    angularCompilerOptions: {strictTemplates: true, strictInjectionParameters: true, strictInputAccessModifiers: true}
  }, null, 2));

  // ngc colors its output and gives the paths from the folder of its config
  const output = run('npx', [target === 'angular' ? 'ngc' : 'tsc', '-p', tsconfig], false).replace(/\x1b\[[0-9;]*m/g, '');
  const problems = output.split('\n').filter(line => /(^|[/ ])code\//.test(line) && /error|warning/.test(line));

  console.log(`${target}: ${files[target].length} files, ${problems.length} problems`);
  problems.forEach(line => console.log('  ' + line.slice(line.indexOf('code/') + 5)));
  failed ||= problems.length > 0;
}

process.exit(failed ? 1 : 0);

function run(command, args, required) {
  const result = spawnSync(command, args, {cwd: root, encoding: 'utf8'});

  if (required && result.status !== 0) {
    console.error(result.stdout, result.stderr);
    process.exit(1);
  }

  return `${result.stdout}\n${result.stderr}`;
}
