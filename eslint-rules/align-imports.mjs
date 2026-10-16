// Lines up `from` in consecutive single-line imports, like IntelliJ IDEA's "Align 'from' clauses":
//
//   import { Card }              from './Card';
//   import { useMemo, useState } from 'react';
//
// A blank line, a multi-line import or a side-effect import ends the run. Table, Bro lines up the re-exports of its
// entries the same way; an import and a re-export never share a run.
export default {
  meta: {
    type: 'layout',
    docs: {description: "Align 'from' in consecutive single-line imports"},
    fixable: 'whitespace',
    schema: [],
    messages: {align: "Align 'from' with the neighbouring imports."}
  },
  /**
   * The listener of the program, which checks the runs of its imports and re-exports.
   * @param context - the context of the rule
   */
  create(context) {
    const source = context.sourceCode;

    return {
      /**
       * Splits the top level of the program into runs and reports every import or re-export whose `from` stands off the
       * column of its run, the column after the longest head of the run.
       * @param program - the program
       */
      Program(program) {
        const runs = [];
        let run = [];
        let previousLine = -1;
        let previousKind = null;

        for (const node of program.body) {
          const kind = (node.type === 'ImportDeclaration' && node.specifiers.length > 0)
            ? 'import'
            : ((node.type === 'ExportNamedDeclaration' && node.source) || node.type === 'ExportAllDeclaration')
                ? 'export'
                : null;
          const singleLine = kind !== null && node.loc.start.line === node.loc.end.line;

          if (!singleLine || node.loc.start.line !== previousLine + 1 || kind !== previousKind) {
            runs.push(run);
            run = [];
          }

          if (singleLine) {
            const from = source.getTokenBefore(node.source);

            run.push({node, from, before: source.getTokenBefore(from)});
          }

          previousLine = node.loc.end.line;
          previousKind = kind;
        }

        runs.push(run);

        for (const imports of runs) {
          const column = Math.max(...imports.map(({before}) => before.loc.end.column + 1));

          for (const {node, from, before} of imports) {
            if (from.loc.start.column !== column) {
              context.report({
                node,
                messageId: 'align',
                fix: fixer => fixer.replaceTextRange([before.range[1], from.range[0]], ' '.repeat(column - before.loc.end.column))
              });
            }
          }
        }
      }
    };
  }
};
