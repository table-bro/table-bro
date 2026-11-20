import {parseHTML} from 'linkedom';

// The elements of the skin extend the HTMLElement of the server DOM of the prerender, linkedom: it is global before the
// server imports the core and the skin, which SvelteKit does after the hooks, with the modules of the pages
globalThis.HTMLElement ??= parseHTML('<!doctype html><html><body></body></html>').window.HTMLElement;
