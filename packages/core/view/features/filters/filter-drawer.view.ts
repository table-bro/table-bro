import {resolveTexts}                                                                                                               from '../../../shared/config';
import {BroDom}                                                                                                                     from '../../../shared/dom';
import {actionEvent, columnsWidthEvent, filtersCloseEvent, filtersOpenEvent, filtersToggleEvent}                                    from '../../../shared/events';
import {BroHTMLElement, classAttr}                                                                                                  from '../../../shared/html';
import {dispatchAction, focusableSelector}                                                                                          from '../../../shared/interaction';
import {getSkin}                                                                                                                    from '../../../shared/skins';
import type {BroConfiguredElement, BroEventDetail, BroFilterDrawerHTMLElement, BroSkin, BroSkinConfig, BroTexts, BroToolbarElement} from '../../../types/table-bro';

/**
 * Defines <table-bro-filter-drawer-container> on demand: the core does not define it on import, the application calls
 * this when it uses the element.
 * @group Filter drawer
 */
export function defineTableBroFilterDrawerContainer(): void {
  registerFilterDrawerProperties();

  // Only in the browser: without a DOM, as in the server render, there is nothing to define
  if (typeof customElements !== 'undefined' && !customElements.get('table-bro-filter-drawer-container')) {
    customElements.define('table-bro-filter-drawer-container', TableBroFilterDrawerContainer);
  }
}

/**
 * Registers the custom properties that the filter drawers move by a transition from 0 to 1: --bro-filter-drawer-opened,
 * how far a drawer is opened, and --bro-filter-drawer-modal, how far it lies over its table. The script registers them,
 * not an @property rule of the CSS: whenever the style sheets of the document change, as when a table writes the widths
 * of its columns or a tooltip adds its styles while the drawer moves, WebKit drops the running transition of a property
 * of an @property rule, and the drawer would jump to its end. The drawer of the core and the one of the mat skin call this.
 * @group Filter drawer
 */
export function registerFilterDrawerProperties(): void {
  // Only in the browser: without a DOM, as in the server render, there are no styles
  if (typeof CSS === 'undefined') {
    return;
  }

  ['--bro-filter-drawer-opened', '--bro-filter-drawer-modal'].forEach(name => {
    try {
      CSS.registerProperty({name, syntax: '<number>', inherits: true, initialValue: '0'});
    } catch {
      // Registered already, as by an earlier call, or a browser without the registration of properties
    }
  });
}

/**
 * The table with the filter drawer: <table-bro-filter-drawer-container skin="bs"> holds the table, <table-bro> or
 * a wrapper of a framework, and the filters of the application marked with slot="filters". The CSS of the core lays
 * them out in a grid: the table on the left, the drawer on the right, outside of the table.
 * The element adds only the card of the drawer and its header with the title and the close button, in the look
 * of its skin. It never moves the nodes of the page, so a framework keeps them.
 * The Filters button of the table toolbar opens the drawer; the page opens and closes it with the opened attribute
 * or property and with toggle(). The CSS of the core runs the transition by the opened attribute.
 * A table that would get narrower than its minimum width next to the drawer keeps its width: the modal attribute lays
 * the drawer over it with a scrim, as the modal side sheet of Material 3 on a compact window. A click on the scrim
 * closes the drawer. The attribute mode="over" lays the drawer over the table always.
 */
export class TableBroFilterDrawerContainer extends BroHTMLElement implements BroFilterDrawerHTMLElement {
  static get observedAttributes(): string[] {
    return ['mode', 'opened', 'skin'];
  }

  private ownTexts?: Partial<BroTexts>;

  /** The element that opened the drawer, as the Filters button of the table: it says whether the drawer is expanded, and the focus goes back to it. */
  private opener: HTMLElement | null = null;
  /** The last click in this element: while the page dispatches it, the control that it reached sends its action. */
  private lastClick: Event | null = null;

  /** The classes of the skin on this element, to take them off when the skin changes. */
  private skinClassName: string = '';
  /** The card and the header of the drawer: the nodes of this element among the nodes of the page. */
  private ownNodes: HTMLElement[] = [];
  /**
   * A framework may add the nodes of the page after this element is connected. The card and the header stay after
   * them, so the CSS finds the table before them.
   */
  private readonly childrenObserver: MutationObserver = new MutationObserver(() => this.keepOwnNodesLast());
  /** The width that the columns of the table have got last. */
  private columnsWidth: number = 0;
  /** A narrower or a wider page moves the opened drawer over the table or next to it. */
  private readonly resizeObserver: ResizeObserver = new ResizeObserver(() => this.fitMode());

  constructor() {
    super();

    this.addEventListener('click', event => {
      this.lastClick = event;
    }, true);

    // The Filters button of the table toolbar: the bro-action event of the table bubbles up to this element
    this.addEventListener(actionEvent, event => {
      if ((<CustomEvent<BroEventDetail>>event).detail?.action === filtersToggleEvent) {
        // The toolbar sends the action from its own element: the button is the one that the click being dispatched
        // reached, else the one that has the focus. Safari gives the focus to no link and no button by a click
        const clicked = (this.lastClick && this.lastClick.eventPhase !== Event.NONE) ? (<Element>this.lastClick.target).closest<HTMLElement>(focusableSelector) : null;
        const opener = clicked ?? <HTMLElement | null>document.activeElement;

        this.opener = (opener && this.contains(opener) && !this.inDrawer(opener)) ? opener : this.opener;
        this.toggle();
      }
    });

    // Escape in the drawer closes it, as in a side sheet; an input method that composes a word keeps it
    this.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.isComposing && this.opened && this.inDrawer(<Node>event.target)) {
        event.preventDefault();
        event.stopPropagation();

        this.opened = false;
      }
    });
  }

  /**
   * Renders the card and the header of the drawer with the elements of the skin; a new skin renders them again.
   * The class of the skin gives the element the sizes, the timings, and the colors of the skin, as it gives them to a table.
   */
  render(): void {
    const skinName = <BroSkin>this.getAttribute('skin');
    const skin = getSkin(skinName);

    this.ownNodes.forEach((node: HTMLElement) => node.remove());
    this.ownNodes = [];

    if (this.skinClassName) {
      this.classList.remove(this.skinClassName);
    }

    if (!skin) {
      return;
    }

    this.skinClassName = skinName;
    this.classList.add(this.skinClassName);

    const dom = new BroDom(this.ownerDocument);
    // The card lies under the header and the filters: the background and the shadow of the skin
    const card = dom.createFromHTML(`<div ${classAttr('bro-filter-drawer-card', skin.css.shadow?.className)}></div>`);
    // The scrim lies over the table of the modal drawer
    const scrim = dom.createFromHTML('<div class="bro-filter-drawer-scrim"></div>');

    scrim.addEventListener('click', () => {
      this.opened = false;
    });

    this.ownNodes = [scrim, card, this.renderHeader(skin)];
    this.append(...this.ownNodes);

    this.renderFiltersRegion();
  }

  /** The texts of the drawer, as the texts of its table: its title and the name of its close button. */
  get texts(): Partial<BroTexts> | undefined {
    return this.ownTexts;
  }

  set texts(value: Partial<BroTexts> | undefined) {
    this.ownTexts = value;

    if (this.isConnected) {
      this.render();
    }
  }

  /** Whether the drawer is opened; reflects the opened attribute. */
  get opened(): boolean {
    return this.hasAttribute('opened');
  }

  set opened(value: boolean) {
    this.toggleAttribute('opened', !!value);
  }

  /** side: the drawer stands next to the table, and over it when the table does not fit; over: it lies over the table always. */
  get mode(): 'side' | 'over' {
    return (this.getAttribute('mode') === 'over') ? 'over' : 'side';
  }

  set mode(value: 'side' | 'over') {
    this.setAttribute('mode', value);
  }

  connectedCallback(): void {
    this.render();

    this.childrenObserver.observe(this, {childList: true});
    this.resizeObserver.observe(this);
  }

  disconnectedCallback(): void {
    this.childrenObserver.disconnect();
    this.resizeObserver.disconnect();
  }

  attributeChangedCallback(name: string, oldValue: string | null, value: string | null): void {
    if (name === 'opened') {
      if ((oldValue === null) !== (value === null)) {
        if (this.opened) {
          this.toggleAttribute('modal', this.mode === 'over' || !this.fitsNextToDrawer(this.querySelector('table-bro')));
        }

        this.fitTableColumns();
        this.renderFocus();

        this.dispatchEvent(new CustomEvent(this.opened ? filtersOpenEvent : filtersCloseEvent));
      }
    } else if (name === 'skin' && oldValue !== value && this.isConnected) {
      this.render();
    }
  }

  toggle(): void {
    this.opened = !this.opened;
  }

  /**
   * Gives the table at once the width it has at the end of the transition: the drawer has a fixed width, so the columns
   * take their new widths right at the click and come with the table. During a transition the drawer counts from
   * the part by which it is opened at this moment.
   */
  private fitTableColumns(): void {
    const table: HTMLElement | null = this.querySelector('table-bro');

    // The table of the modal drawer keeps its width
    if (!table || this.hasAttribute('modal')) {
      return;
    }

    this.columnsWidth = this.tableWidth(table) - (this.opened ? this.drawerWidth() : 0);

    dispatchAction(table, columnsWidthEvent, this.columnsWidth);
  }

  /**
   * Moves the opened drawer over the table when the table would get narrower than its minimum width next to it, and
   * back next to it when it fits again. The table takes its new width at once, and the scrim comes or goes by its
   * transition; the drawer keeps its place at the right edge.
   */
  private fitMode(): void {
    const table: HTMLElement | null = this.querySelector('table-bro');

    if (!this.opened || !table) {
      return;
    }

    const width = this.tableWidth(table);

    if (this.mode !== 'over') {
      this.toggleAttribute('modal', !this.fitsNextToDrawer(table));
    }

    // The columns follow the width of the page, which may change on after the mode
    const columnsWidth = this.hasAttribute('modal') ? width : width - this.drawerWidth();

    if (Math.abs(columnsWidth - this.columnsWidth) >= 1) {
      this.columnsWidth = columnsWidth;

      dispatchAction(table, columnsWidthEvent, columnsWidth);
    }
  }

  /**
   * The table keeps at least its minimum width next to the opened drawer.
   * @param table - the table of the drawer, if it has one
   */
  private fitsNextToDrawer(table: HTMLElement | null): boolean {
    return !table || (this.tableWidth(table) - this.drawerWidth() >= parseFloat(getComputedStyle(table).getPropertyValue('--bro-table-min-width')));
  }

  /**
   * The width of the table without the drawer, from its place in the grid: the place now with the part that the drawer
   * takes at this moment, without the room that a table leaves for its shadows when no shadow container takes them.
   */
  private tableWidth(table: HTMLElement): number {
    let place: HTMLElement = table;

    while (place.parentElement && place.parentElement !== this) {
      place = place.parentElement;
    }

    const openedPart = this.hasAttribute('modal') ? 0 : parseFloat(getComputedStyle(this).getPropertyValue('--bro-filter-drawer-opened'));
    const shadowContainer = this.classList.contains('bro-table-shadow-container') || this.contains(table.closest('.bro-table-shadow-container'));
    const shadowRoom = shadowContainer ? 0 : 2 * parseFloat(getComputedStyle(table).getPropertyValue('--bro-shadow-size'));

    return place.getBoundingClientRect().width + openedPart * this.drawerWidth() - shadowRoom;
  }

  /** The part of the width that the opened drawer takes, with the space before it. */
  private drawerWidth(): number {
    const style = getComputedStyle(this);

    return parseFloat(style.getPropertyValue('--bro-filter-drawer-width')) + parseFloat(style.getPropertyValue('--bro-island-space-size'));
  }

  /** The filters of the page in the drawer: the element with slot="filters". */
  private filtersElement(): HTMLElement | null {
    return this.querySelector<HTMLElement>(':scope > [slot="filters"]');
  }

  /** Whether a node is in the drawer: in the filters of the page, its header or its card. */
  private inDrawer(node: Node | null): boolean {
    return !!node && (!!this.filtersElement()?.contains(node) || this.ownNodes.some(own => own.contains(node)));
  }

  /**
   * The filters of the page are the region of the drawer: its name is the title of the drawer, unless the page named
   * the filters. The button that opened the drawer controls them and says whether the drawer is expanded.
   */
  private renderFiltersRegion(): void {
    const filters = this.filtersElement();

    if (!filters) {
      return;
    }

    if (!filters.id) {
      const [high, low] = window.crypto.getRandomValues(new Uint32Array(2));

      filters.id = `bro-filters-${high.toString(36)}${low.toString(36)}`;
    }

    if (!filters.hasAttribute('role')) {
      filters.setAttribute('role', 'region');
    }

    if (!filters.hasAttribute('aria-label') && !filters.hasAttribute('aria-labelledby')) {
      filters.setAttribute('aria-label', resolveTexts(this.ownTexts).filters);
    }

    this.opener?.setAttribute('aria-controls', filters.id);
    this.opener?.setAttribute('aria-expanded', `${this.opened}`);
  }

  /**
   * An opened drawer takes the focus into its filters, else to its close button; a closed one gives it back to the
   * button that opened it, when the focus was in the drawer.
   */
  private renderFocus(): void {
    this.renderFiltersRegion();

    if (this.opened) {
      const target = this.filtersElement()?.querySelector<HTMLElement>(focusableSelector) ?? this.ownNodes[this.ownNodes.length - 1]?.querySelector<HTMLElement>(focusableSelector);

      target?.focus({preventScroll: true});
    } else if (this.inDrawer(document.activeElement) || document.activeElement === document.body) {
      // After a click of the pointer the button shows no ring, as in Chrome, where the click took the focus from the
      // filters; Safari would show it after the focus that the filters got from the script
      const pointer = !!this.lastClick && this.lastClick.eventPhase !== Event.NONE && (<MouseEvent>this.lastClick).detail > 0;

      this.opener?.focus(pointer ? {preventScroll: true, focusVisible: false} : {preventScroll: true});
    }
  }

  private keepOwnNodesLast(): void {
    const ownNodes = this.ownNodes;

    // Appending them again changes the children once more; then they are last
    if (ownNodes.length && this.lastElementChild !== ownNodes[ownNodes.length - 1]) {
      this.append(...ownNodes);
    }

    // The filters of the page may come after the drawer renders
    this.renderFiltersRegion();
  }

  private renderHeader(skin: BroSkinConfig): HTMLElement {
    const dom = new BroDom(this.ownerDocument);
    const toolbar = dom.createElement<BroToolbarElement & BroConfiguredElement>(skin.components.toolbar.selector);

    toolbar.config = skin;

    toolbar.setAttribute('class', 'bro-toolbar');

    const titleClassName = skin.components.toolbarMain.css?.toolbarTitle.className;
    const texts = resolveTexts(this.ownTexts);
    const title = dom.createFromHTML(`<span ${classAttr('bro-filter-drawer-title', titleClassName)}></span>`);
    const closeButton: HTMLElement = dom.createElement(skin.components.button.selector);

    title.textContent = texts.filters;
    closeButton.setAttribute('label', texts.close);

    closeButton.addEventListener('click', () => {
      this.opened = false;
    });

    skin.components.filterDrawer.beforeRender?.(closeButton);

    if (toolbar.appendToolbarContent) {
      toolbar.appendToolbarContent(title, closeButton);
    } else {
      toolbar.append(title, closeButton);
    }

    closeButton.classList.add('bro-filter-drawer-close');

    // The class stays on this element: an Angular Element replaces the classes of its own host
    const header = dom.createFromHTML('<div class="bro-filter-drawer-header"></div>');

    header.appendChild(toolbar);

    return header;
  }
}
