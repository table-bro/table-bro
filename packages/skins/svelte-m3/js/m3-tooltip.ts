/** The side of its target where a tooltip shows, as matTooltipPosition of the skin mat: the opposite side when it has no room. */
export type BroM3SvelteTooltipPosition = 'above' | 'right';

/** The space between a tooltip and its target, as the tooltip of Angular Material keeps it. */
const tooltipGap: number = 8;
/** The space that a tooltip keeps from the edges of the viewport. */
const viewportMargin: number = 8;
/** A touch shows the tooltip after a long press, as the one of Angular Material. */
const longPressDelay: number = 500;
/** The end of a touch hides the tooltip after a while, as the one of Angular Material. */
const touchendHideDelay: number = 1500;
/** The tooltips of the page, for their ids. */
let tooltipCount: number = 0;

/** The options of a tooltip. */
export interface BroM3SvelteTooltipOptions {
  /** The side of the target where the tooltip shows: above by default, as matTooltipPosition. */
  position?: BroM3SvelteTooltipPosition;
  /**
   * The element that holds the popover of the tooltip, whose color scheme it takes: the parent of the target by default,
   * so a click on the tooltip does not reach a button that is the target.
   */
  host?: HTMLElement;
}

/**
 * Gives a node the plain tooltip of Material 3 of the skin, as matTooltip of Angular Material: a popover of the top layer
 * in the colors, the shape and the type of the tokens of the theme of M3 Svelte, which does not export a tooltip of its
 * own, with the behavior of the tooltip of the skin mat. A pointer shows it at once on hover and hides it when it leaves
 * the target and the tooltip; a keyboard focus shows it and a blur hides it; Escape and a wheel away from the target
 * hide it; a touch shows it after a long press and hides it a while after its end. The tooltip describes the target for
 * screen readers while it shows. The skin gives it to its sort headers, its cut cells and the buttons of its toolbar; an
 * application gives it to its own nodes, as the buttons of a cell, with the stylesheet of the skin. A server DOM has no
 * pointer and no focus: the target gets no tooltip there.
 * @param target - the node that shows the tooltip
 * @param text - the text of the tooltip, or the function that gives it at the time the tooltip shows: an empty text shows
 *   no tooltip
 * @param options - the side of the target and the element that holds the popover
 * @param options.position - the side of the target where the tooltip shows, above by default
 * @param options.host - the element that holds the popover, the parent of the target by default
 * @returns the function that removes the tooltip and its listeners
 */
export function attachM3SvelteTooltip(target: HTMLElement, text: string | (() => string), options: BroM3SvelteTooltipOptions = {}): () => void {
  const view = target.ownerDocument.defaultView;

  if (typeof window === 'undefined' || view !== window) {
    return () => undefined;
  }

  const document = target.ownerDocument;
  const position = options.position ?? 'above';
  const textOf = (typeof text === 'function') ? text : () => text;
  const id = `bro-m3-svelte-tooltip-${++tooltipCount}`;
  let tooltip: HTMLElement | null = null;
  let hideTimeout: ReturnType<typeof setTimeout> | undefined;
  let touchTimeout: ReturnType<typeof setTimeout> | undefined;

  const remove = () => {
    tooltip?.remove();
    tooltip = null;
    target.removeAttribute('aria-describedby');
    document.removeEventListener('keydown', onKeydown, true);
  };

  // The tooltip leaves with the animation of its exit, or at once without one, as under reduced motion
  const hide = (delay: number = 0) => {
    clearTimeout(touchTimeout);
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      const leaving = tooltip;

      if (!leaving) {
        return;
      }

      leaving.classList.replace('bro-m3-svelte-tooltip_show', 'bro-m3-svelte-tooltip_hide');

      if (leaving.getAnimations().length) {
        leaving.addEventListener('animationend', () => (tooltip === leaving) && remove(), {once: true});
      } else {
        remove();
      }
    }, delay);
  };

  const show = () => {
    const value = textOf();
    const host = options.host ?? target.parentElement ?? target;

    clearTimeout(hideTimeout);

    if (tooltip?.classList.contains('bro-m3-svelte-tooltip_show') || !value) {
      return;
    }

    remove();

    tooltip = document.createElement('div');
    tooltip.id = id;
    tooltip.className = 'bro-m3-svelte-tooltip bro-m3-svelte-tooltip_show';
    tooltip.popover = 'manual';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.textContent = value;
    tooltip.addEventListener('mouseleave', (event: MouseEvent) => {
      if (!target.contains(<Node | null>event.relatedTarget)) {
        hide();
      }
    });
    host.append(tooltip);
    tooltip.showPopover();
    place(tooltip, target, position);
    target.setAttribute('aria-describedby', id);
    document.addEventListener('keydown', onKeydown, true);
  };

  function onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      hide();
    }
  }

  const listeners: [string, EventListener][] = [
    // A mouse or a pen: a touch shows the tooltip by a long press
    ['pointerenter', (event: Event) => ((<PointerEvent>event).pointerType !== 'touch') && show()],
    ['pointerleave', (event: Event) => {
      const {pointerType, relatedTarget} = <PointerEvent>event;

      if (pointerType !== 'touch' && !tooltip?.contains(<Node | null>relatedTarget)) {
        hide();
      }
    }],
    ['wheel', (event: Event) => {
      const under = document.elementFromPoint((<WheelEvent>event).clientX, (<WheelEvent>event).clientY);

      if (tooltip && !target.contains(under)) {
        hide();
      }
    }],
    ['touchstart', () => {
      clearTimeout(touchTimeout);
      touchTimeout = setTimeout(show, longPressDelay);
    }],
    ['touchend', () => hide(touchendHideDelay)],
    ['touchcancel', () => hide(touchendHideDelay)],
    // A focus of the keyboard shows the tooltip, a focus of the pointer does not
    ['focusin', () => target.matches(':focus-visible') && show()],
    ['focusout', () => hide()]
  ];

  listeners.forEach(([type, listener]) => target.addEventListener(type, listener, {passive: true}));

  return () => {
    clearTimeout(hideTimeout);
    clearTimeout(touchTimeout);
    remove();
    listeners.forEach(([type, listener]) => target.removeEventListener(type, listener));
  };
}

/**
 * Places a shown tooltip at its target by the coordinates of the viewport, as the overlay of Angular Material: on its
 * side, or on the opposite one when it has no room there, and within the viewport.
 * @param tooltip - the popover of the tooltip
 * @param target - the node that shows it
 * @param position - the side of the target where it shows
 */
function place(tooltip: HTMLElement, target: HTMLElement, position: BroM3SvelteTooltipPosition): void {
  const anchor = target.getBoundingClientRect();
  // The sizes of the layout, not of the scale of the animation that the tooltip enters with
  const size = {width: tooltip.offsetWidth, height: tooltip.offsetHeight};
  const {clientWidth, clientHeight} = target.ownerDocument.documentElement;
  const clamp = (value: number, max: number) => Math.max(viewportMargin, Math.min(value, max - viewportMargin));
  let left: number;
  let top: number;
  let side: string;

  if (position === 'above') {
    const above = anchor.top - tooltipGap - size.height;

    side = (above >= viewportMargin) ? 'above' : 'below';
    top = (side === 'above') ? above : anchor.bottom + tooltipGap;
    left = clamp(anchor.left + (anchor.width - size.width) / 2, clientWidth - size.width);
  } else {
    const right = anchor.right + tooltipGap;

    side = (right + size.width <= clientWidth - viewportMargin) ? 'right' : 'left';
    left = (side === 'right') ? right : anchor.left - tooltipGap - size.width;
    top = clamp(anchor.top + (anchor.height - size.height) / 2, clientHeight - size.height);
  }

  // The class of the side turns the growth of the tooltip toward its target
  tooltip.classList.add(`bro-m3-svelte-tooltip_${side}`);
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}
