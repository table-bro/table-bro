# Class: BroDom

The nodes of a table in the document of its host: the one of the page in the browser, the one of a server DOM in a
prerender, which has no global document. The context of a table holds one, ctx.dom; a custom element of a skin takes
the document of its own element, new BroDom(this.ownerDocument). The methods repeat the ones of Document where they
do the same.

## Since

1.2.0

## Constructors

### Constructor

> **new BroDom**(`document`): `BroDom`

#### Parameters

##### document

`Document`

the document of the nodes: the one of the host of the table

#### Returns

`BroDom`

## Methods

### createElement()

> **createElement**\<`T`\>(`tag`): `HTMLElement` & `T`

An empty element by its tag, as Document.createElement(): an HTML element or the element of a component of the skin
by its selector, typed by the interfaces the element implements.

#### Type Parameters

##### T

`T` = `HTMLElement`

#### Parameters

##### tag

`string`

the tag of the element

#### Returns

`HTMLElement` & `T`

***

### createFromHTML()

> **createFromHTML**\<`T`\>(`html`): `HTMLElement` & `T`

The first element of markup.

#### Type Parameters

##### T

`T` = `HTMLElement`

#### Parameters

##### html

`string`

the markup of the element

#### Returns

`HTMLElement` & `T`

***

### createTemplate()

> **createTemplate**(`html`): `HTMLTemplateElement`

The template of markup.

#### Parameters

##### html

`string`

the markup of the template

#### Returns

`HTMLTemplateElement`

***

### createTextNode()

> **createTextNode**(`value`): `Text`

A text node, as Document.createTextNode().

#### Parameters

##### value

`string`

the text of the node

#### Returns

`Text`

## Properties

### document

> `readonly` **document**: `Document`

the document of the nodes: the one of the host of the table
