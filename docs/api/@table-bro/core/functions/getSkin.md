# Function: getSkin()

> **getSkin**(`name`): [`BroSkinConfig`](../interfaces/BroSkinConfig.md) \| `undefined`

The config of a registered skin, as configure() takes it; undefined when no skin is registered under the name. The
prerender of a framework reads whether a skin has elements for a server DOM (BroSkinConfig.defineElements).

## Parameters

### name

[`BroSkin`](../type-aliases/BroSkin.md)

the name of the skin

## Returns

[`BroSkinConfig`](../interfaces/BroSkinConfig.md) \| `undefined`
