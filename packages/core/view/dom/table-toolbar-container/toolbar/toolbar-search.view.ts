import {filtersFilterEvent, toolbarSearchCloseEvent}  from '../../../../shared/events';
import {BroHTML}                                      from '../../../../shared/html';
import {dispatchAction}                               from '../../../../shared/interaction';
import {selectors}                                    from '../../../../shared/shared-selectors';
import type {BroContext}                              from '../../../../types/context';
import type {BroConfiguredElement, BroToolbarElement} from '../../../../types/table-bro';
import type {BroView}                                 from '../../../../types/view';

const {escape} = BroHTML;

export class BroToolbarSearch implements BroView {
  el?: HTMLElement;

  private inputEl!: HTMLInputElement;
  private search: string | null = null;

  /** The delay of the search after the last key. */
  private timer?: ReturnType<typeof setTimeout>;
  /** The life of this search line: its end takes its listener off the signal of the table. */
  private readonly lifetime = new AbortController();

  private readonly buttonSelector: string;

  constructor(protected readonly ctx: BroContext) {
    this.buttonSelector = this.ctx.config.components.button.selector;
  }

  render(): HTMLElement & BroToolbarElement {
    const {config} = this.ctx;

    const toolbar = this.ctx.dom.createElement<BroToolbarElement & BroConfiguredElement>(config.components.toolbar.selector);

    toolbar.config = config;

    const backButton = this.renderBackButton();
    const inputContainer = this.renderInput();
    const clearButton = this.renderClearButton();

    // The names of the buttons with an icon only, before the skin renders them: the attribute label, which the skin
    // gives its button, since an element without a role must not carry aria-label
    backButton.setAttribute('label', config.texts.back);
    clearButton.setAttribute('label', config.texts.clear);

    config.components.toolbarSearch.beforeRender?.(backButton, clearButton);

    if (toolbar.appendToolbarContent) {
      toolbar.appendToolbarContent(
        backButton,
        inputContainer,
        clearButton
      );
    } else {
      toolbar.append(
        backButton,
        inputContainer,
        clearButton
      );
    }

    clearButton.classList.add('bro-toolbar-clear');

    this.el = toolbar;

    return toolbar;
  }

  unrender(): void {
    clearTimeout(this.timer);
    this.lifetime.abort();

    this.el?.remove();
    this.el = undefined;
  }

  /** Moves the focus to the search field. */
  focus(): void {
    this.inputEl.focus();
  }

  private renderBackButton(): HTMLElement {
    const backButton: HTMLElement = this.ctx.dom.createElement(this.buttonSelector);

    backButton.addEventListener('click', () => {
      this.clearSearch();

      dispatchAction(backButton, toolbarSearchCloseEvent);
    });

    return backButton;
  }

  private renderInput(): HTMLElement {
    const field = escape(this.ctx.config.texts.searchField);

    this.inputEl = <HTMLInputElement>this.ctx.dom.createFromHTML(`<input type="text" name="search" placeholder="${field}" aria-label="${field}" autofocus>`);

    // setTimeout does not accept a signal; the timer is cleared when the table disconnects or the search closes
    this.ctx.signal.addEventListener('abort', () => clearTimeout(this.timer), {once: true, signal: this.lifetime.signal});

    this.inputEl.addEventListener('input', () => {
      this.search = this.inputEl.value;

      clearTimeout(this.timer);

      this.timer = setTimeout(() => {
        this.dispatchSearch();
      }, this.ctx.config.searchDebounce ?? (!this.ctx.config.server ? 100 : 400));
    });

    // Escape closes the search as the back button does; it ends here, so a dialog around the table stays open.
    // Escape of an input method that composes a word belongs to the input method
    this.inputEl.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.isComposing) {
        event.preventDefault();
        event.stopPropagation();

        clearTimeout(this.timer);

        this.clearSearch();

        dispatchAction(this.inputEl, toolbarSearchCloseEvent);
      }
    });

    const inputContainer = this.ctx.dom.createFromHTML(`<span class="${selectors.toolbarContentSearch}"></span>`);

    inputContainer.appendChild(this.inputEl);

    return inputContainer;
  }

  private renderClearButton(): HTMLElement {
    const clearButton = this.ctx.dom.createElement(this.buttonSelector);

    clearButton.addEventListener('click', () => {
      if (this.search) {
        this.clearSearch();

        this.inputEl.value = this.search;
        this.inputEl.focus();
      } else {
        dispatchAction(clearButton, toolbarSearchCloseEvent);
      }
    });

    return clearButton;
  }

  private dispatchSearch(): void {
    dispatchAction(this.inputEl, filtersFilterEvent, {
      search: this.search
    });
  }

  private clearSearch(): void {
    if (this.search) {
      this.search = null;
      this.dispatchSearch();
    }
  }
}
