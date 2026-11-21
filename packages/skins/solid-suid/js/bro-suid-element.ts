import {BroDom, BroHTMLElement, isPrerendered} from '@table-bro/core';

import {createPalette, createTheme, type Theme, ThemeProvider}                                              from '@suid/material/styles';
import {type Accessor, createComponent, createMemo, createRenderEffect, createRoot, createSignal, type JSX} from 'solid-js';
import {Dynamic, render}                                                                                    from 'solid-js/web';

import {suidSkinConfig} from './table-bro.solid-suid.config';

/**
 * The theme of the application, which setSuidTheme() gives the elements of the skin: the theme providers of their roots
 * and the stylesheet of its variables read it, so a new theme reaches the elements rendered.
 */
const [suidTheme, setTheme] = createSignal<Theme>();
/** The console named once the missing theme: without it the CSS of the skin finds no CSS variables of the theme. */
let themeReported: boolean = false;
/**
 * The render of a Solid tree to markup, as renderToString of the server build of solid-js/web, which the server entry
 * of the skin gives: the elements of a prerender in a server DOM render their markup by it (prerenderTableBro).
 */
let serverRender: ((tree: () => JSX.Element) => string) | undefined;
/** The console named once a prerender of the skin without its server entry. */
let serverReported: boolean = false;
/**
 * The element of each server DOM whose markup carries the CSS variables of the theme: the parts of a prerendered table
 * read them before the browser runs setSuidTheme().
 */
const themedElements = new WeakMap<Document, BroSuidElement>();
/** The stylesheet of the CSS variables of the theme, which the document adopts with the first theme. */
let themeSheet: CSSStyleSheet | undefined;

/** The color schemes of a table with a theme of its own, which the table sets on its host by the attribute of the skin. */
type BroSuidScheme = 'light' | 'dark';

/** The attribute of the scheme of a table, themeAttribute of the config of the skin. */
const schemeAttribute: string = suidSkinConfig.themeAttribute;
/** The scheme of each host of a table, as the attribute of its scheme says, for the elements of the table. */
const hostSchemes = new WeakMap<Element, Accessor<string | null>>();
/** The themes of the other scheme of each theme of the application, which a table of that scheme takes. */
const schemeThemes = new WeakMap<Theme, Accessor<Theme>>();

/**
 * The theme of a scheme: the theme of the application in its own scheme, else a theme with the colors of its palette,
 * its typography and its shapes in the other scheme, as a table with a theme of its own takes it.
 * @param theme - the theme of the application
 * @param scheme - the scheme of the table, none for a table that takes the scheme of the application
 */
function schemeTheme(theme: Theme, scheme: string | null): Theme {
  if ((scheme !== 'light' && scheme !== 'dark') || theme.palette.mode === scheme) {
    return theme;
  }

  let other = schemeThemes.get(theme);

  if (!other) {
    // The palette follows the colors of the theme, as of a reactive theme of the application
    other = createRoot(() => createMemo(() => {
      const {palette} = theme;
      const mode: BroSuidScheme = (palette.mode === 'light') ? 'dark' : 'light';
      const color = (name: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success') => ({main: palette[name].main});
      const options = {mode, primary: color('primary'), secondary: color('secondary'), error: color('error'), warning: color('warning'), info: color('info'), success: color('success')};

      return createTheme({
        palette: createPalette(options),
        breakpoints: () => theme.breakpoints,
        components: () => theme.components,
        shape: () => theme.shape,
        spacing: () => theme.spacing,
        typography: () => theme.typography
      });
    }));
    schemeThemes.set(theme, other);
  }

  return other();
}

/**
 * The scheme of the table of a node: the attribute of the scheme of its host, or of the filter drawer around it, which
 * the table sets with its theme. Every element of the table reads it from one observer of the host.
 * @param node - an element in the table
 */
function hostScheme(node: Element): Accessor<string | null> {
  const host = node.closest('table-bro, table-bro-filter-drawer-container');

  // A server DOM renders once: the elements read the scheme of the host as it is
  if (!host || (typeof MutationObserver === 'undefined') || (host.ownerDocument.defaultView !== globalThis.window)) {
    return () => host?.getAttribute(schemeAttribute) ?? null;
  }

  let scheme = hostSchemes.get(host);

  if (!scheme) {
    const [read, write] = createSignal(host.getAttribute(schemeAttribute));

    new MutationObserver(() => write(host.getAttribute(schemeAttribute))).observe(host, {attributes: true, attributeFilter: [schemeAttribute]});
    hostSchemes.set(host, scheme = read);
  }

  return scheme;
}

/**
 * The CSS variables of a theme of SUID, which the CSS of the skin reads for the parts of the table, as the rows and the
 * header, and the cells of the application: SUID, a port of MUI 5, writes no CSS variables of its own. The names follow
 * the CSS variables of MUI in kebab case. The border of the cells is the divider of the theme, as the outline of the rows
 * of the tables of mat. They are declarations for a rule of the application, as the variables of the dark theme for the
 * prerendered tables of a page in its dark scheme, which the prerender, with the theme of one scheme, does not write.
 * @param theme - the theme of the scheme
 */
export function suidThemeVariables(theme: Theme): string {
  const {palette, shadows, typography} = theme;
  const font = (variant: 'body2' | 'button' | 'caption' | 'h6' | 'subtitle2') => {
    const style = typography[variant];

    return `${style.fontWeight} ${style.fontSize}/${style.lineHeight} ${style.fontFamily}`;
  };

  return `
    --suid-palette-action-active: ${palette.action.active};
    --suid-palette-action-disabled: ${palette.action.disabled};
    --suid-palette-action-hover: ${palette.action.hover};
    --suid-palette-action-selected: ${palette.action.selected};
    --suid-palette-background-paper: ${palette.background.paper};
    --suid-palette-divider: ${palette.divider};
    --suid-palette-primary-main: ${palette.primary.main};
    --suid-palette-success-contrast-text: ${palette.success.contrastText};
    --suid-palette-success-main: ${palette.success.main};
    --suid-palette-text-primary: ${palette.text.primary};
    --suid-palette-text-secondary: ${palette.text.secondary};
    --suid-font-body2: ${font('body2')};
    --suid-font-button: ${font('button')};
    --suid-font-caption: ${font('caption')};
    --suid-font-h6: ${font('h6')};
    --suid-font-subtitle2: ${font('subtitle2')};
    --suid-shadows-16: ${shadows[16]};`;
}

/**
 * The CSS variables of the theme of the application for the tables, and of each scheme for a table whose host has the
 * attribute of its scheme, as a table with a theme of its own: rule table-bro[data-suid-theme="dark"].
 * @param theme - the theme of the application
 */
function themeVariables(theme: Theme): string {
  const hosts = (scheme?: BroSuidScheme) => ['table-bro', 'table-bro-filter-drawer-container']
    .map(host => `${host}.suid${scheme ? `[${schemeAttribute}="${scheme}"]` : ''}`)
    .join(', ');

  return [
    `${hosts()} {${suidThemeVariables(theme)}\n}`,
    ...(<BroSuidScheme[]>['light', 'dark']).map(scheme => `${hosts(scheme)} {${suidThemeVariables(schemeTheme(theme, scheme))}\n}`)
  ].join('\n');
}

/**
 * Gives the elements of the skin the SUID theme of the application: the components of SUID in them take its palette,
 * typography, shapes and component settings. The skin writes the CSS variables of the theme, which the CSS of the skin
 * reads for the parts of the table, into a stylesheet of its own. A new theme, or a change of a reactive theme, as a
 * palette that follows the color scheme of the system, reaches the tables rendered.
 * @param theme - the theme of the application, from createTheme() of @suid/material/styles
 */
export function setSuidTheme(theme: Theme): void {
  setTheme(() => theme);

  if (themeSheet || (typeof document === 'undefined')) {
    return;
  }

  const sheet = themeSheet = new CSSStyleSheet();

  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];

  // The stylesheet lasts as long as the page, as the theme does
  createRoot(() => createRenderEffect(() => sheet.replaceSync(themeVariables(suidTheme()!))));
}

/**
 * Gives the elements the render of a Solid tree to markup for a server DOM: the server entry of the skin calls it with
 * renderToString of solid-js/web, which a server bundle resolves to the server build of Solid.
 * @param render - the render of the tree of an element to markup
 */
export function setServerRender(render: (tree: () => JSX.Element) => string): void {
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
 * An element of HTML in a tree of Solid, without JSX: the Dynamic component of Solid with the tag.
 * @param name - the tag of the element
 * @param props - its attributes, its children and its ref
 */
export function tag(name: string, props: Record<string, unknown>): JSX.Element {
  return createComponent(Dynamic, {component: name, ...props});
}

/**
 * A component of SUID in a tree of Solid, without JSX: createComponent of Solid, as the JSX of Solid compiles it. The
 * getters of the props stay reactive, and children given by a getter are created inside the component, where SUID
 * reads the props of its items, as the select does.
 */
export const suid: typeof createComponent = createComponent;

/**
 * A tree of the skin in the theme of the application, as of an element or a tooltip: in the theme of the scheme of its
 * table, when the table has a theme of its own.
 * @param content - the tree
 * @param node - the element in the table that renders the tree
 */
export function themed(content: () => JSX.Element, node: Element): JSX.Element {
  if (!suidTheme()) {
    if (!themeReported) {
      themeReported = true;
      console.error('Table, Bro: the skin suid has no theme: call setSuidTheme(theme) with the SUID theme of the application before the tables render');
    }

    return content();
  }

  const scheme = hostScheme(node);

  // The provider takes the theme as an accessor, which the components read, and the tree as a getter, so the tree is
  // created inside the context of the theme
  return suid(ThemeProvider, {theme: () => schemeTheme(suidTheme()!, scheme()), get children() {
    return content();
  }});
}

/**
 * An element of the skin that renders components of SUID in a Solid root of its own, as an Angular element of the
 * skin mat renders its component. Solid renders a new root at once, so the table measures the element rendered. The
 * tree reads the values of the element through attribute() and changed(), and update() renders the parts that read
 * them again: the components keep their nodes, their focus and their state. Its root is a child with display: contents,
 * since the table or the element may hold other nodes in the element.
 */
export abstract class BroSuidElement extends BroHTMLElement {
  /** The node of the Solid root. */
  private container: HTMLElement | null = null;
  /** Disposes the Solid root. */
  private dispose: (() => void) | null = null;
  /** A move in the DOM, as a sort of the rows: a connection follows the disconnection in the same task. */
  private moving: boolean = false;
  /** The changes of the values of the element: the parts of the tree that read them render again. */
  private version = createSignal<void>(undefined, {equals: false});

  /** The Solid tree of the element, created once for its root. */
  protected abstract content(): JSX.Element;

  connectedCallback(): void {
    if (this.moving) {
      this.moving = false;

      return;
    }

    // An element of the prerender keeps its markup until the table renders its own elements in its place
    if (this.dispose || isPrerendered(this)) {
      return;
    }

    // A server DOM, as of a prerender on the server, has a window of its own: the element renders its markup there by
    // the render of the server entry, not by a Solid root
    const server = (typeof window === 'undefined') || (this.ownerDocument.defaultView !== window);

    if (server && !serverRender) {
      if (!serverReported) {
        serverReported = true;
        console.error('Table, Bro: the skin suid renders its elements on the server with the import of @table-bro/solid-suid/server');
      }

      return;
    }

    this.container = new BroDom(this.ownerDocument).createElement('div');
    this.container.className = 'bro-suid-root';
    this.prepend(this.container);

    if (server) {
      this.renderMarkup();

      return;
    }

    this.dispose = render(() => this.tree(), this.container);
    this.rendered();
  }

  disconnectedCallback(): void {
    if (!this.dispose) {
      return;
    }

    this.moving = true;

    queueMicrotask(() => {
      if (this.moving) {
        this.moving = false;
        this.dispose?.();
        this.container?.remove();
        this.dispose = null;
        this.container = null;
        this.unmounted();
      }
    });
  }

  /**
   * An attribute of the element, which the tree reads: the part that reads it renders again on update().
   * @param name - the name of the attribute
   */
  protected attribute(name: string): string | null {
    this.changed();

    return this.getAttribute(name);
  }

  /** Makes the part of the tree that calls it render again on update(), as one that reads a property of the element. */
  protected changed(): void {
    this.version[0]();
  }

  /**
   * Renders again the parts of the tree that read the values of the element. Solid renders them at once, and inside its
   * own updates and effects at their end.
   */
  protected update(): void {
    // An element of a server DOM renders its markup anew
    if (!this.dispose) {
      if (this.container && serverRender) {
        this.renderMarkup();
      }

      return;
    }

    this.version[1]();
  }

  /** The tree of the element in the theme of the application. */
  private tree(): JSX.Element {
    return themed(() => this.content(), this);
  }

  /**
   * Renders the markup of the element in a server DOM: the components of SUID with their styles, and in the first
   * element of the document the CSS variables of the theme. The browser keeps it until its table renders its own
   * elements in its place.
   */
  private renderMarkup(): void {
    const theme = suidTheme();
    const document = this.ownerDocument;

    if (theme && !themedElements.has(document)) {
      themedElements.set(document, this);
    }

    const variables = (theme && themedElements.get(document) === this) ? `<style>${themeVariables(theme)}</style>` : '';

    this.container!.innerHTML = variables + serverRender!(() => this.tree());
    this.rendered();
  }

  /** The root of the element rendered, or its markup in a server DOM: an element that works on its nodes overrides it. */
  protected rendered(): void {
    // An element that works on the nodes of its tree overrides it
  }

  /** The element left the DOM and its Solid root is gone. */
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
