import {BroDom, BroHTMLElement, isPrerendered} from '@table-bro/core';

import {type Theme, ThemeProvider}     from '@mui/material/styles';
import {createElement, type ReactNode} from 'react';
import {flushSync}                     from 'react-dom';
import {createRoot, type Root}         from 'react-dom/client';

/** The theme of the application, which setMuiTheme() gives the elements of the skin. */
let muiTheme: Theme | undefined;
/**
 * The console named once the render that React put off: inside its render and effects it runs flushSync at their end.
 */
let deferredReported: boolean = false;
/** The console named once the missing theme: without it the CSS of the skin finds no CSS variables of MUI. */
let themeReported: boolean = false;

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

    this.container = new BroDom(this.ownerDocument).createElement('div');
    this.container.className = 'bro-mui-root';
    this.prepend(this.container);

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
      return;
    }

    // The theme writes its CSS variables and its color scheme once, in the application: the provider of each element
    // only gives the theme, without a style sheet, an attribute of the scheme on the page, or a storage of the mode
    const content = this.content();
    const tree = muiTheme ? createElement(ThemeProvider, providerProps(muiTheme), content) : content;

    if (!muiTheme && !themeReported) {
      themeReported = true;
      console.error('Table, Bro: the skin mui has no theme: call setMuiTheme(theme) with the MUI theme of the application, '
        + 'created with cssVariables, before the tables render');
    }

    flushSync(() => root.render(tree));

    // React renders a new root at once, except inside its own render and effects, where it renders at their end: the
    // table has measured the element by then. The console names the call to move, once
    if (content !== null && !this.container?.firstChild && !deferredReported) {
      deferredReported = true;
      console.error('Table, Bro: React renders the elements of the skin mui after its effect, but the table measures them at once: '
        + 'call configure() and the other methods of the table outside the render and the effects of React, as queueMicrotask(() => table.configure(...)) in an effect');
    }
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
