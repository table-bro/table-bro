# Class: BroHTML

A helper of the HTML of the views and the skins: elements and templates from markup, text for markup and back.

## Constructors

### Constructor

> **new BroHTML**(): `BroHTML`

#### Returns

`BroHTML`

## Methods

### createElement()

> `static` **createElement**(`html`): `HTMLElement`

#### Parameters

##### html

`string`

#### Returns

`HTMLElement`

***

### createTemplate()

> `static` **createTemplate**(`html`): `HTMLTemplateElement`

#### Parameters

##### html

`string`

#### Returns

`HTMLTemplateElement`

***

### escape()

> `static` **escape**(`text`): `string`

A text for an HTML template: the characters of markup become entities, so the text shows as it is in the content
and in a quoted attribute. undefined and null give an empty text.

#### Parameters

##### text

`unknown`

#### Returns

`string`

***

### text()

> `static` **text**(`html`): `string`

The text of markup, as for the tooltip of an HTML value. The markup is read in a document of DOMParser, which loads
no images and runs no handlers, unlike an element of the page.

#### Parameters

##### html

`string`

#### Returns

`string`
