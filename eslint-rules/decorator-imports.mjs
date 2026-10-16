// Puts the field imports of @Component, @Directive and @NgModule last, one entry per line, in groups between blank lines:
//
//   imports: [
//     CommonModule,
//     RouterLink,
//
//     MatButtonModule,
//     MatIconModule,
//
//     BroOrderFiltersComponent,
//     TableBroNg
//   ]
//
// The groups go in the order Angular, UI libraries, other libraries, the application; an entry falls into the group of the
// module that imports it, and an entry of the file itself into the application. Each group is sorted by name. The
// options name the modules of the groups, as the patterns of perfectionist/sort-imports do: {angular, ui}; any other
// module is an other library, a relative one is the application. A field moves with the comments above it. The lines of
// the comments in the array, such as an entry commented out, are left out of the check; such an array and a decorator
// with a comment at the end of a line are only reported, not fixed.
const decorators = new Set(['Component', 'Directive', 'NgModule']);

/**
 * The name of the identifier that an entry starts with: RouterModule of RouterModule.forRoot(routes), X of ...X.
 * @param node - the entry of the array
 */
function rootName(node) {
  switch (node.type) {
    case 'Identifier':
      return node.name;
    case 'SpreadElement':
      return rootName(node.argument);
    case 'MemberExpression':
      return rootName(node.object);
    case 'CallExpression':
      return rootName(node.callee);
    default:
      return null;
  }
}

/**
 * The text of an array without the lines of its comments and the blank lines that they leave at its end or twice.
 * @param text - the text of the array
 */
function withoutCommentLines(text) {
  return text.replace(/^[ \t]*(\/\/.*|\/\*.*\*\/)[ \t]*\n/gm, '').replace(/\n{3,}/g, '\n\n').replace(/\n\n([ \t]*\])$/, '\n$1');
}

export default {
  meta: {
    type: 'layout',
    docs: {description: 'Put the field imports of the Angular decorators last, one entry per line, in groups sorted by name'},
    fixable: 'code',
    schema: [{
      type: 'object',
      properties: {
        angular: {type: 'array', items: {type: 'string'}},
        ui: {type: 'array', items: {type: 'string'}}
      },
      additionalProperties: false
    }],
    messages: {
      last: 'Put the field imports last in @{{decorator}}.',
      layout: 'Put each entry of imports on its own line, in the groups Angular, UI libraries, other libraries and the application, each sorted by name.'
    }
  },
  create(context) {
    const source = context.sourceCode;
    const patterns = Object.fromEntries(['angular', 'ui'].map(group => [group, (context.options[0]?.[group] ?? []).map(pattern => new RegExp(pattern))]));
    const modules = new Map();

    /**
     * The index of the group of a module: 0 Angular, 1 UI libraries, 2 other libraries, 3 the application.
     * @param module - the module of the import, or undefined for a name of the file itself
     */
    function group(module) {
      const matches = name => patterns[name].some(pattern => pattern.test(module));

      if (module === undefined || module.startsWith('.')) {
        return 3;
      }

      return matches('angular') ? 0 : matches('ui') ? 1 : 2;
    }

    /**
     * The indent of the line on which a node starts.
     * @param node - the node
     */
    function indentOf(node) {
      return source.lines[node.loc.start.line - 1].match(/^\s*/)[0];
    }

    /**
     * Reports the entries of the array that are not one per line in their sorted groups.
     * @param array - the value of the field imports
     * @param property - the field imports
     */
    function checkLayout(array, property) {
      const entries = array.elements;

      if (entries.length === 0 || entries.some(entry => entry === null)) {
        return;
      }

      const groups = [[], [], [], []];

      for (const entry of entries) {
        groups[group(modules.get(rootName(entry)))].push(source.getText(entry));
      }

      const indent = indentOf(property);
      const text = '[\n' + groups.filter(names => names.length > 0)
        .map(names => names.sort((a, b) => a.localeCompare(b, 'en')).map(name => `${indent}  ${name}`).join(',\n'))
        .join(',\n\n') + `\n${indent}]`;

      // The lines of the comments, such as an entry commented out, are left out of the check and keep the fix away
      const commented = source.getCommentsInside(array).length > 0;
      const written = commented ? withoutCommentLines(source.getText(array)) : source.getText(array);

      if (written !== text) {
        context.report({
          node: array,
          messageId: 'layout',
          fix: commented ? null : fixer => fixer.replaceText(array, text)
        });
      }
    }

    return {
      ImportDeclaration(node) {
        for (const specifier of node.specifiers) {
          modules.set(specifier.local.name, node.source.value);
        }
      },
      'Decorator > CallExpression'(call) {
        const object = call.arguments[0];

        if (call.callee.type !== 'Identifier' || !decorators.has(call.callee.name) || object?.type !== 'ObjectExpression') {
          return;
        }

        const properties = object.properties;
        const property = properties.find(field => field.type === 'Property' && !field.computed && (field.key.name ?? field.key.value) === 'imports');

        if (property?.value.type !== 'ArrayExpression') {
          return;
        }

        if (property !== properties.at(-1)) {
          // A field moves with the comments on the lines above it; a comment at the end of a line keeps the fix away
          const starts = properties.map(field => source.getCommentsBefore(field).find(comment => comment.loc.start.line > source.getTokenBefore(field).loc.end.line)?.range[0] ?? field.range[0]);
          const trailing = properties.some(field => source.getCommentsBefore(field).some(comment => comment.loc.start.line === source.getTokenBefore(field).loc.end.line));
          const chunks = properties.map((field, i) => source.text.slice(starts[i], field.range[1]));
          const index = properties.indexOf(property);
          const separator = source.text.slice(properties[0].range[1], starts[1]);

          context.report({
            node: property,
            messageId: 'last',
            data: {decorator: call.callee.name},
            fix: trailing ? null : fixer => fixer.replaceTextRange([starts[0], properties.at(-1).range[1]], [...chunks.filter((_, i) => i !== index), chunks[index]].join(separator))
          });

          return;
        }

        checkLayout(property.value, property);
      }
    };
  }
};
