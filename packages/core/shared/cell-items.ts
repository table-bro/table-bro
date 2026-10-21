import {focusableSelector} from './interaction';

/** The class of the ellipsis after the items that show. */
const ellipsisClassName = 'bro-cell-items-ellipsis';
/** The class of an item that does not fit the line: it is hidden from the eye only, screen readers read it. */
const hiddenClassName = 'bro-cell-item-hidden';

/**
 * Fits the items of a component cell, such as tags, into the one line of the cell, since all rows have one fixed height.
 * The items that do not fit whole give way to an ellipsis after the items that show; the first item always shows,
 * and the CSS of the skin shrinks it with its own ellipsis in a narrow cell (mixin bro-cell-items).
 * The items are measured once; then the line follows the width of the cell, also while it animates, until
 * the signal aborts. A hidden item is out of the tab order, and takes its own tabindex back when it shows.
 * @group Rendering helpers
 */
export function fitCellItems(row: HTMLElement, signal: AbortSignal): void {
  let ellipsis: HTMLElement | null = row.querySelector(`:scope > .${ellipsisClassName}`);

  const items = (<HTMLElement[]>Array.from(row.children)).filter((item: HTMLElement) => item !== ellipsis);

  // A single item needs no ellipsis after it, so the text of the cell stays its value
  if (items.length < 2) {
    ellipsis?.remove();

    return;
  }

  if (!ellipsis) {
    ellipsis = row.ownerDocument.createElement('span');
    ellipsis.className = ellipsisClassName;
    ellipsis.textContent = '…';
    // The items that it stands for are read
    ellipsis.setAttribute('aria-hidden', 'true');

    row.append(ellipsis);
  }

  ellipsis.style.display = 'none';

  fits.set(row, {items, ellipsis, tabIndexes: new Map()});

  observer ??= new ResizeObserver(fitRows);
  observer.observe(row);

  // A line that connects again, as a sort moves its row, fits anew from the tabindex of its own markup
  signal.addEventListener('abort', () => {
    observer?.unobserve(row);
    fits.get(row)?.tabIndexes.forEach(returnToTabOrder);
    fits.delete(row);
  }, {once: true});
}

/** The items of a line, its ellipsis, and the width of its first items with the ellipsis after them, once measured. */
interface BroItemsFit {
  items: HTMLElement[];
  ellipsis: HTMLElement;
  widths?: number[];
  /** The hidden items out of the tab order, each with the tabindex, or null for none, of the elements it took out. */
  tabIndexes: Map<HTMLElement, Map<Element, string | null>>;
}

/** The lines that the observer follows. */
const fits = new WeakMap<Element, BroItemsFit>();

/**
 * One observer follows every line: a line per cell measured its items in a layout of its own, so the cells that a sort
 * moved, which connect again, laid the table out once for each cell.
 */
let observer: ResizeObserver | undefined;

/**
 * Fits the lines whose width changed. The new lines are measured together, in one layout: their items show whole,
 * the first one too, then all of them are read, then each line shows the most items that fit.
 */
function fitRows(entries: ResizeObserverEntry[]): void {
  // A hidden table has no widths to measure yet
  const lines = entries
    .map(entry => ({fit: fits.get(entry.target), width: entry.contentRect.width}))
    .filter((line): line is {fit: BroItemsFit; width: number} => !!line.fit && line.width > 0);
  const unmeasured = lines.filter(({fit}) => !fit.widths);

  unmeasured.forEach(({fit}) => {
    fit.items.forEach(item => item.classList.remove(hiddenClassName));
    fit.items[0].style.flexShrink = '0';
    fit.ellipsis.style.display = '';
  });

  unmeasured.forEach(({fit}) => {
    const ellipsisWidth = outerWidth(fit.ellipsis);
    const widths: number[] = [];

    // The last count needs no ellipsis
    fit.items.reduce((sum: number, item: HTMLElement, i: number) => {
      sum += outerWidth(item);
      widths.push(sum + ((i < fit.items.length - 1) ? ellipsisWidth : 0));

      return sum;
    }, 0);

    fit.widths = widths;
  });

  lines.forEach(({fit: {items, ellipsis, widths, tabIndexes}, width}) => {
    items[0].style.flexShrink = '';

    // The most items that fit; the first one shows anyway
    let count = items.length;

    while (count > 1 && widths![count - 1] > width) {
      count--;
    }

    items.forEach((item: HTMLElement, i: number) => {
      const hidden = (i >= count);

      item.classList.toggle(hiddenClassName, hidden);

      if (hidden && !tabIndexes.has(item)) {
        tabIndexes.set(item, takeOutOfTabOrder(item));
      } else if (!hidden && tabIndexes.has(item)) {
        returnToTabOrder(tabIndexes.get(item)!);
        tabIndexes.delete(item);
      }
    });

    ellipsis.style.display = (count < items.length) ? '' : 'none';
  });
}

/**
 * Takes the elements of a hidden item out of the tab order: the links and controls that the markup of an item can hold,
 * and the boxes that scroll, which Tab reaches once the item shrinks to one pixel, such as the action of a chip of
 * Material. An element out of the tab order already stays as it is.
 * @param item - the hidden item
 * @returns the tabindex, or null for none, of each element that it took out
 */
function takeOutOfTabOrder(item: HTMLElement): Map<Element, string | null> {
  const tabIndexes = new Map<Element, string | null>();

  [item, ...Array.from(item.querySelectorAll('*'))].forEach((el: Element) => {
    const {overflowX, overflowY} = getComputedStyle(el);
    const scrolls = [overflowX, overflowY].some(overflow => overflow === 'auto' || overflow === 'scroll');

    if (el.getAttribute('tabindex') !== '-1' && (scrolls || el.matches(focusableSelector))) {
      tabIndexes.set(el, el.getAttribute('tabindex'));
      el.setAttribute('tabindex', '-1');
    }
  });

  return tabIndexes;
}

/**
 * Gives the elements that takeOutOfTabOrder() took out their own tabindex back.
 * @param tabIndexes - the tabindex, or null for none, of each element
 */
function returnToTabOrder(tabIndexes: Map<Element, string | null>): void {
  tabIndexes.forEach((tabIndex: string | null, el: Element) => {
    if (tabIndex === null) {
      el.removeAttribute('tabindex');
    } else {
      el.setAttribute('tabindex', tabIndex);
    }
  });
}

function outerWidth(el: HTMLElement): number {
  const style = getComputedStyle(el);

  return el.getBoundingClientRect().width + parseFloat(style.marginLeft) + parseFloat(style.marginRight);
}
