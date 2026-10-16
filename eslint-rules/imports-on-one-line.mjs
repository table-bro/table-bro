// Puts a multi-line import on one line when the line fits:
//
//   import {                          →   import {Bar, BarChart, XAxis} from 'recharts';
//     Bar,
//     BarChart,
//     XAxis
//   } from 'recharts';
//
// An import with a comment inside stays as written.
export default {
  meta: {
    type: 'layout',
    docs: {description: 'Put a multi-line import on one line when it fits'},
    fixable: 'whitespace',
    schema: [{type: 'object', properties: {maxLength: {type: 'integer', minimum: 1}}, additionalProperties: false}],
    messages: {join: 'Put the import on one line: it fits in {{maxLength}} characters.'}
  },
  /**
   * The listener of the imports, with the maximum length of a line from the options of the rule.
   * @param context - the context of the rule
   */
  create(context) {
    const source = context.sourceCode;
    const maxLength = context.options[0]?.maxLength ?? 240;

    return {
      /**
       * Reports a multi-line import with named specifiers and no comments inside if it fits on one line with the text
       * around it, and joins it.
       * @param node - the import
       */
      ImportDeclaration(node) {
        if (node.loc.start.line === node.loc.end.line || source.getCommentsInside(node).length > 0) {
          return;
        }

        const named = node.specifiers.filter(specifier => specifier.type === 'ImportSpecifier');

        if (named.length === 0) {
          return;
        }

        const open = source.getTokenBefore(named[0], token => token.value === '{');
        const close = source.getTokenAfter(named.at(-1), token => token.value === '}');
        /**
         * The text with each run of whitespace as one space.
         * @param text - the text
         */
        const squeeze = text => text.replace(/\s+/g, ' ');
        const head = squeeze(source.text.slice(node.range[0], open.range[0]));
        const tail = squeeze(source.text.slice(close.range[1], node.range[1]));
        const joined = `${head}{${named.map(specifier => source.getText(specifier)).join(', ')}}${tail}`;
        const before = source.lines[node.loc.start.line - 1].slice(0, node.loc.start.column);
        const after = source.lines[node.loc.end.line - 1].slice(node.loc.end.column);

        if (before.length + joined.length + after.length > maxLength) {
          return;
        }

        context.report({
          node,
          messageId: 'join',
          data: {maxLength},
          fix: fixer => fixer.replaceText(node, joined)
        });
      }
    };
  }
};
