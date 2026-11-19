import Popper                   from '@suid/material/Popper';
import {alpha, styled}          from '@suid/material/styles';
import {createSignal, type JSX} from 'solid-js';
import {render}                 from 'solid-js/web';

import {suid, themed} from './bro-suid-element';

/** The side of its element where a tooltip shows, as the positions above and right of the tooltips of the skin mat. */
export type BroSuidTooltipPlacement = 'top' | 'right';

/** The options of a tooltip of the skin. */
export interface BroSuidTooltipOptions {
  /** The side of the element where the tooltip shows, top by default, as the placements of the Popper of SUID. */
  placement?: BroSuidTooltipPlacement;
}

/** The delay of a long press of a touch that shows a tooltip, as touchLongPressShowDelay of the tooltip of mat. */
const touchShowDelay: number = 500;
/** The delay after the end of a touch that hides a tooltip, as touchendHideDelay of the tooltip of mat. */
const touchHideDelay: number = 1500;
/** The number of the next tooltip, for the id that aria-describedby of its element names. */
let nextTooltip: number = 0;

/** The tooltip of SUID, which SUID 0.19 does not port: the look of the tooltip of MUI in the theme of the application. */
const TooltipPopup = styled('div')(({theme}) => ({
  maxWidth: 300,
  padding: '4px 8px',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.grey[700], 0.92),
  color: theme.palette.common.white,
  fontFamily: theme.typography.fontFamily,
  fontSize: theme.typography.pxToRem(11),
  fontWeight: theme.typography.fontWeightMedium,
  lineHeight: `${Math.round(16 / 11 * 1e5) / 1e5}em`,
  overflowWrap: 'break-word'
}));

/**
 * Gives an element a tooltip on the Popper of SUID, with the behavior of the tooltip of the skin mat: it shows on the
 * hover of the pointer, on the focus of the keyboard and on a long press of a touch, without a delay, and hides when
 * the pointer leaves, the element loses the focus, the touch ends, or Escape is pressed. A disabled element, as a link
 * of a page that does not exist, shows none. The tooltip renders its Solid root when it shows first. In a server DOM
 * the element gets no tooltip. The skin gives its tooltips by it, and an application gives it the controls of its cells
 * and dialogs, as matTooltip of the skin mat, in the theme of SUID of the table of the element.
 * The tooltip works in a table and out of it, as on the buttons of a page: its styles are the ones of the skin and of
 * SUID in the body of the page.
 * @param target - the element
 * @param text - the text of the tooltip, or the function that gives it when the tooltip shows; an empty one shows none
 * @param options - the options of the tooltip
 * @param options.placement - the side of the element where the tooltip shows, top by default
 * @returns the function that takes the tooltip off the element
 */
export function attachSuidTooltip(target: Element, text: string | (() => string), options: BroSuidTooltipOptions = {}): () => void {
  const placement = options.placement ?? 'top';
  const message = (typeof text === 'function') ? text : () => text;

  if ((typeof window === 'undefined') || (target.ownerDocument.defaultView !== window)) {
    return () => undefined;
  }

  const id = `bro-suid-tooltip-${nextTooltip++}`;
  const [open, setOpen] = createSignal(false);
  // The text of the tooltip as it shows: a function gives it anew each time
  const [shown, setShown] = createSignal('');
  const listeners = new AbortController();
  const {signal} = listeners;
  let dispose: (() => void) | null = null;
  let touchTimer: ReturnType<typeof setTimeout> | undefined;

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      hide();
    }
  };

  const popup = (): JSX.Element => suid(Popper, {
    get open() {
      return open();
    },
    anchorEl: <HTMLElement>target,
    placement,
    modifiers: [{name: 'offset', options: {offset: [0, 8]}}],
    class: 'bro-suid-tooltip-popper',
    // The Popper is the element of the role tooltip; its text names the element by aria-describedby
    children: suid(TooltipPopup, {id, class: 'bro-suid-tooltip', get children() {
      return shown();
    }})
  });

  function show(): void {
    const current = message();

    if (open() || !current || target.closest('.disabled, :disabled, [aria-disabled="true"]')) {
      return;
    }

    setShown(current);

    // The root lives in a container out of the page: the Popper renders the tooltip into the body
    dispose ??= render(() => themed(popup, target), target.ownerDocument.createElement('div'));
    setOpen(true);
    target.setAttribute('aria-describedby', id);
    target.ownerDocument.addEventListener('keydown', onKeydown, {signal});
  }

  function hide(): void {
    clearTimeout(touchTimer);

    if (!open()) {
      return;
    }

    setOpen(false);
    target.removeAttribute('aria-describedby');
    target.ownerDocument.removeEventListener('keydown', onKeydown);
  }

  target.addEventListener('mouseenter', show, {signal});
  target.addEventListener('mouseleave', hide, {signal});
  target.addEventListener('focusin', () => target.matches(':focus-visible') && show(), {signal});
  target.addEventListener('focusout', hide, {signal});
  target.addEventListener('touchstart', () => {
    clearTimeout(touchTimer);
    touchTimer = setTimeout(show, touchShowDelay);
  }, {signal, passive: true});
  target.addEventListener('touchend', () => {
    clearTimeout(touchTimer);
    touchTimer = setTimeout(hide, touchHideDelay);
  }, {signal});

  return () => {
    hide();
    listeners.abort();
    dispose?.();
  };
}
