/**
 * A helper of the interaction of the table: the actions that its views and elements send, and the focus.
 */

import type {BroActionDataMap, BroCellActionData, BroEventDetail, BroTableAction} from '../types/table-bro';
import {actionEvent}                                                              from './events';

/**
 * The data of an action: for an action of the table its type in BroActionDataMap, optional where it may be undefined;
 * for a custom action of the application the column and the row of a cell, or nothing.
 */
export type BroActionArgs<A extends string> = A extends BroTableAction
  ? (undefined extends BroActionDataMap[A] ? [data?: BroActionDataMap[A]] : [data: BroActionDataMap[A]])
  : [data?: BroCellActionData];

/**
 * Sends an action as a bubbling bro-action event from the target: the table or an element inside it. A page sends so
 * the filters of its own fields or a known new width of the table; the data of an action of the table is checked
 * by BroActionDataMap.
 * @group Events
 */
export function dispatchAction<A extends string>(target: Element, action: A, ...[data]: BroActionArgs<A>): void {
  target.dispatchEvent(
    new CustomEvent<BroEventDetail>(actionEvent, {
      bubbles: true,
      detail: {
        action: action,
        selector: target.nodeName.toLowerCase(),
        data: data
      }
    })
  );
}

/** Sends the own event of an element on as the action of the same name, such as the loading of server details. */
export function bubbleAction(event: Event): void {
  dispatchAction(<Element>event.target, event.type, (<CustomEvent>event).detail);
}

/** The elements that take the focus by the keyboard. */
export const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Replaces an element and gives the focus that was in it to the same control of the new one, by its place among the
 * controls: a row or a paginator rendered anew does not throw the focus of the keyboard out to the page. A control that
 * the new element disables, as the next page on the last one, gives the focus to the last control before it.
 * @param previous - the element that goes
 * @param replace - puts the new element in its place and gives it
 */
export function keepFocus(previous: Element, replace: () => Element): void {
  const focused = document.activeElement;
  const index = (focused && previous.contains(focused)) ? Array.from(previous.querySelectorAll(focusableSelector)).indexOf(focused) : -1;
  const next = replace();

  if (index >= 0) {
    const controls = next.querySelectorAll<HTMLElement>(focusableSelector);

    controls[Math.min(index, controls.length - 1)]?.focus({preventScroll: true});
  }
}
