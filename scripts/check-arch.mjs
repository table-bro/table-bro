// Checks the dependency rules of the code by searching it:
// 1. views and models do not import the controller or the element;
// 2. skins, adapters and framework wrappers import the core only from '@table-bro/core', their unit specs too;
// 3. nobody reads or writes the window.bro global, and the core touches no window or document when its modules load;
// 5. animations run only through BroMotion, and only its clock requests animation frames, also in the skins;
// 6. views and models read no views from the registry ctx.view: a view talks to the views that it makes and only puts
//    them into the registry, which the controller reads;
// 7. views assign no fields of ctx.model: the controller makes the models, and the models keep their geometry. The slot
//    of a row (BroRowSlot) is the exception by design: the views put the layers that they render into it (tr, auxTr,
//    details, progressBar), and the details view writes detailsHeight, the target of the animation of the details;
// 8. models write no DOM;
// 9. the controller neither writes nor measures the DOM: the views do it;
// 10. the element renders no regions: BroTableRegions renders them;
// 11. each method and function of the controller names its part in update() in its JSDoc: @phase input, state, render
//     or events (BroUpdate); the constructors and update() itself are the frame of it.
// The rules 6 to 10 keep the boundaries of the parts: the controller decides, the views render, measure and write the
// DOM, the models keep the data; the rule 11 keeps the phases of an update visible in the controller.
// ARCHITECTURE.md describes the rules and the parts they keep apart.
// Usage: npm run check:arch
import fs              from 'node:fs';
import {createRequire} from 'node:module';
import path            from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const core = path.join(root, 'packages/core');
const skins = ['bootstrap/js', 'native/js', 'shared/js'].map(dir => path.join(root, 'packages/skins', dir));
const adapter = path.join(root, 'packages/skins/angular-material/src');
const wrapper = path.join(root, 'packages/angular/src');

function files(dir, specs = false) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
    const file = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return ['dist', 'node_modules'].includes(entry.name) ? [] : files(file, specs);
    }

    // Unit specs drive the code under test directly, so only the rules that ask for them apply to them
    return /\.ts$/.test(entry.name) && !(specs ? /\.d\.ts$/ : /\.(d|spec)\.ts$/).test(entry.name) ? [file] : [];
  });
}

/** The modules that a file imports: from, export from, import() and an import for its side effects, in either quotes. */
function imports(file) {
  return [...fs.readFileSync(file, 'utf8').matchAll(/(?:\bfrom\s+|\bimport\s*\(\s*|^\s*import\s+)(['"])([^'"]+)\1/gm)].map(match => match[2]);
}

const ts = createRequire(path.join(root, 'package.json'))('typescript');

/** The uses of window and document that run when a module loads: outside its functions, as a typeof check is not one. */
function loadTimeGlobals(file) {
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.ESNext, true);
  const uses = [];

  const visit = node => {
    if (ts.isFunctionLike(node) || ts.isClassDeclaration(node) || ts.isClassExpression(node) || ts.isTypeNode(node) || ts.isTypeOfExpression(node)) {
      return;
    }

    // The global itself, not a property of that name, as event.window
    const global = ts.isIdentifier(node) && ['window', 'document'].includes(node.text) && !(ts.isPropertyAccessExpression(node.parent) && node.parent.name === node);

    if (global) {
      uses.push(`${node.text} at line ${source.getLineAndCharacterOfPosition(node.getStart()).line + 1}`);
    }

    ts.forEachChild(node, visit);
  };

  source.statements.forEach(visit);

  return uses;
}

function resolves(file, specifier) {
  return specifier.startsWith('.') ? path.resolve(path.dirname(file), specifier) : null;
}

/** The methods and functions of a file whose JSDoc has no @phase; a class member is a line of the class at its indent. */
function untaggedPhases(source) {
  const lines = source.split('\n');
  let inClass = false;

  return lines.flatMap((line, i) => {
    inClass = /^(export )?class /.test(line) || (inClass && line !== '}');

    const name = (inClass ? line.match(/^ {2}(?:(?:private|protected|public|static|async)\s+)*(\w+)\(.*\{$/) : line.match(/^(?:export )?function (\w+)\(/))?.[1];

    if (!name || name === 'constructor' || name === 'update') {
      return [];
    }

    // The JSDoc right above the declaration, one line or a block
    let start = i - 1;

    while (start > 0 && /^\s*\*/.test(lines[start]) && !/^\s*\/\*\*/.test(lines[start])) {
      start--;
    }

    const doc = /^\s*\/\*\*/.test(lines[start] ?? '') ? lines.slice(start, i).join('\n') : '';

    return /^\s*\*?\s*@phase (input|state|render|events)$/m.test(doc.replace(/\s*\*\/$/, '')) ? [] : [name];
  });
}

const errors = [];
const report = (file, message) => errors.push(`${path.relative(root, file)}: ${message}`);

// The writes to the DOM and the reads of the layout that the rules 8 and 9 look for
const domWrites = /\.style\.|\b(setAttribute|removeAttribute|toggleAttribute|appendChild|insertBefore|replaceWith|replaceChildren|insertAdjacentHTML)\(|\.(append|prepend|before|after|remove)\(|\bclassList\.|\b(innerHTML|textContent)\s*=[^=]/;
const domReads = /\b(getComputedStyle|getBoundingClientRect|ResizeObserver)\b|\.(offset|client|scroll)(Width|Height|Top|Left)\b/;

for (const file of files(core)) {
  const relative = path.relative(core, file);
  const inViewOrModel = /^(view|model)\//.test(relative);
  const source = fs.readFileSync(file, 'utf8');

  // Rule 1: views and models do not depend on the controller or on the element
  for (const specifier of inViewOrModel ? imports(file) : []) {
    const target = resolves(file, specifier);

    if (target && (target.startsWith(path.join(core, 'controller')) || target === path.join(core, 'table-bro'))) {
      report(file, `rule 1: a view or a model imports '${specifier}'`);
    }
  }

  // Rule 5: animations run only through BroMotion: views through ctx.motion, Custom Elements through their own BroMotion.
  // Only the clock of BroMotion requests frames; comments do not count.
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

  if (/\brequestAnimationFrame\(/.test(code) && !file.endsWith('shared/clock.ts')) {
    report(file, 'rule 5: requestAnimationFrame is called outside shared/clock.ts; run animations through BroMotion');
  }

  // Rule 3: the core touches no window or document when its modules load, as in the server render
  for (const use of loadTimeGlobals(file)) {
    report(file, `rule 3: ${use} runs when the module loads`);
  }

  // Rule 6: a view or a model reads no view from the registry, it only puts the views that it makes into it
  for (const match of inViewOrModel ? code.matchAll(/\b(?:ctx\.)?view\.(\w+)\b(?!\s*=[^=])/g) : []) {
    report(file, `rule 6: a view or a model reads the view ${match[1]} from the registry ctx.view`);
  }

  // Rule 7: a view assigns no field of ctx.model
  for (const match of /^view\//.test(relative) ? code.matchAll(/\bmodel\.(\w+)(?:\[[^\]]*\])?\s*(?:=|\?\?=|\+=|-=)(?!=)/g) : []) {
    report(file, `rule 7: a view assigns the field ${match[1]} of ctx.model`);
  }

  // Rule 8: models write no DOM
  if (/^model\//.test(relative) && domWrites.test(code)) {
    report(file, `rule 8: a model writes the DOM: ${code.match(domWrites)?.[0]}`);
  }

  // Rule 9: the controller neither writes nor measures the DOM
  if (/^controller\//.test(relative) && (domWrites.test(code) || domReads.test(code))) {
    report(file, `rule 9: the controller writes or measures the DOM: ${(code.match(domWrites) ?? code.match(domReads))?.[0]}`);
  }

  // Rule 11: each method and function of the controller names its phase in its JSDoc
  for (const name of /^controller\//.test(relative) ? untaggedPhases(source) : []) {
    report(file, `rule 11: ${name} names no part in update(): add @phase input, state, render or events to its JSDoc`);
  }

  // Rule 10: the element renders no regions: it makes BroTableRegions and asks it to render them
  if (relative === 'table-bro.ts' && /\bnew\s+Bro\w*Container\(|\.(append|appendChild|prepend)\(/.test(code)) {
    report(file, 'rule 10: the element renders a region itself');
  }
}

// Rule 5 in the skins: their elements run their animations through BroMotion too
for (const file of skins.flatMap(dir => files(dir))) {
  if (/\brequestAnimationFrame\(/.test(fs.readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, ''))) {
    report(file, 'rule 5: a skin calls requestAnimationFrame; run animations through BroMotion');
  }
}

// Rule 2: skins, adapters and framework wrappers import the core only from '@table-bro/core', their unit specs too
for (const file of [...skins.flatMap(dir => files(dir, true)), ...files(adapter, true), ...files(wrapper, true)]) {
  for (const specifier of imports(file)) {
    const target = resolves(file, specifier);

    if (specifier.startsWith('@table-bro/core/') || (target && target.startsWith(core + path.sep))) {
      report(file, `rule 2: the core is imported as '${specifier}' instead of '@table-bro/core'`);
    }
  }
}

// Rule 3: nobody reads or writes the window.bro global
for (const file of [...files(core), ...skins.flatMap(dir => files(dir)), ...files(adapter), ...files(wrapper)]) {
  if (/\b(window|globalThis|self)\s*(as\s+any\s*\)\s*)?(\.bro\b|\[\s*['"]bro['"]\s*\])/.test(fs.readFileSync(file, 'utf8'))) {
    report(file, 'rule 3: window.bro is used');
  }
}

if (errors.length) {
  console.error(`check:arch failed, ARCHITECTURE.md describes the rules in its section The rules:\n${errors.join('\n')}`);
  process.exit(1);
}

console.log('check:arch: rules 1, 2, 3, 5, 6, 7, 8, 9, 10 and 11 hold');
