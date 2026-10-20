/**
 * The nodes of a table in the document of its host: the one of the page in the browser, the one of a server DOM in a
 * prerender, which has no global document. The context of a table holds one, ctx.dom; a custom element of a skin takes
 * the document of its own element, new BroDom(this.ownerDocument). The methods repeat the ones of Document where they
 * do the same.
 * @group Rendering helpers
 * @since 1.2.0
 */
export class BroDom {
  /**
   * @param document - the document of the nodes: the one of the host of the table
   */
  constructor(readonly document: Document) {}

  /**
   * An empty element by its tag, as Document.createElement(): an HTML element or the element of a component of the skin
   * by its selector, typed by the interfaces the element implements.
   * @param tag - the tag of the element
   */
  createElement<T = HTMLElement>(tag: string): HTMLElement & T {
    return <HTMLElement & T>this.document.createElement(tag);
  }

  /**
   * A text node, as Document.createTextNode().
   * @param value - the text of the node
   */
  createTextNode(value: string): Text {
    return this.document.createTextNode(value);
  }

  /**
   * The template of markup.
   * @param html - the markup of the template
   */
  createTemplate(html: string): HTMLTemplateElement {
    html = html || '';

    html = html.trim(); // Never return a text node of whitespace as the result

    const template = this.createElement<HTMLTemplateElement>('template');

    template.innerHTML = html;

    return template;
  }

  /**
   * The first element of markup.
   * @param html - the markup of the element
   */
  createFromHTML<T = HTMLElement>(html: string): HTMLElement & T {
    return <HTMLElement & T>this.createTemplate(html).content.firstChild;
  }
}
