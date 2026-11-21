import {parseHTML} from 'linkedom';

// The elements of the core and of the skin extend the HTMLElement of a server DOM: this module gives it to the global
// scope, and the modules that import it before the core and the skin load after it
const {window} = parseHTML('<!doctype html><html><body></body></html>');

globalThis.HTMLElement ??= window.HTMLElement;
