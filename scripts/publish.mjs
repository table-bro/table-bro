// The publication of the packages to npm: each package goes from the folder that `npm run check:pack` checks, the Angular
// packages from their ng-packagr builds in dist/. Run after `npm run build` and the checks of the release, as
// `npm run publish:packages`; the arguments go to every `npm publish`, as --otp=<code> or --dry-run. `npm run
// build:samples` publishes the packages to its local registry by the same function, so the pages of samples/ install
// what the release publishes.
import {execFileSync}  from 'node:child_process';
import path            from 'node:path';
import {fileURLToPath} from 'node:url';

import {packages, root} from './check-pack.mjs';

/**
 * Publishes every package, the core first, and stops at the first failure.
 * @param args - the arguments of `npm publish`, after the folder of the package
 */
export function publishAll(args) {
  for (const {dir} of packages) {
    execFileSync('npm', ['publish', path.join(root, dir), '--access', 'public', ...args], {cwd: root, stdio: 'inherit'});
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  publishAll(process.argv.slice(2));
}
