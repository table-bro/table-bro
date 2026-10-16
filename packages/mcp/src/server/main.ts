#!/usr/bin/env node
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';

import {createServer, enabledExtensions, loadExtensions} from './server.js';

// The agent starts the server in the folder of the project: the project and its paid modules are there. A paid module
// joins by its name only: --extension @table-bro-extended/island-details
const root = process.cwd();
const server = createServer(root, await loadExtensions(root, enabledExtensions(process.argv.slice(2))));

await server.connect(new StdioServerTransport());
