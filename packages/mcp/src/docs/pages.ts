import {accessibilityPages}  from './pages/accessibility/index.js';
import {basicsPages}         from './pages/basics/index.js';
import {designPages}         from './pages/design/index.js';
import {detailsPages}        from './pages/details/index.js';
import {filteringPages}      from './pages/filtering/index.js';
import {frameworksPages}     from './pages/frameworks/index.js';
import {gettingStartedPages} from './pages/getting-started/index.js';
import {ssrPages}            from './pages/ssr/index.js';

/** A file of code of a page of Docs, which the text of the page shows. */
export interface BroDocFile {
  /** The name of the file, unique on its page; the text shows the file by the line {{file}}. */
  file: string;
  /** The language of the code, as of a Markdown code block: ts, tsx, js, scss, css, html, vue, svelte, astro, json, bash or text. */
  language: string;
  code: string;
}

/**
 * A page of Docs: the one source of the page of Docs on table-bro.com and of its topic of get_docs. The text is
 * Markdown of a few forms: paragraphs, headings ### to ######, ordered lists whose items continue with blocks
 * indented by three spaces, tables | a | b | with the line | --- | --- | after the head, `code`, **strong**, _emphasis_ and
 * [links](url); the _emphasis_ at the end of a heading is its note, as #### Loading _with Lottie_. A line {{file}} shows a
 * file of code, and a line <!-- name --> starts the part of the page that the site shows at that name, next to its tables.
 * An API that came after 1.1.0 names the version it came in: a section by the note of its heading, as
 * #### Prerendering _since 1.2.0_, a field in a table of fields by the column Since, as | Field | Default | Since |.
 */
export interface BroDocPage {
  /** The path of the page under /docs. */
  path: string;
  name: string;
  text: string;
  files: BroDocFile[];
}

/** The pages of Docs, in the order of reading. Island Details have their own pages on the site, apart from this package. */
export const docPages: BroDocPage[] = [...gettingStartedPages, ...basicsPages, ...designPages, ...detailsPages, ...filteringPages, ...frameworksPages, ...ssrPages, ...accessibilityPages];

/** The text of a page as Markdown: without the marks of its parts, with its files of code in code blocks. */
export function docPageMarkdown(page: BroDocPage): string {
  return page.text
    .replace(/^<!-- .+ -->\n(\n)?/gm, '')
    .replace(/^( *)\{\{(.+)\}\}$/gm, (line: string, indent: string, file: string) => {
      const code = page.files.find(item => item.file === file)!;

      return `${indent}${file}:\n\n${indent}\`\`\`${code.language}\n${code.code.trimEnd().replace(/^(?=.)/gm, indent)}\n${indent}\`\`\``;
    });
}
