import {BroHTML, createComponent}          from '../../../../../../shared/html';
import {selectors}                         from '../../../../../../shared/shared-selectors';
import type {BroContext}                   from '../../../../../../types/context';
import type {BroCol, BroConfiguredElement} from '../../../../../../types/table-bro';
import type {BroView}                      from '../../../../../../types/view';

const {createElement, escape} = BroHTML;

export class BroProgressTheadTh implements BroView {
  template(col: BroCol): string {
    return `
      <th class="${selectors.tableProgress}"
          colspan="${escape(col.colSpan)}"></th>`;
  }

  constructor(protected readonly ctx: BroContext,
              private col: BroCol) {
  }

  render(): HTMLElement {
    const th = createElement(this.template(this.col));

    // An element of the skin with the config of the table, as the other elements of the skin
    const progress = createComponent<BroConfiguredElement>(this.ctx.config.components.progressBar.selector);

    progress.config = this.ctx.config;
    progress.setAttribute('color', 'primary');
    progress.setAttribute('mode', 'indeterminate');

    th.appendChild(progress);

    return th;
  }
}
