# Interface: BroDropdown

A list of the toolbar, and the contract of the list element of a skin.

## Properties

### buttonClassName?

> `optional` **buttonClassName?**: `string` \| `null`

The class of the button of the list.

***

### buttonTitle

> **buttonTitle**: `string`

The title of the button of the list, as text.

***

### buttonTooltip?

> `optional` **buttonTooltip?**: `string`

The tooltip of the button of the list.

***

### iconHTML?

> `optional` **iconHTML?**: `string`

The markup of the icon of the button of the list.

***

### label?

> `optional` **label?**: `string`

The name of a list of values for screen readers, as the page sizes of the paginator, from the attribute label: the
element names its control by it and by the value that the control shows.

***

### mode

> **mode**: `"select"` \| `"dropdown"` \| `"navbar-dropdown"`

A select of values, a dropdown menu, or a dropdown menu of a navbar.

***

### options

> **options**: [`BroDropdownOption`](../type-aliases/BroDropdownOption.md)[]

The items of the list.
