import type {BroSpecSkin} from './spec.js';

/**
 * The values of BroConfig['css'] and BroConfig['components'] a spec may set for one skin, by the types of Table, Bro
 * (types/table-bro.ts). The config of the application lies over a copy of the config of the skin, so it may change
 * any of them before init, without a new build of the skin: nested objects are merged, arrays are replaced.
 */
export type BroSkinConfigShape = 'string' | 'boolean' | 'state' | {[key: string]: BroSkinConfigShape};

const className = {className: 'string'} as const;

const states: BroSkinConfigShape = {loading: 'state', 'no-data': 'state', 'not-found': 'state', fail: 'state'};

export const skinConfigShape: {css: BroSkinConfigShape; components: BroSkinConfigShape} = {
  css: {
    table: {
      className: 'string',
      thead: {className: 'string', tr: {className: 'string', th: className}},
      tbody: {className: 'string', tr: {className: 'string', td: className}}
    },
    shadow: className
  },
  components: {
    button: {selector: 'string', iconSelector: 'string'},
    dropdown: {selector: 'string', css: {button: className}},
    paginator: {
      selector: 'string',
      inputsAsProperties: 'boolean',
      recreateOnReplaceRows: 'boolean',
      css: {ul: {className: 'string', li: {className: 'string', a: className}}}
    },
    progressBar: {selector: 'string'},
    sortHeader: {selector: 'string', titleAsContent: 'boolean', contentSelector: 'string'},
    state: {fontIcon: 'boolean', lottie: 'boolean', states, statesDark: states},
    switch: {selector: 'string', css: {div: {className: 'string', input: className}}},
    textEllipsis: {selector: 'string'},
    toolbar: {selector: 'string', css: {nav: {className: 'string', div: className}}},
    toolbarMain: {
      selector: 'string',
      css: {
        toolbarTitle: className,
        navbarCollapse: {className: 'string', ul: {className: 'string', li: {className: 'string', a: className}}}
      }
    }
  }
};

/** The fields of the config that the spec gives in other places: the generator writes them from there. */
export const skinConfigElsewhere: Record<string, string> = {
  'components.toolbarMain.buttons': 'the buttons of the toolbar go into toolbar of the spec'
};

/**
 * The contracts of the elements of a skin: a custom element in place of one of them follows its contract,
 * a type of Table, Bro. The application defines the element, the generator does not write it.
 */
export const skinElementContracts: Record<string, string> = {
  button: 'BroButton',
  dropdown: 'BroDropdown',
  paginator: 'BroPaginatorElement',
  progressBar: 'BroProgressBar',
  sortHeader: 'BroSortHeader',
  textEllipsis: 'BroTextEllipsis',
  toolbar: 'BroToolbarElement',
  toolbarMain: 'BroToolbarMain'
};

export interface BroSkinCallback {
  path: string;
  signature: string;
  /** The skins that call it: the elements of the mat skin are Angular components and call none of their own. */
  skins: BroSpecSkin[];
  description: string;
}

export const skinCallbacks: BroSkinCallback[] = [
  {path: 'components.button.beforeRender', signature: '(element: Element, value: string) => void', skins: ['mat', 'bs', 'nv'], description: 'before the details button of the core renders'},
  {path: 'components.sortHeader.beforeRender', signature: '(element: Element, value: string) => void', skins: ['mat', 'bs', 'nv'], description: 'before the header of a column renders'},
  {path: 'components.sortHeader.afterRender', signature: '(element: Element, value: string) => void | (() => void)', skins: ['bs', 'nv'], description: 'after the header of a column renders, for example to add a tooltip; a returned function cleans up'},
  {path: 'components.textEllipsis.afterRender', signature: '(element: Element, value: string) => void | (() => void)', skins: ['bs', 'nv'], description: 'after a cut value renders, for example to add a tooltip; a returned function cleans up'},
  {path: 'components.toolbarMain.beforeRender', signature: '(searchButton: Element, value: string) => void', skins: ['bs', 'nv'], description: 'before the search button of the toolbar renders; value is its word, texts.search'},
  {path: 'components.toolbarSearch.beforeRender', signature: '(backButton: Element, clearButton: Element) => void', skins: ['mat', 'bs', 'nv'], description: 'before the buttons of the search line render'},
  {path: 'components.fontIcon.html', signature: '(iconName: string) => string', skins: ['mat', 'bs', 'nv'], description: 'the markup of a state icon with components.state.fontIcon'},
  {path: 'components.state.lottieHTML', signature: '(iconSrc: string) => string', skins: ['mat', 'bs', 'nv'], description: 'the markup of a state icon with components.state.lottie'}
];

/** Functions of the config that the config of a table cannot change, with the reason. */
export const skinCallbacksElsewhere: Record<string, string> = {
  'components.filterDrawer.beforeRender': 'the Filter Drawer is outside of the table and takes it from the registered config of the skin, not from the config of the table'
};
