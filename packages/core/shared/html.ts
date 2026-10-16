/**
 * A helper of the HTML of the views and the skins: elements and templates from markup, text for markup and back.
 * @group Rendering helpers
 */
export class BroHTML {
  static createElement(html: string): HTMLElement {
    return BroHTML.createTemplate(html).content.firstChild as HTMLElement;
  }

  static createTemplate(html: string): HTMLTemplateElement {
    html = html || '';

    html = html.trim(); // Never return a text node of whitespace as the result

    const template: HTMLTemplateElement = document.createElement('template');

    template.innerHTML = html;

    return template;
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

/** Creates the element of a skin component, typed by the interfaces the element implements. */
export function createComponent<T>(selector: string): HTMLElement & T {
  return document.createElement(selector) as HTMLElement & T;
}

/**
 * The base class of the custom elements: HTMLElement in the browser, an empty class where the module is imported without
 * a DOM, as in the server render of Angular. The elements are defined only in the browser.
 * @group Rendering helpers
 */
export const BroHTMLElement: typeof HTMLElement = (typeof HTMLElement === 'undefined') ? <typeof HTMLElement><unknown>class {} : HTMLElement;
