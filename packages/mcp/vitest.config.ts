import {fileURLToPath} from 'node:url';

import {defineConfig} from 'vitest/config';

// The unit specs of @table-bro/mcp: pure functions, so they run in Node
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  test: {
    include: ['src/**/*.spec.ts'],
    environment: 'node'
  }
});
