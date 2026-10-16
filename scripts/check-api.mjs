// Checks the public types of the core and of the vanilla skins against their reports: each package builds its types,
// and the declarations of dist/*.d.ts without their comments must be the ones of <package>.api.md. A change of the
// public API, wanted or not, shows in the review as a change of the report; a change of a JSDoc does not.
// Usage: npm run check:api, and npm run check:api -- --update after a change of the public API that is wanted.
import {execFileSync}  from 'node:child_process';
import fs              from 'node:fs';
import {createRequire} from 'node:module';
import os              from 'node:os';
import path            from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const ts = createRequire(import.meta.url)('typescript');
const update = process.argv.includes('--update');

const packages = [
  {dir: path.join(root, 'packages/core'), name: 'table-bro'},
  {dir: path.join(root, 'packages/skins/bootstrap'), name: 'table-bro.bootstrap'},
  {dir: path.join(root, 'packages/skins/native'), name: 'table-bro.native'}
];

/** The declarations of a .d.ts as TypeScript prints them, without the comments. */
function declarations(file) {
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);

  return ts.createPrinter({removeComments: true}).printFile(source);
}

/** The report of the public types of a package, as its .api.md file holds it. */
function report(name, types) {
  return `# The public types of ${name}\n\n`
    + 'Written by `npm run check:api -- --update` from the types of the build, without their comments.\n\n'
    + '```ts\n' + types + '```\n';
}

let changed = 0;

for (const {dir, name} of packages) {
  // The build of the package writes its types into a temporary directory: a build into dist/ would clean it, and the
  // CSS of the core, which only its full build writes, would be gone
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'check-api-build-'));

  execFileSync('npx', ['tsdown', '--log-level', 'error', '--out-dir', out], {cwd: dir, stdio: 'inherit'});

  const reportFile = path.join(dir, `${name}.api.md`);
  const actual = report(name, declarations(path.join(out, `${name}.d.ts`)));

  fs.rmSync(out, {recursive: true, force: true});

  const expected = fs.existsSync(reportFile) ? fs.readFileSync(reportFile, 'utf8') : '';

  if (actual === expected) {
    continue;
  }

  if (update) {
    fs.writeFileSync(reportFile, actual);
    console.log(`check:api: ${path.relative(root, reportFile)} updated`);

    continue;
  }

  changed++;

  const actualFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'check-api-')), `${name}.api.md`);

  fs.writeFileSync(actualFile, actual);

  try {
    execFileSync('git', ['diff', '--no-index', '--no-color', reportFile, actualFile], {stdio: 'inherit'});
  } catch {
    // git diff exits with 1 when the files differ
  }
}

if (changed) {
  console.error(`check:api: the public types of ${changed} package(s) differ from their reports. If the change is wanted, `
    + 'run npm run check:api -- --update and commit the reports with it.');
  process.exit(1);
}

if (!update) {
  console.log(`check:api: the public types of ${packages.length} packages match their reports`);
}
