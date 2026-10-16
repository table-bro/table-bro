import {matSkinConfig}                                                                            from '@table-bro/angular-material';
import {bootstrapSkinConfig, withSwitch, withTags}                                                from '@table-bro/bootstrap';
import {type BroButton, type BroDropdown, type BroSkin, type BroSkinConfig, events, registerSkin} from '@table-bro/core';
import {nativeSkinConfig, withTags as withNativeTags}                                             from '@table-bro/native';

/**
 * The skins ship a toolbar with the search only: the tables of the stand add a Filters button and a sample menu More.
 * @param config - the config of the skin
 * @param material - the skin is mat: its buttons are icons with tooltips
 */
function withStandToolbar(config: BroSkinConfig, material: boolean): BroSkinConfig {
  const icon = (name: string) => material ? {iconHTML: name} : {};
  const buttons: (BroButton | BroDropdown)[] = [
    {buttonTitle: 'Filters', eventType: events.filtersToggleEvent, ...(material ? {iconHTML: 'filter_list', buttonTooltip: 'Filters'} : {})},
    {
      buttonTitle: 'More',
      mode: 'navbar-dropdown',
      ...(material ? {buttonTooltip: 'Your custom menu'} : {}),
      options: [
        {value: 'action-1', title: 'Action', ...icon('filter_1')},
        {value: 'action-2', title: 'Another action', ...icon('filter_2')},
        {divider: true},
        {value: 'action-3', title: 'Something else here', ...icon('filter_3')}
      ]
    }
  ];

  return {...config, components: {...config.components, toolbarMain: {...config.components.toolbarMain, buttons}}};
}

/** The configs of the skins of the stand. */
const standSkinConfigs: Record<BroSkin, BroSkinConfig> = {
  mat: withStandToolbar(matSkinConfig, true),
  bs: withStandToolbar(bootstrapSkinConfig, false),
  nv: withStandToolbar(nativeSkinConfig, false)
};

/** Registers the skins of the stand with all their elements, after provideTableBroMatSkin() has registered the skin mat. */
export function registerStandSkins(): void {
  // The skins bs and nv share the switch
  withTags();
  withNativeTags();
  withSwitch();

  registerSkin('mat', standSkinConfigs.mat);
  registerSkin('bs', standSkinConfigs.bs);
  registerSkin('nv', standSkinConfigs.nv);
}
