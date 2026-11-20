import {BroDom, BroHTMLElement, isPrerendered} from '@table-bro/core';

import {type App, createApp, defineComponent, h, type PropType, render, type VNode, watch, type WatchStopHandle} from 'vue';
import type {createVuetify}                                                                                      from 'vuetify';
import {VIcon}                                                                                                   from 'vuetify/components/VIcon';

/** The instance of Vuetify of the application, which setVuetify() gives the elements of the skin. */
export type BroVuetifyInstance = Pick<ReturnType<typeof createVuetify>, 'install' | 'theme'>;

/** The attribute of the color scheme of a table with a theme of its own, themeAttribute of the config of the skin. */
export const vuetifyThemeAttribute: string = 'data-vuetify-theme';

/** The options of the skin that setVuetify() takes with the instance of Vuetify. */
export interface BroVuetifyOptions {
  /**
   * The class of the font of the ligature icons that the skin shows, material-icons by default: as
   * material-symbols-rounded for Material Symbols.
   */
  iconClass?: string;
}

/** The app of the skin with the Vuetify of the application: the context of the Vue roots of the elements. */
let skinApp: App | null = null;
/** The class of the font of the ligature icons, which setVuetify() gives. */
let iconClass: string = 'material-icons';
/** The styles of the themes of the application in the tables with a theme of their own. */
let themeSheet: CSSStyleSheet | null = null;
/** Stops following the themes of the previous instance of Vuetify. */
let stopThemes: WatchStopHandle | null = null;
/** The console named once the missing Vuetify: without it the components of Vuetify render nothing. */
let vuetifyReported: boolean = false;
/**
 * The render of a Vue tree to markup, which the server entry of the skin gives: the elements of a prerender in a server
 * DOM render their markup by it (prerenderTableBro).
 */
let serverRender: ((root: VNode) => string) | undefined;
/** The console named once a prerender of the skin without its server entry. */
let serverReported: boolean = false;

/**
 * The rules of the themes of the application for the tables with a theme of their own: for each theme, its CSS
 * variables on the host with the attribute of the theme, and on the components of Vuetify in it, whose class of the
 * theme of the application writes the variables of that theme. Vuetify selects a theme by a class, which CSS cannot
 * take for an attribute, so the rules copy the variables that Vuetify writes for each class of a theme.
 * @param styles - the styles of the themes that Vuetify writes, theme.styles
 * @param prefix - the prefix of the classes and the variables of Vuetify, v- by default
 */
export function themeRules(styles: string, prefix: string): string {
  const themes = new RegExp(`\\.${prefix}theme--([\\w-]+)[^{]*\\{([^}]*)\\}`, 'g');
  const host = (name: string) => `:is(table-bro, table-bro-filter-drawer-container)[${vuetifyThemeAttribute}="${name}"]`;

  return [...styles.matchAll(themes)]
    .map(([, name, variables]) => `${host(name)}, ${host(name)} [class*="${prefix}theme--"] {${variables}}`)
    .join('\n');
}

/**
 * Gives the elements of the skin the Vuetify of the application, before its tables render: the components of Vuetify
 * in them take its themes, defaults, icons and locale, as in the components of the application. The CSS of the skin
 * reads the CSS variables of its themes for the parts of the table, as the rows and the header; a table with a theme of
 * its own takes the theme of that name, light or dark, by a stylesheet that follows the themes of the application.
 * @param vuetify - the instance of createVuetify() that the application installs
 * @param options - the options of the skin, as {iconClass: 'material-symbols-rounded'}
 * @param options.iconClass - the class of the font of the ligature icons, material-icons by default
 */
export function setVuetify(vuetify: BroVuetifyInstance, options: BroVuetifyOptions = {}): void {
  iconClass = options.iconClass ?? 'material-icons';
  skinApp = createApp({});
  skinApp.use(vuetify);

  stopThemes?.();
  stopThemes = null;

  if (typeof document === 'undefined') {
    return;
  }

  const sheet = themeSheet ?? new CSSStyleSheet();
  const theme = vuetify.theme;

  if (!themeSheet) {
    themeSheet = sheet;
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  }

  stopThemes = watch(() => theme.styles.value, styles => sheet.replaceSync(themeRules(styles, theme.prefix)), {immediate: true});
}

/**
 * Gives the elements the render of a Vue tree to markup for a server DOM: the server entry of the skin calls it with the
 * server render of Vue, which the bundle of the browser does not carry.
 * @param render - the render of the root of an element to markup
 */
export function setServerRender(render: (root: VNode) => string): void {
  serverRender = render;
}

/**
 * Defines an element of the skin unless it is defined: without a DOM, as in the server render, it does nothing.
 * @param name - the tag of the element
 * @param element - the class of the element
 */
export function defineElement(name: string, element: CustomElementConstructor): void {
  if (typeof customElements !== 'undefined' && !customElements.get(name)) {
    customElements.define(name, element);
  }
}

/**
 * The root component of an element: it renders the tree of the element, so the components in it have a parent in the
 * context of the app of the skin. A new function of the tree updates it at once.
 */
const BroVuetifyRoot = defineComponent({
  props: {
    tree: {type: Function as PropType<() => VNode | VNode[] | null>, required: true}
  },
  setup: props => () => props.tree()
});

/** The icons of the skin by their names, the same component for the same icon at every render. */
const ligatures = new Map<string, () => string>();

/**
 * An icon of Vuetify with a ligature of Material Icons, as the icons of the skins mat and mui, whatever icon set the
 * application gives Vuetify: the font of the class of setVuetify(), Material Icons by default.
 * @param name - the name of the ligature, as close
 * @param className - the class of the icon
 */
export function icon(name: string, className?: string): VNode {
  let ligature = ligatures.get(name);

  if (!ligature) {
    ligature = () => name;
    ligatures.set(name, ligature);
  }

  return h(VIcon, {icon: ligature, class: className ? `${iconClass} ${className}` : iconClass});
}

/**
 * An element of the skin that renders components of Vuetify in a Vue root of its own, as an Angular element of the
 * skin mat renders its component. It renders at once, by render() of Vue, which patches the tree before it returns:
 * the table measures the elements right after it adds them. The root takes the context of the app of the skin, which
 * installs the Vuetify of the application. Its root is a child with display: contents, since Vue clears the node it
 * renders into, and the table or the element may hold other nodes in the element.
 */
export abstract class BroVuetifyElement extends BroHTMLElement {
  /** The element renders its markup in a server DOM, without a Vue root: it measures and observes nothing there. */
  protected server: boolean = false;

  /** The node of the Vue root. */
  private container: HTMLElement | null = null;
  /** A move in the DOM, as a sort of the rows: a connection follows the disconnection in the same task. */
  private moving: boolean = false;

  /** The Vue tree of the element. */
  protected abstract content(): VNode | VNode[] | null;

  connectedCallback(): void {
    if (this.moving) {
      this.moving = false;

      return;
    }

    // An element of the prerender keeps its markup until the table renders its own elements in its place
    if (this.container || isPrerendered(this)) {
      return;
    }

    // A server DOM, as of a prerender on the server, has a window of its own: the element renders its markup there by
    // the render of the server entry, not by a Vue root
    this.server = (typeof window === 'undefined') || (this.ownerDocument.defaultView !== window);

    if (this.server && !serverRender) {
      if (!serverReported) {
        serverReported = true;
        console.error('Table, Bro: the skin vuetify renders its elements on the server with the import of @table-bro/vue-vuetify/server');
      }

      return;
    }

    this.container = new BroDom(this.ownerDocument).createElement('div');
    this.container.className = 'bro-vuetify-root';
    this.prepend(this.container);

    this.update();
  }

  disconnectedCallback(): void {
    if (!this.container) {
      return;
    }

    this.moving = true;

    queueMicrotask(() => {
      if (this.moving) {
        this.moving = false;

        if (!this.server) {
          render(null, this.container!);
        }

        this.container!.remove();
        this.container = null;
        this.unmounted();
      }
    });
  }

  /** Renders the element again with its current values; an element out of the DOM renders when it connects. */
  protected update(): void {
    if (!this.container) {
      return;
    }

    if (!skinApp) {
      if (!vuetifyReported) {
        vuetifyReported = true;
        console.error('Table, Bro: the skin vuetify has no Vuetify: call setVuetify(vuetify) with the instance of createVuetify() '
          + 'of the application before the tables render');
      }

      return;
    }

    // A new tree of the same components patches the previous one before render() returns, in the context of the app of
    // the skin, which installs Vuetify
    const root = h(BroVuetifyRoot, {tree: () => this.content()});

    root.appContext = skinApp._context;

    // An element of a server DOM renders its markup anew; the browser keeps it until its table renders its own
    // elements in its place
    if (this.server) {
      this.container.innerHTML = serverRender!(root);
    } else {
      render(root, this.container);
    }
  }

  /** The node of the root of the element, while it is rendered. */
  protected get rootNode(): HTMLElement | null {
    return this.container;
  }

  /** The element left the DOM and its Vue root is gone. */
  protected unmounted(): void {
    // An element that stops a work of its own when it leaves the DOM overrides it
  }

  /**
   * Sends an event of the element, as the outputs of an Angular element of the skin mat: the table turns the event of a
   * cell into bro-action with its column and row.
   * @param type - the name of the event
   * @param detail - its detail
   */
  protected emit<T>(type: string, detail: T): void {
    this.dispatchEvent(new CustomEvent<T>(type, {detail}));
  }
}
