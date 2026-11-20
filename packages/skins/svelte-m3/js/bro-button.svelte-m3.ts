import {BroHTML} from '@table-bro/core';

import {Button} from 'm3-svelte';

import {BroM3SvelteElement, BroM3SvelteMarkup, type BroM3SveltePart, type BroM3SvelteProps, iconHTML} from './bro-m3-svelte-element';

/**
 * The button of the skin, the element bro-m3-svelte-button with the attributes of BroButton: a text button of M3 Svelte with
 * its title, else an icon button named by the attribute label. The icon is the name of a ligature of Material Symbols.
 */
export class BroM3SvelteButtonComponent extends BroM3SvelteElement {
  private button: BroM3SveltePart | null = null;
  private readonly label = new BroM3SvelteMarkup();

  protected render(container: HTMLElement): void {
    this.button = this.mountPart(Button, container, this.props());
  }

  protected refresh(): void {
    this.button?.set(this.props());
  }

  protected override unmounted(): void {
    this.button = null;
  }

  /** The props of the button from the attributes of the element. */
  private props(): BroM3SvelteProps {
    const icon = this.getAttribute('icon');
    const title = this.getAttribute('button-title');
    const onclick = () => this.emit('action', this.getAttribute('event-type') ?? '');

    if (title) {
      // The icon of a text button comes before its title, at the gap of the button
      const label = `<span class="bro-m3-svelte-button-label">${icon ? iconHTML(icon) : ''}${BroHTML.escape(title)}</span>`;

      return {variant: 'text', iconType: icon ? 'left' : 'none', onclick, children: this.label.of(label)};
    }

    // The name of a button without a title: the table gives it as the attribute label, not aria-label on the element
    return {variant: 'text', iconType: 'full', 'aria-label': this.getAttribute('label') ?? undefined, onclick, children: this.label.of(iconHTML(icon ?? ''))};
  }
}
