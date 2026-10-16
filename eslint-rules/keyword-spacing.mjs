import stylistic from '@stylistic/eslint-plugin';

// The keyword-spacing of @stylistic, with no space between the type of a type assertion and its expression:
//
//   <BroButton[]> this.toolbarButtons()   →   <BroButton[]>this.toolbarButtons()
//
// @stylistic asks for a space before a keyword after `>`; a keyword right after the `>` of a type assertion takes none
// here, as any other expression there. The options are those of @stylistic/keyword-spacing.
const keywordSpacing = stylistic.rules['keyword-spacing'];

export default {
  meta: {
    ...keywordSpacing.meta,
    docs: {description: 'Enforce the spacing around keywords, and no space after the type of a type assertion'},
    messages: {...keywordSpacing.meta.messages, assertion: 'Unexpected space after the type of a type assertion.'}
  },
  /**
   * The listeners of @stylistic/keyword-spacing, whose reports go through the filter of the type assertions, and the
   * listener of the type assertions.
   * @param context - the context of the rule
   */
  create(context) {
    const source = context.sourceCode;
    // The ends of the types of the type assertions, which the reports of @stylistic about the space before a keyword skip
    const assertionEnds = new Set();
    /**
     * Passes a report of @stylistic on, except a report of a missing space before a keyword after a type assertion.
     * @param descriptor - the report of @stylistic
     */
    const report = descriptor => {
      const before = descriptor.messageId === 'expectedBefore' && source.getTokenBefore(descriptor.data);

      if (!before || !assertionEnds.has(before.range[1])) {
        context.report(descriptor);
      }
    };

    return {
      /**
       * Keeps the end of the type of the assertion for the filter, and reports a space between the type and its
       * expression.
       * @param node - the type assertion
       */
      TSTypeAssertion(node) {
        const end = source.getTokenBefore(node.expression, token => token.value === '>');
        const next = source.getTokenAfter(end);

        assertionEnds.add(end.range[1]);

        if (source.isSpaceBetween(end, next)) {
          context.report({
            node,
            loc: {start: end.loc.end, end: next.loc.start},
            messageId: 'assertion',
            fix: fixer => fixer.removeRange([end.range[1], next.range[0]])
          });
        }
      },
      ...keywordSpacing.create(Object.create(context, {report: {value: report}}))
    };
  }
};
