import {ANIMATION_MODULE_TYPE, type ComponentRef, createComponent, type EnvironmentInjector, InjectionToken, Injector, reflectComponentType, type Type} from '@angular/core';

import {type BroCol, type BroConfig, type BroSkin, prerenderTableBro} from '@table-bro/core';

/** The elements of a skin of Angular components: the component of each tag, as the skin defines it as a custom element. */
export interface TableBroSkinElements {
  /** The name of the skin. */
  readonly skin: BroSkin;
  /** The component of each tag. */
  readonly elements: Record<string, Type<unknown>>;
}

/**
 * The elements of the skins for the prerender. The server DOM of Angular has no custom elements, so the prerender renders
 * the components of the elements into the elements of the table itself; a skin of Angular components provides them, as
 * provideTableBroMatSkin() does. A skin of custom elements needs none: the prerender gives the server DOM a registry of
 * custom elements, where the skin defines its elements (BroSkinConfig.defineElements). A table of a skin with neither
 * keeps an empty host on the server.
 */
export const TABLE_BRO_ELEMENTS = new InjectionToken<TableBroSkinElements[]>('TABLE_BRO_ELEMENTS', {factory: () => []});

/**
 * Renders the table into the host of the wrapper in the server DOM of Angular, in its loading state: the core renders the
 * regions of the table, and the components of the skin render into its elements, as the custom elements of the skin do in
 * the browser; the custom elements of a skin of custom elements render themselves. The host of a skin with neither stays
 * empty. The browser takes the element of the table over (TableBroNg). Returns the components, which the wrapper destroys
 * with itself: they belong to no view of the application.
 * @param host - the host of the wrapper in the server DOM
 * @param cols - the columns of the table
 * @param conf - the config of the table
 * @param elements - the components of the elements of the skin by their tags, none for a skin of custom elements
 * @param injector - the injector of the application, for the components
 * @param tableId - the id of the <table-bro> element
 * @param theme - the theme of the table
 */
export function prerenderTableBroNg<MODEL extends object>(host: HTMLElement, cols: BroCol<MODEL>[], conf: BroConfig<MODEL>, elements: Record<string, Type<unknown>>, injector: EnvironmentInjector, tableId?: string, theme?: string | null): ComponentRef<unknown>[] {
  const tableBro = host.ownerDocument.createElement('table-bro');

  if (tableId) {
    tableBro.setAttribute('id', tableId);
  }

  if (theme) {
    tableBro.setAttribute('theme', theme);
  }

  const customElementsDefined = withParentNodeMethods(() => withCustomElements(<ServerDocument>host.ownerDocument, () => {
    host.replaceChildren(tableBro);
    prerenderTableBro(tableBro, {cols, conf});
  }));
  const selector = Object.keys(elements).join(',');

  // A skin of custom elements has rendered them with the table
  if (!selector) {
    if (!customElementsDefined) {
      host.replaceChildren();
    }

    return [];
  }

  // The components render their templates, which may hold elements of the skin too: they render after them
  const rendered = new Map<Element, ComponentRef<unknown>>();
  // The components render the markup of the browser, with its animations, as the progress bar of Material: the server
  // render of Angular has no animations, and the CSS animations of the prerender run from its first paint
  const elementInjector = Injector.create({providers: [{provide: ANIMATION_MODULE_TYPE, useValue: 'BrowserAnimations'}]});
  let pending: Element[];

  while ((pending = Array.from(tableBro.querySelectorAll(selector)).filter(element => !rendered.has(element))).length) {
    pending.forEach(element => rendered.set(element, renderElement(element, elements[element.localName], injector, elementInjector)));
  }

  return [...rendered.values()];
}

/**
 * Renders a component into an element of the table, as an Angular element does: the content of the element goes into
 * the content of the component, and its inputs take the properties that the table set on the element, else its
 * attributes, by the names of the inputs in dashes.
 * @param element - the element of the skin
 * @param component - the component of the element
 * @param environmentInjector - the injector of the application
 * @param elementInjector - the injector of the elements, with the animations of the browser
 */
function renderElement(element: Element, component: Type<unknown>, environmentInjector: EnvironmentInjector, elementInjector: Injector): ComponentRef<unknown> {
  const componentRef = createComponent(component, {environmentInjector, elementInjector, hostElement: element, projectableNodes: [Array.from(element.childNodes)]});

  reflectComponentType(component)?.inputs.forEach(({propName, templateName}) => {
    const attribute = templateName.replace(/[A-Z]/g, char => `-${char.toLowerCase()}`);

    if (Object.hasOwn(element, propName)) {
      componentRef.setInput(templateName, (<Record<string, unknown>><unknown>element)[propName]);
    } else if (element.hasAttribute(attribute)) {
      componentRef.setInput(templateName, element.getAttribute(attribute));
    }
  });

  componentRef.changeDetectorRef.detectChanges();

  return componentRef;
}

/** The methods of ParentNode that add nodes, by the DOM standard: a text is added as a text node. */
const parentNodeMethods = {
  append(this: ParentNode & Node, ...nodes: (Node | string)[]): void {
    nodes.forEach(node => this.appendChild(toNode(this, node)));
  },
  prepend(this: ParentNode & Node, ...nodes: (Node | string)[]): void {
    const first = this.firstChild;

    nodes.forEach(node => this.insertBefore(toNode(this, node), first));
  },
  replaceChildren(this: ParentNode & Node, ...nodes: (Node | string)[]): void {
    while (this.firstChild) {
      this.removeChild(this.firstChild);
    }

    nodes.forEach(node => this.appendChild(toNode(this, node)));
  }
};

/**
 * Runs the render of the core in the server DOM of Angular. The core creates its nodes in the document of the table and
 * adds them with the methods of ParentNode, which the server DOM of Angular lacks: its elements, fragments and documents
 * get them while the render runs, and lose them after it, so the classes of the server DOM stay as Angular made them for
 * the rest of the application and for the other renders of the process.
 * @param render - the render of the core
 */
function withParentNodeMethods<T>(render: () => T): T {
  const prototypes = [Element, DocumentFragment, Document].map(({prototype}) => prototype).filter(prototype => !('append' in prototype));

  prototypes.forEach(prototype => Object.assign(prototype, parentNodeMethods));

  try {
    return render();
  } finally {
    prototypes.forEach(prototype => Object.keys(parentNodeMethods).forEach(name => delete (<Record<string, unknown>>prototype)[name]));
  }
}

/** A document of the server DOM of Angular (domino), with its handler of the changes of the document, as an inserted node. */
interface ServerDocument extends Document {
  mutationHandler?: (mutation: {type: number; node?: Node}) => void;
}

/** The type of the change of the server DOM of Angular for a node inserted into its document. */
const nodeInserted = 6;

/**
 * Runs the render of the core with a registry of custom elements in the window of the server DOM of Angular, which has
 * none, so that the elements of a skin of custom elements render as in the browser: the skin defines them in the registry
 * (BroSkinConfig.defineElements), the document creates them as instances of their classes, also in parsed HTML, and the
 * elements that the render inserts into the document connect. The registry, the creation and the connection belong to the document of the
 * render while it runs: the other renders of the process and the code of the application do not see them. Returns
 * whether the skin has defined elements.
 * @param document - the server document of the table
 * @param render - the render of the core
 */
function withCustomElements(document: ServerDocument, render: () => void): boolean {
  // The window of the server DOM of Angular has no registry of custom elements
  const window = <{customElements?: CustomElementRegistry} | null>document.defaultView;

  // A server DOM with a registry of its own, or a document without a window
  if (!window || window.customElements) {
    render();

    return !!window;
  }

  const definitions = new Map<string, CustomElementConstructor>();
  // The upgraded elements with their prototypes of the server DOM, which they take back after the render
  const upgraded = new Map<Element, object>();
  // The prototypes of the empty base classes of the custom elements with their own prototypes (construct)
  const bases = new Map<object, object>();
  const mutationHandler = document.mutationHandler;

  // An element of a defined tag becomes an instance of its class once, as at its creation in the browser
  const upgrade = <T extends Element>(element: T): T => {
    const constructor = definitions.get(element.localName);

    if (constructor && !upgraded.has(element)) {
      upgraded.set(element, Object.getPrototypeOf(element));
      construct(element, constructor, bases);
    }

    return element;
  };

  // The custom elements of a node in the order of the tree, upgraded
  const customElementsOf = (node: Node): Element[] => {
    const elements = (node instanceof Element) ? [node] : [];

    if (node instanceof Element || node instanceof DocumentFragment) {
      elements.push(...Array.from(node.querySelectorAll('*')));
    }

    return elements.filter(element => definitions.has(element.localName)).map(upgrade);
  };

  window.customElements = <CustomElementRegistry><unknown>{
    define: (name: string, constructor: CustomElementConstructor) => definitions.set(name, constructor),
    get: (name: string) => definitions.get(name),
    whenDefined: (name: string) => definitions.has(name) ? Promise.resolve(definitions.get(name)) : new Promise(() => undefined)
  };

  // Own methods of the document, over the ones of the server DOM, which are read-only
  Object.defineProperties(document, {
    createElement: {
      configurable: true,
      value: (tagName: string, options?: ElementCreationOptions) => upgrade(Document.prototype.createElement.call(document, tagName, options))
    },
    // Parsed HTML comes from the document of the parser: its elements upgrade as the document adopts them, as the browser
    // creates the elements of the HTML of an element in the document of the element
    adoptNode: {
      configurable: true,
      value: <T extends Node>(node: T): T => {
        const parsed = (node.ownerDocument !== document);

        Document.prototype.adoptNode.call(document, node);

        if (parsed) {
          customElementsOf(node);
        }

        return node;
      }
    }
  });

  // The custom elements of a node inserted into the document connect
  document.mutationHandler = mutation => {
    mutationHandler?.call(document, mutation);

    if (mutation.type === nodeInserted && mutation.node) {
      customElementsOf(mutation.node).forEach(element => (<Partial<CustomElementCallbacks>>element).connectedCallback?.());
    }
  };

  try {
    render();

    return definitions.size > 0;
  } finally {
    // The document keeps the elements of the server DOM, without the classes of the skin
    upgraded.forEach((prototype, element) => Object.setPrototypeOf(element, prototype));
    bases.forEach((prototype, basePrototype) => Object.setPrototypeOf(basePrototype, prototype));
    delete window.customElements;
    delete (<Partial<Document>>document).createElement;
    delete (<Partial<Document>>document).adoptNode;
    document.mutationHandler = mutationHandler;
  }
}

/** The callback of a custom element that the prerender calls. */
interface CustomElementCallbacks {
  /** The element is connected to the document. */
  connectedCallback(): void;
}

/**
 * Runs the constructor of a custom element on an element of the server DOM, as the browser upgrades an element: the
 * element takes the prototype of the class, and the constructor runs with the element as this, so the fields of its
 * classes are set on it. For the time of the call, the class that extends the base class of the custom elements extends
 * a constructor that gives the element, as the HTMLElement of the browser gives the element that it upgrades. The base
 * class is HTMLElement of the server DOM, or an empty class, as BroHTMLElement where the core loads before the server
 * DOM: the prototype of an empty one takes the prototype of the element until the render ends, for the methods of the
 * element.
 * @param element - the element of the server DOM
 * @param constructor - the class of the custom element
 * @param bases - the prototypes of the empty base classes with their own prototypes, which they take back after the render
 */
function construct(element: Element, constructor: CustomElementConstructor, bases: Map<object, object>): void {
  let derived: object = constructor;
  let base: object = Object.getPrototypeOf(derived);

  while (base !== Function.prototype && Object.getPrototypeOf(base) !== Function.prototype) {
    derived = base;
    base = Object.getPrototypeOf(base);
  }

  // A class that extends no class is no custom element
  if (base === Function.prototype) {
    return;
  }

  const basePrototype = (<{prototype: object}>base).prototype;

  if (!(element instanceof <CustomElementConstructor>base) && !bases.has(basePrototype)) {
    bases.set(basePrototype, Object.getPrototypeOf(basePrototype));
    Object.setPrototypeOf(basePrototype, Object.getPrototypeOf(element));
  }

  Object.setPrototypeOf(element, constructor.prototype);
  Object.setPrototypeOf(derived, function upgradedElement() {
    return element;
  });

  try {
    Reflect.construct(constructor, []);
  } finally {
    Object.setPrototypeOf(derived, base);
  }
}

/**
 * A node to add to a parent: a text becomes a text node of the document of the parent.
 * @param parent - the parent of the node
 * @param node - the node or the text
 */
function toNode(parent: Node, node: Node | string): Node {
  return (typeof node === 'string') ? (<Document>(parent.ownerDocument ?? parent)).createTextNode(node) : node;
}
