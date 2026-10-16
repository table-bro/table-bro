import {BroHTML}            from '../../../../../shared/html';
import type {BroContext}    from '../../../../../types/context';
import type {BroCol}        from '../../../../../types/table-bro';
import type {BroView}       from '../../../../../types/view';
import {BroProgressTheadTh} from './th/th.view';

const {createElement} = BroHTML;

export class BroProgressTheadTr implements BroView {
  template(): string {
    // The table tells that it is busy with aria-busy; its progress bar is no row for screen readers
    return '<tr aria-hidden="true"></tr>';
  }

  el!: HTMLElement;

  constructor(protected readonly ctx: BroContext,
              private cols: BroCol[]) {
  }

  render(): HTMLElement {
    this.el = createElement(this.template());

    this.el.appendChild(
      new BroProgressTheadTh(this.ctx, {
        title: '',
        colSpan: this.cols.length
      }).render()
    );

    return this.el;
  }
}
