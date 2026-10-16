import type {BroColumnModel}                                                                                                        from '../../../../../../../../../../model/columns';
import {type BroRowSlot, type BroValueWidths, emptyRow}                                                                             from '../../../../../../../../../../model/row-slots';
import {appObject}                                                                                                                  from '../../../../../../../../../../shared/app-objects';
import type {BroFrame}                                                                                                              from '../../../../../../../../../../shared/frame';
import {getSkin}                                                                                                                    from '../../../../../../../../../../shared/skins';
import {selectors}                                                                                                                  from '../../../../../../../../../../table-bro-selectors';
import type {BroContext}                                                                                                            from '../../../../../../../../../../types/context';
import type {BroCellElement, BroCol, BroConfiguredElement, BroCustomElementConfig, BroCustomElementValueFn, BroEventDetail, BroRow} from '../../../../../../../../../../types/table-bro';
import type {BroView}                                                                                                               from '../../../../../../../../../../types/view';

/**
 * The one range that measures the values of the cells. A range lives until the garbage collector takes it, and the
 * browser updates every live range on each removal or move of a node: a range for each cell made the moves of the rows
 * of a sort quadratic in the number of the rows.
 */
let measureRange: Range | undefined;

/** The optional elements of the skins whose missing definition the console has told, once for each tag. */
const reportedElements = new Set<string>();

export class BroTdContent implements BroView {
  /**
   * @param ctx - the context of the table
   * @param col - the column of the application
   * @param row - the row of the cell
   * @param column - the record of the column: a plain value compares its width with the width of the column
   * @param valueWidths - the widths of the values of the row, which keep the width of a value for its next render
   */
  constructor(protected readonly ctx: BroContext,
              private col: BroCol,
              private row: BroRow,
              private readonly column?: BroColumnModel,
              private readonly valueWidths?: BroValueWidths) {
  }

  /**
   * @param frame - the frame of the update, for the cells of the body table: a plain value is measured in it.
   * The aux table measures the widths of the columns and renders its values without a frame, as they are
   */
  render(frame?: BroFrame): HTMLElement | Node {
    const {config} = this.ctx;

    const col = this.col;
    const row = this.row;

    if (row === emptyRow) {
      return document.createTextNode('');
    }

    if (typeof col.component === 'string') {
      return this.createElement(col.component);
    }

    const componentConfig = col.component;

    if (componentConfig?.selector) {
      return this.decorate(this.createElement(componentConfig.selector), componentConfig);
    }

    const value = this.buildAttrValue(componentConfig, 'value', col, row);

    if (col.name === selectors.rowCounter) {
      return cellValueElement('strong', value, false);
    }

    if (!value) {
      return document.createTextNode('');
    }

    const node = cellValueElement('span', value, col.html);

    // autoColumnWidth: false measures nothing: the CSS of the application sizes the columns
    if (frame && this.column && config.autoColumnWidth !== false) {
      this.fit(frame, node, value, this.column);
    }

    return this.decorate(node, componentConfig || {}); // to support `value` as function
  }

  /**
   * Phases 3 and 4 of the update: the natural width of a plain value is measured in its own cell, with the font of the
   * cell, together with all the cells of the update in one layout. A value wider than its column becomes the text
   * ellipsis element of the skin, which shows the whole value in its tooltip. The value keeps to one line while it is
   * measured: the CSS of the table lets a plain value wrap. A row rendered again keeps the width of a value it had.
   */
  private fit(frame: BroFrame, node: HTMLElement, value: string, column: BroColumnModel): void {
    const {model} = this.ctx;

    const known = this.valueWidths?.get(column.key);
    let width: number;

    if (known?.value === value) {
      width = known.width;
    } else {
      node.style.whiteSpace = 'nowrap';

      frame.read(() => {
        const range = measureRange ??= document.createRange();

        range.selectNodeContents(node);
        width = range.getBoundingClientRect().width;

        // A hidden table measures 0: the value is measured again when the table shows it
        if (width > 0) {
          this.valueWidths?.set(column.key, {value, width});
        }
      });
    }

    frame.write(() => {
      node.removeAttribute('style');

      const targetWidth = model.tbodyCols?.find(tbodyCol => tbodyCol.key === column.key)?.targetWidth;

      if (targetWidth !== undefined && width > targetWidth) {
        node.replaceWith(this.ellipsis(value));
      }
    });
  }

  /** The text ellipsis element of the skin for a value wider than its column: it shows the whole value in its tooltip. */
  ellipsis(value: string): HTMLElement {
    const {config} = this.ctx;

    const col = this.col;
    const {selector} = config.components.textEllipsis;
    const textEllipsis: BroCustomElementConfig = {
      selector,
      attrs: {
        // A column without classes gives none: an empty attribute value would turn into the value of the cell
        ...(col.className ? {'container-class': col.className} : {}),

        value: () => value,
        ...(<BroCustomElementConfig>col.component)?.attrs // to support `value` as function
      }
    };

    return this.decorate(document.createElement(selector), textEllipsis);
  }

  /**
   * Creates the element of a cell. An optional element of the skin that the page has not defined, as the tags without
   * withTags(), renders nothing: the console names the function that defines it, once for each tag.
   * @param tag - the tag of the element
   */
  private createElement(tag: string): HTMLElement {
    const define = getSkin(this.ctx.config.skin)?.elements?.[tag];

    if (define && !customElements.get(tag) && !reportedElements.has(tag)) {
      reportedElements.add(tag);
      console.error(`Table, Bro: the column "${this.col.name}" uses the element ${tag}: call ${define}() after the import of the skin`);
    }

    return document.createElement(tag);
  }

  /** Gives a cell element the objects of its column and row, its attributes and the listener of its event from the config of the column. */
  private decorate(tdContent: HTMLElement & BroCellElement & BroConfiguredElement, componentConfig: BroCustomElementConfig): HTMLElement {
    const {config} = this.ctx;

    const col = this.col;
    const row = this.row;

    if (componentConfig.selector) {
      tdContent.col = appObject(col);
      tdContent.row = appObject(row);

      tdContent.config = config;

      tdContent.classList.add('bro-cell_component');
    }

    if (componentConfig.attrs) {
      Object.keys(componentConfig.attrs).forEach(attr => {
        tdContent.setAttribute(attr, this.buildAttrValue(componentConfig, attr, col, row));
      });
    }

    if (componentConfig.event) {
      // Angular Elements dispatch output events without bubbling, so the table dispatches them again as a bubbling bro-action event
      tdContent.addEventListener(componentConfig.event, (event: Event) => {
        tdContent.dispatchEvent(new CustomEvent<BroEventDetail<{col: BroCol; row: BroRow}>>('bro-action', {
          bubbles: true,
          composed: true,
          detail: {
            action: (<CustomEvent>event).detail,
            selector: componentConfig.selector,
            data: {col: appObject(col), row: appObject(row)}
          }
        }));
      });
    }

    return tdContent;
  }

  private buildAttrValue(componentConfig: BroCustomElementConfig | undefined, attr: string, col: BroCol, row: BroRow): string {
    const attrValue: BroCustomElementValueFn<BroRow> | string | undefined = componentConfig?.attrs?.[attr];

    let value: unknown;

    if (typeof attrValue === 'function') {
      value = attrValue(appObject(col), appObject(row));
    } else if (attrValue) {
      value = attrValue;
    } else {
      value = (col.name === undefined) ? '' : row[col.name];
    }

    // An empty value is an empty cell, not the text undefined or null
    if (value === undefined || value === null) {
      value = '';
    }

    return String(value);
  }
}

/** A cell value element: the value goes in as text, or as markup for a column with html: true. */
function cellValueElement(tagName: 'strong' | 'span', value: string, html: boolean | undefined): HTMLElement {
  const el: HTMLElement = document.createElement(tagName);

  el.className = 'bro-cell_component';

  if (html) {
    el.innerHTML = value;
  } else {
    el.textContent = value;
  }

  return el;
}

/**
 * Gives the plain values of the rendered rows that the widths of their columns cut the text ellipsis element of the
 * skin, as a row rendered with these widths has them: a narrower column, as next to the Filter Drawer, and a value
 * measured before its font loaded keep the tooltip of a value. The values are measured again, all in one layout, and
 * compared with the target widths, as the cells may still move to them; without target widths, with autoColumnWidth:
 * false, with the widths of the cells. A value keeps its element when its column gets wider again.
 * @param ctx - the context of the table
 * @param targets - the target widths by the keys of the columns, of the table whose rows hold this table in their details
 */
export function fitRenderedValues(ctx: BroContext, targets?: Map<string, number>): void {
  const {model, columns} = ctx;
  const values: {node: HTMLElement; slot: BroRowSlot; column: BroColumnModel; targetWidth?: number}[] = [];

  for (const slot of model.slots?.list ?? []) {
    if (!slot?.tr) {
      continue;
    }

    for (const column of columns) {
      const targetWidth = targets?.get(column.key) ?? model.tbodyCols?.find(tbodyCol => tbodyCol.key === column.key)?.targetWidth;
      const node = column.col.html ? null : slot.tr.querySelector<HTMLElement>(`:scope > td[${selectors.columnKeyAttribute}="${CSS.escape(column.key)}"] > span.bro-cell_component`);

      if (node) {
        values.push({node, slot, column, targetWidth});
      }
    }
  }

  const shownWidths = values.map(({node, targetWidth}) => targetWidth ?? node.getBoundingClientRect().width);

  // The values keep to one line while they are measured: the CSS of the table lets a plain value wrap
  values.forEach(({node}) => node.style.whiteSpace = 'nowrap');

  const range = measureRange ??= document.createRange();
  const widths = values.map(({node}) => {
    range.selectNodeContents(node);

    return range.getBoundingClientRect().width;
  });
  // A value that a width of its column holds keeps its box in one line; a value of a column without a width grows with it,
  // and the ellipsis element would widen the column instead of cutting the value
  const held = values.map(({node, targetWidth}, i) => targetWidth !== undefined || node.getBoundingClientRect().width < widths[i] - 0.5);

  values.forEach(({node, slot, column}, i) => {
    node.removeAttribute('style');

    if (held[i] && widths[i] > shownWidths[i] + 0.5) {
      node.replaceWith(new BroTdContent(ctx, column.col, slot.row, column, slot.valueWidths).ellipsis(node.textContent ?? ''));
    }
  });

  // The tables in the open details of the rows with the same columns take these widths too, as the rules of the widths
  // find their cells by the keys of the columns
  const own = new Map(model.tbodyCols?.map(tbodyCol => [tbodyCol.key, tbodyCol.targetWidth]));

  for (const slot of model.slots?.list ?? []) {
    slot?.details?.element.querySelectorAll('table-bro').forEach(table => {
      const tableCtx = renderedTables.get(table);

      if (tableCtx) {
        fitRenderedValues(tableCtx, own);
      }
    });
  }
}

/** The context of each rendered table by its host, for the tables in the row details of another one (fitRenderedValues). */
export const renderedTables = new WeakMap<Element, BroContext>();
