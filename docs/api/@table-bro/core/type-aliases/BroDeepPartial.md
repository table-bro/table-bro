# Type Alias: BroDeepPartial\<T\>

> **BroDeepPartial**\<`T`\> = `{ [K in keyof T]?: T[K] extends infer V ? V extends (args: never[]) => unknown ? V : V extends readonly unknown[] ? V : V extends object ? BroDeepPartial<V> : V : never }`

Every field optional at every depth. Arrays and functions stay whole, as the table replaces them in the config of
the skin.

## Type Parameters

### T

`T`
