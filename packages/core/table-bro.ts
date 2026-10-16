import {BroController}                                                                                                                                                from './controller/controller';
import {copyRows, setRowNumbers}                                                                                                                                      from './controller/state';
import {copyAppObject}                                                                                                                                                from './shared/app-objects';
import {resolveConfig}                                                                                                                                                from './shared/config';
import {createContext}                                                                                                                                                from './shared/context';
import {BroHTMLElement}                                                                                                                                               from './shared/html';
import {getSkin}                                                                                                                                                      from './shared/skins';
import {selectors}                                                                                                                                                    from './table-bro-selectors';
import type {BroAppendRowsOptions, BroCol, BroConfigureOptions, BroEventDetail, BroReplaceRowsOptions, BroResolvedConfig, BroRow, BroTableState, TableBroHTMLElement} from './types/table-bro';
import type {BroUserTheme}                                                                                                                                            from './types/theme';
import {BroTableHTMLCellComponent}                                                                                                                                    from './view/dom/table-container/table-body-container/scrolling-container/table/tbody/tr/td/content/bro-table-html-cell';
import {renderedTables}                                                                                                                                               from './view/dom/table-container/table-body-container/scrolling-container/table/tbody/tr/td/content/td-content.view';
import {BroTableRegions}                                                                                                                                              from './view/dom/table-regions.view';
import {BroDetailsButton, detailsButtonSelector}                                                                                                                      from './view/features/details/details-button.view';

/*
 * © Table, Bro. 2025
 */
export class TableBro extends BroHTMLElement implements TableBroHTMLElement {
  static get observedAttributes(): string[] {
    return ['theme'];
  }

  /** init() was called: the table can render. */
  private initialized = false;

  // configure() sets them before the first render
  private cols!: BroCol[];
  private config!: BroResolvedConfig;

  /** The rows from init before the render; at render they move to ctx.state. */
  private readonly pendingInit: {rows?: BroRow[]} = {};

  /** The calls of the application before the first render, in their order: the render applies them after it. */
  private pendingCalls: ((controller: BroController) => void)[] = [];

  private controller: BroController | null = null;

  /** The lifecycle of the current connection; its signal becomes ctx.signal. */
  private lifecycle!: AbortController;

  /** The class of the skin that the last render put on the host. */
  private skinClass: string | null = null;
  /** The first render waits for the fonts of the document. */
  private waitingForFonts: boolean = false;
  /** The inline size of the shadow of the application, kept while a table without shadows has 0 there. */
  private appShadowSize: string | null = null;

  constructor() {
    super();

    // A theme property set before the element was defined shadows the setter: the value is applied again
    if (Object.prototype.hasOwnProperty.call(this, 'theme')) {
      const theme: BroUserTheme | null = this.theme;

      delete (this as {theme?: BroUserTheme | null}).theme;

      this.theme = theme;
    }
  }

  /**
   * The theme of this table: 'light', 'dark', or 'auto'. null returns the theme from config.theme.
   * The property reflects the theme attribute; the library itself does not write the attribute.
   */
  get theme(): BroUserTheme | null {
    return <BroUserTheme | null>this.getAttribute('theme');
  }

  set theme(value: BroUserTheme | null) {
    if (value === null || value === undefined) {
      this.removeAttribute('theme');
    } else {
      this.setAttribute('theme', value);
    }
  }

  connectedCallback(): void {
    // the browser calls this method when the element is added to the document
    // (it may be called many times if the element is added and removed many times)

    // Before init() there is nothing to render; a table moved in the DOM keeps its regions and subscriptions
    if (!this.initialized || this.isRendered()) {
      return;
    }

    this.renderSafely();
  }

  disconnectedCallback(): void {
    // the browser calls this method when the element is removed from the document
    // (it may be called many times if the element is added and removed many times)

    // A move calls disconnectedCallback and connectedCallback in one task, so the release waits for a microtask
    queueMicrotask(() => {
      if (!this.isConnected) {
        this.release();
      }
    });
  }

  attributeChangedCallback(name: string, _oldValue: string | null, value: string | null): void {
    // called when one of the attributes listed above changes
    if (name === 'theme' && this.controller) {
      this.controller.ctx.themeService.setExplicitTheme(<BroUserTheme | null>value);
    }
  }

  /**
   * Builds the table from its columns, its first rows and its config; a call again builds it anew. Without rows the table
   * shows its loading state until replaceRows() or setState().
   */
  configure<T extends object>(options: BroConfigureOptions<T>): void {
    // The table reads the fields of the rows of any type by the names of its columns
    const cols = <BroCol[]>options.cols;
    const rows = <BroRow[] | undefined>options.rows;
    const conf = options.conf;

    // Copies: the table never changes the application columns; cells and events get them back
    this.cols = cols.map(col => copyAppObject(col));

    // A copy: the row numbers below must not change the application rows
    if (rows) {
      this.pendingInit.rows = copyRows(rows);
    }

    // A table cannot start without a skin
    if (!conf?.skin) {
      throw new Error('[table-bro] conf.skin is required. Pass the name of a registered skin, for example configure({cols, conf: {skin: \'mat\'}}).');
    }

    const skinConfig = getSkin(conf.skin);

    if (!skinConfig) {
      throw new Error(`[table-bro] The skin "${conf.skin}" is not registered. Import the skin package, call provideTableBroMatSkin() for the skin mat, or call registerSkin() before configure(). If the skin is registered, check that the page loads one copy of table-bro: each copy has its own skin registry.`);
    }

    this.config = resolveConfig(skinConfig, conf);

    if (this.config.rowCounter) {
      this.cols.unshift({
        title: this.config.texts.rowCounter,
        name: selectors.rowCounter,
        className: 'bro-col_text-left bro-cell-number',
        sortKey: selectors.rowCounter
      });

      if (this.pendingInit.rows?.length) {
        this.pendingInit.rows = setRowNumbers(this.pendingInit.rows);
      }
    }

    if (!this.getAttribute('id')) {
      this.setAttribute('id', `table-bro-${randomName()}`);
    }

    // A page that replaces a table may hold the old one with the same id for a moment, as the @if of Angular does: the rules
    // of the column widths find this table by its instance as well, so the ones of the old table never size it
    if (!this.hasAttribute(selectors.instanceAttribute)) {
      this.setAttribute(selectors.instanceAttribute, randomName());
    }

    // The calls before a new configure() belong to the table it replaces
    this.pendingCalls = [];
    this.initialized = true;

    // A connected table renders now; one created in markup waited for configure()
    if (this.isConnected) {
      this.renderSafely();
    }
  }

  /** Replaces the rows of the table; the server mode passes the total of the query and the state of an empty answer. */
  replaceRows<T extends object>(rows: T[], options: BroReplaceRowsOptions = {}): void {
    if (!Array.isArray(rows)) {
      throw new TypeError('[table-bro] replaceRows() takes an array of rows.');
    }

    const delivered = [...<BroRow[]>rows];

    this.call('replaceRows', controller => controller.onReplaceRows(delivered, options));
  }

  /** Appends the rows of the answer to the last load intent of the table: its page and its page size. */
  appendRows<T extends object>(rows: T[], options: BroAppendRowsOptions): void {
    if (!Array.isArray(rows)) {
      throw new TypeError('[table-bro] appendRows() takes an array of rows.');
    }

    const delivered = [...<BroRow[]>rows];

    this.call('appendRows', controller => controller.onAppendRows(delivered, options));
  }

  /** Sets the state of the table: loading without rows, refreshing over its rows, a failure, or idle, which ends a refresh. */
  setState(state: BroTableState): void {
    this.call('setState', controller => controller.onSetState(state));
  }

  /**
   * Hands a call to the controller; a table that has not rendered yet keeps it for its first render. A call before
   * configure() has no table to go to.
   */
  private call(method: string, apply: (controller: BroController) => void): void {
    if (!this.initialized) {
      throw new Error(`[table-bro] ${method}() before configure(): configure the table first.`);
    }

    if (this.controller) {
      apply(this.controller);
    } else {
      this.pendingCalls.push(apply);
    }
  }

  private renderSafely(): void {
    // The first render waits for the fonts that the document loads now: the table measures its titles and values with
    // the fonts it shows them in, else a web font that comes later cuts them by a few pixels
    if (!this.isRendered() && document.fonts?.status === 'loading') {
      if (!this.waitingForFonts) {
        this.waitingForFonts = true;

        document.fonts.ready.then(() => {
          this.waitingForFonts = false;

          if (this.isConnected && !this.isRendered()) {
            this.renderSafely();
          }
        });
      }

      return;
    }

    try {
      this.render();
    } catch (error) {
      // The controller of this render shows the fail state and tells the application; an earlier failure is only reported
      if (this.isRendered()) {
        this.controller?.failRender(error);
      } else {
        reportError(error);
      }
    }
  }

  /** Whether the regions and subscriptions of the last render are alive. */
  private isRendered(): boolean {
    return !!this.controller && !this.lifecycle.signal.aborted;
  }

  /** Releases the subscriptions and animations of the last render. */
  private release(): void {
    if (!this.isRendered()) {
      return;
    }

    this.lifecycle.abort();

    this.controller?.dispose();
  }

  private events(controller: BroController): void {
    this.addEventListener('bro-action', event => {
      // The actions of a table in the row details of this one bubble through it: they are not its own
      if ((<Element>event.target).closest('table-bro') === this) {
        controller.onDelegateEvents(<CustomEvent<BroEventDetail>>event);
      }
    }, {signal: controller.ctx.signal});
  }

  private render(): void {
    // The rows from init at the first render, the current rows when connected again
    const rows = (this.pendingInit.rows !== undefined) ? this.pendingInit.rows : this.controller?.ctx.state.sourceRows;

    this.pendingInit.rows = undefined;

    // A table rendered again after its release starts from an empty host, without the controller of its last render:
    // a render that fails before its new controller is only reported, not shown by the released one
    this.release();
    this.controller = null;
    this.replaceChildren();

    // The host keeps the classes of the application: only the class of the skin changes
    if (this.skinClass) {
      this.classList.remove(this.skinClass);
    }

    this.classList.add(this.config.skin);
    this.skinClass = this.config.skin;

    // A table without shadows has no room for them in the CSS of its skin either, as in its script (resolveStyles)
    if (this.appShadowSize !== null) {
      this.style.setProperty('--bro-shadow-size', this.appShadowSize);
      this.appShadowSize = null;
    }

    if (!this.config.shadowsEnabled) {
      this.appShadowSize = this.style.getPropertyValue('--bro-shadow-size');
      this.style.setProperty('--bro-shadow-size', '0px');
    }

    this.lifecycle = new AbortController();

    /**
     * Instance context. Its theme service subscribes to system theme changes in case of `auto` theme
     * and, with the `theme` attribute, adds the theme class to the host after the skin class above.
     */
    const controller = new BroController(createContext(this, this.cols, this.config, this.lifecycle.signal));
    const {ctx} = controller;

    // A table in the row details of another one fits its values to the widths of that table
    renderedTables.set(this, ctx);

    this.controller = controller;

    if (this.config.debug) {
      // The instance context for debugging: document.querySelector('table-bro')[Symbol.for('table-bro:debug')]
      Reflect.set(this, Symbol.for('table-bro:debug'), ctx);
    }

    /** The toolbar, and the table for screen readers with the header */
    ctx.view.regions = new BroTableRegions(ctx);
    ctx.view.regions.render();

    /** Table body and paginator with the rows from init */
    controller.mount(rows);

    /** Attach events */
    this.events(controller);

    /** The calls of the application before the first render, in their order */
    const calls = this.pendingCalls;

    this.pendingCalls = [];
    calls.forEach(apply => apply(controller));
  }
}

safeDefine('table-bro', TableBro);

/* DOM */
safeDefine(detailsButtonSelector, BroDetailsButton);
safeDefine('bro-table-html-cell', BroTableHTMLCellComponent);

/** Defines the element in the browser only: imported without a DOM, as in the server render, the module defines nothing. */
function safeDefine(selector: string, constructor: CustomElementConstructor) {
  if (typeof customElements !== 'undefined' && !customElements.get(selector)) {
    customElements.define(selector, constructor);
  }
}

/** A random name in base 36; getRandomValues works outside a secure context too, unlike randomUUID, as on a page of plain HTTP. */
function randomName(): string {
  const [high, low] = window.crypto.getRandomValues(new Uint32Array(2));

  return `${high.toString(36)}${low.toString(36)}`;
}
