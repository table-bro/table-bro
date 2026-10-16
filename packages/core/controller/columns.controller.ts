import {distributeColumnWidths} from '../model/columns';
import {BroFrame}               from '../shared/frame';
import type {BroContext}        from '../types/context';
import type {BroCol}            from '../types/table-bro';
import {BroTheadAux}            from '../view/dom/table-container/table-body-container/scrolling-container/table-aux/thead/thead-aux.view';

/**
 * The widths of the columns: the measurement of the header and of the body in the aux table, and the layout of the
 * columns for a width of the table.
 */
export class BroColumnsController {
  constructor(private readonly ctx: BroContext) {
  }

  /**
   * Measures the header before the body, in a frame of its own. The first layout gives the widths of the full titles
   * and the ellipsis of the skin for its titles; the header row and the widths of the header with its tooltips follow.
   * The second layout gives the widths of the short titles (shortColumnTitle), which end with the ellipsis of the skin.
   * @phase render
   */
  measureHeader(): void {
    const {cols, config, host, model, view} = this.ctx;

    const frame = new BroFrame();

    let tableBroWidth: number | undefined;
    let ellipsis: boolean;

    // The aux header with every title is there until the header is measured
    const theadAux = <BroTheadAux>view.theadAux;

    frame.read(() => {
      const measured = view.tableAux.measureColumns(theadAux.el, host);

      if (measured) {
        model.theadCols = measured.columns;
        tableBroWidth = measured.width;
      }

      // The aux header has the sort headers of the skin, so their titles tell whether the skin ends a title with an ellipsis
      ellipsis = view.tableAux.headerEllipsis(theadAux.el);
    });

    frame.write(() => {
      view.thead.renderRow(cols);

      if (tableBroWidth !== undefined) {
        this.fitColumns(tableBroWidth, 'thead');
      }

      const shortColumns: BroCol[] = cols.map(col => {
        return {
          ...col,
          title: config.shortColumnTitle(col) + (ellipsis ? '...' : '')
        };
      });

      const newTheadAux = new BroTheadAux(this.ctx, shortColumns);

      newTheadAux.replace(theadAux);
      view.theadAux = newTheadAux;

      frame.read(() => {
        const measured = view.tableAux.measureColumns(newTheadAux.el, host);

        if (measured) {
          model.theadShortCols = measured.columns;
        }
      });
    });

    frame.flush();
  }

  /**
   * The aux row with the longest values is measured with the cells of the rows, in one layout. Its widths come
   * first among the dependent writes, before the cells compare their values with them; then the row goes away.
   * @phase render
   */
  measureBody(frame: BroFrame): void {
    const {host, model, view} = this.ctx;

    let tableBroWidth: number | undefined;

    // Before their first widths the components of the rows show their own widths, as the ones of the aux row
    const first = !view.tableAux.hasColumnWidths('tbody');

    if (first) {
      view.tableAux.renderMeasuring(true);
    }

    frame.read(() => {
      // The measure row renders right before the measurement
      const measured = view.tableAux.measureColumns(<HTMLElement>view.tbodyAux.measureEl, host);

      if (measured) {
        model.tbodyCols = measured.columns;
        tableBroWidth = measured.width;
      }
    });

    frame.write(() => {
      // A host on its way to the width that a filter drawer declared: the rows that come take that width, as the shown ones
      if (tableBroWidth !== undefined) {
        this.fitColumns(model.declaredWidth?.to ?? tableBroWidth, 'tbody');
      }

      view.tbodyAux.removeMeasureRow();

      if (first) {
        view.tableAux.renderMeasuring(false);
      }
    });
  }

  /**
   * Lays the columns out for a width of the table: the model distributes it between the measured columns, of the header
   * and of the body or of one of them, and the aux table renders their widths.
   * @phase render
   */
  fitColumns(tableBroWidth: number, kind?: 'thead' | 'tbody'): void {
    distributeColumnWidths(this.ctx, tableBroWidth, kind);

    this.ctx.view.tableAux.renderColumnWidths(kind);
  }
}
