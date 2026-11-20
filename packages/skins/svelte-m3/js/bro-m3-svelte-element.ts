import {BroDom, BroHTML, BroHTMLElement, isPrerendered} from '@table-bro/core';

import {type Component, createRawSnippet, flushSync, mount, type Snippet, unmount, untrack} from 'svelte';
import {SvelteMap}                                                                          from 'svelte/reactivity';

/** The props of a component of M3 Svelte that an element of the skin gives. */
export type BroM3SvelteProps = Record<string, unknown>;

/** The render of a component of M3 Svelte with its props to markup, as render() of svelte/server. */
export type BroM3SvelteServerRender = (component: Component<never>, props: BroM3SvelteProps) => string;

/**
 * The render of a component to markup, which the server entry of the skin gives: the elements of a prerender in a
 * server DOM render their markup by it (prerenderTableBro).
 */
let serverRender: BroM3SvelteServerRender | undefined;
/** The console named once a prerender of the skin without its server entry. */
let serverReported: boolean = false;

/**
 * Gives the elements the render of a component to markup for a server DOM: the server entry of the skin calls it with
 * render() of svelte/server, which the bundle of the browser does not carry.
 * @param render - the render of a component of M3 Svelte with its props to markup
 */
export function setServerRender(render: BroM3SvelteServerRender): void {
  serverRender = render;
}

/**
 * A component of M3 Svelte mounted into a node of an element of the skin, as an Angular element of the skin mat renders
 * its component. Its props live in a reactive map of Svelte: set() changes the ones that differ, and the component
 * renders them at the next flush, which the element runs at once by flushSync(). In a server DOM the component renders
 * its markup into the node once, without a root of Svelte.
 */
export class BroM3SveltePart {
  /** A prop changed since the last flush of the element. */
  private changed: boolean = false;
  /** The mounted component; none for the markup of a server DOM. */
  private readonly instance: Record<string, unknown> | null = null;
  /** The markup of a server DOM, which renders once. */
  private readonly markup: boolean;
  private readonly values = new SvelteMap<string, unknown>();

  /**
   * Mounts the component into its node, or renders its markup there in a server DOM.
   * @param component - the component of M3 Svelte
   * @param target - the node that holds it
   * @param props - its first props
   * @param server - the render of the component to markup for a server DOM
   */
  constructor(component: Component<never>, target: Element, props: BroM3SvelteProps, server?: BroM3SvelteServerRender) {
    const values = this.values;

    this.markup = !!server;

    if (server) {
      target.insertAdjacentHTML('beforeend', server(component, props));

      return;
    }

    this.set(props);
    this.changed = false;

    // The component reads its props through the map, so a change of a prop renders it again. The keys of the map are
    // the props that the element gives: the rest props of a component, as the attributes of its button, read them
    const view = new Proxy<BroM3SvelteProps>({}, {
      get: (_target, key) => (typeof key === 'string') ? values.get(key) : undefined,
      set: (_target, key, value) => (typeof key === 'string') && !!values.set(key, value),
      has: (_target, key) => (typeof key === 'string') && values.has(key),
      ownKeys: () => [...values.keys()],
      getOwnPropertyDescriptor: (_target, key) => ((typeof key === 'string') && values.has(key))
        ? {value: values.get(key), enumerable: true, configurable: true, writable: true}
        : undefined
    });

    this.instance = mount(<Component<BroM3SvelteProps>><unknown>component, {target, props: view});
  }

  /**
   * Gives the component new props: the ones that change render again, the ones that are gone are removed.
   * @param props - the props of the component
   */
  set(props: BroM3SvelteProps): void {
    // The markup of a server DOM renders once
    if (this.markup) {
      return;
    }

    [...this.values.keys()].filter(key => !(key in props)).forEach(key => {
      this.values.delete(key);
      this.changed = true;
    });
    Object.entries(props).forEach(([key, value]) => {
      if (this.values.get(key) !== value || !this.values.has(key)) {
        this.values.set(key, value);
        this.changed = true;
      }
    });
  }

  /** Whether a prop changed since the last call: the element flushes the render of Svelte only then. */
  takeChange(): boolean {
    const changed = this.changed;

    this.changed = false;

    return changed;
  }

  /** Unmounts the component. */
  destroy(): void {
    if (this.instance) {
      void unmount(this.instance);
    }
  }
}

/**
 * The children of a component of M3 Svelte as markup, as the label of a button or of a chip: the snippet is the same
 * while its markup stays, so the component renders its children again only when they change.
 */
export class BroM3SvelteMarkup {
  private html: string | null = null;
  private snippet: Snippet | null = null;

  /**
   * The snippet of the markup: one element, as a raw snippet of Svelte renders.
   * @param html - the markup of one element
   */
  of(html: string): Snippet {
    if (html !== this.html || !this.snippet) {
      const markup = html;

      this.html = html;
      this.snippet = createRawSnippet(() => ({render: () => markup}));
    }

    return this.snippet;
  }
}

/**
 * The markup of a font icon of Material Symbols, which the application loads, as the icons of the config of a table
 * name them: M3 Svelte draws its own icons from the SVG of Iconify, which takes no names.
 * @param name - the name of the ligature of the icon
 */
export function iconHTML(name: string): string {
  return `<span class="material-symbols-outlined bro-m3-svelte-icon" aria-hidden="true">${BroHTML.escape(name)}</span>`;
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
 * An element of the skin that mounts components of M3 Svelte into nodes of its own. It renders at once: mount() of
 * Svelte renders a component synchronously, and a change of its props renders by flushSync(), since the table measures
 * the elements right after it adds them. Its nodes are in a child with display: contents: the table and the element
 * hold other nodes in the element.
 */
export abstract class BroM3SvelteElement extends BroHTMLElement {
  /** The node of the markup of the element. */
  private container: HTMLElement | null = null;
  /** A move in the DOM, as a sort of the rows: a connection follows the disconnection in the same task. */
  private moving: boolean = false;
  /** The components that the element mounted. */
  private parts: BroM3SveltePart[] = [];
  /** The element renders its markup in a server DOM. */
  private server: boolean = false;

  /**
   * Builds the markup of the element in its node and mounts the components of M3 Svelte into it with mountPart().
   * @param container - the node of the element
   */
  protected abstract render(container: HTMLElement): void;

  /** Gives the components of the element their props from its current values. */
  protected abstract refresh(): void;

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
    // the render of the server entry, not by a root of Svelte
    const server = (typeof window === 'undefined') || (this.ownerDocument.defaultView !== window);

    if (server && !serverRender) {
      if (!serverReported) {
        serverReported = true;
        console.error('Table, Bro: the skin m3-svelte renders its elements on the server with the import of @table-bro/svelte-m3/server');
      }

      return;
    }

    this.server = server;
    this.container = new BroDom(this.ownerDocument).createElement('div');
    this.container.className = 'bro-m3-svelte-root';
    this.prepend(this.container);

    // mount() renders the components at once with their first props: no flush, which inside the mount of an application
    // of Svelte, as of a filter drawer in its markup, would run the effects of the application before their time
    this.render(this.container);
    this.refreshParts();
    this.parts.forEach(part => part.takeChange());
  }

  disconnectedCallback(): void {
    if (!this.container) {
      return;
    }

    this.moving = true;

    queueMicrotask(() => {
      if (this.moving) {
        this.moving = false;
        this.parts.forEach(part => part.destroy());
        this.parts = [];
        this.container?.remove();
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

    this.refreshParts();

    // A change of the props renders at the next flush of Svelte: the table measures the element at once
    if (this.parts.map(part => part.takeChange()).includes(true)) {
      flushSync();
    }
  }

  /**
   * Gives the components their props outside the tracking of Svelte: an element may render inside a block of an
   * application of Svelte, as in its markup, where a change of state of another root is not the state of that block.
   */
  private refreshParts(): void {
    untrack(() => this.refresh());
  }

  /**
   * Mounts a component of M3 Svelte into a node of the element; the element unmounts it when it leaves the DOM.
   * @param component - the component
   * @param target - the node that holds it
   * @param props - its first props
   */
  protected mountPart(component: Component<never>, target: Element, props: BroM3SvelteProps): BroM3SveltePart {
    const part = new BroM3SveltePart(component, target, props, this.server ? serverRender : undefined);

    this.parts.push(part);

    return part;
  }

  /** The element renders its markup in a server DOM, where the components render once and measure nothing. */
  protected get serverRendered(): boolean {
    return this.server;
  }

  /** The element left the DOM and its components are unmounted. */
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
