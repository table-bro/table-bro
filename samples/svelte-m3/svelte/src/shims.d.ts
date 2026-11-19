// The components of Svelte for tsc, which checks the TypeScript of the sample; Vite compiles them
declare module '*.svelte' {
  import type {Component} from 'svelte';

  const component: Component;

  export default component;
}
