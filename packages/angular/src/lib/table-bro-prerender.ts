import {type ComponentRef, createComponent, type EnvironmentInjector, InjectionToken, reflectComponentType, type Type} from '@angular/core';

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
 * provideTableBroMatSkin() does. A table of a skin without them keeps an empty host on the server: the custom elements
 * of a vanilla skin render in the browser only.
 */
export const TABLE_BRO_ELEMENTS = new InjectionToken<TableBroSkinElements[]>('TABLE_BRO_ELEMENTS', {factory: () => []});

/**
 * Renders the table into the host of the wrapper in the server DOM of Angular, in its loading state: the core renders the
 * regions of the table, and the components of the skin render into its elements, as the custom elements of the skin do in
 * the browser. The browser takes the element of the table over (TableBroNg). Returns the components, which the wrapper
 * destroys with itself: they belong to no view of the application.
 * @param host - the host of the wrapper in the server DOM
 * @param cols - the columns of the table
 * @param conf - the config of the table
 * @param elements - the components of the elements of the skins by their tags
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

  withParentNodeMethods(() => {
    host.replaceChildren(tableBro);
    prerenderTableBro(tableBro, {cols, conf});
  });

  // The components render their templates, which may hold elements of the skin too: they render after them
  const rendered = new Map<Element, ComponentRef<unknown>>();
  const selector = Object.keys(elements).join(',');
  let pending: Element[];

  while ((pending = Array.from(tableBro.querySelectorAll(selector)).filter(element => !rendered.has(element))).length) {
    pending.forEach(element => rendered.set(element, renderElement(element, elements[element.localName], injector)));
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
 */
function renderElement(element: Element, component: Type<unknown>, environmentInjector: EnvironmentInjector): ComponentRef<unknown> {
  const componentRef = createComponent(component, {environmentInjector, hostElement: element, projectableNodes: [Array.from(element.childNodes)]});

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
function withParentNodeMethods(render: () => void): void {
  const prototypes = [Element, DocumentFragment, Document].map(({prototype}) => prototype).filter(prototype => !('append' in prototype));

  prototypes.forEach(prototype => Object.assign(prototype, parentNodeMethods));

  try {
    render();
  } finally {
    prototypes.forEach(prototype => Object.keys(parentNodeMethods).forEach(name => delete (<Record<string, unknown>>prototype)[name]));
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
