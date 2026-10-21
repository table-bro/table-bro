import {describe, expect, it} from 'vitest';

/** The sources of the core and of the vanilla skins, as text, by their paths from this folder. */
const sources = import.meta.glob<string>(['./**/*.ts', '../skins/{bootstrap,native,shared}/js/**/*.ts', '!**/*.spec.ts', '!**/*.d.ts', '!**/dist/**', '!**/node_modules/**'], {query: '?raw', import: 'default', eager: true});

/** The lines of the sources that match a pattern, as path:line. */
function linesMatching(pattern: RegExp, files: string[] = Object.keys(sources)): string[] {
  return files.flatMap(file => sources[file].split('\n').flatMap((line, i) => pattern.test(line) ? [`${file}:${i + 1}`] : []));
}

/** The source that a relative import of a file names: the file itself, or the index of a folder. */
function resolveImport(from: string, specifier: string): string {
  const parts = from.split('/').slice(0, -1);

  for (const part of specifier.split('/')) {
    if (part === '..') {
      parts.pop();
    } else if (part !== '.') {
      parts.push(part);
    }
  }

  const path = parts.join('/');

  return [`${path}.ts`, `${path}/index.ts`, path].find(file => file in sources) ?? path;
}

describe('the sources of the library', () => {
  it('carry no todo markers: a known problem is recorded outside the code', () => {
    expect(linesMatching(/\b(todo|fixme)\b/i)).toEqual([]);
  });

  it('have no constant conditions, which leave dead branches', () => {
    expect(linesMatching(/\((?:true|false)\s*(?:\|\||&&)|(?:\|\||&&)\s*(?:true|false)\s*\)/)).toEqual([]);
  });

  it('keep no global registry: two tables on a page share nothing', () => {
    // Also through a cast, as (window as any).bro or (<any>window).bro
    expect(linesMatching(/\b(?:window|globalThis|self)(?:\s+as\s+[^)]*)?\)?\s*(?:\.\s*bro\b|\[\s*['"]bro['"]\s*\])/)).toEqual([]);
  });

  it('let the models look up nothing in the document: a model of one table never finds another table', () => {
    expect(linesMatching(/\bdocument\b/, Object.keys(sources).filter(file => file.startsWith('./model/')))).toEqual([]);
  });

  it('import one another without a cycle, also through types only', () => {
    const imports = new Map(Object.entries(sources).map(([file, code]) => {
      return [file, [...code.matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*)'(\.{1,2}\/[^']+)'/g)].map(match => resolveImport(file, match[1]))];
    }));
    const done = new Set<string>();
    const cycles: string[] = [];
    const visit = (file: string, path: string[]) => {
      if (path.includes(file)) {
        cycles.push([...path.slice(path.indexOf(file)), file].join(' -> '));

        return;
      }

      if (!done.has(file)) {
        (imports.get(file) ?? []).forEach(next => visit(next, [...path, file]));
        done.add(file);
      }
    };

    Object.keys(sources).forEach(file => visit(file, []));

    expect(cycles).toEqual([]);
  });

  it('leave no module unused: every module but the entries and the build is imported', () => {
    const imported = new Set(Object.entries(sources).flatMap(([file, code]) => {
      return [...code.matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*)'(\.{1,2}\/[^']+)'/g)].map(match => resolveImport(file, match[1]));
    }));
    // The entries of the packages, their build configs, and the selector maps that the production build takes instead
    const entries = /(?:^|\/)index\.ts$|\/tsdown\.config\.ts$|\.prod\.ts$/;

    expect(Object.keys(sources).filter(file => !imported.has(file) && !entries.test(file))).toEqual([]);
  });

  it('give the selector maps of the production build every member of the development maps', () => {
    // A member that the production map lacks is undefined in the production build: its element gets no class
    const members = (file: string) => [...sources[file].matchAll(/^ {2}(\w+) = /gm)].map(match => match[1]);

    for (const file of ['./table-bro-selectors.ts', './shared/shared-selectors.ts']) {
      expect(members(file.replace(/\.ts$/, '.prod.ts'))).toEqual(members(file));
    }
  });
});
