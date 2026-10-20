// The components of Vue for tsc, which checks the TypeScript of the sample; Vite compiles them
declare module '*.vue' {
  import type {DefineComponent} from 'vue';

  const component: DefineComponent;

  export default component;
}
