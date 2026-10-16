# Interface: BroButton

A button of the toolbar, and the contract of the button element of a skin, which takes it as attributes.

## Properties

### buttonClassName?

> `optional` **buttonClassName?**: `string` \| `null`

The class of the button inside the element.

***

### buttonTitle

> **buttonTitle**: `string`

The title of the button, as text.

***

### buttonTooltip?

> `optional` **buttonTooltip?**: `string`

The tooltip of the button.

***

### eventType

> **eventType**: `string`

The action of the bro-action event the button sends on click.

***

### iconHTML?

> `optional` **iconHTML?**: `string`

The markup of the icon of the button, of the skin or the application.

***

### label?

> `optional` **label?**: `string`

The name of a button without a title, for screen readers: the element gives it to its button. An attribute of its
own, not aria-label, which an element without a role must not carry.

***

### mode?

> `optional` **mode?**: `"link"` \| `"button"`

A button, by default, or a link of the toolbar.
