import {BroDom, BroHTMLElement, isPrerendered} from '@table-bro/core';

import {type Theme, ThemeProvider}                         from '@mui/material/styles';
import {createElement, type CSSProperties, type ReactNode} from 'react';
import {flushSync}                                         from 'react-dom';
import {createRoot, type Root}                             from 'react-dom/client';

/** The theme of the application, which setMuiTheme() gives the elements of the skin. */
let muiTheme: Theme | undefined;
/**
 * The console named once the render that React put off: inside its render and effects it runs flushSync at their end.
 */
let deferredReported: boolean = false;
/** The console named once the missing theme: without it the CSS of the skin finds no CSS variables of MUI. */
let themeReported: boolean = false;
/**
 * The render of a React tree to markup, as renderToString of react-dom/server, which the server entry of the skin
 * gives: the elements of a prerender in a server DOM render their markup by it (prerenderTableBro).
 */
let serverRender: ((tree: ReactNode, element: HTMLElement) => string) | undefined;
/** The console named once a prerender of the skin without its server entry. */
let serverReported: boolean = false;

/**
 * The tooltips of the skin have the body small text of Material 3, as the tooltips of mat: the caption text of the theme
 * on a line of 16px. The tooltip of MUI has a text of 11px in the medium weight of its own.
 */
export const tooltipSlotProps = {tooltip: {sx: (theme: Theme): CSSProperties => ({...theme.typography.caption, lineHeight: '1rem'})}};

/**
 * Gives the elements of the skin the MUI theme of the application, before its tables render: the components of MUI in
 * them take its palette, typography, shapes and component settings. The theme writes the CSS variables of MUI
 * (cssVariables of createTheme), which the CSS of the skin reads for the parts of the table, as the rows and the
 * header.
 * @param theme - the theme of the application, from createTheme({cssVariables: ...})
 */
export function setMuiTheme(theme: Theme): void {
  muiTheme = theme;
}

/**
 * Gives the elements the render of a React tree to markup for a server DOM: the server entry of the skin calls it with
 * renderToString of react-dom/server, which the bundle of the browser does not carry.
 * @param render - the render of a React tree of an element to markup
 */
export function setServerRender(render: (tree: ReactNode, element: HTMLElement) => string): void {
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
 * The props of the theme provider of an element. The ones of the CSS variables of MUI exist in its types only for an
 * application that turns them on there, so the object is not a literal, which the check of excess props would fail.
 * @param theme - the theme of the application
 */
function providerProps(theme: Theme): {theme: Theme} {
  const props: {theme: Theme; colorSchemeNode: null; disableStyleSheetGeneration: boolean; storageManager: null} = {
    theme,
    colorSchemeNode: null,
    disableStyleSheetGeneration: true,
    storageManager: null
  };

  return props;
}

/**
 * An element of the skin that renders components of MUI in a React root of its own, as an Angular element of the skin
 * mat renders its component. It renders at once, by flushSync: the table measures the elements right after it adds
 * them, so an application of React calls the methods of the table outside the render and the effects of React. Its root
 * is a child with display: contents, since React clears the node of a new root, and the table or the element may hold
 * other nodes in the element.
 */
export abstract class BroMuiElement extends BroHTMLElement {
  /** The node of the React root. */
  private container: HTMLElement | null = null;
  /** A move in the DOM, as a sort of the rows: a connection follows the disconnection in the same task. */
  private moving: boolean = false;
  private root: Root | null = null;

  /** The React tree of the element. */
  protected abstract content(): ReactNode;

  connectedCallback(): void {
    if (this.moving) {
      this.moving = false;

      return;
    }

    // An element of the prerender keeps its markup until the table renders its own elements in its place
    if (this.root || isPrerendered(this)) {
      return;
    }

    // A server DOM, as of a prerender on the server, has a window of its own: the element renders its markup there by
    // the render of the server entry, not by a React root
    const server = (typeof window === 'undefined') || (this.ownerDocument.defaultView !== window);

    if (server && !serverRender) {
      if (!serverReported) {
        serverReported = true;
        console.error('Table, Bro: the skin mui renders its elements on the server with the import of @table-bro/react-mui/server');
      }

      return;
    }

    this.container = new BroDom(this.ownerDocument).createElement('div');
    this.container.className = 'bro-mui-root';
    this.prepend(this.container);

    if (server) {
      this.renderMarkup();

      return;
    }

    this.root = createRoot(this.container);
    this.update();
  }

  disconnectedCallback(): void {
    if (!this.root) {
      return;
    }

    this.moving = true;

    queueMicrotask(() => {
      if (this.moving) {
        this.moving = false;
        this.root?.unmount();
        this.container?.remove();
        this.root = null;
        this.container = null;
        this.unmounted();
      }
    });
  }

  /** Renders the element again with its current values; an element out of the DOM renders when it connects. */
  protected update(): void {
    const root = this.root;

    if (!root) {
      // An element of a server DOM renders its markup anew
      if (this.container && serverRender) {
        this.renderMarkup();
      }

      return;
    }

    const content = this.content();

    flushSync(() => root.render(this.tree(content)));

    // React renders a new root at once, except inside its own render and effects, where it renders at their end: the
    // table has measured the element by then. The console names the call to move, once
    if (content !== null && !this.container?.firstChild && !deferredReported) {
      deferredReported = true;
      console.error('Table, Bro: React renders the elements of the skin mui after its effect, but the table measures them at once: '
        + 'call configure() and the other methods of the table outside the render and the effects of React, as queueMicrotask(() => table.configure(...)) in an effect');
    }
  }

  /**
   * The tree of the element in the theme of the application. The theme writes its CSS variables and its color scheme
   * once, in the application: the provider of each element only gives the theme, without a style sheet, an attribute of
   * the scheme on the page, or a storage of the mode.
   * @param content - the tree of the element
   */
  private tree(content: ReactNode): ReactNode {
    if (!muiTheme && !themeReported) {
      themeReported = true;
      console.error('Table, Bro: the skin mui has no theme: call setMuiTheme(theme) with the MUI theme of the application, '
        + 'created with cssVariables, before the tables render');
    }

    return muiTheme ? createElement(ThemeProvider, providerProps(muiTheme), content) : content;
  }

  /**
   * Renders the markup of the element in a server DOM: the components of MUI with the styles of Emotion, which the
   * markup carries. The browser keeps it until its table renders its own elements in its place.
   */
  private renderMarkup(): void {
    this.container!.innerHTML = serverRender!(this.tree(this.content()), this);
  }

  /** The element left the DOM and its React root is gone. */
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
