import {type BroButton, type BroConfiguredElement, type BroDropdown, type BroResolvedConfig, events} from '@table-bro/core';

import {h, mergeProps, type VNode} from 'vue';
import {VBtn}                      from 'vuetify/components/VBtn';
import {VDivider}                  from 'vuetify/components/VDivider';
import {VList, VListItem}          from 'vuetify/components/VList';
import {VMenu}                     from 'vuetify/components/VMenu';
import {VToolbar}                  from 'vuetify/components/VToolbar';
import {VTooltip}                  from 'vuetify/components/VTooltip';

import {BroVuetifyElement, icon} from '../bro-vuetify-element';

/** The props that the tooltip or the menu of Vuetify gives its activator. */
type BroActivatorProps = {props: Record<string, unknown>};

/**
 * An icon button of the toolbar with its tooltip.
 * @param ligature - the icon of the button
 * @param props - the props of the button: its name, its class and its click
 * @param tooltip - the text of the tooltip; none without it
 */
function toolbarButton(ligature: string, props: Record<string, unknown>, tooltip?: string): VNode {
  return h(VTooltip, {text: tooltip, disabled: !tooltip, location: 'top', contentClass: 'bro-vuetify-tooltip'}, {
    activator: ({props: activator}: BroActivatorProps) => h(VBtn, mergeProps(activator, props, {icon: true, variant: 'text'}), () => icon(ligature))
  });
}

/**
 * The toolbar of a table, the element bro-vuetify-toolbar-main: its title, its search and the buttons and the menu of
 * the config.
 */
export class BroVuetifyToolbarMainComponent extends BroVuetifyElement implements BroConfiguredElement {
  /** The config of the table: the name of the search button. */
  config?: BroResolvedConfig;

  protected content() {
    // The table sets the buttons and the title before the element connects: the buttons as the JSON of the config
    const buttons: (BroButton | BroDropdown)[] = JSON.parse(this.getAttribute('buttons') ?? '[]');
    const dropdown = <BroDropdown | undefined>buttons.find(button => button.mode === 'navbar-dropdown');
    const send = (action: string) => this.emit(events.toolbarEvent, action);

    const mainButtons = (<BroButton[]>buttons.filter(button => button.mode !== 'navbar-dropdown'))
      .map(button => toolbarButton(button.iconHTML ?? '', {'aria-label': button.buttonTitle, onClick: () => send(button.eventType)}, button.buttonTooltip));

    // The hidden menu button keeps the place of the navigation icon of a Material toolbar before the title
    return h(VToolbar, {flat: true}, () => [
      h(VBtn, {class: 'bro-toolbar-placeholder', icon: true, variant: 'text', tabindex: -1, 'aria-hidden': 'true'}, () => icon('menu')),
      h('span', {class: 'bro-toolbar-title text-title-large'}, this.getAttribute('title') ?? ''),
      h('span', {class: 'bro-toolbar-space'}),
      toolbarButton('search', {class: 'bro-toolbar-button-search', 'aria-label': this.config?.texts.search, onClick: () => send(events.toolbarSearchOpenEvent)}),
      ...mainButtons,
      dropdown ? this.menu(dropdown, send) : null
    ]);
  }

  /**
   * The menu of the toolbar: an icon button with the title of the menu as its name, and the items of the list of
   * Vuetify that send their values.
   * @param dropdown - the menu of the config, a button of toolbarMain.buttons with the mode navbar-dropdown
   * @param send - sends the value of an item
   */
  private menu(dropdown: BroDropdown, send: (action: string) => void): VNode {
    const items = dropdown.options.map(option => option.divider
      ? h(VDivider)
      : h(VListItem, {title: option.title, onClick: () => send(option.value ?? '')}, {
          prepend: option.iconHTML ? () => icon(option.iconHTML!) : undefined
        }));

    return h(VMenu, {location: 'bottom end'}, {
      activator: ({props}: BroActivatorProps) => toolbarButton('more_vert', mergeProps(props, {'aria-label': dropdown.buttonTitle}), dropdown.buttonTooltip),
      default: () => h(VList, {class: 'bro-vuetify-menu'}, () => items)
    });
  }
}
