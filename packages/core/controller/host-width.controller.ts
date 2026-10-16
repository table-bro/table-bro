import {columnsWidthEvent}         from '../shared/events';
import type {BroUpdater}           from '../shared/frame';
import {filterDrawerEasing}        from '../shared/styles';
import type {BroContext}           from '../types/context';
import type {BroBodyController}    from './body.controller';
import type {BroColumnsController} from './columns.controller';

/**
 * The columns follow the width of the host: a resize of the host lays them out again, and a filter drawer declares the
 * width that its transition gives the host, so the columns take it at once and move with the drawer.
 */
export class BroHostWidthController {
  constructor(private readonly ctx: BroContext, private readonly update: BroUpdater, private readonly columnsCtrl: BroColumnsController, private readonly bodyCtrl: BroBodyController) {
  }

  /**
   * The columns follow the width of the host: a new width lays them out again, without a measurement. A hidden table,
   * of width 0, waits; a table measured while hidden measures its columns at its first width.
   * @phase input
   */
  observe(): void {
    const {config, view} = this.ctx;

    if (config.autoColumnWidth === false) {
      return;
    }

    view.tableContainer.observeHostWidth(width => this.onResize(width));
  }

  /**
   * The fonts that the first render made the document load. A web font that no text of the page used before the table
   * starts to load with the text of the table, after the table measured its columns in the fallback font, and would cut
   * its titles and values. Once the fonts are loaded, the table measures its columns again in them, as a table measured
   * while hidden does at its first width.
   * @phase input
   */
  remeasureAfterFonts(): void {
    const {config, signal} = this.ctx;

    if (config.autoColumnWidth === false || document.fonts?.status !== 'loading') {
      return;
    }

    document.fonts.ready.then(() => {
      // A table measured while hidden measures its columns at its first width
      if (signal.aborted || !this.ctx.model.columnsWidth) {
        return;
      }

      this.update('fonts', {
        render: frame => this.bodyCtrl.remount(frame)
      });
    });
  }

  /**
   * A filter drawer declared a known new width of the table: the columns take it at once, without a measurement, and
   * they come with the table.
   * @phase input
   */
  onDeclaredWidth(width: number): void {
    const {config, model, view} = this.ctx;

    if (config.autoColumnWidth === false || !model.theadCols) {
      return;
    }

    const duration = this.declareWidth(width);

    this.update(columnsWidthEvent, {
      render: () => {
        this.columnsCtrl.fitColumns(width);

        // The columns move with the drawer, by its duration and its curve: the table keeps to the width of the host
        view.tableAux.timeColumnWidths(duration * this.ctx.styles.durationScale, filterDrawerEasing);
      }
    });
  }

  /**
   * A new width of the host. The columns are laid out for it, or a table measured while hidden measures them at its first width.
   * @phase input
   */
  private onResize(width: number): void {
    const {model, view} = this.ctx;

    if (!width || !model.theadCols) {
      return;
    }

    const declared = model.declaredWidth;

    // The host on its way to the width that a filter drawer declared: the columns have that width already. A width on
    // the way may also step back for a moment, as when a scrollbar of the page comes or goes; the way ends at the declared
    // width, outside the way, or with the transition of the drawer (declareWidth)
    if (declared) {
      const onTheWay = Math.min(declared.from, declared.to) <= width && width <= Math.max(declared.from, declared.to);

      if (Math.abs(width - declared.to) >= 1 && onTheWay) {
        declared.last = width;
        declared.moved = performance.now();

        return;
      }

      model.declaredWidth = null;
    }

    // A narrower host lays the columns out by any part of a pixel, or they would go past it; a host wider by less than
    // a pixel keeps them
    if (model.columnsWidth !== undefined && width >= model.columnsWidth && width - model.columnsWidth < 1) {
      return;
    }

    this.update('resize', {
      render: frame => {
        if (model.columnsWidth) {
          this.columnsCtrl.fitColumns(width);
          view.tableAux.settleColumnWidths();
        } else {
          this.bodyCtrl.remount(frame);
        }
      }
    });
  }

  /**
   * A filter drawer declared the width that its transition gives the host. The way to it ends when the host reaches it.
   * After the transition of the drawer, --bro-filter-drawer-duration, and then every 100 ms, a host that no longer moves
   * but stopped elsewhere, as after a resize of the window during the transition, gets its columns laid out for its width.
   * Returns the duration of the transition.
   * @phase input
   */
  private declareWidth(to: number): number {
    const {model, view} = this.ctx;

    // Only a table with its columns laid out declares a width
    const columnsWidth = <number>model.columnsWidth;
    const declared = model.declaredWidth = {from: columnsWidth, to, last: columnsWidth, moved: performance.now()};
    const duration = view.tableContainer.filterDrawerDuration();

    this.checkDeclaredWidth(declared, duration);

    return duration;
  }

  /**
   * Checks the way to the declared width after the given time: a host that no longer moves gets its columns for its width.
   * The check is a track of the motion, declared-width: it shows in tracks(), it holds idle() while the drawer moves the
   * host, and it follows durationScale. At durationScale 0, as under reduced motion, it ends in its first frame and
   * checks again in every frame until the host stands still for 100ms.
   * @phase input
   */
  private checkDeclaredWidth(declared: NonNullable<BroContext['model']['declaredWidth']>, after: number): void {
    this.ctx.motion.animate(null, {
      label: 'declared-width',
      duration: after,
      timing: progress => progress,
      draw: progress => {
        if (progress !== 1 || this.ctx.model.declaredWidth !== declared) {
          return;
        }

        // The host still moves on the way: the transition of the drawer goes on
        if (performance.now() - declared.moved < 100) {
          this.checkDeclaredWidth(declared, 100);

          return;
        }

        this.ctx.model.declaredWidth = null;
        this.onResize(declared.last);
      }
    });
  }
}
