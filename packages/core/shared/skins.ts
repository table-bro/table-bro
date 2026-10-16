import type {BroSkin, BroSkinConfig} from '../types/table-bro';

const skins = new Map<BroSkin, BroSkinConfig>();

/**
 * Registers a skin under its name, for the config of the tables that name it in skin.
 * @param name - the name of the skin, as BroConfig.skin takes it
 * @param config - the config of the skin
 * @group Skins
 */
export function registerSkin(name: BroSkin, config: BroSkinConfig): void {
  skins.set(name, config);
}

/** The config of a registered skin for init(); undefined when no skin is registered under the name. */
export function getSkin(name: BroSkin): BroSkinConfig | undefined {
  return skins.get(name);
}
