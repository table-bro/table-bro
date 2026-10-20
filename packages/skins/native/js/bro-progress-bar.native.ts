import {type BroConfiguredElement, BroHTML, BroHTMLElement, type BroProgressBar, type BroProgressMode, type BroResolvedConfig, type BroView, isPrerendered} from '@table-bro/core';

const {escape} = BroHTML;

export class BroNativeProgressBarComponent extends BroHTMLElement implements BroView, BroConfiguredElement, BroProgressBar {
  template(): string {
    // The skin has no colors of the bar; the contract keeps the attribute of the table
    this.color = this.getAttribute('color') || '';

    this.mode = <BroProgressMode>this.getAttribute('mode') || 'indeterminate';

    const indeterminate = (this.mode === 'indeterminate');

    this.value = (indeterminate ? 100 : (this.getAttribute('value') || 0))
      .toString();

    return `
      <progress ${indeterminate ? '' : `value="${this.value}"`}
        max="${indeterminate ? '' : 100}" aria-label="${escape(this.config.texts.loadingProgress)}"></progress>`;
  }

  static get observedAttributes() {
    return [
      'value'
    ];
  }

  config!: BroResolvedConfig;

  color!: string;
  mode!: BroProgressMode;
  value!: string;

  /** A move in the DOM connects the element again; it keeps its markup and listeners. */
  private rendered: boolean = false;
  private valueEl!: HTMLProgressElement;

  render(): void {
    this.insertAdjacentHTML('afterbegin', this.template());
  }

  connectedCallback(): void {
    // An element of a prerendered table keeps its markup until the table renders its own elements in its place
    if (isPrerendered(this)) {
      return;
    }

    if (this.rendered) {
      return;
    }

    this.rendered = true;

    this.render();
  }

  attributeChangedCallback(name: string, previousValue: string, currentValue: string) {
    if (this.mode === 'determinate' && name === 'value') {
      if (!this.valueEl) {
        this.valueEl = <HTMLProgressElement>this.querySelector('progress');
      }

      this.valueEl.value = +currentValue;
    }
  }
}
