# Type Alias: BroTextGroupName

> **BroTextGroupName** = keyof `Pick`\<[`BroSkinComponents`](../interfaces/BroSkinComponents.md), `"filterDrawer"` \| `"paginator"` \| `"progressBar"` \| `"state"` \| `"toolbarMain"` \| `"toolbarSearch"`\>

The names of the groups of the texts of a config: the components of a skin whose texts they hold, by their keys in
BroSkinComponents, as paginator for components.paginator. Pick takes only keys of BroSkinComponents, so a component
renamed there fails to compile here.

## Since

1.2.0
