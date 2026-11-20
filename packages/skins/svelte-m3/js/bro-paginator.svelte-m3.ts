import {type BroConfiguredElement, BroDom, type BroPaginatorElement, type BroPaginatorPageEvent, type BroResolvedConfig} from '@table-bro/core';

import {Button, SelectOutlined} from 'm3-svelte';

import {BroM3SvelteElement, BroM3SvelteMarkup, type BroM3SveltePart, type BroM3SvelteProps, iconHTML} from './bro-m3-svelte-element';

/** The buttons of the paginator: the class of the vanilla skins, the icon and the text of the name of each. */
const navigation = [
  ['first', 'first_page', 'firstPage'],
  ['previous', 'chevron_left', 'previousPage'],
  ['next', 'chevron_right', 'nextPage'],
  ['last', 'last_page', 'lastPage']
] as const;

/**
 * The paginator of the skin, the element bro-m3-svelte-paginator with the properties of BroPaginatorElement. M3 Svelte has
 * no paginator, so it is the one of Angular Material of the skin mat from the components of M3 Svelte: the outlined
 * select of the page size, the range of the page and the icon buttons of the pages, with the texts of the config of the
 * table. A change of the page or of the page size sends the event page with the indexes of the pages.
 */
export class BroM3SveltePaginatorComponent extends BroM3SvelteElement implements BroConfiguredElement, BroPaginatorElement {
  config?: BroResolvedConfig;

  /** The icon buttons of the pages, in the order of navigation. */
  private buttons: BroM3SveltePart[] = [];
  /** The markup of the icons of the buttons, one snippet each. */
  private readonly icons: Record<typeof navigation[number][0], BroM3SvelteMarkup> = {first: new BroM3SvelteMarkup(), previous: new BroM3SvelteMarkup(), next: new BroM3SvelteMarkup(), last: new BroM3SvelteMarkup()};
  private options: BroPaginatorElement = {pageIndex: 0, pageSize: 10, length: 0, pageSizeOptions: [], showFirstLastButtons: false, disabled: false};
  /** The text of the range of the page. */
  private range: HTMLElement | null = null;
  /** The select of the page size. */
  private select: BroM3SveltePart | null = null;
  /** The label of the select of the page size. */
  private sizeLabel: HTMLElement | null = null;

  get disabled(): boolean {
    return this.options.disabled;
  }

  set disabled(disabled: boolean) {
    this.setOption('disabled', disabled);
  }

  get length(): number {
    return this.options.length;
  }

  set length(length: number) {
    this.setOption('length', length);
  }

  get pageIndex(): number {
    return this.options.pageIndex;
  }

  set pageIndex(pageIndex: number) {
    this.setOption('pageIndex', pageIndex);
  }

  get pageSize(): number {
    return this.options.pageSize;
  }

  set pageSize(pageSize: number) {
    this.setOption('pageSize', pageSize);
  }

  get pageSizeOptions(): number[] {
    return this.options.pageSizeOptions;
  }

  set pageSizeOptions(pageSizeOptions: number[]) {
    this.setOption('pageSizeOptions', pageSizeOptions);
  }

  get showFirstLastButtons(): boolean {
    return this.options.showFirstLastButtons;
  }

  set showFirstLastButtons(showFirstLastButtons: boolean) {
    this.setOption('showFirstLastButtons', showFirstLastButtons);
  }

  protected render(container: HTMLElement): void {
    const dom = new BroDom(this.ownerDocument);
    const paginator = dom.createElement('div');
    const size = dom.createElement('div');

    paginator.className = 'bro-m3-svelte-paginator';
    size.className = 'bro-m3-svelte-paginator-page-size';
    this.sizeLabel = dom.createElement('span');
    this.sizeLabel.className = 'bro-m3-svelte-paginator-page-size-label';
    this.range = dom.createElement('span');
    this.range.className = 'bro-m3-svelte-paginator-range';
    size.append(this.sizeLabel);
    paginator.append(size, this.range);
    container.append(paginator);

    this.select = this.mountPart(SelectOutlined, size, this.selectProps());
    this.buttons = navigation.map(([name]) => {
      const button = this.mountPart(Button, paginator, this.buttonProps(name));

      // The class of the vanilla skins, which a page, as a demo, finds the button by: the button of M3 Svelte writes its
      // own classes, which a class among the props would replace, and they stay, since its variant, size and icon do not
      // change
      paginator.lastElementChild!.classList.add(`bro-paginator-navigation-${name}`);

      return button;
    });
  }

  protected refresh(): void {
    const {length, pageIndex, pageSize} = this.options;
    const texts = this.config?.texts;

    this.sizeLabel!.textContent = texts?.itemsPerPage ?? '';
    this.range!.textContent = texts?.rangeLabel(pageIndex, pageSize, length) ?? '';
    this.select?.set(this.selectProps());
    this.buttons.forEach((button, i) => button.set(this.buttonProps(navigation[i][0])));
  }

  protected override unmounted(): void {
    this.buttons = [];
    this.range = null;
    this.select = null;
    this.sizeLabel = null;
  }

  /**
   * The props of a button of the pages: hidden for the first and the last page without showFirstLastButtons, disabled
   * at the edges.
   * @param name - the name of the button
   */
  private buttonProps(name: typeof navigation[number][0]): BroM3SvelteProps {
    const {disabled, length, pageIndex, pageSize, showFirstLastButtons} = this.options;
    const [, icon, text] = navigation.find(([button]) => button === name)!;
    const lastPage = Math.max(Math.ceil(length / pageSize) - 1, 0);
    const before = (name === 'first' || name === 'previous');
    const target = {first: 0, previous: pageIndex - 1, next: pageIndex + 1, last: lastPage}[name];

    return {
      variant: 'text',
      iconType: 'full',
      'aria-label': this.config?.texts[text],
      hidden: (name === 'first' || name === 'last') && !showFirstLastButtons,
      disabled: disabled || (before ? pageIndex <= 0 : pageIndex >= lastPage),
      onclick: () => this.changePage(target, pageSize),
      children: this.icons[name].of(iconHTML(icon))
    };
  }

  /** The props of the select of the page size: its options and its value, named by the label before it. */
  private selectProps(): BroM3SvelteProps {
    const {disabled, pageIndex, pageSize, pageSizeOptions} = this.options;

    return {
      label: '',
      'aria-label': this.config?.texts.itemsPerPage,
      options: pageSizeOptions.map(option => ({text: String(option), value: String(option)})),
      value: String(pageSize),
      disabled,
      // The first row of the page stays on the page of the new size, as in the paginator of Angular Material
      onchange: (event: Event) => {
        const size = Number((<HTMLSelectElement>event.target).value);

        this.changePage(Math.floor(pageIndex * pageSize / size), size);
      }
    };
  }

  /**
   * Shows the new page and sends the event page.
   * @param pageIndex - the index of the new page
   * @param pageSize - the new page size
   */
  private changePage(pageIndex: number, pageSize: number): void {
    const previousPageIndex = this.options.pageIndex;

    this.options = {...this.options, pageIndex, pageSize};
    this.update();

    this.emit<BroPaginatorPageEvent>('page', {pageIndex, previousPageIndex, pageSize, length: this.options.length});
  }

  /**
   * Sets an option that the table gives and renders the paginator with it.
   * @param name - the name of the option
   * @param value - its value
   */
  private setOption<K extends keyof BroPaginatorElement>(name: K, value: BroPaginatorElement[K]): void {
    this.options = {...this.options, [name]: value};
    this.update();
  }
}
