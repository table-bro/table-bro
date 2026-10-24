# Class: BroHTML

A helper of the HTML of the views and the skins: text for markup and back. BroDom creates the elements and the
templates of markup in the document of the table.

## Constructors

### Constructor

> **new BroHTML**(): `BroHTML`

#### Returns

`BroHTML`

## Methods

### ~~createElement()~~

> `static` **createElement**(`html`): `HTMLElement`

The element of markup, in the global document.

#### Parameters

##### html

`string`

the markup of the element

#### Returns

`HTMLElement`

#### Deprecated

Use createFromHTML() of BroDom, in the document of the table: ctx.dom in a view, new
BroDom(this.ownerDocument) in a custom element. 2.0 removes it.

***

### ~~createTemplate()~~

> `static` **createTemplate**(`html`): `HTMLTemplateElement`

The template of markup, in the global document.

#### Parameters

##### html

`string`

the markup of the template

#### Returns

`HTMLTemplateElement`

#### Deprecated

Use createTemplate() of BroDom, in the document of the table: ctx.dom in a view, new
BroDom(this.ownerDocument) in a custom element. 2.0 removes it.

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
