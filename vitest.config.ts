import {fileURLToPath} from 'node:url';

import {playwright}                from '@vitest/browser-playwright';
import ts                          from 'typescript';
import {defineConfig, type Plugin} from 'vitest/config';

// The unit specs of the library. They run in Chromium, not in a DOM emulation: the code under test reads
// computed styles and registered custom properties, which only a browser engine gives.
export default defineConfig({
  plugins: [angularJit()],
  // The skins and the Angular packages import the core and the wrapper by their names: the specs take their sources
  resolve: {
    alias: {
      '@table-bro/core': fileURLToPath(new URL('./packages/core/index.ts', import.meta.url)),
      '@table-bro/angular': fileURLToPath(new URL('./packages/angular/src/public-api.ts', import.meta.url))
    }
  },
  // Known in advance, the dependencies of the Angular specs do not make Vite reload a test on a first run with an empty cache
  optimizeDeps: {
    include: [
      '@angular/common', '@angular/compiler', '@angular/core', '@angular/core/testing', '@angular/elements', '@angular/platform-browser/testing',
      '@angular/material/button', '@angular/material/chips', '@angular/material/divider', '@angular/material/icon', '@angular/material/menu',
      '@angular/material/paginator', '@angular/material/progress-bar', '@angular/material/sidenav', '@angular/material/slide-toggle',
      '@angular/material/sort', '@angular/material/toolbar', '@angular/material/tooltip', 'tslib'
    ]
  },
  test: {
    include: ['packages/core/**/*.spec.ts', 'packages/skins/*/js/**/*.spec.ts', 'packages/angular/src/**/*.spec.ts', 'packages/skins/angular-material/src/**/*.spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{browser: 'chromium'}]
    }
  }
});

/**
 * The Angular wrapper and the adapter of Material run in JIT under the specs. JIT knows only decorators, so their files
 * go through the transform of the Angular compiler, as in ng test: it gives the signal inputs, outputs and queries the
 * decorators that JIT reads.
 */
function angularJit(): Plugin {
  const angularSource = /\/packages\/(angular|skins\/angular-material)\/src\/(?!.*\.spec\.ts$).*\.ts$/;
  let program: ts.Program | undefined;

  return {
    name: 'table-bro:angular-jit',
    enforce: 'pre',
    async transform(_code, id) {
      if (!angularSource.test(id)) {
        return undefined;
      }

      const {angularJitApplicationTransform} = await import('@angular/compiler-cli');
      const config = ts.getParsedCommandLineOfConfigFile(fileURLToPath(new URL('./tsconfig.json', import.meta.url)), {}, <ts.ParseConfigFileHost><unknown>{...ts.sys, onUnRecoverableConfigFileDiagnostic: () => undefined})!;

      program ??= ts.createProgram([id], {...config.options, noEmit: false, sourceMap: true, inlineSourceMap: false, inlineSources: true, declaration: false});

      // A file the program does not have yet, as one more spec imports, joins it
      if (!program.getSourceFile(id)) {
        program = ts.createProgram([...program.getRootFileNames(), id], program.getCompilerOptions(), undefined, program);
      }

      const output: Record<string, string> = {};

      program.emit(program.getSourceFile(id), (name, text) => output[name.endsWith('.map') ? 'map' : 'code'] = text, undefined, false, {before: [angularJitApplicationTransform(program)]});

      // The map leads the coverage and the stack traces back to the TypeScript source
      return {code: output['code'].replace(/\n\/\/# sourceMappingURL=.*$/, ''), map: {...JSON.parse(output['map']), sources: [id], sourceRoot: ''}};
    }
  };
}
