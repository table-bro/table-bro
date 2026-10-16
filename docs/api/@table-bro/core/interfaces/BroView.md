# Interface: BroView

A view of the core or of a skin: the element that it renders from its template and keeps.

## Methods

### events()?

> `optional` **events**(): `void`

Adds the listeners to the rendered element.

#### Returns

`void`

***

### render()

> **render**(...`args`): `void` \| `Node`

Renders the element of the view and returns it, or fills the element in place and returns nothing.

#### Parameters

##### args

...`unknown`[]

the data of the render

#### Returns

`void` \| `Node`

***

### renderAnimation()?

> `optional` **renderAnimation**(...`args`): `void`

Renders the view frame by frame during an animation.

#### Parameters

##### args

...`unknown`[]

the data of the animation

#### Returns

`void`

***

### template()?

> `optional` **template**(...`args`): `string`

The HTML of the element, which render inserts.

#### Parameters

##### args

...`unknown`[]

the data that the view needs for the HTML

#### Returns

`string`

## Properties

### el?

> `optional` **el?**: `HTMLElement`

The element that the view renders and keeps.

***

### selector?

> `optional` **selector?**: `string`

The class name or the tag name that the view gives its element.
