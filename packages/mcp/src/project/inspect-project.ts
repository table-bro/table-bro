import fs   from 'node:fs';
import path from 'node:path';

import type {BroSpecSkin} from '../spec/spec.js';
import {tableBroVersion}  from '../version.js';

export interface BroProjectProblem {
  code: string;
  message: string;
  fix: string;
}

/**
 * The profile of the project of a developer: the answers an agent would collect from ten reads of files.
 * The search goes by the text of the files, so a missing item means "not found", not "absent".
 */
export interface BroProjectProfile {
  /** The folder that the profile describes. */
  folder: string;
  tableBro: {
    version: string | null;
    packages: Record<string, string>;
    /** The installed paid modules with their part of the MCP server. */
    extensions: string[];
  };
  framework: {name: 'angular' | 'none'; version: string | null};
  ui: {material: string | null; bootstrap: string | null};
  skins: {registered: BroSpecSkin[]; where: string[]};
  styles: string[];
  customElements: {tag: string; file: string}[];
  tables: string[];
  problems: BroProjectProblem[];
  /** The lists cut to their first items, with the number of the items each lost. */
  omitted?: Partial<Record<BroProjectList, number>>;
}

type BroProjectList = 'styles' | 'customElements' | 'tables' | 'problems';

/** The fields of a package.json that the inspection reads. */
interface BroPackageJson {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  'table-bro.mcp'?: string;
}

/** The fields of an angular.json that the inspection reads. */
interface BroAngularJson {
  projects?: Record<string, {architect?: {build?: {options?: {styles?: (string | {input: string})[]}}}}>;
}

const tableBroPackages = ['@table-bro/core', '@table-bro/angular', '@table-bro/angular-material', '@table-bro/bootstrap', '@table-bro/native'];

/** The tags of the elements of the skins and of the core: a column may name them without a definition of the project. */
const readyTags = /^bro-(mat|bs|nv)-|^bro-(switch|button|details-button|paginator|sort-header|text-ellipsis|toolbar|toolbar-main)$/;

const sourceExtensions = ['.ts', '.html', '.js', '.mjs'];
const skippedFolders = new Set(['node_modules', 'dist', '.angular', '.git', 'coverage', 'out-tsc', '.check']);
const maxFiles = 5000;

/** The longest walk: a folder with more folders than this is no project, as a home folder. */
const maxFolders = 10000;

/** The longest list of a profile: the profile of a big monorepo would fill the context of the agent. */
const maxItems = 20;

/** The first version of Table, Bro with an MCP server: an older project has no server of its version. */
const firstMcpVersion = '1.1.0';

/**
 * An exact version, as npm installs it: the only text of the project that goes into the command of a fix. The project
 * is foreign text, and an agent runs the commands of the fixes.
 */
const exactVersion = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$/;

/** Looks at a project as text: its packages, its setup of Table, Bro, its elements and its tables. */
export function inspectProject(root: string): BroProjectProfile {
  const folderMissing = !fs.existsSync(root) || !fs.statSync(root).isDirectory();
  const manifest = (folderMissing ? null : readJson<BroPackageJson>(path.join(root, 'package.json'))) ?? {};
  const declared: Record<string, string> = {...manifest.dependencies, ...manifest.devDependencies};
  const version = (name: string): string | null => readJson<BroPackageJson>(path.join(root, 'node_modules', name, 'package.json'))?.version ?? declared[name] ?? null;

  const packages = Object.fromEntries(tableBroPackages.map(name => [name, version(name)]).filter(([, value]) => value));
  const profile: BroProjectProfile = {
    folder: root,
    tableBro: {version: version('@table-bro/core'), packages, extensions: findExtensions(root).map(extension => extension.name)},
    framework: version('@angular/core') ? {name: 'angular', version: version('@angular/core')} : {name: 'none', version: null},
    ui: {material: version('@angular/material'), bootstrap: version('bootstrap')},
    skins: {registered: [], where: []},
    styles: angularStyles(root),
    customElements: [],
    tables: [],
    problems: []
  };

  const selectors: {tag: string; file: string}[] = [];
  const walk = folderMissing ? {files: [], cut: false} : sourceFiles(root);

  for (const file of walk.files) {
    const text = readText(file);
    // The paths of the profile have the slashes of the web on every system
    const relative = path.relative(root, file).split(path.sep).join('/');

    if (text === null) {
      continue;
    }

    for (const [skin, pattern] of <[BroSpecSkin, RegExp][]>[
      ['mat', /provideTableBroMatSkin\(|registerSkin\(\s*['"]mat['"]/],
      ['bs', /from\s+['"]@table-bro\/bootstrap['"]|import\s+['"]@table-bro\/bootstrap['"]|registerSkin\(\s*['"]bs['"]/],
      ['nv', /from\s+['"]@table-bro\/native['"]|import\s+['"]@table-bro\/native['"]|registerSkin\(\s*['"]nv['"]/]
    ]) {
      if (pattern.test(text) && !profile.skins.registered.includes(skin)) {
        profile.skins.registered.push(skin);
        profile.skins.where.push(relative);
      }
    }

    for (const match of text.matchAll(/customElements\.define\(\s*['"]([a-z][a-z0-9-]*)['"]/g)) {
      profile.customElements.push({tag: match[1], file: relative});
    }

    // The tag a column names in component.selector; the selector of an Angular component, as the filters, is no such tag
    for (const match of text.matchAll(/component:\s*\{[^{}]*?selector:\s*['"](bro-[a-z0-9-]+)['"]/g)) {
      selectors.push({tag: match[1], file: relative});
    }

    if (/<table-bro-ng\b|<table-bro-filter-drawer-container(-ng)?\b|createElement\(\s*['"]table-bro['"]\s*\)/.test(text)) {
      profile.tables.push(relative);
    }
  }

  profile.problems = problems(profile, selectors, Boolean(version('@angular/elements')));

  if (walk.cut) {
    profile.problems.unshift({code: 'search-cut', message: `the search stopped after ${maxFiles} source files or ${maxFolders} folders: ${root} is larger than a project`, fix: 'pass the root of the project in path'});
  }

  // A folder that is no project: the other problems follow from it, so it comes first
  if (folderMissing) {
    profile.problems.unshift({code: 'folder-missing', message: `${root} is not a folder`, fix: 'pass the root of the project in path, or start the server in it'});
  } else if (!fs.existsSync(path.join(root, 'package.json'))) {
    profile.problems.unshift({code: 'package-json-missing', message: `${root} has no package.json: it is not the root of a project`, fix: 'pass the root of the project in path, or start the server in it; for a new project create it first, as ng new for Angular'});
  }

  // The problems of the setup come before the tags, so a cut list keeps them
  for (const list of <BroProjectList[]>['styles', 'customElements', 'tables', 'problems']) {
    const lost = (<unknown[]>profile[list]).splice(maxItems).length;

    if (lost) {
      profile.omitted = {...profile.omitted, [list]: lost};
    }
  }

  return profile;
}

/**
 * The paid modules of the scope @table-bro-extended with a part of the MCP server: the field table-bro.mcp of their manifest,
 * a file inside the package.
 */
export function findExtensions(root: string): {name: string; entry: string}[] {
  const scope = path.join(root, 'node_modules', '@table-bro-extended');

  if (!fs.existsSync(scope)) {
    return [];
  }

  return fs.readdirSync(scope).flatMap(folder => {
    const directory = path.join(scope, folder);
    const manifest = readJson<BroPackageJson>(path.join(directory, 'package.json'));
    const entry = manifest?.['table-bro.mcp'];

    if (typeof entry !== 'string' || typeof manifest!.name !== 'string') {
      return [];
    }

    const file = path.resolve(directory, entry);
    const relative = path.relative(directory, file);

    return (relative && !relative.startsWith('..') && !path.isAbsolute(relative)) ? [{name: manifest!.name, entry: file}] : [];
  });
}

function problems(profile: BroProjectProfile, selectors: {tag: string; file: string}[], elements: boolean): BroProjectProblem[] {
  const list: BroProjectProblem[] = [];
  const {packages, version} = profile.tableBro;
  const angular = profile.framework.name === 'angular';

  if (!version) {
    list.push({code: 'table-bro-missing', message: '@table-bro/core is not found among the packages', fix: 'npm install @table-bro/core, the wrapper and the skin of the project, as get_docs with the topic setup says'});
  } else if (version.replace(/^[^\d]*/, '') !== tableBroVersion) {
    const project = version.replace(/^[^\d]*/, '');
    let fix = 'run the server of the version of Table, Bro of the project';

    if (older(project, firstMcpVersion)) {
      fix = `@table-bro/mcp starts with Table, Bro ${firstMcpVersion}: update the packages of Table, Bro of the project to ${tableBroVersion}, or check the answers of this server against the project`;
    } else if (exactVersion.test(project)) {
      fix = `run the server of the same version: npx -y @table-bro/mcp@${project}`;
    }

    list.push({code: 'version-mismatch', message: `this MCP server describes Table, Bro ${tableBroVersion}, the project has ${JSON.stringify(version)}`, fix});
  }

  if (angular && version && !packages['@table-bro/angular']) {
    list.push({code: 'wrapper-missing', message: 'the Angular wrapper @table-bro/angular is not found', fix: 'npm install @table-bro/angular'});
  }

  if (packages['@table-bro/angular-material'] && !profile.framework.version) {
    list.push({code: 'angular-missing', message: '@table-bro/angular-material needs Angular', fix: 'use the skin bs or nv without Angular'});
  }

  const usesMat = Boolean(packages['@table-bro/angular-material']) || profile.skins.registered.includes('mat');

  if (usesMat && !elements) {
    list.push({code: 'elements-package-missing', message: 'the mat skin and the cells of Angular need @angular/elements', fix: 'npm install @angular/elements'});
  }

  for (const [skin, name] of <[BroSpecSkin, string][]>[['mat', '@table-bro/angular-material'], ['bs', '@table-bro/bootstrap'], ['nv', '@table-bro/native']]) {
    if (packages[name] && !profile.skins.registered.includes(skin)) {
      list.push({code: 'skin-not-registered', message: `the registration of the skin ${skin} is not found`, fix: 'see get_docs with the topic setup'});
    }
  }

  if (angular && version) {
    const core = profile.styles.some(style => /table-bro(\.min)?\.s?css$/.test(style));
    const skinStyles = profile.styles.some(style => /table-bro\.(material|bootstrap|native)|table-(bootstrap|native)/.test(style));

    if (!core || !skinStyles) {
      list.push({code: 'css-missing', message: `the CSS of ${!core ? 'the core' : 'the skin'} is not found in "styles" of angular.json`, fix: 'see get_docs with the topic setup'});
    }
  }

  const defined = new Set(profile.customElements.map(element => element.tag));

  for (const {tag, file} of selectors) {
    if (!defined.has(tag) && !readyTags.test(tag)) {
      list.push({code: 'tag-not-defined', message: `${file} names the tag ${tag}, and its customElements.define is not found`, fix: `define ${tag} before the table is created`});
    }
  }

  return list;
}

/** Whether the version a comes before the version b, as 1.0.2 before 1.1.0. */
function older(a: string, b: string): boolean {
  const [first, second] = [a, b].map(version => version.split('.').map(part => parseInt(part, 10) || 0));
  const index = first.findIndex((part, position) => part !== second[position]);

  return index !== -1 && first[index] < second[index];
}

function angularStyles(root: string): string[] {
  const workspace = readJson<BroAngularJson>(path.join(root, 'angular.json'));

  if (!workspace?.projects) {
    return [];
  }

  return Object.values(workspace.projects).flatMap(project => {
    const styles = project?.architect?.build?.options?.styles ?? [];

    return styles.map((style: string | {input: string}) => (typeof style === 'string') ? style : style.input);
  });
}

/** The source files of a project, up to the limits of the walk; a folder that the server may not read stays out. */
function sourceFiles(root: string): {files: string[]; cut: boolean} {
  const files: string[] = [];
  const stack = [root];
  let folders = 0;

  while (stack.length) {
    if (files.length >= maxFiles || ++folders > maxFolders) {
      return {files, cut: true};
    }

    const directory = stack.pop()!;
    let entries: fs.Dirent[];

    try {
      entries = fs.readdirSync(directory, {withFileTypes: true});
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!skippedFolders.has(entry.name) && !entry.name.startsWith('.')) {
          stack.push(path.join(directory, entry.name));
        }
      } else if (sourceExtensions.includes(path.extname(entry.name))) {
        if (files.length >= maxFiles) {
          return {files, cut: true};
        }

        files.push(path.join(directory, entry.name));
      }
    }
  }

  return {files, cut: false};
}

/** The text of a file, or null for one that the server may not read. */
function readText(file: string): string | null {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return null;
  }
}

function readJson<T>(file: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}
