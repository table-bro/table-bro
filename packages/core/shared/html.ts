import {BroDom} from './dom';

/**
 * A helper of the HTML of the views and the skins: text for markup and back. BroDom creates the elements and the
 * templates of markup in the document of the table.
 * @group Rendering helpers
 */
export class BroHTML {
  /**
   * The element of markup, in the global document.
   * @param html - the markup of the element
   * @deprecated Use createFromHTML() of BroDom, in the document of the table: ctx.dom in a view, new
   * BroDom(this.ownerDocument) in a custom element. 2.0 removes it.
   */
  static createElement(html: string): HTMLElement {
    return new BroDom(document).createFromHTML(html);
  }

  /**
   * The template of markup, in the global document.
   * @param html - the markup of the template
   * @deprecated Use createTemplate() of BroDom, in the document of the table: ctx.dom in a view, new
   * BroDom(this.ownerDocument) in a custom element. 2.0 removes it.
   */
  static createTemplate(html: string): HTMLTemplateElement {
    return new BroDom(document).createTemplate(html);
  }

  /**
   * A text for an HTML template: the characters of markup become entities, so the text shows as it is in the content
   * and in a quoted attribute. undefined and null give an empty text.
   */
  static escape(text: unknown): string {
    return `${text ?? ''}`.replace(/[&<>"']/g, char => `&#${char.charCodeAt(0)};`);
  }

  /**
   * The text of markup, as for the tooltip of an HTML value. The markup is read in a document of DOMParser, which loads
   * no images and runs no handlers, unlike an element of the page.
   */
  static text(html: string): string {
    return new DOMParser().parseFromString(html, 'text/html').body.textContent ?? '';
  }
}

/**
 * The class attribute of a template, escaped: no attribute when none of the classes has a value.
 * @param classNames - the classes of the element, as of the config and of the column; empty ones are left out
 */
export function classAttr(...classNames: (string | undefined)[]): string {
  const className = classNames.filter(Boolean).join(' ');

  return className ? `class="${BroHTML.escape(className)}"` : '';
}

/**
 * The base class of the custom elements: HTMLElement in the browser, an empty class where the module is imported without
 * a DOM, as in the server render of Angular. The elements are defined only in the browser.
 * @group Rendering helpers
 */
export const BroHTMLElement: typeof HTMLElement = (typeof HTMLElement === 'undefined') ? <typeof HTMLElement><unknown>class {} : HTMLElement;
