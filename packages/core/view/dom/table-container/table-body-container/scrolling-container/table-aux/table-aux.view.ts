import type {BroColumnMeasure}          from '../../../../../../model/columns';
import {BroHTML}                        from '../../../../../../shared/html';
import {selectors}                      from '../../../../../../shared/shared-selectors';
import {selectors as tableSelectors}    from '../../../../../../table-bro-selectors';
import type {BroContext}                from '../../../../../../types/context';
import type {BroResolvedConfig, BroRow} from '../../../../../../types/table-bro';
import type {BroView}                   from '../../../../../../types/view';
import {easeInOutSine}                  from '../../../../../shared/animation';
import {BroTable}                       from '../table/table.view';
import {fitRenderedValues}              from '../table/tbody/tr/td/content/td-content.view';
import {BroTbodyAux}                    from './tbody/tbody-aux.view';
import {BroTheadAux}                    from './thead/thead-aux.view';

const {createElement} = BroHTML;

/** The canvas that compares the widths of the plain values of a column. */
let measureCanvas: HTMLCanvasElement | undefined;

export class BroTableAux implements BroView {
  static template(config: BroResolvedConfig): string {
    return BroTable.template(config, false, {className: selectors.tableAux, ariaHidden: true});
  }

  el!: HTMLElement;
  headerContentSelector: string;
  /** The aux body: the rows that keep the heights of the rows of the body, and the row that measures the widths. */
  tbodyAux!: BroTbodyAux;

  private refreshProgress: boolean = false; // whether table is in loading/refreshing state after refresh-transition
  private zIndexInitial?: string;
  /** The opacity of the cells of the body that the refresh gives them, or null without a refresh. */
  private refreshOpacity: number | null = null;

  constructor(protected readonly ctx: BroContext,
              private rows: BroRow[] | null | undefined) {
    this.headerContentSelector = this.ctx.config.components.sortHeader.contentSelector;
  }

  render(): Node {
    const {cols, config, model, view, motion} = this.ctx;

    this.el = createElement(BroTableAux.template(config));

    // A new body starts without the dimming of a refresh, as before it with a new aux table: the dimming of the previous
    // body would stay in the style of the host
    const refreshStyle = this.refreshStyle();

    if (refreshStyle) {
      motion.cancel('refresh-overlay');
      refreshStyle.textContent = '';
    }

    this.tbodyAux = new BroTbodyAux(this.ctx, this.rows);
    view.tbodyAux = this.tbodyAux;

    // The header row with every title is built only to measure the header, once: the controller removes it after the measurement
    if (config.autoColumnWidth !== false && !model.theadCols) {
      const theadAux = new BroTheadAux(this.ctx, cols);

      view.theadAux = theadAux;

      this.el.appendChild(
        theadAux.render()
      );
    }

    this.el.appendChild(
      this.tbodyAux.render()
    );

    return this.el;
  }

  /** Before their first widths the components of the rows show their own widths, as the ones of the aux row, while they are measured. */
  renderMeasuring(measuring: boolean): void {
    if (measuring) {
      this.ctx.host.setAttribute('data-bro-measure', '');
    } else {
      this.ctx.host.removeAttribute('data-bro-measure');
    }
  }

  /** Whether the skin ends a title of the aux header with an ellipsis: the aux header has the sort headers of the skin. */
  headerEllipsis(theadAux: HTMLElement): boolean {
    return getComputedStyle(<Element>theadAux.querySelector(this.headerContentSelector))?.textOverflow === 'ellipsis';
  }

  /**
   * Measures the cells of the aux row in trContainer; it only reads the layout. Returns the width of the table with the
   * measurements of the columns, or undefined when there is no row to measure.
   */
  measureColumns(trContainer: HTMLElement, tableBro: HTMLElement): {width: number; columns: BroColumnMeasure[]} | undefined {
    const {model} = this.ctx;

    const thead = (trContainer.tagName === 'THEAD');
    const tableBroWidth = tableBro.getBoundingClientRect().width || tableBro.clientWidth;

    const columns: BroColumnMeasure[] = [];

    const tr = trContainer.children[0];

    if (!tr?.children) {
      return;
    }

    Array.from(tr.children).forEach((td: Element, i: number) => {
      let clientWidth: number;
      let contentWidth: number;

      // The paddings come from the CSS of the skin and the page, so they are measured with the widths.
      // The aux body row has no paddings: a body column takes the paddings of its header cell, which are the same.
      const headerPaddings = thead ? undefined : model.theadCols?.[i]?.paddings;
      const cellStyle = getComputedStyle(td);
      const paddings = headerPaddings ?? ((parseFloat(cellStyle.paddingLeft) || 0) + (parseFloat(cellStyle.paddingRight) || 0));

      try {
        clientWidth = td.children[0].getBoundingClientRect().width;

        if (thead) {
          const content = td.querySelector(this.headerContentSelector);

          if (content) {
            // The full title and the sort icon: the text of the title at its natural width, which the box of a header
            // already sized by the widths of its column may cut, and the rest of the sort header, its icon with its space.
            // Up to a whole pixel, as the values of the body: a title cut by a fraction of a pixel ends with an ellipsis
            const range = document.createRange();

            range.selectNodeContents(content);

            const titleWidth = range.getBoundingClientRect().width;

            clientWidth = Math.ceil(titleWidth + clientWidth - content.getBoundingClientRect().width);
            contentWidth = Math.ceil(titleWidth);
          } else {
            clientWidth = Math.ceil(clientWidth);
            contentWidth = Math.ceil((<HTMLElement>td.querySelector('.bro-cell_component')).clientWidth);
          }
        } else {
          // Up to a whole pixel: a value of the body measures a little wider than the one of the aux table and than its
          // width in the canvas, and a column cut by a fraction of a pixel would wrap its longest value to an ellipsis
          clientWidth = Math.ceil(Math.max(clientWidth + this.widerValue(td, i), this.widestComponent(i)));
          contentWidth = clientWidth;
        }
      } catch {
        clientWidth = 0;
        contentWidth = 0;
      }

      columns.push({
        key: this.ctx.columns[i].key,
        clientWidth: clientWidth,
        contentWidth: contentWidth,
        targetWidth: clientWidth,
        paddings
      });
    });

    return {width: tableBroWidth, columns};
  }

  /**
   * Rewrites the widths of the columns, of the header and of the body, or of one of them while the table measures its
   * columns, with the target widths of their measurements (distributeColumnWidths); the header gets its tooltips for them.
   */
  renderColumnWidths(kind?: 'thead' | 'tbody'): void {
    const {model, host} = this.ctx;

    if (!kind) {
      if (model.theadCols) {
        this.renderColumnWidths('thead');
      }

      if (model.tbodyCols) {
        this.renderColumnWidths('tbody');
      }

      return;
    }

    const thead = (kind === 'thead');
    const tableBro = host;
    const hostSelector = this.hostSelector();
    // The columns of the kind are measured and laid out right before they render
    const columns = <BroColumnMeasure[]>(thead ? model.theadCols : model.tbodyCols);

    const first = !this.hasColumnWidths(kind);
    const style = this.columnWidthsStyle(tableBro, kind);

    style.textContent = columns.map(col => {
      // The rules find the cells of the column by its key: a class of the application may be shared by several columns
      const cell = `[${tableSelectors.columnKeyAttribute}="${CSS.escape(col.key)}"]`;
      // The widths of the body are the last ones of the columns, also of the header: the rules of the header weigh only
      // the host, less than the ones of the body, whatever the order of the two style elements
      const rule = (selector: string) => thead ? `${hostSelector} :where(table:not(.${selectors.tableAux}) .bro-header-row ${selector})` : `${hostSelector} table:not(.${selectors.tableAux}) ${selector}`;

      const targetWidth = col.targetWidth;

      return `
        ${rule(cell)},
        ${rule(`${cell} .${selectors.tableCellTextEllipsisContainer}`)},
        ${rule(`${cell} .bro-cell_component`)} {
          width: ${targetWidth}px;
        }`;
    }).join('\n');

    this.renderTooltips();

    // The rendered values that the new widths cut take the ellipsis element with its tooltip, as the header takes its tooltips
    if (!thead) {
      fitRenderedValues(this.ctx);
    }

    // The header of a table that waited for its rows moves to the widths that the rows give it
    if (first) {
      this.settleColumnWidths(!thead && model.headerBeforeRows);
    }
  }

  /** Whether the host has the widths of the columns of the kind. */
  hasColumnWidths(kind: 'thead' | 'tbody'): boolean {
    return !!this.columnWidthsStyleOf(kind);
  }

  /**
   * The first widths of the header and of the body come without the width transition of the skin: the cells had the
   * widths of the CSS of the application before them, as of bro-text-ellipsis-width, and a table that shows its cells
   * for the first time does not adjust them in front of the user. The rules of the body size the header cells as well,
   * so the transitions that the first rules start end at once in the whole table. The widths of a new width of the host
   * come so too: the columns keep to a host that moves, as a panel that narrows, in every frame.
   *
   * The header of a table that showed no rows when it got its first widths stays out: it stands at the widths of its titles,
   * and the rows that come later give it their widths, which it moves to with the transition of the skin.
   */
  settleColumnWidths(exceptHeader: boolean = false): void {
    this.ctx.host.getAnimations({subtree: true}).forEach(animation => {
      if (animation instanceof CSSTransition && animation.transitionProperty === 'width'
        && !(exceptHeader && (animation.effect as KeyframeEffect).target?.closest(`table.${selectors.header}`))) {
        animation.finish();
      }
    });
  }

  /**
   * The width transitions that the last rules started take another duration and curve, as of a filter drawer that
   * moves the host: then the columns keep to the width of the host in every frame, and the table gives no part of
   * the difference to the narrow columns, which would move the columns after them to and fro.
   */
  timeColumnWidths(duration: number, easing: string): void {
    this.ctx.host.getAnimations({subtree: true}).forEach(animation => {
      if (animation instanceof CSSTransition && animation.transitionProperty === 'width') {
        animation.effect?.updateTiming({duration, easing});
      }
    });
  }

  /**
   * Shows or hides the dimming of a refresh; the same value again changes nothing. The cells of the body fade by the
   * dimming of the theme, and the rows keep their backgrounds: a white layer over the body would also whiten what the
   * layout of the body draws between and around the rows, and end at the edges of the table.
   * The aux table lies over the body meanwhile, and the cells of the body take no clicks: a table without server
   * details has no aux rows that would cover them.
   */
  renderRefresh(shown: boolean): void {
    const {styles, motion, themeService} = this.ctx;

    if (shown === !!this.refreshProgress) {
      return;
    }

    const el = this.el;

    const dimming = (themeService.theme === 'dark') ? styles.refreshOverlayOpacityDark : styles.refreshOverlayOpacity;

    // The opacity of a refresh animation that runs, else the one of the last end
    const previousOpacity = this.refreshOpacity ?? 1;
    const targetOpacity = (!this.refreshProgress) ? 1 - dimming : 1;

    if (this.zIndexInitial === undefined) {
      this.zIndexInitial = el.style.zIndex;
    }

    el.style.zIndex = styles.tableBodyContainerZIndex + '';

    this.refreshProgress = !this.refreshProgress;

    motion.animate('refresh-overlay', {
      duration: styles.detailsDuration,
      timing: easeInOutSine,
      draw: timingProgress => {
        const ended = (timingProgress === 1 && !this.refreshProgress);

        this.renderRefreshOpacity(ended ? null : previousOpacity + (targetOpacity - previousOpacity) * timingProgress);

        if (ended) {
          el.style.zIndex = <string>this.zIndexInitial;
        }
      }
    });
  }

  /**
   * How much wider than the value in the row of the longest values the widest plain value of a column is. That row has
   * the longest strings, and in a proportional font a shorter string of wide letters can be wider: the values of the
   * rows are compared on a canvas, in the font of the cell.
   * @param td - the cell of the column in the row of the longest values
   * @param index - the index of the column
   */
  private widerValue(td: Element, index: number): number {
    const {col} = this.ctx.columns[index];
    const node = td.children[0];

    if (!node || !col.name || col.name === tableSelectors.rowCounter || col.html || col.component) {
      return 0;
    }

    const style = getComputedStyle(node);
    const context = (measureCanvas ??= document.createElement('canvas')).getContext('2d')!;
    let widest = 0;

    context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    new Set(this.tbodyAux.values(col.name)).forEach(value => widest = Math.max(widest, context.measureText(value).width));

    return Math.max(0, widest - context.measureText(node.textContent ?? '').width);
  }

  /**
   * The widest component of a column among the rows of the body. The row of the longest values has the longest strings,
   * not always the widest components: a chip of a shorter but wider word, a date in a format of its own. A component of
   * a column with widths takes the width of its content when the column cuts it; before the first widths every component
   * has the width of its content (data-bro-measure on the host), as in the aux table.
   */
  private widestComponent(index: number): number {
    const {model} = this.ctx;
    const {col} = this.ctx.columns[index];

    if (typeof col.component !== 'string' && !col.component?.selector) {
      return 0;
    }

    const sized = this.hasColumnWidths('tbody');

    return Math.max(0, ...(model.slots?.list ?? []).map(slot => {
      const component = slot.tr?.children[index]?.firstElementChild;

      if (!component) {
        return 0;
      }

      return sized ? ((component.scrollWidth > component.clientWidth) ? component.scrollWidth : 0) : component.getBoundingClientRect().width;
    }));
  }

  /**
   * The tooltips of the header follow the widths that it shows: a title with its sort icon wider than its column shows
   * in a tooltip, and the tooltip of the column config shows otherwise. The widths of the body size the header cells too,
   * so they are the shown ones once the body has them; before that the header shows its own.
   */
  private renderTooltips(): void {
    const {columns, model} = this.ctx;

    // The header is measured before its tooltips; a body measured without it leaves them
    const theadCols = model.theadCols;

    if (!theadCols) {
      return;
    }

    const shownCols = (this.hasColumnWidths('tbody') && model.tbodyCols) || theadCols;

    columns.forEach(({col, sortHeader}, i) => {
      sortHeader?.setAttribute('tooltip', (theadCols[i].clientWidth > shownCols[i].targetWidth) ? col.title : (col.tooltip || ''));
    });
  }

  /**
   * One <style> per kind of column widths in the host: a new calculation replaces the rules instead of adding a style.
   * The header widths go first, the body widths after them.
   */
  private columnWidthsStyle(tableBro: HTMLElement, kind: 'thead' | 'tbody'): HTMLStyleElement {
    let style = this.columnWidthsStyleOf(kind);

    if (!style) {
      const theadStyle = this.columnWidthsStyleOf('thead');

      style = document.createElement('style');
      style.setAttribute('data-bro-column-widths', kind);

      // A strict Content Security Policy applies the style only with the nonce of the page
      if (this.ctx.config.styleNonce) {
        style.nonce = this.ctx.config.styleNonce;
      }

      if (kind === 'tbody' && theadStyle) {
        theadStyle.after(style);
      } else {
        tableBro.prepend(style);
      }
    }

    return style;
  }

  /**
   * The host in the rules of its <style> elements: its id and its instance. A page that replaces a table may hold the old one
   * with the same id for a moment, and the rules of the old table would size the cells of the new one.
   */
  private hostSelector(): string {
    const {host} = this.ctx;

    // An id of the application, as orders.v2, is escaped for the selectors of the rules
    return `#${CSS.escape(<string>host.getAttribute('id'))}[${tableSelectors.instanceAttribute}="${host.getAttribute(tableSelectors.instanceAttribute)}"]`;
  }

  /** The <style> of the widths of the kind in the host, if the table has one. */
  private columnWidthsStyleOf(kind: 'thead' | 'tbody'): HTMLStyleElement | null {
    return this.ctx.host.querySelector<HTMLStyleElement>(`:scope > style[data-bro-column-widths="${kind}"]`);
  }

  /** The opacity of the cells of the body in one <style> of the host, and no clicks on them; null takes the rule away. */
  private renderRefreshOpacity(opacity: number | null): void {
    const {host, config} = this.ctx;

    this.refreshOpacity = opacity;

    let style = this.refreshStyle();

    if (!style) {
      style = document.createElement('style');
      style.setAttribute('data-bro-refresh', '');

      // A strict Content Security Policy applies the style only with the nonce of the page
      if (config.styleNonce) {
        style.nonce = config.styleNonce;
      }

      host.prepend(style);
    }

    // The body table lies right in the scrolling container: the tables in the details of its rows stay out
    style.textContent = (opacity === null)
      ? ''
      : `
      ${this.hostSelector()} .${tableSelectors.tableBody} > table:not(.${selectors.tableAux}) > tbody > tr > td {
        opacity: ${opacity};
        pointer-events: none;
      }`;
  }

  /** The <style> of the dimming of a refresh in the host, if the table has one. */
  private refreshStyle(): HTMLStyleElement | null {
    return this.ctx.host.querySelector<HTMLStyleElement>(':scope > style[data-bro-refresh]');
  }
}
