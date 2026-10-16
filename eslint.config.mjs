import js                            from '@eslint/js';
import stylistic                     from '@stylistic/eslint-plugin';
import perfectionist                 from 'eslint-plugin-perfectionist';
import {defineConfig, globalIgnores} from 'eslint/config';
import globals                       from 'globals';
import tseslint                      from 'typescript-eslint';

import alignImports     from './eslint-rules/align-imports.mjs';
import decoratorImports from './eslint-rules/decorator-imports.mjs';
import importsOnOneLine from './eslint-rules/imports-on-one-line.mjs';
import inputOrder       from './eslint-rules/input-order.mjs';
import keywordSpacing   from './eslint-rules/keyword-spacing.mjs';
import quoteProps       from './eslint-rules/quote-props.mjs';
import viewMemberOrder  from './eslint-rules/view-member-order.mjs';

// The ESLint settings of Table, Bro for all its TS and JS code: the core, the skins, the Angular packages, the MCP, the
// stand and its e2e tests, the scripts and the configs. `npm run lint` checks, `npm run format` fixes.

// The modules of the groups of the imports, of the import declarations and of the field imports of the Angular decorators:
// Angular and the UI libraries, Table, Bro among them; any other module is an other library, a relative one is the application.
const importGroups = {
  angular: ['^@angular/(?!material(/|$)|cdk(/|$))'],
  ui: ['^@angular/(material|cdk)(/|$)', '^angular2-ladda$', '^bootstrap$', '^table-bro(\\.[a-z-]+)?(/|$)', '^@table-bro(-extended)?/']
};

const style = stylistic.configs.customize({
  indent: 2,
  quotes: 'single',
  semi: true,
  commaDangle: 'never',
  braceStyle: '1tbs',
  arrowParens: false,
  quoteProps: 'as-needed',
  jsx: false
});

export default defineConfig([
  globalIgnores(['**/node_modules', '**/dist', '**/.angular', '**/*.d.ts', 'packages/mcp/.check']),
  {
    files: ['**/*.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    rules: {
      // A type comes in by `type`: inline next to the values of its module, import type {...} for a module of types only.
      // The compilers with verbatimModuleSyntax, as of the template vanilla-ts of Vite, fail on a type imported as a value;
      // typeof import('...') stays, as vi.mock takes it.
      '@typescript-eslint/consistent-type-imports': ['error', {prefer: 'type-imports', fixStyle: 'inline-type-imports', disallowTypeAnnotations: false}],
      '@typescript-eslint/no-import-type-side-effects': 'error'
    }
  },
  {
    files: ['packages/core/**/*.ts', 'packages/skins/**/*.ts', 'packages/angular/**/*.ts', 'stand/**/*.{ts,js}'],
    languageOptions: {
      globals: globals.browser
    }
  },
  {
    files: ['packages/mcp/**/*.{ts,js,mjs}', 'scripts/**/*.mjs', '**/*.config.{js,mjs,ts}', 'eslint-rules/*.mjs'],
    languageOptions: {
      globals: globals.node
    }
  },

  // Code style: the IntelliJ IDEA TypeScript scheme, plus the blank-line rules IDEA does not have.
  // `npm run format` applies it; IDEA applies it on save with "Run eslint --fix on save".
  style,
  {
    plugins: {
      perfectionist,
      local: {rules: {'align-imports': alignImports, 'decorator-imports': decoratorImports, 'imports-on-one-line': importsOnOneLine, 'input-order': inputOrder, 'keyword-spacing': keywordSpacing, 'quote-props': quoteProps, 'view-member-order': viewMemberOrder}}
    },
    rules: {
      // IDEA: "Force braces: Always", with the body on a line of its own.
      curly: ['error', 'all'],
      '@stylistic/brace-style': ['error', '1tbs', {allowSingleLine: false}],
      '@stylistic/quotes': ['error', 'single', {avoidEscape: true}],
      // The keys of an object in camelCase go without quotes, any other key in quotes: {'ad_storage': 'denied', adStorage: 'denied'}.
      '@stylistic/quote-props': 'off',
      'local/quote-props': 'error',
      // No parentheses around the only parameter of an arrow function, with a block body too: x => x.id, x => {...}.
      '@stylistic/arrow-parens': ['error', 'as-needed'],
      // No space after the type of a type assertion, before a keyword too: <BroButton[]>this.toolbarButtons().
      '@stylistic/keyword-spacing': 'off',
      'local/keyword-spacing': ['error', {before: true, after: true}],
      // The options of the indent of stylistic.configs.customize, but the wrapped parameters of a function line up with its first one.
      '@stylistic/indent': ['error', 2, {
        'ArrayExpression': 1,
        'CallExpression': {arguments: 1},
        flatTernaryExpressions: false,
        'FunctionDeclaration': {body: 1, parameters: 'first', returnType: 1},
        'FunctionExpression': {body: 1, parameters: 'first', returnType: 1},
        ignoreComments: false,
        ignoredNodes: ['TSUnionType', 'TSIntersectionType'],
        'ImportDeclaration': 1,
        'MemberExpression': 1,
        'ObjectExpression': 1,
        offsetTernaryExpressions: true,
        outerIIFEBody: 1,
        'SwitchCase': 1,
        tabLength: 2,
        'VariableDeclarator': 1
      }],
      // Blank lines: around a group of declarations, around blocks, before `return` and after `super()`.
      // When several entries match a pair of statements, the last one wins.
      '@stylistic/padding-line-between-statements': ['error',
        {blankLine: 'always', prev: '*', next: ['const', 'let', 'var']},
        {blankLine: 'always', prev: ['const', 'let', 'var'], next: '*'},
        {blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var']},
        {blankLine: 'always', prev: 'block-like', next: '*'},
        {blankLine: 'always', prev: '*', next: ['if', 'for', 'while', 'do', 'switch', 'try']},
        {blankLine: 'always', prev: '*', next: 'return'},
        {blankLine: 'always', prev: {selector: 'ExpressionStatement[expression.callee.type="Super"]'}, next: '*'}
      ],
      // `=` ends the line, as in IDEA; other operators start the next one.
      '@stylistic/operator-linebreak': ['error', 'before', {overrides: {'=': 'after'}}],
      // No spaces in the braces of objects, destructuring, imports and types: {path: string; content: string}.
      '@stylistic/object-curly-spacing': ['error', 'never'],

      // The imports in groups between blank lines, each sorted by module name: the platform, as Node and the Workers
      // runtime, Angular, UI libraries, other libraries, the application. The tools, as Vitest, Playwright and ESLint, are
      // other libraries.
      'perfectionist/sort-imports': ['error', {
        customGroups: [
          {groupName: 'platform', elementNamePattern: ['^node:', '^cloudflare:']},
          {groupName: 'angular', elementNamePattern: importGroups.angular},
          {groupName: 'ui', elementNamePattern: importGroups.ui}
        ],
        groups: ['platform', 'angular', 'ui', ['builtin', 'external'], ['internal', 'parent', 'sibling', 'index', 'unknown'], 'style'],
        newlinesBetween: 1,
        newlinesInside: 0
      }],
      // The field imports of @Component, @Directive and @NgModule goes last, in the same groups, each sorted by name.
      'local/decorator-imports': ['error', importGroups],
      'perfectionist/sort-named-imports': 'error',
      // An import always takes one line: the lines of Table, Bro have no limit of length.
      'local/imports-on-one-line': ['error', {maxLength: Number.MAX_SAFE_INTEGER}],
      'local/align-imports': 'error',
      // The spaces that line up `from` of the imports and of the re-exports are not extra.
      '@stylistic/no-multi-spaces': ['error', {exceptions: {'Property': true, 'ImportDeclaration': true, 'ExportNamedDeclaration': true, 'ExportAllDeclaration': true}}]
    }
  },
  {
    // The views of the core and of the skins in the order of BroView, the HTML of template() first, as in Angular.
    files: ['packages/core/**/*.ts', 'packages/skins/{bootstrap,native,shared}/js/**/*.ts'],
    rules: {
      'local/view-member-order': 'error'
    }
  },
  {
    // The inputs of the components of the mat skin: col, row and config first as a group, then the others by name.
    files: ['packages/skins/angular-material/src/lib/**/*.material.component.ts'],
    rules: {
      'local/input-order': 'error'
    }
  }
]);
