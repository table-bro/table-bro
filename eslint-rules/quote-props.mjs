// Quotes the keys of an object that are not in camelCase, and only them:
//
//   {'ad_storage': 'denied', 'Content-Type': type, adStorage: 'denied'}
//
// A key in camelCase goes without quotes, any other key in single quotes; a number and a computed key stay as written.
// The names of the methods and of the accessors, such as the listeners of an ESLint rule, Program(node) {...}, and the
// keys of the types and of the destructuring stay as written too.
const camelCase = /^[a-z][a-zA-Z0-9]*$/;

export default {
  meta: {
    type: 'layout',
    docs: {description: 'Quote the keys of an object that are not in camelCase, and only them'},
    fixable: 'code',
    schema: [],
    messages: {
      quote: 'Put the key {{name}}, which is not in camelCase, in quotes.',
      unquote: 'Write the key {{name}}, which is in camelCase, without quotes.'
    }
  },
  /**
   * The listener of the properties of the object literals.
   * @param context - the context of the rule
   */
  create(context) {
    return {
      /**
       * Reports a key of a plain property that is not in camelCase without quotes, or that is in camelCase in quotes.
       * @param node - the property
       */
      'ObjectExpression > Property'(node) {
        const key = node.key;

        if (node.shorthand || node.computed || node.method || node.kind !== 'init') {
          return;
        }

        if (key.type === 'Identifier' && !camelCase.test(key.name)) {
          context.report({node: key, messageId: 'quote', data: {name: key.name}, fix: fixer => fixer.replaceText(key, `'${key.name}'`)});
        } else if (key.type === 'Literal' && typeof key.value === 'string' && camelCase.test(key.value)) {
          context.report({node: key, messageId: 'unquote', data: {name: key.value}, fix: fixer => fixer.replaceText(key, key.value)});
        }
      }
    };
  }
};
