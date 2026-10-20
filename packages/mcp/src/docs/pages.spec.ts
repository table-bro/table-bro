import fs              from 'node:fs';
import path            from 'node:path';
import {fileURLToPath} from 'node:url';

import {ESLint}               from 'eslint';
import {compileString}        from 'sass';
import ts                     from 'typescript';
import {describe, expect, it} from 'vitest';

import {cssVariables} from '../spec/css-variables.js';
import {docPages}     from './pages.js';

// The files of code of Docs against the sources of Table, Bro: a file that a change of the library leaves behind fails
// here, before a reader copies it. The TypeScript files compile with the options of the repository, the styles compile with Sass,
// and the files and the CSS variables that they name exist.

/** The sources of Table, Bro in this repository. */
const root = fileURLToPath(new URL('../../../../', import.meta.url));
const styles = ['core', 'skins/angular-material', 'skins/bootstrap', 'skins/native'].map(folder => path.join(root, 'packages', folder, 'styles'));

const docFiles = docPages.flatMap(page => page.files.map(docFile => ({page: page.path, ...docFile})));

/** The place of a file of code among the files of the compiler: its page is its folder, so a file imports another one of its page. */
const docFilePath = (page: string, file: string): string => path.join(root, 'docs-files', page, file);

/** The diagnostics of the TypeScript files of code, compiled together with the options of the repository: its paths of the packages and its decorators. */
function typeScriptErrors(): string[] {
  const config = ts.readConfigFile(path.join(root, 'tsconfig.json'), ts.sys.readFile);
  const {options} = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
  const files = new Map(docFiles.filter(docFile => docFile.language === 'ts').map(docFile => [docFilePath(docFile.page, docFile.file), docFile.code]));

  // The project of a reader installs the types of Bootstrap in the setup of the skin bs: the repository has none
  files.set(docFilePath('', 'bootstrap.d.ts'), 'declare module \'bootstrap\';\n');

  const folders = new Set([...files.keys()].flatMap(file => {
    const parts = path.relative(root, path.dirname(file)).split(path.sep);

    return parts.map((_, i) => path.join(root, ...parts.slice(0, i + 1)));
  }));

  // A file of code names its variables for the reader, so it may leave some of them unused
  const program = ts.createProgram([...files.keys()], {...options, noEmit: true, noUnusedLocals: false, noUnusedParameters: false}, {
    ...ts.createCompilerHost(options),
    fileExists: file => files.has(file) || ts.sys.fileExists(file),
    directoryExists: folder => folders.has(folder) || ts.sys.directoryExists(folder),
    readFile: file => files.get(file) ?? ts.sys.readFile(file),
    getSourceFile: (file, language) => {
      const text = files.get(file) ?? ts.sys.readFile(file);

      return (text === undefined) ? undefined : ts.createSourceFile(file, text, language);
    }
  });

  return ts.getPreEmitDiagnostics(program)
    .filter(diagnostic => diagnostic.file && files.has(diagnostic.file.fileName))
    .map(diagnostic => {
      const {line} = diagnostic.file!.getLineAndCharacterOfPosition(diagnostic.start ?? 0);

      return `${path.relative(path.join(root, 'docs-files'), diagnostic.file!.fileName)}:${line + 1} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`;
    });
}

/** The remarks of ESLint on the TypeScript files of code: each one is linted as a file of an application, with the settings of the repository. */
async function eslintRemarks(): Promise<string[]> {
  // A file of code names its variables for the reader, so it may leave some of them unused
  const eslint = new ESLint({cwd: root, overrideConfig: {rules: {'@typescript-eslint/no-unused-vars': 'off'}}});
  const remarks: string[] = [];

  for (const docFile of docFiles.filter(item => item.language === 'ts')) {
    const [result] = await eslint.lintText(docFile.code, {filePath: path.join(root, 'docs-files', docFile.page, docFile.file)});

    remarks.push(...result.messages.map(message => `${docFile.page}/${docFile.file}:${message.line} ${message.message} (${message.ruleId})`));
  }

  return remarks;
}

/** Compiles SCSS with the styles of the packages, built with the copies of the shared styles, and the packages of the repository among its load paths. */
function compileScss(code: string): void {
  compileString(code, {
    loadPaths: [...styles, path.join(styles[0], 'mappings/production'), path.join(root, 'node_modules')],
    silenceDeprecations: ['import'],
    quietDeps: true
  });
}

describe('the files of code of Docs', () => {
  it('compile as TypeScript with the packages of Table, Bro', () => {
    expect(typeScriptErrors()).toEqual([]);
  }, 60_000);

  it('follow the code style of the repository: ESLint has no remarks on the TypeScript ones', async () => {
    expect(await eslintRemarks()).toEqual([]);
  }, 60_000);

  it('compile as SCSS with the sources of the skins, each skin of a file too', () => {
    const skins = ['material', 'bootstrap', 'native'];

    for (const docFile of docFiles.filter(item => item.language === 'scss')) {
      // A file that names the three skins stands for each of them: the skins have the same variables
      const variants = skins.every(skin => docFile.code.includes(`"table-bro.${skin}"`))
        ? skins.map(skin => docFile.code.replace(/@use "table-bro\.\w+"/, `@use "table-bro.${skin}"`))
        : [docFile.code];

      for (const variant of variants) {
        expect(() => compileScss(variant), `${docFile.page}/${docFile.file}: ${variant}`).not.toThrow();
      }
    }
  }, 60_000);

  it('are valid CSS', () => {
    for (const docFile of docFiles.filter(item => item.language === 'css')) {
      expect(() => compileString(docFile.code, {syntax: 'css'}), `${docFile.page}/${docFile.file}`).not.toThrow();
    }
  });

  it('name only the CSS variables of the skins', () => {
    const names = new Set(cssVariables.map(variable => variable.name));

    for (const docFile of docFiles) {
      for (const [name] of docFile.code.matchAll(/--bro-[a-z-]+/g)) {
        expect(names.has(name), `${docFile.page}/${docFile.file}: ${name}`).toBe(true);
      }
    }
  });

  it('of Getting started without a build are the files of samples/no-build, at the versions of the packages', () => {
    const files = docPages.find(page => page.path === 'getting-started')!.files;

    for (const file of ['index.html', 'app.js']) {
      expect(files.find(item => item.file === file)?.code, file).toBe(fs.readFileSync(path.join(root, 'samples/no-build', file), 'utf8'));
    }

    for (const [, name, version] of files.find(item => item.file === 'index.html')!.code.matchAll(/@table-bro\/([\w-]+)@([\d.]+)\//g)) {
      const folder = path.join(root, 'packages', name === 'core' ? name : `skins/${name}`);

      expect(version, name).toBe(JSON.parse(fs.readFileSync(path.join(folder, 'package.json'), 'utf8')).version);
    }
  });

  it('name only the files that the packages of Table, Bro ship', () => {
    // The CSS of a package is built from the entry file of its styles of the same name, and dist/lottie of the core is a copy of its Lottie files
    const shipped = (name: string, file: string): boolean => {
      const folder = path.join(root, 'packages', ['core', 'angular', 'mcp'].includes(name) ? name : `skins/${name}`);

      if (file === 'lottie') {
        return name === 'core' && fs.existsSync(path.join(folder, 'lottie'));
      }

      return /^[a-z.-]+\.min\.css$/.test(file) && fs.existsSync(path.join(folder, 'styles', `${file.replace(/\.min\.css$/, '')}.scss`));
    };

    const texts = [...docFiles.map(docFile => docFile.code), ...docPages.map(page => page.text)];

    for (const text of texts) {
      for (const [, name, file] of text.matchAll(/node_modules\/@table-bro\/([\w-]+)\/dist\/([\w.-]+)/g)) {
        expect(shipped(name, file), `${name}/${file}`).toBe(true);
      }
    }
  });
});
