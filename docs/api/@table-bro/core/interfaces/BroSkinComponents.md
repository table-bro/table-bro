# Interface: BroSkinComponents

The components of a skin: its elements, their settings and their functions, all that the table uses.

## Properties

### button

> **button**: [`BroCustomElementConfig`](BroCustomElementConfig.md)\<[`BroRow`](BroRow.md)\> & `object`

The button element of the skin: the details button, the buttons of the search line and of the filter drawer.

#### Type Declaration

##### beforeRender

> **beforeRender**: (`element`, `value`) => `void`

Sets the attributes of the button of the details button before it renders, as its class, title and icon.

###### Parameters

###### element

`Element`

the button element

###### value

`string`

the title of the button

###### Returns

`void`

##### iconSelector

> **iconSelector**: `string`

The icon inside the button, which the details button turns.

##### selector

> **selector**: `string`

The tag of the button element.

***

### dropdown?

> `optional` **dropdown?**: `object`

The list element of the skin, for the lists of the toolbar.

#### css?

> `optional` **css?**: `object`

The classes of the list element.

##### css.button

> **button**: `object`

The button that opens the list.

##### css.button.className

> **className**: `string`

The class of the button; the attribute button-class of the element replaces it.

#### selector

> **selector**: `string`

The tag of the list element.

***

### filterDrawer

> **filterDrawer**: `object`

The filter drawer of the skin.

#### beforeRender?

> `optional` **beforeRender?**: (`closeButton`) => `void`

Sets the attributes of the close button of the filter drawer before it renders.

##### Parameters

###### closeButton

`Element`

the close button element

##### Returns

`void`

***

### fontIcon?

> `optional` **fontIcon?**: `object`

The font icons of the skin, for the icons of the states with state.fontIcon.

#### html

> **html**: (`iconName`) => `string`

The markup of an icon.

##### Parameters

###### iconName

`string`

the name of the icon, the first item of a state in state.states

##### Returns

`string`

***

### paginator

> **paginator**: `object`

The paginator element of the skin.

#### css?

> `optional` **css?**: `object`

The classes of the list of the page buttons of a vanilla paginator.

##### css.ul?

> `optional` **ul?**: `object`

The list of the page buttons.

##### css.ul.className?

> `optional` **className?**: `string`

The class of the list.

##### css.ul.li?

> `optional` **li?**: `object`

An item of the list.

##### css.ul.li.a?

> `optional` **a?**: `object`

The button of an item.

##### css.ul.li.a.className?

> `optional` **className?**: `string`

The class of the button.

##### css.ul.li.className?

> `optional` **className?**: `string`

The class of an item.

#### inputsAsProperties?

> `optional` **inputsAsProperties?**: `boolean`

The element takes pageIndex, pageSize, length, pageSizeOptions, disabled and showFirstLastButtons as properties; otherwise as attributes.

#### recreateOnReplaceRows?

> `optional` **recreateOnReplaceRows?**: `boolean`

The element does not apply a new pageIndex after replaceRows, so the table replaces it with a new element.

#### selector

> **selector**: `string`

The tag of the paginator element.

***

### progressBar

> **progressBar**: `object`

The progress bar element of the skin, for the loading of the table and of the server details.

#### selector

> **selector**: `string`

The tag of the progress bar element.

***

### sortHeader

> **sortHeader**: `object`

The sort header element of the skin in the header cells.

#### afterRender?

> `optional` **afterRender?**: (`element`, `value`) => `void` \| (() => `void`)

Runs after the element renders, for example to add a tooltip. It may return a cleanup function:
the element calls it when it is removed from the DOM, and runs the callback again if it is connected later.

##### Parameters

###### element

`Element`

the sort header element

###### value

`string`

the tooltip of the column

##### Returns

`void` \| (() => `void`)

#### beforeRender?

> `optional` **beforeRender?**: (`element`, `value`) => `void`

Sets the attributes of the element before it renders.

##### Parameters

###### element

`Element`

the sort header element

###### value

`string`

an empty string: the title of the column is in the attributes of the element

##### Returns

`void`

#### contentSelector

> **contentSelector**: `string`

The title inside the element, measured for the column widths.

#### selector

> **selector**: `string`

The tag of the sort header element.

#### titleAsContent?

> `optional` **titleAsContent?**: `boolean`

The column title goes into the element as its content, not only into the header-title attribute.

***

### state

> **state**: `object`

The states of the body: their icons and messages.

#### fontIcon?

> `optional` **fontIcon?**: `boolean`

The icons of the states are font icons of fontIcon.html.

#### lottie?

> `optional` **lottie?**: `boolean`

The icons of the states are Lottie animations of lottieHTML, without a message.

#### lottieHTML?

> `optional` **lottieHTML?**: (`iconSrc`) => `string`

The markup of the animation of a state.

##### Parameters

###### iconSrc

`string`

the address of the animation, the first item of a state in states

##### Returns

`string`

#### states

> **states**: [`BroStates`](BroStates.md)

The icon and the message of each state.

#### statesDark?

> `optional` **statesDark?**: [`BroStates`](BroStates.md)

The icon and the message of each state in the dark theme; without it the dark theme takes states.

***

### switch?

> `optional` **switch?**: `object`

The switch element of the bootstrap-based skins, for the cells of boolean values.

#### css?

> `optional` **css?**: `object`

The classes of the switch.

##### css.div

> **div**: `object`

The container of the switch.

##### css.div.className

> **className**: `string`

The class of the container.

##### css.div.input

> **input**: `object`

The checkbox of the switch.

##### css.div.input.className

> **className**: `string`

The class of the checkbox.

#### selector

> **selector**: `string`

The tag of the switch element.

***

### textEllipsis

> **textEllipsis**: `object`

The text element of the skin with an ellipsis, for the cells and the short titles.

#### afterRender?

> `optional` **afterRender?**: (`element`, `value`) => `void` \| (() => `void`)

Runs after the element renders, for example to add a tooltip. It may return a cleanup function:
the element calls it when it is removed from the DOM, and runs the callback again if it is connected later.

##### Parameters

###### element

`Element`

the text element

###### value

`string`

the text of the element

##### Returns

`void` \| (() => `void`)

#### selector

> **selector**: `string`

The tag of the text element.

***

### toolbar

> **toolbar**: `object`

The toolbar element of the skin: the bar of the search line and of the filter drawer.

#### css?

> `optional` **css?**: `object`

The classes of the toolbar of a vanilla skin.

##### css.nav

> **nav**: `object`

The bar of the toolbar.

##### css.nav.className

> **className**: `string`

The class of the bar.

##### css.nav.div?

> `optional` **div?**: `object`

The content of the bar.

##### css.nav.div.className?

> `optional` **className?**: `string`

The class of the content, next to its own class.

#### selector

> **selector**: `string`

The tag of the toolbar element.

***

### toolbarMain

> **toolbarMain**: `object`

The main toolbar element of the skin: the title, the search button and the buttons of the application.

#### beforeRender?

> `optional` **beforeRender?**: (`searchButton`, `value`) => `void`

Sets the attributes of the search button before it renders.

##### Parameters

###### searchButton

`Element`

the search button element

###### value

`string`

the word of the button, texts.search

##### Returns

`void`

#### buttons?

> `optional` **buttons?**: ([`BroButton`](BroButton.md) \| [`BroDropdown`](BroDropdown.md))[]

The buttons and lists of the application in the toolbar.

#### css?

> `optional` **css?**: `object`

The classes of the main toolbar of a vanilla skin.

##### css.navbarCollapse

> **navbarCollapse**: `object`

The part of the toolbar with its buttons.

##### css.navbarCollapse.className

> **className**: `string`

The class of the part.

##### css.navbarCollapse.ul

> **ul**: `object`

The list of the buttons.

##### css.navbarCollapse.ul.className?

> `optional` **className?**: `string`

The class of the list.

##### css.navbarCollapse.ul.li

> **li**: `object`

An item of the list.

##### css.navbarCollapse.ul.li.a

> **a**: `object`

The button of an item.

##### css.navbarCollapse.ul.li.a.className

> **className**: `string`

The class of the button.

##### css.navbarCollapse.ul.li.className

> **className**: `string`

The class of an item.

##### css.toolbarTitle

> **toolbarTitle**: `object`

The title of the toolbar, also the title of the filter drawer.

##### css.toolbarTitle.className

> **className**: `string`

The class of the title.

#### selector

> **selector**: `string`

The tag of the main toolbar element.

***

### toolbarSearch

> **toolbarSearch**: `object`

The search line of the toolbar.

#### beforeRender?

> `optional` **beforeRender?**: (`backButton`, `clearButton`) => `void`

Sets the attributes of the back and clear buttons of the search line before they render.

##### Parameters

###### backButton

`Element`

the back button element

###### clearButton

`Element`

the clear button element

##### Returns

`void`
